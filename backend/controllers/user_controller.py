from flask import jsonify, request
from ..extensions import db
from ..models import User, Subscription, UserCredits
from ..schemas import user_schema, users_schema, user_credits_schema
from werkzeug.security import generate_password_hash
import uuid

def create_user():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        # Hash password using werkzeug
        password_hash = generate_password_hash(data['password'])
        
        new_user = User(
            id=str(uuid.uuid4()),
            email=data['email'],
            password_hash=password_hash,
            full_name=data.get('full_name'),
            role=data.get('role', 'user')
        )
        
        db.session.add(new_user)
        db.session.commit()
        return user_schema.dump(new_user), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

def get_users():
    users = User.query.all()
    return users_schema.dump(users)

def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user_data = user_schema.dump(user)

        # Get active subscription
        subscription = Subscription.query.filter_by(user_id=user_id, status='active').first()
        subscription_data = None
        if subscription:
            subscription_data = {
                'plan': subscription.plan,
                'status': subscription.status,
                'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None
            }
            
        # Add subscription data directly to user_data
        user_data['subscription'] = subscription_data

        # Get user credits details
        user_credits = UserCredits.query.filter_by(user_id=user_id).first()
        credits_data = None # Default to None
        if user_credits:
             credits_data = user_credits_schema.dump(user_credits) # Dump the full credits object
        
        # Combine data
        response_data = {
            'user': user_data, 
            'credits': credits_data # Assign the full credits object (or None)
        }
        # print(response_data)
        return jsonify(response_data), 200
        
    except Exception as e:
         return jsonify({'message': f'Error getting user details: {str(e)}'}), 500

def update_user_profile(user_id, data):
    try:
        user = User.query.get_or_404(user_id)
        
        # Update fields that are present in the request
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'message': 'Email already in use'}), 400
            user.email = data['email']
            
        try:
            db.session.commit()
            user_response = user_schema.dump(user) 
            # user_response['subscription'] = ... # Add if needed 
            return jsonify({'user': user_response}), 200 
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error updating profile: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500