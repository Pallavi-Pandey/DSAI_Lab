import json
import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from jose import JWTError, jwt
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel

from config import settings

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Pydantic Schemas (Data Validation) ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserPublic(BaseModel):
    id: int
    username: str
    total_score: int
    quizzes_taken: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class QuestionPublic(BaseModel):
    id: int
    question_text: str
    question_type: str
    options: Optional[List[str]]
    points: int

    class Config:
        orm_mode = True

class QuizPublic(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: str
    difficulty: str
    time_limit: int
    question_count: int

    class Config:
        orm_mode = True

class QuizDetail(QuizPublic):
    questions: List[QuestionPublic]

class Answer(BaseModel):
    question_id: int
    answer: str

class QuizSubmission(BaseModel):
    answers: List[Answer]
    time_taken: int

class QuizResultPublic(BaseModel):
    score: int
    total_questions: int
    percentage: float
    time_taken: int

# --- SQLAlchemy Models (Database Tables) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_score = Column(Integer, default=0)
    quizzes_taken = Column(Integer, default=0)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    time_limit = Column(Integer, default=300)
    created_at = Column(DateTime, default=datetime.utcnow)
    questions = relationship('Question', back_populates='quiz', cascade='all, delete-orphan')

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(Text)
    correct_answer = Column(String, nullable=False)
    points = Column(Integer, default=1)
    order = Column(Integer, default=0)
    quiz = relationship('Quiz', back_populates='questions')

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    time_taken = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    answers = Column(Text)

# --- FastAPI App Initialization ---
app = FastAPI()
app.mount("/static", StaticFiles(directory="../static"), name="static")
templates = Jinja2Templates(directory="../templates")

# --- Dependency Injection ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Authentication ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # You can add sample data initialization here if needed

@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    db_user = User(username=user.username, email=user.email, password=user.password) # In production, hash this!
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not user.password == form_data.password: # In production, use proper password hashing
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/quizzes", response_model=List[QuizPublic])
def get_quizzes(category: Optional[str] = None, difficulty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Quiz)
    if category:
        query = query.filter(Quiz.category == category)
    if difficulty:
        query = query.filter(Quiz.difficulty == difficulty)
    quizzes = query.all()
    return [{**quiz.__dict__, "question_count": len(quiz.questions)} for quiz in quizzes]

@app.get("/api/quizzes/{quiz_id}", response_model=QuizDetail)
def get_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Manually process questions to fit the Pydantic model
    questions_public = []
    for q in sorted(quiz.questions, key=lambda x: x.order):
        questions_public.append(
            QuestionPublic(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=json.loads(q.options) if q.options else None,
                points=q.points
            )
        )

    return QuizDetail(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        category=quiz.category,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        question_count=len(quiz.questions),
        questions=questions_public
    )

@app.post("/api/quizzes/{quiz_id}/submit", response_model=QuizResultPublic)
def submit_quiz(quiz_id: int, submission: QuizSubmission, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    score = 0
    user_answers_map = {ans.question_id: ans.answer for ans in submission.answers}

    for question in quiz.questions:
        user_answer = user_answers_map.get(question.id)
        if user_answer and str(user_answer).lower().strip() == question.correct_answer.lower().strip():
            score += question.points

    total_points = sum(q.points for q in quiz.questions)
    percentage = round((score / total_points) * 100, 2) if total_points > 0 else 0

    result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        total_questions=len(quiz.questions),
        time_taken=submission.time_taken,
        answers=json.dumps({ans.question_id: ans.answer for ans in submission.answers})
    )
    db.add(result)

    current_user.total_score += score
    current_user.quizzes_taken += 1
    db.commit()

    return QuizResultPublic(score=score, total_questions=len(quiz.questions), percentage=percentage, time_taken=submission.time_taken)

@app.get("/api/leaderboard", response_model=List[UserPublic])
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.total_score.desc()).limit(10).all()

@app.get("/api/users/me", response_model=UserPublic)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
