import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, BarChart3, Clock, Award, Share2, RotateCcw, Star } from 'lucide-react';
import RatingModal from '../components/RatingModal';
import ShareModal from '../components/ShareModal';
import '../components/RatingModal.css';
import '../components/ShareModal.css';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!results) {
    navigate('/quizzes');
    return null;
  }

  const { 
    quiz_title, 
    total_questions, 
    time_taken, 
    correct_answers 
  } = results;

  const percentage = Math.round((correct_answers / total_questions) * 100);
  
  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Excellent', color: '#10b981', message: 'Outstanding performance!' };
    if (percentage >= 75) return { level: 'Good', color: '#3b82f6', message: 'Well done!' };
    if (percentage >= 60) return { level: 'Average', color: '#f59e0b', message: 'Good effort!' };
    return { level: 'Needs Improvement', color: '#ef4444', message: 'Keep practicing!' };
  };

  const performance = getPerformanceLevel(percentage);

  const shareResults = () => {
    setShowShareModal(true);
  };

  const handleRatingSubmitted = (data) => {
    alert(`Rating submitted! Average rating: ${data.average_rating} stars`);
  };

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <div className="score-display">
          <div className="score-circle" style={{ borderColor: performance.color }}>
            <span className="score-percentage" style={{ color: performance.color }}>
              {percentage}%
            </span>
            <span className="score-fraction">{correct_answers}/{total_questions}</span>
          </div>
          <div className="performance-info">
            <h2 style={{ color: performance.color }}>{performance.level}</h2>
            <p>{performance.message}</p>
          </div>
        </div>

        <div className="quiz-info">
          <h1>{quiz_title}</h1>
          <div className="quiz-stats">
            <div className="stat-item">
              <CheckCircle size={20} color="#10b981" />
              <span>{correct_answers} Correct</span>
            </div>
            <div className="stat-item">
              <XCircle size={20} color="#ef4444" />
              <span>{total_questions - correct_answers} Incorrect</span>
            </div>
            <div className="stat-item">
              <Clock size={20} color="#6b7280" />
              <span>{Math.floor(time_taken / 60)}:{(time_taken % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-analytics">
        <h3><BarChart3 size={20} /> Performance Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Accuracy Rate</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${percentage}%`, backgroundColor: performance.color }}
              ></div>
            </div>
            <span>{percentage}%</span>
          </div>
          
          <div className="analytics-card">
            <h4>Time per Question</h4>
            <div className="time-stat">
              <span className="time-value">{Math.round(time_taken / total_questions)}s</span>
              <span className="time-label">avg per question</span>
            </div>
          </div>

          <div className="analytics-card">
            <h4>Quiz Completion</h4>
            <div className="total-questions">{total_questions}</div>
            <Award size={24} color="#f59e0b" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      <div className="detailed-results">
        <h3>Question by Question Analysis</h3>
        <div className="questions-review">
          <p>Detailed question analysis will be available in a future update.</p>
        </div>
      </div>

      <div className="results-actions">
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/quizzes')}
        >
          <RotateCcw size={16} />
          Take Another Quiz
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={shareResults}
        >
          <Share2 size={16} />
          Share Results
        </button>

        <button 
          className="btn btn-outline"
          onClick={() => setShowRatingModal(true)}
        >
          <Star size={16} />
          Rate Quiz
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/leaderboard')}
        >
          <Award size={16} />
          View Leaderboard
        </button>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        quizTitle={quiz_title}
        quizId={1} // Mock quiz ID
        username="User" // Mock username
        onRatingSubmitted={handleRatingSubmitted}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={{
          title: quiz_title,
          description: `${percentage}% (${correct_answers}/${total_questions} correct)`,
          url: `${window.location.origin}/quiz-results`,
          type: 'result'
        }}
      />
    </div>
  );
};

export default QuizResults;
