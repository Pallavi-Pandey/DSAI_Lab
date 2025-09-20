"""
Sample data for QuizMaster application
"""

import json
from sqlalchemy.orm import Session
from app import Quiz, Question, SessionLocal

def create_sample_data():
    """Create sample quiz data for testing"""
    # First, create all tables
    from app import Base, engine
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Quiz).first():
            print("Sample data already exists!")
            return
            
        # Programming Quiz
        programming_quiz = Quiz(
            title="Python Programming Basics",
            description="Test your knowledge of Python fundamentals",
            category="Programming",
            difficulty="Easy",
            time_limit=300
        )
        db.add(programming_quiz)
        db.flush()
        
        programming_questions = [
            {
                "question_text": "What is the correct way to create a list in Python?",
                "question_type": "multiple_choice",
                "options": ["my_list = []", "my_list = {}", "my_list = ()", "my_list = <>"],
                "correct_answer": "my_list = []",
                "points": 1,
                "order": 1
            },
            {
                "question_text": "Which keyword is used to define a function in Python?",
                "question_type": "multiple_choice", 
                "options": ["function", "def", "func", "define"],
                "correct_answer": "def",
                "points": 1,
                "order": 2
            },
            {
                "question_text": "What does 'len()' function return?",
                "question_type": "multiple_choice",
                "options": ["Length of an object", "Last element", "First element", "Type of object"],
                "correct_answer": "Length of an object",
                "points": 1,
                "order": 3
            },
            {
                "question_text": "How do you create a comment in Python?",
                "question_type": "multiple_choice",
                "options": ["// comment", "# comment", "/* comment */", "<!-- comment -->"],
                "correct_answer": "# comment",
                "points": 1,
                "order": 4
            },
            {
                "question_text": "What is the output of print(type([]))?",
                "question_type": "text",
                "options": None,
                "correct_answer": "<class 'list'>",
                "points": 2,
                "order": 5
            }
        ]
        
        for q_data in programming_questions:
            question = Question(
                quiz_id=programming_quiz.id,
                question_text=q_data["question_text"],
                question_type=q_data["question_type"],
                options=json.dumps(q_data["options"]) if q_data["options"] else None,
                correct_answer=q_data["correct_answer"],
                points=q_data["points"],
                order=q_data["order"]
            )
            db.add(question)

        # Data Science Quiz
        ds_quiz = Quiz(
            title="Data Science Fundamentals",
            description="Basic concepts in data science and machine learning",
            category="Data Science",
            difficulty="Medium",
            time_limit=600
        )
        db.add(ds_quiz)
        db.flush()
        
        ds_questions = [
            {
                "question_text": "What is the primary purpose of data preprocessing?",
                "question_type": "multiple_choice",
                "options": ["Clean and prepare data", "Visualize data", "Store data", "Delete data"],
                "correct_answer": "Clean and prepare data",
                "points": 1,
                "order": 1
            },
            {
                "question_text": "Which library is commonly used for data manipulation in Python?",
                "question_type": "multiple_choice",
                "options": ["matplotlib", "pandas", "requests", "flask"],
                "correct_answer": "pandas",
                "points": 1,
                "order": 2
            },
            {
                "question_text": "What does 'overfitting' mean in machine learning?",
                "question_type": "multiple_choice",
                "options": [
                    "Model performs well on training data but poorly on new data",
                    "Model performs poorly on all data",
                    "Model has too few parameters",
                    "Model trains too quickly"
                ],
                "correct_answer": "Model performs well on training data but poorly on new data",
                "points": 2,
                "order": 3
            },
            {
                "question_text": "Name one popular algorithm for classification tasks.",
                "question_type": "text",
                "options": None,
                "correct_answer": "Random Forest",
                "points": 2,
                "order": 4
            }
        ]
        
        for q_data in ds_questions:
            question = Question(
                quiz_id=ds_quiz.id,
                question_text=q_data["question_text"],
                question_type=q_data["question_type"],
                options=json.dumps(q_data["options"]) if q_data["options"] else None,
                correct_answer=q_data["correct_answer"],
                points=q_data["points"],
                order=q_data["order"]
            )
            db.add(question)

        # Mathematics Quiz
        math_quiz = Quiz(
            title="Basic Mathematics",
            description="Fundamental mathematical concepts and calculations",
            category="Mathematics",
            difficulty="Easy",
            time_limit=300
        )
        db.add(math_quiz)
        db.flush()
        
        math_questions = [
            {
                "question_text": "What is 15 + 27?",
                "question_type": "multiple_choice",
                "options": ["41", "42", "43", "44"],
                "correct_answer": "42",
                "points": 1,
                "order": 1
            },
            {
                "question_text": "What is the square root of 64?",
                "question_type": "multiple_choice",
                "options": ["6", "7", "8", "9"],
                "correct_answer": "8",
                "points": 1,
                "order": 2
            },
            {
                "question_text": "If x + 5 = 12, what is x?",
                "question_type": "text",
                "options": None,
                "correct_answer": "7",
                "points": 2,
                "order": 3
            }
        ]
        
        for q_data in math_questions:
            question = Question(
                quiz_id=math_quiz.id,
                question_text=q_data["question_text"],
                question_type=q_data["question_type"],
                options=json.dumps(q_data["options"]) if q_data["options"] else None,
                correct_answer=q_data["correct_answer"],
                points=q_data["points"],
                order=q_data["order"]
            )
            db.add(question)

        # Advanced Programming Quiz
        advanced_quiz = Quiz(
            title="Advanced Python Concepts",
            description="Deep dive into advanced Python programming concepts",
            category="Programming",
            difficulty="Hard",
            time_limit=900
        )
        db.add(advanced_quiz)
        db.flush()
        
        advanced_questions = [
            {
                "question_text": "What is a decorator in Python?",
                "question_type": "multiple_choice",
                "options": [
                    "A function that modifies another function",
                    "A design pattern",
                    "A data structure",
                    "A built-in module"
                ],
                "correct_answer": "A function that modifies another function",
                "points": 2,
                "order": 1
            },
            {
                "question_text": "What does the 'yield' keyword do?",
                "question_type": "multiple_choice",
                "options": [
                    "Creates a generator",
                    "Returns a value",
                    "Breaks a loop",
                    "Imports a module"
                ],
                "correct_answer": "Creates a generator",
                "points": 2,
                "order": 2
            },
            {
                "question_text": "Explain the difference between 'is' and '==' operators.",
                "question_type": "text",
                "options": None,
                "correct_answer": "is checks identity, == checks equality",
                "points": 3,
                "order": 3
            }
        ]
        
        for q_data in advanced_questions:
            question = Question(
                quiz_id=advanced_quiz.id,
                question_text=q_data["question_text"],
                question_type=q_data["question_type"],
                options=json.dumps(q_data["options"]) if q_data["options"] else None,
                correct_answer=q_data["correct_answer"],
                points=q_data["points"],
                order=q_data["order"]
            )
            db.add(question)

        db.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
