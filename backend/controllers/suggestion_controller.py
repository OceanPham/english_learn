from flask import jsonify, request
from ..extensions import db
from ..models import EssaySuggestion
from ..schemas import essay_suggestion_schema, essay_suggestions_schema
import uuid

def create_suggestion():
    data = request.json
    if not data or 'essay_id' not in data or 'issue_type' not in data or 'suggestion' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    new_suggestion = EssaySuggestion(
        id=str(uuid.uuid4()),
        essay_id=data['essay_id'],
        sentence_excerpt=data.get('sentence_excerpt'),
        issue_type=data['issue_type'],
        suggestion=data['suggestion']
    )
    
    try:
        db.session.add(new_suggestion)
        db.session.commit()
        return essay_suggestion_schema.dump(new_suggestion), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

def get_suggestions(essay_id):
    try:
        suggestions = EssaySuggestion.query.filter_by(essay_id=essay_id).all()
        return essay_suggestions_schema.dump(suggestions), 200
    except Exception as e:
        return jsonify({'message': f'Error getting suggestions: {str(e)}'}), 500 