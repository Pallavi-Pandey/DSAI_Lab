import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { Calendar, Clock, Target, TrendingUp, BarChart3, Eye, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/quiz-history/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const viewDetailedResults = (attempt) => {
    navigate('/quiz-results', {
      state: {
        results: {
          score: attempt.score,
          detailed_results: attempt.detailed_results,
          quiz_title: attempt.quiz_title,
          time_taken: 300 // Mock time data
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quiz history...</p>
      </div>
    );
  }

  return (
    <div className="quiz-history-page">
      <div className="container">
        <div className="page-header">
          <h1>Quiz History</h1>
          <p>Track your progress and review past quiz attempts</p>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={64} color="#ccc" />
            <h3>No Quiz History Yet</h3>
            <p>Take your first quiz to start building your history!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/quizzes')}
            >
              Browse Quizzes
            </button>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{history.length}</span>
                  <span className="stat-label">Quizzes Taken</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)}%
                  </span>
                  <span className="stat-label">Average Score</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {history.filter(h => h.score === 100).length}
                  </span>
                  <span className="stat-label">Perfect Scores</span>
                </div>
              </div>
            </div>

            <div className="history-timeline">
              <h3>Recent Attempts</h3>
              <div className="timeline-container">
                {history.map((attempt, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <div 
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(attempt.score) }}
                      >
                        {getScoreGrade(attempt.score)}
                      </div>
                    </div>
                    
                    <div className="timeline-content">
                      <div className="attempt-header">
                        <h4>{attempt.quiz_title}</h4>
                        <div className="attempt-meta">
                          <div className="meta-item">
                            <Calendar size={16} />
                            <span>{formatDate(attempt.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="attempt-details">
                        <div className="score-display">
                          <span 
                            className="score-percentage"
                            style={{ color: getScoreColor(attempt.score) }}
                          >
                            {Math.round(attempt.score)}%
                          </span>
                          <span className="score-label">Final Score</span>
                        </div>
                        
                        <div className="attempt-actions">
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => viewDetailedResults(attempt)}
                          >
                            <Eye size={16} />
                            View Results
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/quizzes')}
                          >
                            <RotateCcw size={16} />
                            Retake
                          </button>
                        </div>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${attempt.score}%`,
                            backgroundColor: getScoreColor(attempt.score)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
