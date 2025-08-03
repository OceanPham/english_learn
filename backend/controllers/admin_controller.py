from flask import jsonify, request
from ..extensions import db
from ..models import User, Subscription, Payment, WritingScore, Essay
from datetime import datetime, timedelta
from sqlalchemy import func, extract, text, desc, and_
from sqlalchemy.sql.expression import func as sql_func, case
from ..schemas import users_schema, user_schema, payments_schema
from sqlalchemy.orm import aliased

# Custom date_trunc function for MySQL
def mysql_date_trunc(interval, field):
    if interval == 'month':
        # Return a date object for the first day of the month
        return func.DATE(
            func.CONCAT(
                func.YEAR(field), '-', 
                func.LPAD(func.MONTH(field), 2, '0'), '-01'
            )
        )
    return field

def get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            search = f"%{search}%"
            query = query.filter(
                (User.email.ilike(search)) | 
                (User.full_name.ilike(search))
            )
            
        users = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': users_schema.dump(users.items),
            'total': users.total,
            'pages': users.pages,
            'current_page': users.page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching users: {str(e)}'}), 500

def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        return user_schema.dump(user), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching user: {str(e)}'}), 500

def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'message': 'Email already in use'}), 400
            user.email = data['email']
            
        if 'full_name' in data:
            user.full_name = data['full_name']
            
        if 'role' in data and data['role'] in ['user', 'admin']:
            user.role = data['role']
            
        db.session.commit()
        return user_schema.dump(user), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating user: {str(e)}'}), 500

def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting user: {str(e)}'}), 500

