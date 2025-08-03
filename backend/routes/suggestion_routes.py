from flask import Blueprint
from ..controllers.suggestion_controller import create_suggestion, get_suggestions

suggestion_bp = Blueprint('suggestion', __name__)

suggestion_bp.route('/', methods=['POST'])(create_suggestion)
suggestion_bp.route('/<essay_id>', methods=['GET'])(get_suggestions) 