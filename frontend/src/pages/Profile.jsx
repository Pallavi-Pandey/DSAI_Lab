import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Clock, Target, Moon, Sun, Settings, Award } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import AchievementSystem from '../components/AchievementSystem';
import UserSettings from '../components/UserSettings';
import '../components/AchievementSystem.css';
import '../components/UserSettings.css';

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats] = useState({
    quizzesCompleted: 3,
    averageScore: 85,
    perfectScores: 1,
    fastestTime: 95,
    totalPoints: 500,
    currentStreak: 10
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    // Apply theme
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleBadgeEarned = (badge) => {
    // Show notification for new badge
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <h4>🏆 Achievement Unlocked!</h4>
      <p>${badge.name}: ${badge.description}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 4000);
  };

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
          <div className="user-info">
            <div className="user-avatar">
              <User size={48} />
            </div>
            <div className="user-details">
              <h1>{user && user.username}</h1>
              <p>Quiz enthusiast since {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={16} />
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Trophy size={16} />
            Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            Settings
          </button>
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
          {activeTab === 'overview' && (
            <div className="overview-section">
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

              <div className="performance-chart">
                <h3>Performance Trends</h3>
                <div className="chart-content">
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-value">{userStats.quizzesCompleted}</span>
                      <span className="metric-label">Quizzes Completed</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{userStats.averageScore}%</span>
                      <span className="metric-label">Average Score</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{userStats.currentStreak}</span>
                      <span className="metric-label">Current Streak</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <Trophy size={20} />
                    <span>Completed "JavaScript Basics" quiz</span>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                  <div className="activity-item">
                    <Target size={20} />
                    <span>Achieved "Perfect Score" badge</span>
                    <span className="activity-time">1 day ago</span>
                  </div>
                  <div className="activity-item">
                    <Clock size={20} />
                    <span>Finished "React Concepts" in record time</span>
                    <span className="activity-time">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && <AchievementSystem userStats={userStats} />}

          {activeTab === 'settings' && <UserSettings />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
