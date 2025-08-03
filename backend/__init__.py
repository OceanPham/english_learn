from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .extensions import db, ma, migrate
from .config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)
    # Configure CORS with support for credentials
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5175"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                "supports_credentials": True,
                "expose_headers": ["Content-Type", "Content-Length", "X-Requested-With", "Authorization"],
                "max_age": 600  # Cache preflight request for 10 minutes
            }
        },
        supports_credentials=True
    )
    
    # CORS headers are handled by the CORS middleware above
    # No need for manual CORS headers in after_request

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp
    from .routes.chat_routes import chat_bp
    from .routes.essay_routes import essay_bp
    from .routes.suggestion_routes import suggestion_bp
    from .routes.subscription_routes import subscription_bp
    from .routes.writing_routes import writing_bp
    from .routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(essay_bp, url_prefix='/api/essays')
    app.register_blueprint(suggestion_bp, url_prefix='/api')
    app.register_blueprint(subscription_bp, url_prefix='/api')
    app.register_blueprint(writing_bp, url_prefix='/api/writing')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app