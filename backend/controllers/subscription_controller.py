from ..extensions import db
from ..models import User, Subscription, UserCredits
from datetime import datetime, timedelta, date
import uuid
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

# Định nghĩa credits cho mỗi gói
PLAN_CREDITS = {
    'free': 2,
    'student': 50,
    'pro': 200,
    'unlimited': 999999  # Effectively unlimited
}

def create_subscription():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        if not data or 'plan' not in data:
            return jsonify({'message': 'Plan is required'}), 400

        plan = data['plan']
        if plan not in PLAN_CREDITS:
            return jsonify({'message': 'Invalid plan selected'}), 400

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # For free plan, check if user has used it before
        if plan == 'free':
            existing_subscription = Subscription.query.filter_by(user_id=current_user_id).first()
            if existing_subscription and existing_subscription.plan != 'free':
                return jsonify({'message': 'Cannot downgrade to free plan'}), 400
            elif existing_subscription and existing_subscription.plan == 'free':
                return jsonify({'message': 'Free plan can only be used once'}), 400

        # Calculate subscription dates
        start_date = date.today()
        end_date = start_date + timedelta(days=30)
        
        # Create or update subscription
        subscription = Subscription.query.filter_by(user_id=current_user_id).first()
        if subscription:
            # Prevent downgrade from paid plans
            if subscription.plan in ['student', 'pro', 'unlimited'] and plan == 'free':
                return jsonify({'message': 'Cannot downgrade to free plan'}), 400
                
            subscription.plan = plan
            subscription.status = 'active'
            subscription.start_date = start_date
            subscription.end_date = end_date
        else:
            subscription = Subscription(
                id=str(uuid.uuid4()),
                user_id=current_user_id,
                plan=plan,
                status='active',
                start_date=start_date,
                end_date=end_date
            )
            db.session.add(subscription)

        # Update user credits
        user_credits = UserCredits.query.filter_by(user_id=current_user_id).first()
        if not user_credits:
            user_credits = UserCredits(
                user_id=current_user_id,
                available_credits=PLAN_CREDITS[plan],
                last_updated=datetime.utcnow()
            )
            db.session.add(user_credits)
        else:
            user_credits.available_credits = PLAN_CREDITS[plan]
            user_credits.last_updated = datetime.utcnow()

        db.session.commit()
        
        return jsonify({
            'message': 'Subscription created successfully',
            'subscription': {
                'plan': subscription.plan,
                'status': subscription.status,
                'start_date': subscription.start_date.isoformat(),
                'end_date': subscription.end_date.isoformat()
            },
            'credits': user_credits.available_credits
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating subscription: {str(e)}'}), 500

def get_subscription():
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy subscription hiện tại
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()

        # Lấy số credits hiện có
        user_credits = UserCredits.query.filter_by(user_id=current_user_id).first()
        available_credits = user_credits.available_credits if user_credits else 0

        if not subscription:
            return jsonify({
                'message': 'No active subscription found',
                'credits': available_credits
            }), 404

        return jsonify({
            'subscription': {
                'plan': subscription.plan,
                'status': subscription.status,
                'start_date': subscription.start_date.isoformat(),
                'end_date': subscription.end_date.isoformat()
            },
            'credits': available_credits
        }), 200

    except Exception as e:
        return jsonify({'message': f'Error getting subscription: {str(e)}'}), 500 