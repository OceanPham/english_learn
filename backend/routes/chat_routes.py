from flask import Blueprint, jsonify, request
from ..controllers.chat_controller import create_chat, get_chats, get_chatgpt_response
from ..models import AIChat, User
from ..extensions import db
from ..schemas import chat_schema
import uuid

chat_bp = Blueprint('chat', __name__)

chat_bp.route('/', methods=['POST'])(create_chat)
chat_bp.route('/<user_id>', methods=['GET'])(get_chats)

@chat_bp.route('/gpt', methods=['POST'])
def chat_with_gpt():
    try:
        data = request.json
        if not data or 'user_id' not in data or 'message' not in data:
            return jsonify({'message': 'Missing required fields'}), 400

        user_id = data['user_id']
        user_message = data['message']

        # Get chat history
        chat_history = AIChat.query.filter_by(user_id=user_id).order_by(AIChat.created_at.desc()).limit(5).all()
        messages = []
        
        # Convert chat history to OpenAI format (in reverse chronological order)
        for chat in reversed(chat_history):
            messages.append({
                "role": chat.role,
                "content": chat.message
            })

        # Add the new user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Save user message
        user = User.query.get(user_id)
        if not user:
            # Create a temporary user if not exists
            temp_user = User(
                id=user_id,
                email=f"temp_{user_id}@temp.com",
                password_hash="temporary",
                full_name="Temporary User",
                role="user"
            )
            try:
                db.session.add(temp_user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({'message': f'Error creating temporary user: {str(e)}'}), 400

        # Create user message
        user_chat = AIChat(
            id=str(uuid.uuid4()),
            user_id=user_id,
            message=user_message,
            role='user'
        )
        
        try:
            db.session.add(user_chat)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 400

        # Get response from ChatGPT
        ai_response = get_chatgpt_response(messages)

        # Create AI response
        ai_chat = AIChat(
            id=str(uuid.uuid4()),
            user_id=user_id,
            message=ai_response,
            role='assistant'
        )
        
        try:
            db.session.add(ai_chat)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 400

        return jsonify({
            'user_message': chat_schema.dump(user_chat),
            'ai_response': chat_schema.dump(ai_chat)
        }), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 400

@chat_bp.route('/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    return get_chats(user_id) 