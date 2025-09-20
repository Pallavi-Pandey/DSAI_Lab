import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Charts removed as they're not used in current implementation
import { Users, Target, TrendingUp, AlertCircle, ArrowLeft, Download, CheckCircle, BarChart3 } from 'lucide-react';

const QuizAnalytics = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/quiz-analytics/${quizId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchAnalytics();
  }, [quizId, fetchAnalytics]);


  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `quiz_analytics_${analytics.quiz.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Error Loading Analytics</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="#ef4444" />
        <h2>No Analytics Data</h2>
        <p>No analytics data available for this quiz.</p>
        <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  const { quiz, total_attempts, average_score, score_distribution, question_analytics } = analytics;

  return (
    <div className="analytics-page">
      <div className="container">
        <div className="analytics-header">
          <button onClick={() => navigate('/quizzes')} className="back-button">
            <ArrowLeft size={20} />
            Back to Quizzes
          </button>
          
          <div className="header-content">
            <h1>Quiz Analytics</h1>
            <h2>"{quiz.title}"</h2>
            <p>{quiz.description}</p>
          </div>

          <button onClick={exportData} className="btn btn-outline">
            <Download size={16} />
            Export Data
          </button>
        </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{total_attempts}</h3>
              <p>Total Attempts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon score">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <h3>{average_score}%</h3>
              <p>Average Score</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completion">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>100%</h3>
              <p>Completion Rate</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon questions">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <h3>{quiz.questions.length}</h3>
              <p>Total Questions</p>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="analytics-section">
          <h3>Score Distribution</h3>
          <div className="score-distribution">
            {score_distribution.map((range, index) => {
              const percentage = total_attempts > 0 ? (range.count / total_attempts * 100) : 0;
              return (
                <div key={index} className="distribution-bar">
                  <div className="range-label">
                    <span>{range.range}%</span>
                    <span className="count">({range.count})</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getScoreColor(range.range)
                      }}
                    ></div>
                  </div>
                  <span className="percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Analytics */}
        {question_analytics.length > 0 && (
          <div className="analytics-section">
            <h3>Question Performance</h3>
            <div className="question-analytics">
              {question_analytics.map((qa, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <div className="success-rate">
                      <span className="rate">{qa.correct_rate.toFixed(1)}%</span>
                      <span className="label">Success Rate</span>
                    </div>
                  </div>
                  <p className="question-text">{qa.question}</p>
                  <div className="question-stats">
                    <span>{qa.total_attempts} attempts</span>
                    <div className="difficulty-indicator">
                      <span className={`difficulty ${getDifficultyLevel(qa.correct_rate)}`}>
                        {getDifficultyLevel(qa.correct_rate)}
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${qa.correct_rate}%`,
                        backgroundColor: getPerformanceColor(qa.correct_rate)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {total_attempts === 0 && (
          <div className="no-data-message">
            <TrendingUp size={48} color="#94a3b8" />
            <h3>No Data Yet</h3>
            <p>This quiz hasn't been attempted yet. Share it with others to start collecting analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getScoreColor = (range) => {
  switch (range) {
    case '0-25': return '#ef4444';
    case '26-50': return '#f59e0b';
    case '51-75': return '#3b82f6';
    case '76-100': return '#10b981';
    default: return '#94a3b8';
  }
};

const getDifficultyLevel = (correctRate) => {
  if (correctRate >= 80) return 'easy';
  if (correctRate >= 60) return 'medium';
  return 'hard';
};

const getPerformanceColor = (rate) => {
  if (rate >= 80) return '#10b981';
  if (rate >= 60) return '#3b82f6';
  if (rate >= 40) return '#f59e0b';
  return '#ef4444';
};

export default QuizAnalytics;
