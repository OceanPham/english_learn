from flask import Blueprint
from ..controllers.essay_controller import create_essay, get_essays, get_essay, update_essay

essay_bp = Blueprint('essay', __name__)

essay_bp.route('/', methods=['POST'])(create_essay)
essay_bp.route('/', methods=['GET'])(get_essays)
essay_bp.route('/<essay_id>', methods=['GET'])(get_essay)
essay_bp.route('/<essay_id>', methods=['PUT'])(update_essay) 