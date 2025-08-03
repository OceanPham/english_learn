from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields, validate, validates, ValidationError
from .models import User, Essay, EssaySuggestion, AIChat, Export, Subscription, Payment, UserCredits, WritingScore

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_relationships = True
        load_instance = True

class EssaySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Essay
        include_relationships = True
        load_instance = True

class EssaySuggestionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = EssaySuggestion
        include_relationships = True
        load_instance = True

class AIChatSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AIChat
        include_relationships = True
        load_instance = True

class ExportSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Export
        include_relationships = True
        load_instance = True

class SubscriptionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Subscription
        include_relationships = True
        load_instance = True

class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        include_relationships = True
        load_instance = True

class UserCreditsSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = UserCredits
        include_relationships = True
        load_instance = True

class WritingScoreSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = WritingScore
        include_relationships = True
        load_instance = True

    task_achievement = fields.Float(validate=validate.Range(min=0, max=9))
    coherence_cohesion = fields.Float(validate=validate.Range(min=0, max=9))
    lexical_resource = fields.Float(validate=validate.Range(min=0, max=9))
    grammatical_range = fields.Float(validate=validate.Range(min=0, max=9))

    @validates('task_achievement')
    def validate_task_achievement(self, value):
        if value * 2 % 1 != 0:
            raise ValidationError("Score must be in 0.5 increments")

    @validates('coherence_cohesion')
    def validate_coherence_cohesion(self, value):
        if value * 2 % 1 != 0:
            raise ValidationError("Score must be in 0.5 increments")

    @validates('lexical_resource')
    def validate_lexical_resource(self, value):
        if value * 2 % 1 != 0:
            raise ValidationError("Score must be in 0.5 increments")

    @validates('grammatical_range')
    def validate_grammatical_range(self, value):
        if value * 2 % 1 != 0:
            raise ValidationError("Score must be in 0.5 increments")

# Initialize schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
essay_schema = EssaySchema()
essays_schema = EssaySchema(many=True)
essay_suggestion_schema = EssaySuggestionSchema()
essay_suggestions_schema = EssaySuggestionSchema(many=True)
chat_schema = AIChatSchema()
chats_schema = AIChatSchema(many=True)
export_schema = ExportSchema()
exports_schema = ExportSchema(many=True)
subscription_schema = SubscriptionSchema()
subscriptions_schema = SubscriptionSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
user_credits_schema = UserCreditsSchema()
user_credits_list_schema = UserCreditsSchema(many=True)
writing_score_schema = WritingScoreSchema()
writing_scores_schema = WritingScoreSchema(many=True) 