def get_orders():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        search = request.args.get('search', '')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        user_id = request.args.get('user_id')
        subscription_plan = request.args.get('subscription_plan')
        
        # Base query with user join
        query = db.session.query(Subscription, User).join(
            User, Subscription.user_id == User.id
        )
        
        # Apply filters
        if status:
            query = query.filter(Subscription.status == status)
            
        if user_id:
            query = query.filter(Subscription.user_id == user_id)
            
        if subscription_plan:
            query = query.filter(Subscription.plan == subscription_plan)
            
        if search:
            search = f"%{search}%"
            query = query.filter(
                (User.email.ilike(search)) |
                (User.full_name.ilike(search)) |
                (Subscription.plan.ilike(search))
            )
            
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Subscription.start_date >= start_date)
            except ValueError:
                pass
                
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Subscription.start_date <= end_date)
            except ValueError:
                pass
        
        # Order by most recent first
        query = query.order_by(Subscription.start_date.desc())
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        orders = []
        for subscription, user in pagination.items:
            order_data = {
                'id': subscription.id,
                'plan': subscription.plan,
                'status': subscription.status,
                'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                'created_at': subscription.created_at.isoformat() if subscription.created_at else None,
                'is_active': subscription.status == 'active' and \
                            (not subscription.end_date or subscription.end_date >= datetime.utcnow().date()),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name or 'No Name',
                    'role': user.role,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
            }
                
            orders.append(order_data)
            
        return jsonify({
            'items': orders,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching orders: {str(e)}'}), 500
        
def get_order_stats():
    try:
        # Total revenue
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'success'
        ).scalar() or 0
        
        # Monthly revenue for the last 12 months
        monthly_revenue = db.session.query(
            func.DATE_FORMAT(Payment.paid_at, '%Y-%m').label('month'),
            func.sum(Payment.amount).label('total')
        ).filter(
            Payment.payment_status == 'success',
            Payment.paid_at >= datetime.utcnow() - timedelta(days=365)
        ).group_by('month').order_by('month').all()
        
        # Payment methods distribution
        payment_methods = db.session.query(
            Payment.method,
            func.count(Payment.id).label('count'),
            func.sum(Payment.amount).label('total')
        ).filter(
            Payment.payment_status == 'success'
        ).group_by(Payment.method).all()
        
        # Subscription plan distribution
        subscription_stats = db.session.query(
            Subscription.plan,
            func.count(Subscription.id).label('count'),
            func.sum(case([(Subscription.plan == 'free', 0)], else_=1)).label('paid_count')
        ).group_by(Subscription.plan).all()
        
        # Recent transactions
        recent_transactions = Payment.query.join(User).filter(
            Payment.payment_status == 'success'
        ).order_by(desc(Payment.paid_at)).limit(5).all()
        
        # Format response
        return jsonify({
            'total_revenue': float(total_revenue) if total_revenue else 0,
            'monthly_revenue': [
                {'month': m[0], 'total': float(m[1]) if m[1] else 0} 
                for m in monthly_revenue
            ],
            'payment_methods': [
                {'method': m[0], 'count': m[1], 'total': float(m[2]) if m[2] else 0} 
                for m in payment_methods
            ],
            'subscription_stats': [
                {'plan': s[0], 'count': s[1], 'is_paid': s[0] != 'free'} 
                for s in subscription_stats
            ],
            'recent_transactions': [
                {
                    'id': t.id,
                    'user_email': t.user.email if t.user else None,
                    'amount': float(t.amount) if t.amount else 0,
                    'method': t.method,
                    'paid_at': t.paid_at.isoformat() if t.paid_at else None
                }
                for t in recent_transactions
            ]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching order stats: {str(e)}'}), 500

def get_dashboard_stats():
    try:
        # Total users
        total_users = User.query.count()
        
        # New users this month
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        new_users_this_month = User.query.filter(
            extract('month', User.created_at) == current_month,
            extract('year', User.created_at) == current_year
        ).count()
        
        # Total revenue
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'success'
        ).scalar() or 0
        
        # Monthly revenue - MySQL compatible version
        monthly_revenue = db.session.query(
            func.DATE_FORMAT(Payment.paid_at, '%Y-%m-01').label('month'),
            func.sum(Payment.amount).label('total')
        ).filter(
            Payment.payment_status == 'success',
            Payment.paid_at >= datetime.utcnow() - timedelta(days=365)
        ).group_by('month').order_by('month').all()
        
        # User growth with custom date_trunc
        user_growth = db.session.query(
            func.DATE_FORMAT(User.created_at, '%Y-%m-01').label('month'),
            func.count(User.id).label('count')
        ).group_by('month').order_by('month').all()
        
        # Package statistics
        package_stats = db.session.query(
            Subscription.plan,
            func.count(Subscription.id).label('count')
        ).filter(
            Subscription.status == 'active'
        ).group_by(Subscription.plan).all()
        
        # Order statistics
        order_stats = db.session.query(
            Payment.payment_status,
            func.count(Payment.id).label('count'),
            func.sum(
                case(
                    (Payment.payment_status == 'success', Payment.amount),
                    else_=0
                )
            ).label('total')
        ).group_by(Payment.payment_status).all()
        
        # Recent activities
        recent_activities = []
        
        # Recent users
        recent_users = User.query.order_by(desc(User.created_at)).limit(5).all()
        for user in recent_users:
            recent_activities.append({
                'type': 'new_user',
                'user_id': user.id,
                'user_email': user.email,
                'user_name': user.full_name,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })
            
        # Recent payments with explicit join
        recent_payments = db.session.query(Payment).join(
            User, Payment.user_id == User.id
        ).order_by(desc(Payment.paid_at)).limit(5).all()
        for payment in recent_payments:
            recent_activities.append({
                'type': 'payment',
                'payment_id': payment.id,
                'user_id': payment.user_id,
                'user_email': payment.user.email if payment.user else None,
                'amount': float(payment.amount) if payment.amount else 0,
                'status': payment.payment_status,
                'created_at': payment.paid_at.isoformat() if payment.paid_at else None
            })
            
        # Sort all activities by created_at
        recent_activities.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        recent_activities = recent_activities[:10]  # Get top 10 most recent
        
        # Format the response data
        response_data = {
            'summary': {
                'total_users': total_users,
                'new_users_this_month': new_users_this_month,
                'total_revenue': float(total_revenue) if total_revenue else 0,
                'active_subscriptions': sum(p[1] for p in package_stats if p[0] != 'free'),
                'total_orders': sum(o[1] for o in order_stats),
                'successful_orders': next((o[1] for o in order_stats if o[0] == 'success'), 0),
                'pending_orders': next((o[1] for o in order_stats if o[0] == 'pending'), 0),
                'failed_orders': next((o[1] for o in order_stats if o[0] == 'failed'), 0)
            },
            'charts': {
                'monthly_revenue': [
                    {'month': m[0].strftime('%Y-%m') if hasattr(m[0], 'strftime') else m[0], 
                     'total': float(m[1]) if m[1] else 0} 
                    for m in monthly_revenue
                ],
                'user_growth': [
                    {'month': m[0].strftime('%Y-%m') if hasattr(m[0], 'strftime') else m[0], 
                     'count': m[1]} 
                    for m in user_growth
                ],
                'subscription_distribution': [
                    {'plan': p[0], 'count': p[1], 'is_paid': p[0] != 'free'} 
                    for p in package_stats
                ],
                'order_status': [
                    {'status': o[0], 'count': o[1], 'total': float(o[2]) if o[2] else 0} 
                    for o in order_stats
                ]
            },
            'recent_activities': recent_activities,
            'package_stats': [{'plan': p[0], 'count': p[1], 'is_paid': p[0] != 'free'} for p in package_stats]
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching dashboard stats: {str(e)}'}), 500

def get_monthly_revenue():
    try:
        # Get monthly revenue for the last 12 months
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        
        # Query to get monthly revenue
        monthly_revenue = db.session.query(
            func.YEAR(Payment.paid_at).label('year'),
            func.MONTH(Payment.paid_at).label('month'),
            func.sum(Payment.amount).label('revenue')
        ).filter(
            Payment.paid_at >= one_year_ago,
            Payment.payment_status == 'success'
        ).group_by(
            'year', 'month'
        ).order_by(
            'year', 'month'
        ).all()
        
        # Format the response
        result = [
            {
                'month': f"{row.year}-{row.month:02d}-01",
                'revenue': float(row.revenue) if row.revenue else 0
            }
            for row in monthly_revenue
        ]
        
        return jsonify(result), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching monthly revenue: {str(e)}'}), 500

def get_user_growth():
    try:
        # Get user growth for the last 12 months
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        
        # Query to get monthly user growth
        monthly_users = db.session.query(
            func.YEAR(User.created_at).label('year'),
            func.MONTH(User.created_at).label('month'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= one_year_ago
        ).group_by(
            'year', 'month'
        ).order_by(
            'year', 'month'
        ).all()
        
        # Format the response
        result = [
            {
                'month': f"{row.year}-{row.month:02d}-01",
                'count': row.count
            }
            for row in monthly_users
        ]
        
        return jsonify(result), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching user growth data: {str(e)}'}), 500

def get_subscription_stats():
    try:
        from sqlalchemy import func
        
        # Get total number of subscriptions
        total_subscriptions = db.session.query(func.count(Subscription.id)).scalar()
        
        # Get subscriptions by plan
        subscriptions_by_plan = db.session.query(
            Subscription.plan,
            func.count(Subscription.id).label('count')
        ).group_by(Subscription.plan).all()
        
        # Get active vs expired subscriptions
        active_subscriptions = db.session.query(
            func.count(Subscription.id)
        ).filter(
            Subscription.status == 'active',
            Subscription.end_date >= datetime.utcnow().date()
        ).scalar()
        
        expired_subscriptions = db.session.query(
            func.count(Subscription.id)
        ).filter(
            Subscription.status == 'expired',
            Subscription.end_date < datetime.utcnow().date()
        ).scalar()
        
        # Format the response
        return jsonify({
            'total_subscriptions': total_subscriptions,
            'by_plan': [{'plan': plan, 'count': count} for plan, count in subscriptions_by_plan],
            'active_subscriptions': active_subscriptions,
            'expired_subscriptions': expired_subscriptions,
            'subscription_status': {
                'active': active_subscriptions,
                'expired': expired_subscriptions
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error fetching subscription stats: {str(e)}'}), 500
