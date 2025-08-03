from datetime import datetime
import uuid
from .extensions import db
import json

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.Enum('user', 'admin'), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    essays = db.relationship('Essay', backref='user', lazy=True)
    chats = db.relationship('AIChat', backref='user', lazy=True)
    subscription = db.relationship('Subscription', backref='user', lazy=True, uselist=False)
    credits = db.relationship('UserCredits', backref='user', lazy=True, uselist=False)

class Essay(db.Model):
    __tablename__ = 'Essays'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'))
    title = db.Column(db.String(255))
    task_type = db.Column(db.Enum('task1', 'task2'), nullable=False)
    input_text = db.Column(db.Text, nullable=False)
    feedback_text = db.Column(db.Text)
    band_score_total = db.Column(db.Float)
    band_task_response = db.Column(db.Float)
    band_coherence = db.Column(db.Float)
    band_grammar = db.Column(db.Float)
    band_lexical = db.Column(db.Float)
    status = db.Column(db.Enum('pending', 'scored', 'exported'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    suggestions = db.relationship('EssaySuggestion', backref='essay', lazy=True)
    exports = db.relationship('Export', backref='essay', lazy=True)

class EssaySuggestion(db.Model):
    __tablename__ = 'EssaySuggestions'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    essay_id = db.Column(db.String(36), db.ForeignKey('Essays.id', ondelete='CASCADE'))
    sentence_excerpt = db.Column(db.Text)
    issue_type = db.Column(db.Enum('grammar', 'vocabulary', 'coherence', 'task'))
    suggestion = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AIChat(db.Model):
    __tablename__ = 'AIChats'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'))
    message = db.Column(db.Text, nullable=False)
    role = db.Column(db.Enum('user', 'assistant'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Export(db.Model):
    __tablename__ = 'Exports'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    essay_id = db.Column(db.String(36), db.ForeignKey('Essays.id', ondelete='CASCADE'))
    format = db.Column(db.Enum('pdf', 'docx'), nullable=False)
    file_url = db.Column(db.Text, nullable=False)
    exported_at = db.Column(db.DateTime, default=datetime.utcnow)

class Subscription(db.Model):
    __tablename__ = 'Subscriptions'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'))
    plan = db.Column(db.Enum('free', 'student', 'pro', 'unlimited'), nullable=False)
    status = db.Column(db.Enum('active', 'expired', 'cancelled'), default='active')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    __tablename__ = 'Payments'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    method = db.Column(db.Enum('credit_card', 'paypal', 'momo', 'vn_pay'), nullable=False)
    payment_status = db.Column(db.Enum('success', 'failed', 'pending'), default='pending')
    transaction_id = db.Column(db.String(255), unique=True)
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserCredits(db.Model):
    __tablename__ = 'UserCredits'
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'), primary_key=True)
    available_credits = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class WritingScore(db.Model):
    __tablename__ = 'WritingScores'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    task_type = db.Column(db.String(20), nullable=False)  # 'task1' or 'task2'
    essay_text = db.Column(db.Text, nullable=False)
    
    # Word count and time tracking
    word_count = db.Column(db.Integer, nullable=False, default=0)
    time_spent = db.Column(db.Integer, nullable=True)  # in seconds
    
    # Scoring criteria (0-9 scale with 0.5 increments)
    task_achievement = db.Column(db.Float, nullable=False)
    coherence_cohesion = db.Column(db.Float, nullable=False)
    lexical_resource = db.Column(db.Float, nullable=False)
    grammatical_range = db.Column(db.Float, nullable=False)
    
    # Overall score (average of the four criteria)
    overall_score = db.Column(db.Float, nullable=False)
    
    # Penalties and adjustments
    word_count_penalty = db.Column(db.Float, nullable=False, default=0.0)
    time_penalty = db.Column(db.Float, nullable=False, default=0.0)
    adjusted_score = db.Column(db.Float, nullable=False)  # Score after penalties
    
    # Feedback for each criterion
    task_achievement_feedback = db.Column(db.Text)
    coherence_cohesion_feedback = db.Column(db.Text)
    lexical_resource_feedback = db.Column(db.Text)
    grammatical_range_feedback = db.Column(db.Text)
    
    # Corrections data with highlighting positions
    corrections = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('writing_scores', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_type': self.task_type,
            'essay_text': self.essay_text,
            'word_count': self.word_count,
            'time_spent': self.time_spent,
            'task_achievement': self.task_achievement,
            'coherence_cohesion': self.coherence_cohesion,
            'lexical_resource': self.lexical_resource,
            'grammatical_range': self.grammatical_range,
            'overall_score': self.overall_score,
            'word_count_penalty': self.word_count_penalty,
            'time_penalty': self.time_penalty,
            'adjusted_score': self.adjusted_score,
            'task_achievement_feedback': self.task_achievement_feedback,
            'coherence_cohesion_feedback': self.coherence_cohesion_feedback,
            'lexical_resource_feedback': self.lexical_resource_feedback,
            'grammatical_range_feedback': self.grammatical_range_feedback,
            'corrections': json.loads(self.corrections) if self.corrections else {},
            'created_at': self.created_at.isoformat()
        }

# Add new model for combined scores
class CombinedWritingScore(db.Model):
    __tablename__ = 'CombinedWritingScores'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    task1_score_id = db.Column(db.String(36), db.ForeignKey('WritingScores.id'), nullable=True)
    task2_score_id = db.Column(db.String(36), db.ForeignKey('WritingScores.id'), nullable=True)
    
    # Combined score calculation: Task 1 (1/3) + Task 2 (2/3)
    combined_score = db.Column(db.Float, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('combined_writing_scores', lazy=True))
    task1_score = db.relationship('WritingScore', foreign_keys=[task1_score_id])
    task2_score = db.relationship('WritingScore', foreign_keys=[task2_score_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task1_score_id': self.task1_score_id,
            'task2_score_id': self.task2_score_id,
            'combined_score': self.combined_score,
            'created_at': self.created_at.isoformat(),
            'task1_score': self.task1_score.to_dict() if self.task1_score else None,
            'task2_score': self.task2_score.to_dict() if self.task2_score else None
        } 