# IELTS AI Platform API

A Flask-based REST API for an IELTS AI platform that helps users improve their IELTS writing skills through AI-powered feedback and scoring.

## Features

- User management with authentication
- Essay submission and automated scoring
- AI-powered writing feedback and suggestions
- Chat interface for user assistance
- Export functionality for essays
- Subscription and payment management
- User credit system

## Project Structure

```
project/
├── app.py                  # Main application file
├── models.py              # Database models
├── schemas.py             # Marshmallow schemas
├── controllers/           # Controllers directory
│   ├── user_controller.py
│   ├── essay_controller.py
│   ├── suggestion_controller.py
│   └── chat_controller.py
├── routes/               # Routes directory
│   ├── user_routes.py
│   ├── essay_routes.py
│   ├── suggestion_routes.py
│   └── chat_routes.py
├── config/              # Configuration directory
│   └── env.md          # Environment setup guide
└── requirements.txt     # Project dependencies
```

## Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ielts-ai-platform
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
   - Copy the environment configuration from `config/env.md`
   - Create a new `.env` file in the root directory
   - Fill in your configuration values

5. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

## Running the Application

1. Ensure your MySQL server is running
2. Activate your virtual environment if not already active
3. Start the Flask development server:
```bash
flask run
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Users
- POST /api/users - Create a new user
- GET /api/users - Get all users
- GET /api/users/<user_id> - Get a specific user

### Essays
- POST /api/essays - Submit a new essay
- GET /api/essays - Get all essays (or filter by user_id)
- GET /api/essays/<essay_id> - Get a specific essay
- PUT /api/essays/<essay_id> - Update an essay

### Essay Suggestions
- POST /api/suggestions - Create a new suggestion
- GET /api/suggestions/<essay_id> - Get suggestions for an essay

### AI Chat
- POST /api/chats - Create a new chat message
- GET /api/chats/<user_id> - Get chat history for a user

## Environment Configuration

See `config/env.md` for detailed environment setup instructions. The application requires several environment variables to be set for:
- Database connection
- Application security
- External services (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.