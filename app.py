from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import datetime, timedelta
import json
import os
from config import config

app = Flask(__name__)
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_score = db.Column(db.Integer, default=0)
    quizzes_taken = db.Column(db.Integer, default=0)

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)  # Easy, Medium, Hard
    time_limit = db.Column(db.Integer, default=300)  # seconds
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False)  # multiple_choice, true_false, text
    options = db.Column(db.Text)  # JSON string for multiple choice options
    correct_answer = db.Column(db.String(500), nullable=False)
    points = db.Column(db.Integer, default=1)
    order = db.Column(db.Integer, default=0)

class QuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer)  # seconds
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    answers = db.Column(db.Text)  # JSON string of user answers

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password']  # In production, hash this!
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token, 'user_id': user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.password == data['password']:  # In production, use proper password hashing
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user_id': user.id,
            'username': user.username
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    
    query = Quiz.query
    if category:
        query = query.filter_by(category=category)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    
    quizzes = query.all()
    return jsonify([{
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'category': quiz.category,
        'difficulty': quiz.difficulty,
        'time_limit': quiz.time_limit,
        'question_count': len(quiz.questions)
    } for quiz in quizzes])

@app.route('/api/quiz/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = [{
        'id': q.id,
        'question_text': q.question_text,
        'question_type': q.question_type,
        'options': json.loads(q.options) if q.options else None,
        'points': q.points
    } for q in sorted(quiz.questions, key=lambda x: x.order)]
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'category': quiz.category,
        'difficulty': quiz.difficulty,
        'time_limit': quiz.time_limit,
        'questions': questions
    })

@app.route('/api/quiz/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    quiz = Quiz.query.get_or_404(quiz_id)
    user_answers = data['answers']
    time_taken = data.get('time_taken', 0)
    
    score = 0
    total_questions = len(quiz.questions)
    
    for question in quiz.questions:
        user_answer = user_answers.get(str(question.id))
        if user_answer and str(user_answer).lower().strip() == question.correct_answer.lower().strip():
            score += question.points
    
    # Save result
    result = QuizResult(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=total_questions,
        time_taken=time_taken,
        answers=json.dumps(user_answers)
    )
    
    db.session.add(result)
    
    # Update user stats
    user = User.query.get(user_id)
    user.total_score += score
    user.quizzes_taken += 1
    
    db.session.commit()
    
    return jsonify({
        'score': score,
        'total_questions': total_questions,
        'percentage': round((score / sum(q.points for q in quiz.questions)) * 100, 2),
        'time_taken': time_taken
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    users = User.query.order_by(User.total_score.desc()).limit(10).all()
    return jsonify([{
        'username': user.username,
        'total_score': user.total_score,
        'quizzes_taken': user.quizzes_taken
    } for user in users])

@app.route('/api/user/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    recent_results = QuizResult.query.filter_by(user_id=user_id).order_by(QuizResult.completed_at.desc()).limit(5).all()
    
    return jsonify({
        'username': user.username,
        'total_score': user.total_score,
        'quizzes_taken': user.quizzes_taken,
        'recent_results': [{
            'quiz_title': Quiz.query.get(result.quiz_id).title,
            'score': result.score,
            'total_questions': result.total_questions,
            'percentage': round((result.score / result.total_questions) * 100, 2),
            'completed_at': result.completed_at.isoformat()
        } for result in recent_results]
    })

def init_sample_data():
    """Initialize the database with sample quizzes"""
    if Quiz.query.count() == 0:
        # Sample quizzes
        quizzes_data = [
            {
                'title': 'Python Basics',
                'description': 'Test your knowledge of Python fundamentals',
                'category': 'Programming',
                'difficulty': 'Easy',
                'time_limit': 300,
                'questions': [
                    {
                        'question_text': 'What is the correct way to create a list in Python?',
                        'question_type': 'multiple_choice',
                        'options': ['[]', '{}', '()', 'all of the above'],
                        'correct_answer': '[]',
                        'points': 1
                    },
                    {
                        'question_text': 'Python is case-sensitive',
                        'question_type': 'true_false',
                        'options': ['True', 'False'],
                        'correct_answer': 'True',
                        'points': 1
                    }
                ]
            },
            {
                'title': 'Data Science Fundamentals',
                'description': 'Basic concepts in data science and analytics',
                'category': 'Data Science',
                'difficulty': 'Medium',
                'time_limit': 600,
                'questions': [
                    {
                        'question_text': 'What does SQL stand for?',
                        'question_type': 'text',
                        'options': None,
                        'correct_answer': 'Structured Query Language',
                        'points': 2
                    },
                    {
                        'question_text': 'Which library is commonly used for data manipulation in Python?',
                        'question_type': 'multiple_choice',
                        'options': ['NumPy', 'Pandas', 'Matplotlib', 'All of the above'],
                        'correct_answer': 'Pandas',
                        'points': 2
                    }
                ]
            }
        ]
        
        for quiz_data in quizzes_data:
            quiz = Quiz(
                title=quiz_data['title'],
                description=quiz_data['description'],
                category=quiz_data['category'],
                difficulty=quiz_data['difficulty'],
                time_limit=quiz_data['time_limit']
            )
            db.session.add(quiz)
            db.session.flush()  # Get the quiz ID
            
            for i, q_data in enumerate(quiz_data['questions']):
                question = Question(
                    quiz_id=quiz.id,
                    question_text=q_data['question_text'],
                    question_type=q_data['question_type'],
                    options=json.dumps(q_data['options']) if q_data['options'] else None,
                    correct_answer=q_data['correct_answer'],
                    points=q_data['points'],
                    order=i
                )
                db.session.add(question)
        
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        init_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5000)