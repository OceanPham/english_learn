from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..controllers.subscription_controller import create_subscription, get_subscription

subscription_bp = Blueprint('subscription', __name__)

# Explicitly handle OPTIONS for CORS preflight
@subscription_bp.route('/subscription', methods=['OPTIONS'])
def handle_subscription_options():
    # Flask-CORS should intercept this and add headers
    # Return an empty response with 200 OK
    return '', 200

@subscription_bp.route('/subscription', methods=['POST'])
@jwt_required()
def create():
    return create_subscription()

@subscription_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get():
    return get_subscription() 