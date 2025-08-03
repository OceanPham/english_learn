from flask import jsonify, request
from ..models import WritingScore, CombinedWritingScore, db, UserCredits
from ..schemas import writing_score_schema, writing_scores_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
from openai import OpenAI
import json
import re
from ..config.config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

CREDITS_PER_ANALYSIS = 1  # Define how many credits each analysis costs

def calculate_overall_score(scores):
    """Calculate the overall score as average of individual scores."""
    return round(sum(scores) / len(scores), 1)

def calculate_word_count_penalty(word_count, task_type):
    """Calculate penalty for insufficient word count."""
    min_words = 150 if task_type == 'task1' else 250
    if word_count >= min_words:
        return 0.0
    
    # Calculate penalty: 0.5 points for every 25 words short
    words_short = min_words - word_count
    penalty = (words_short / 25) * 0.5
    return min(penalty, 2.0)  # Maximum penalty of 2.0 points

def calculate_time_penalty(time_spent, task_type):
    """Calculate penalty for exceeding time limit."""
    if not time_spent:
        return 0.0
    
    # Time limits in minutes
    time_limit = 20 if task_type == 'task1' else 40  # 20 min for task1, 40 min for task2
    time_limit_seconds = time_limit * 60
    
    if time_spent <= time_limit_seconds:
        return 0.0
    
    # Calculate penalty: 0.1 points for every minute over
    minutes_over = (time_spent - time_limit_seconds) / 60
    penalty = minutes_over * 0.1
    return min(penalty, 1.0)  # Maximum penalty of 1.0 point

def find_text_positions(essay_text, corrections):
    """Find positions of corrections in the essay text for highlighting."""
    highlighted_corrections = {
        'grammar': [],
        'vocabulary': [],
        'structure': []
    }
    
    for category in ['grammar', 'vocabulary', 'structure']:
        if category in corrections:
            for correction in corrections[category]:
                original_text = correction.get('original', '')
                if original_text and category != 'structure':  # Structure corrections don't have specific text positions
                    # Find all occurrences of the original text
                    positions = []
                    start = 0
                    while True:
                        pos = essay_text.find(original_text, start)
                        if pos == -1:
                            break
                        positions.append({
                            'start': pos,
                            'end': pos + len(original_text),
                            'text': original_text
                        })
                        start = pos + 1
                    
                    if positions:
                        correction_with_positions = correction.copy()
                        correction_with_positions['positions'] = positions
                        highlighted_corrections[category].append(correction_with_positions)
                    else:
                        highlighted_corrections[category].append(correction)
                else:
                    highlighted_corrections[category].append(correction)
    
    return highlighted_corrections

