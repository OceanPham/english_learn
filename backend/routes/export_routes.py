from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..controllers.export_controller import export_essay

export_bp = Blueprint('export', __name__)

@export_bp.route('/<essay_id>', methods=['POST'])
@jwt_required()
def create_export(essay_id):
    try:
        format = request.json.get('format', 'pdf')
        result = export_essay(essay_id, format)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400 