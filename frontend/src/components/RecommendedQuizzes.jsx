import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, TrendingUp, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const RecommendedQuizzes = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:8000/recommendations/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setUserStats(data.user_stats);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
    setLoading(false);
  };

  const startQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getConfidenceIcon = (score) => {
    if (score >= 0.8) return <Sparkles size={14} />;
    if (score >= 0.6) return <Star size={14} />;
    return <Target size={14} />;
  };

  const getSkillLevelBadge = (level) => {
    const badges = {
      beginner: { color: '#10b981', icon: '🌱' },
      intermediate: { color: '#f59e0b', icon: '🎯' },
      advanced: { color: '#8b5cf6', icon: '🏆' }
    };
    return badges[level] || badges.beginner;
  };

  if (!isAuthenticated) {
    return (
      <div className="recommendations-section">
        <div className="container">
          <div className="recommendations-header">
            <h2>
              <TrendingUp size={24} />
              Personalized Quiz Recommendations
            </h2>
            <p>Sign in to get quiz recommendations tailored to your learning style and progress!</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="recommendations-section">
        <div className="container">
          <div className="recommendations-header">
            <h2>
              <TrendingUp size={24} />
              Loading Recommendations...
            </h2>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-section">
        <div className="container">
          <div className="recommendations-header">
            <h2>
              <TrendingUp size={24} />
              Quiz Recommendations
            </h2>
            <p>Complete a few quizzes to get personalized recommendations!</p>
          </div>
          <div className="empty-recommendations">
            <Sparkles size={48} color="#94a3b8" />
            <h3>No Recommendations Yet</h3>
            <p>Take your first quiz to unlock personalized recommendations based on your interests and performance.</p>
            <button 
              onClick={() => navigate('/quizzes')}
              className="btn btn-primary"
            >
              Browse All Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-section">
      <div className="container">
        <div className="recommendations-header">
          <h2>
            <TrendingUp size={24} />
            Recommended For You
          </h2>
          {userStats && (
            <div className="user-insights">
              <div className="skill-badge">
                <span className="skill-icon">{getSkillLevelBadge(userStats.skill_level).icon}</span>
                <span className="skill-text">
                  {userStats.skill_level.charAt(0).toUpperCase() + userStats.skill_level.slice(1)} Level
                </span>
              </div>
              <div className="stats-summary">
                <span>{userStats.total_attempts} quizzes completed</span>
                <span>•</span>
                <span>{userStats.recent_avg_score}% recent average</span>
              </div>
            </div>
          )}
        </div>

        <div className="recommendations-grid">
          {recommendations.map((quiz, index) => (
            <div key={quiz.id} className="recommendation-card">
              <div className="recommendation-badge">
                <span className="confidence-icon">
                  {getConfidenceIcon(quiz.confidence_score)}
                </span>
                <span className="confidence-text">
                  {Math.round(quiz.confidence_score * 100)}% match
                </span>
              </div>

              <div className="quiz-content">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span 
                    className="difficulty-badge"
                    style={{ 
                      backgroundColor: getDifficultyColor(quiz.difficulty),
                      color: 'white'
                    }}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="quiz-description">{quiz.description}</p>

                <div className="recommendation-reason">
                  <Sparkles size={14} />
                  <span>{quiz.recommendation_reason}</span>
                </div>

                <div className="quiz-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{quiz.time_limit / 60} min</span>
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{quiz.question_count} questions</span>
                  </div>
                  <div className="meta-item">
                    <TrendingUp size={14} />
                    <span>{quiz.attempts_count} attempts</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => startQuiz(quiz.id)}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="recommendations-footer">
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn btn-outline"
          >
            Browse All Quizzes
          </button>
          <button 
            onClick={fetchRecommendations}
            className="btn btn-secondary"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedQuizzes;
