import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:8000/quizzes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        setTimeLeft(data.timeLimit * 60);
      } else {
        toast.error('Failed to fetch quiz');
        navigate('/quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to take quizzes');
      navigate('/quizzes');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, quizCompleted, submitQuiz]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (quizCompleted) return;
    
    try {
      // Calculate score
      const correctAnswers = quiz.questions.filter((question, index) => 
        answers[question.id] === question.correct_answer
      ).length;
      const score = Math.round((correctAnswers / quiz.questions.length) * 100);

      const response = await fetch(`http://localhost:8000/quiz-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'User',
          quiz_title: quiz.title,
          score: score,
          total_questions: quiz.questions.length,
          time_taken: (quiz.timeLimit * 60) - timeLeft,
          completed_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        const resultData = {
          quiz_title: quiz.title,
          total_questions: quiz.questions.length,
          correct_answers: correctAnswers,
          incorrect_answers: quiz.questions.length - correctAnswers,
          time_taken: (quiz.timeLimit * 60) - timeLeft,
          score: score
        };
        setResult(resultData);
        setQuizCompleted(true);
        toast.success('Quiz submitted successfully!');
        navigate('/quiz-results', { state: { results: resultData } });
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="error-message">Quiz not found</div>;
  }

  // Quiz not started yet
  if (!quizStarted) {
    return (
      <div className="quiz-intro">
        <div className="container">
          <div className="quiz-intro-content">
            <h1>{quiz.title}</h1>
            <p>{quiz.description}</p>
            
            <div className="quiz-info">
              <div className="info-item">
                <strong>Questions:</strong> {quiz.questions.length}
              </div>
              <div className="info-item">
                <strong>Time Limit:</strong> {formatTime(quiz.time_limit)}
              </div>
              <div className="info-item">
                <strong>Category:</strong> {quiz.category}
              </div>
              <div className="info-item">
                <strong>Difficulty:</strong> {quiz.difficulty}
              </div>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completed - show results
  if (quizCompleted && result) {
    return (
      <div className="quiz-result">
        <div className="container">
          <div className="result-content">
            <h1>Quiz Completed!</h1>
            
            <div className="result-score">
              <div className="score-circle">
                <span className="percentage">{result.percentage}%</span>
              </div>
              <div className="score-details">
                <p>Score: {result.score}/{result.total_questions}</p>
                <p>Time: {formatTime(result.time_taken)}</p>
              </div>
            </div>
            
            <div className="result-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/quizzes')}
              >
                Back to Quizzes
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="quiz-timer">
          <Clock size={20} />
          <span className={timeLeft <= 60 ? 'timer-warning' : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-container">
          <h2>{question.question_text}</h2>
          
          <div className="options-container">
            {question.options ? (
              question.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))
            ) : (
              <input
                type="text"
                className="text-answer"
                placeholder="Enter your answer..."
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            className="btn btn-secondary"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          {isLastQuestion ? (
            <button 
              className="btn btn-success"
              onClick={submitQuiz}
              disabled={!answers[question.id]}
            >
              <Check size={20} />
              Submit Quiz
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={nextQuestion}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
