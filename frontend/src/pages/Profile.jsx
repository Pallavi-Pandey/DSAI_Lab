import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avgScore = user.quizzes_taken > 0 
    ? (user.total_score / user.quizzes_taken).toFixed(1)
    : '0.0';

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="profile-email">{user.email || 'No email provided'}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Trophy size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{user.total_score}</span>
              <span className="stat-label">Total Score</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{user.quizzes_taken}</span>
              <span className="stat-label">Quizzes Taken</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{avgScore}</span>
              <span className="stat-label">Average Score</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Your Progress</h2>
            <div className="progress-card">
              {user.quizzes_taken === 0 ? (
                <div className="no-progress">
                  <p>You haven't taken any quizzes yet!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/quizzes')}
                  >
                    Take Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="progress-content">
                  <div className="progress-item">
                    <span className="progress-label">Quiz Completion Rate</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="progress-value">100%</span>
                  </div>
                  
                  <div className="achievement-badges">
                    <h3>Achievements</h3>
                    <div className="badges-grid">
                      {user.quizzes_taken >= 1 && (
                        <div className="badge">
                          <Trophy size={24} />
                          <span>First Quiz</span>
                        </div>
                      )}
                      {user.quizzes_taken >= 5 && (
                        <div className="badge">
                          <Target size={24} />
                          <span>Quiz Explorer</span>
                        </div>
                      )}
                      {user.quizzes_taken >= 10 && (
                        <div className="badge">
                          <Award size={24} />
                          <span>Quiz Master</span>
                        </div>
                      )}
                      {user.total_score >= 100 && (
                        <div className="badge">
                          <Trophy size={24} />
                          <span>High Scorer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/quizzes')}
            >
              Take Another Quiz
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
