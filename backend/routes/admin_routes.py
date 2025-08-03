from functools import wraps
from flask import Blueprint, request
from ..controllers import admin_controller
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import User

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return {'message': 'Admin access required'}, 403
        return fn(*args, **kwargs)
    return wrapper

# User management routes
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users_route():
    return admin_controller.get_users()

@admin_bp.route('/users/<string:user_id>', methods=['GET'])
@admin_required
def get_user_route(user_id):
    return admin_controller.get_user(user_id)

@admin_bp.route('/users/<string:user_id>', methods=['PUT'])
@admin_required
def update_user_route(user_id):
    return admin_controller.update_user(user_id)

@admin_bp.route('/users/<string:user_id>', methods=['DELETE'])
@admin_required
def delete_user_route(user_id):
    return admin_controller.delete_user(user_id)

# Order management routes
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_orders_route():
    return admin_controller.get_orders()

@admin_bp.route('/orders/stats', methods=['GET'])
@admin_required
def get_order_stats_route():
    return admin_controller.get_order_stats()

# Statistics routes
@admin_bp.route('/stats/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats_route():
    return admin_controller.get_dashboard_stats()

@admin_bp.route('/stats/monthly-revenue', methods=['GET'])
@admin_required
def get_monthly_revenue_route():
    return admin_controller.get_monthly_revenue()

@admin_bp.route('/stats/user-growth', methods=['GET'])
@admin_required
def get_user_growth_route():
    return admin_controller.get_user_growth()

@admin_bp.route('/stats/subscription', methods=['GET'])
@admin_required
def get_subscription_stats_route():
    return admin_controller.get_subscription_stats()

# Export routes
@admin_bp.route('/export/orders', methods=['GET'])
@admin_required
def export_orders_route():
    # Get query parameters
    status = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    return admin_controller.export_orders(status, start_date, end_date)

@admin_bp.route('/export/users', methods=['GET'])
@admin_required
def export_users_route():
    return admin_controller.export_users()