def analyze_essay(essay_text, task_type):
    """Analyze essay using GPT-4 and return scores, feedback, and corrections with highlighting."""
    system_prompt = """You are an experienced IELTS examiner with deep knowledge of the IELTS Writing assessment criteria.
    Analyze the essay and provide scores, detailed feedback, and specific corrections based on the official IELTS Writing assessment criteria.
    
    You MUST respond in the following JSON format only:
    {
        "scores": {
            "task_achievement": <score 0-9>,
            "coherence_cohesion": <score 0-9>,
            "lexical_resource": <score 0-9>,
            "grammatical_range": <score 0-9>
        },
        "feedback": {
            "task_achievement": "<detailed feedback>",
            "coherence_cohesion": "<detailed feedback>",
            "lexical_resource": "<detailed feedback>",
            "grammatical_range": "<detailed feedback>"
        },
        "corrections": {
            "grammar": [
                {
                    "original": "<exact text from essay>",
                    "correction": "<corrected text>",
                    "explanation": "<why this correction is needed>"
                }
            ],
            "vocabulary": [
                {
                    "original": "<exact word/phrase from essay>",
                    "suggestion": "<better word/phrase>",
                    "explanation": "<why this word is better>"
                }
            ],
            "structure": [
                {
                    "issue": "<structural issue description>",
                    "suggestion": "<how to improve the structure>",
                    "example": "<example of improved structure>"
                }
            ]
        }
    }
    
    IMPORTANT: For grammar and vocabulary corrections, use the EXACT text as it appears in the essay for the "original" field.
    This is crucial for text highlighting functionality.
    
    For each criterion:
    1. Score must be between 0-9 (allowing 0.5 increments)
    2. Feedback must include:
       - Strengths
       - Areas for improvement
       - Specific examples from the text
       - Suggestions for improvement
    
    For corrections:
    1. Grammar: Identify grammatical errors and provide corrections using exact text from essay
    2. Vocabulary: Suggest better word choices using exact words/phrases from essay
    3. Structure: Suggest improvements for sentence and paragraph structure
    
    For Task 1, focus on:
    - Task Achievement: analyzing and reporting data/describing a process/object
    - Coherence and Cohesion: logical organization, paragraphing, linking
    - Lexical Resource: vocabulary range and accuracy
    - Grammatical Range and Accuracy
    
    For Task 2, focus on:
    - Task Response: addressing all parts of the task with a clear position
    - Coherence and Cohesion: logical organization, paragraphing, linking
    - Lexical Resource: vocabulary range and accuracy
    - Grammatical Range and Accuracy"""

    user_prompt = f"""Please analyze this IELTS Writing {task_type} essay and respond in the required JSON format:

{essay_text}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3  # Lower temperature for more consistent scoring
        )
        
        # Parse the JSON response
        try:
            result = json.loads(response.choices[0].message.content)
            # Validate response structure
            required_keys = ['scores', 'feedback', 'corrections']
            score_keys = ['task_achievement', 'coherence_cohesion', 'lexical_resource', 'grammatical_range']
            
            if not all(key in result for key in required_keys):
                raise ValueError("Invalid response format: missing required keys")
            
            if not all(key in result['scores'] for key in score_keys):
                raise ValueError("Invalid response format: missing score keys")
            
            if not all(key in result['feedback'] for key in score_keys):
                raise ValueError("Invalid response format: missing feedback keys")
            
            if 'corrections' not in result:
                raise ValueError("Invalid response format: missing corrections")
            
            # Add text highlighting positions
            result['corrections'] = find_text_positions(essay_text, result['corrections'])
            
            return result
        except json.JSONDecodeError:
            raise ValueError("Failed to parse GPT response as JSON")
        except Exception as e:
            raise ValueError(f"Invalid response format: {str(e)}")

    except Exception as e:
        print(f"Error analyzing essay: {str(e)}")
        raise Exception(f"Failed to analyze essay: {str(e)}")

def check_and_deduct_credits(user_id):
    """Check if user has enough credits and deduct them."""
    user_credits = UserCredits.query.filter_by(user_id=user_id).first()
    
    if not user_credits:
        raise ValueError("User credits not found")
    
    if user_credits.available_credits < CREDITS_PER_ANALYSIS:
        raise ValueError("Insufficient credits")
    
    user_credits.available_credits -= CREDITS_PER_ANALYSIS
    db.session.commit()

def score_essay(user_id, data):
    """Score a writing task and provide feedback with penalties and highlighting."""
    try:
        # Validate request data
        if not data or 'essay_text' not in data or 'task_type' not in data:
            raise ValueError("Missing required fields")
        
        essay_text = data['essay_text']
        task_type = data['task_type']
        time_spent = data.get('time_spent')  # Optional time tracking
        
        # Calculate word count
        word_count = len(essay_text.strip().split())
        
        # Check and deduct credits before processing
        check_and_deduct_credits(user_id)
            
        # Analyze essay using GPT-4
        analysis = analyze_essay(essay_text, task_type)
        
        # Calculate base overall score
        base_scores = [
            analysis['scores']['task_achievement'],
            analysis['scores']['coherence_cohesion'],
            analysis['scores']['lexical_resource'],
            analysis['scores']['grammatical_range']
        ]
        overall_score = calculate_overall_score(base_scores)
        
        # Calculate penalties
        word_count_penalty = calculate_word_count_penalty(word_count, task_type)
        time_penalty = calculate_time_penalty(time_spent, task_type)
        
        # Calculate adjusted score
        adjusted_score = max(0.0, overall_score - word_count_penalty - time_penalty)
        
        # Create new writing score record
        writing_score = WritingScore(
            user_id=user_id,
            task_type=task_type,
            essay_text=essay_text,
            word_count=word_count,
            time_spent=time_spent,
            task_achievement=analysis['scores']['task_achievement'],
            coherence_cohesion=analysis['scores']['coherence_cohesion'],
            lexical_resource=analysis['scores']['lexical_resource'],
            grammatical_range=analysis['scores']['grammatical_range'],
            overall_score=overall_score,
            word_count_penalty=word_count_penalty,
            time_penalty=time_penalty,
            adjusted_score=adjusted_score,
            task_achievement_feedback=analysis['feedback']['task_achievement'],
            coherence_cohesion_feedback=analysis['feedback']['coherence_cohesion'],
            lexical_resource_feedback=analysis['feedback']['lexical_resource'],
            grammatical_range_feedback=analysis['feedback']['grammatical_range'],
            corrections=json.dumps(analysis['corrections'])  # Store corrections with positions as JSON string
        )
        
        # Save to database
        db.session.add(writing_score)
        db.session.commit()
        
        # Check for combined score calculation
        calculate_combined_score(user_id, writing_score)
        
        # Return the created record with corrections
        result = writing_score_schema.dump(writing_score)
        result['corrections'] = json.loads(writing_score.corrections) if writing_score.corrections else {}
        return result
        
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            raise e
        raise Exception(f"Failed to score essay: {str(e)}")

def calculate_combined_score(user_id, new_score):
    """Calculate combined score when both Task 1 and Task 2 are available."""
    try:
        # Get the most recent scores for both tasks
        task1_score = WritingScore.query.filter_by(
            user_id=user_id, 
            task_type='task1'
        ).order_by(WritingScore.created_at.desc()).first()
        
        task2_score = WritingScore.query.filter_by(
            user_id=user_id, 
            task_type='task2'
        ).order_by(WritingScore.created_at.desc()).first()
        
        if task1_score and task2_score:
            # Calculate combined score: Task 1 (1/3) + Task 2 (2/3)
            combined_score = round(
                (task1_score.adjusted_score * 1/3) + (task2_score.adjusted_score * 2/3), 
                1
            )
            
            # Check if combined score already exists for these specific scores
            existing_combined = CombinedWritingScore.query.filter_by(
                user_id=user_id,
                task1_score_id=task1_score.id,
                task2_score_id=task2_score.id
            ).first()
            
            if not existing_combined:
                # Create new combined score record
                combined_writing_score = CombinedWritingScore(
                    user_id=user_id,
                    task1_score_id=task1_score.id,
                    task2_score_id=task2_score.id,
                    combined_score=combined_score
                )
                
                db.session.add(combined_writing_score)
                db.session.commit()
                
    except Exception as e:
        print(f"Error calculating combined score: {str(e)}")
        # Don't raise error as this is not critical to the main scoring process

def get_user_scores(user_id):
    """Get all writing scores for the current user."""
    try:
        scores = WritingScore.query.filter_by(user_id=user_id).order_by(WritingScore.created_at.desc()).all()
        return writing_scores_schema.dump(scores)
    except Exception as e:
        raise e

def get_score(score_id, user_id):
    """Get a specific writing score."""
    try:
        score = WritingScore.query.filter_by(id=score_id, user_id=user_id).first()
        if not score:
            raise ValueError("Score not found")
        return writing_score_schema.dump(score)
    except Exception as e:
        raise e

def get_combined_scores(user_id):
    """Get all combined writing scores for the current user."""
    try:
        combined_scores = CombinedWritingScore.query.filter_by(user_id=user_id).order_by(CombinedWritingScore.created_at.desc()).all()
        return [score.to_dict() for score in combined_scores]
    except Exception as e:
        raise e 