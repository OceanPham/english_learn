from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.models import User, Subscription, UserCredits
from backend.extensions import db
import uuid
from datetime import datetime, date, timedelta

def get_user_data(user):
    # Get user's active subscription
    subscription = Subscription.query.filter_by(
        user_id=user.id,
        status='active'
    ).first()

    subscription_data = None
    if subscription:
        subscription_data = {
            'plan': subscription.plan,
            'status': subscription.status,
            'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
            'end_date': subscription.end_date.isoformat() if subscription.end_date else None
        }

    return {
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
        'subscription': subscription_data
    }

def register_user(data):
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    if not email or not password or not full_name:
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(
        id=str(uuid.uuid4()), 
        email=email, 
        password_hash=hashed_password, 
        full_name=full_name
    )
    
    try:
        # Add new user
        db.session.add(new_user)
        
        # Create free subscription
        start_date = date.today()
        end_date = start_date + timedelta(days=30)
        new_subscription = Subscription(
            id=str(uuid.uuid4()),
            user_id=new_user.id,
            plan='free',
            status='active',
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(new_subscription)

        # Create user credits with 2 free credits
        new_user_credits = UserCredits(
            user_id=new_user.id,
            available_credits=2,  # Free plan credits
            last_updated=datetime.utcnow()
        )
        db.session.add(new_user_credits)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

    access_token = create_access_token(identity=new_user.id)
    user_data = get_user_data(new_user)
    return jsonify({'access_token': access_token, 'user': user_data}), 201

def login_user(data):
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    user_data = get_user_data(user)
    return jsonify({'access_token': access_token, 'user': user_data}), 200 