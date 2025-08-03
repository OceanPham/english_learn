from flask import jsonify, request
from ..extensions import db
from ..models import Essay
from ..schemas import essay_schema, essays_schema
import uuid

def create_essay():
    data = request.json
    if not data or 'user_id' not in data or 'task_type' not in data or 'input_text' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    new_essay = Essay(
        id=str(uuid.uuid4()),
        user_id=data['user_id'],
        title=data.get('title'),
        task_type=data['task_type'],
        input_text=data['input_text']
    )
    
    try:
        db.session.add(new_essay)
        db.session.commit()
        return essay_schema.dump(new_essay), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

def get_essays():
    user_id = request.args.get('user_id')
    if user_id:
        essays = Essay.query.filter_by(user_id=user_id).all()
    else:
        essays = Essay.query.all()
    return essays_schema.dump(essays)

def get_essay(essay_id):
    essay = Essay.query.get_or_404(essay_id)
    return essay_schema.dump(essay)

def update_essay(essay_id):
    essay = Essay.query.get_or_404(essay_id)
    data = request.json
    
    for key, value in data.items():
        if hasattr(essay, key):
            setattr(essay, key, value)
    
    try:
        db.session.commit()
        return essay_schema.dump(essay)
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400 