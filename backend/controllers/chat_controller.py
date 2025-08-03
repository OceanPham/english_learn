from flask import jsonify, request
from ..extensions import db
from ..models import AIChat, User
from ..schemas import chat_schema, chats_schema
from openai import OpenAI
from ..config.openai_config import OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_MESSAGE
import uuid
from datetime import datetime

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def get_chatgpt_response(messages):
    try:
        # Add system message to guide the model's behavior
        full_messages = [{"role": "system", "content": SYSTEM_MESSAGE}] + messages
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=full_messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        return str(e)

def create_chat():
    data = request.json
    if not data or 'user_id' not in data or 'message' not in data or 'role' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    # First, check if user exists
    user = User.query.get(data['user_id'])
    if not user:
        # Create a temporary user if not exists
        temp_user = User(
            id=data['user_id'],
            email=f"temp_{data['user_id']}@temp.com",
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
    
    new_chat = AIChat(
        id=str(uuid.uuid4()),
        user_id=data['user_id'],
        message=data['message'],
        role=data['role']
    )
    
    try:
        db.session.add(new_chat)
        db.session.commit()
        return chat_schema.dump(new_chat), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

def get_chats(user_id):
    try:
        chats = AIChat.query.filter_by(user_id=user_id).order_by(AIChat.created_at.desc()).all()
        return chats_schema.dump(chats)
    except Exception as e:
        return jsonify({'message': str(e)}), 400 