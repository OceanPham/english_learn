from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..controllers.writing_controller import score_essay, get_user_scores, get_score, get_combined_scores

writing_bp = Blueprint('writing', __name__)

@writing_bp.route('/score', methods=['POST'])
@jwt_required()
def create_score():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        result = score_essay(user_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@writing_bp.route('/scores', methods=['GET'])
@jwt_required()
def list_scores():
    try:
        user_id = get_jwt_identity()
        scores = get_user_scores(user_id)
        return jsonify(scores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@writing_bp.route('/scores/<score_id>', methods=['GET'])
@jwt_required()
def get_score_detail(score_id):
    try:
        user_id = get_jwt_identity()
        score = get_score(score_id, user_id)
        return jsonify(score), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@writing_bp.route('/combined-scores', methods=['GET'])
@jwt_required()
def list_combined_scores():
    try:
        user_id = get_jwt_identity()
        combined_scores = get_combined_scores(user_id)
        return jsonify(combined_scores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400 