# Environment Configuration Guide

To run the application, you need to create a `.env` file in the root directory with the following environment variables:

```env
# Database Configuration
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ielts_ai_platform

# Application Configuration
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here

# Server Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1

# Optional: API Keys for External Services
# OPENAI_API_KEY=your_openai_api_key_here
# AWS_ACCESS_KEY_ID=your_aws_access_key_here
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
```

## Instructions

1. Create a new file named `.env` in the project root directory
2. Copy the above configuration
3. Replace the placeholder values with your actual configuration:
   - `MYSQL_USER`: Your MySQL username
   - `MYSQL_PASSWORD`: Your MySQL password
   - `MYSQL_HOST`: Your MySQL host (usually localhost)
   - `MYSQL_PORT`: Your MySQL port (default 3306)
   - `MYSQL_DATABASE`: Your database name (default: ielts_ai_platform)
   - `SECRET_KEY`: A random string for Flask session encryption
   - `JWT_SECRET_KEY`: A random string for JWT token encryption

## Security Notes

- Never commit the `.env` file to version control
- Keep your secret keys secure
- Use strong passwords for database access
- In production, use more complex secret keys

## Generating Secret Keys

You can generate secure secret keys using Python:

```python
import secrets
print(secrets.token_hex(32))
```

## Environment Specific Configuration

You might want to maintain different .env files for different environments:
- `.env.development`
- `.env.testing`
- `.env.production`

Just make sure to load the correct one based on your FLASK_ENV setting. 