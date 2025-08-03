from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..controllers.user_controller import create_user, get_users, get_user, update_user_profile
from ..models import User
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt  # Import bcrypt to check old passwords

user_bp = Blueprint('user', __name__)

user_bp.route('/', methods=['POST'])(create_user)
user_bp.route('/', methods=['GET'])(get_users)
user_bp.route('/<user_id>', methods=['GET'])(get_user)

@user_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_profile(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.json
    return update_user_profile(user_id, data)

@user_bp.route('/<user_id>/password', methods=['PUT'])
@jwt_required()
def update_password(user_id):
    try:
        # Verify user identity
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.json
        if not data or 'current_password' not in data or 'new_password' not in data:
            return jsonify({'message': 'Missing required fields'}), 400

        # Get user from database
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Verify current password (try werkzeug first, then bcrypt for old hashes)
        current_password_valid = False
        try:
            if check_password_hash(user.password_hash, data['current_password']):
                current_password_valid = True
        except ValueError:
            # This might happen if it's an old bcrypt hash
            try:
                if bcrypt.checkpw(data['current_password'].encode('utf-8'), user.password_hash.encode('utf-8')):
                    current_password_valid = True
            except ValueError:
                # Hash is likely corrupted or invalid format
                pass
            except Exception as bcrypt_err:
                # Handle potential bcrypt errors if needed
                print(f"Bcrypt check failed: {bcrypt_err}")
                pass
        
        if not current_password_valid:
             return jsonify({'message': 'Current password is incorrect'}), 400

        # Hash new password using werkzeug (always use the new standard)
        new_password_hash = generate_password_hash(data['new_password'])
        
        # Update password
        user.password_hash = new_password_hash
        
        try:
            db.session.commit()
            return jsonify({'message': 'Password updated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error updating password: {str(e)}'}), 500

    except Exception as e:
        # Catch potential errors from getting user or JWT identity
        return jsonify({'message': f'An unexpected error occurred: {str(e)}'}), 500

@user_bp.route('/<user_id>/notifications', methods=['PUT'])
@jwt_required()
def update_notifications(user_id):
    try:
        # Verify user identity
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.json
        if 'email_notifications' not in data:
            return jsonify({'message': 'Missing email_notifications field'}), 400

        # Get user from database
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Update notification settings
        user.email_notifications = data['email_notifications']
        
        try:
            db.session.commit()
            return jsonify({
                'message': 'Notification settings updated successfully',
                'email_notifications': user.email_notifications
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error updating notification settings: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'message': str(e)}), 500 