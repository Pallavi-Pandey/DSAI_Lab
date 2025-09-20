import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, Trophy, Play } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [quizzesResponse, leaderboardResponse] = await Promise.all([
        axios.get('/api/quizzes'),
        axios.get('/api/leaderboard'),
      ]);
      
      setStats({
        totalUsers: leaderboardResponse.data.length,
        totalQuizzes: quizzesResponse.data.length,
        totalAttempts: leaderboardResponse.data.reduce((sum, user) => sum + user.quizzes_taken, 0),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Test Your Knowledge</h1>
            <p>
              Challenge yourself with our interactive quizzes covering various topics 
              from programming to data science. Join thousands of learners and 
              enhance your skills today!
            </p>
            <Link to="/quizzes" className="btn btn-primary btn-large">
              <Play size={20} />
              Start Quiz
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Active Users</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Brain size={32} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalQuizzes}</span>
                <span className="stat-label">Available Quizzes</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Trophy size={32} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalAttempts}</span>
                <span className="stat-label">Quiz Attempts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose QuizMaster?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Brain size={48} />
              </div>
              <h3>Multiple Categories</h3>
              <p>From programming to general knowledge, find quizzes that match your interests.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Trophy size={48} />
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your performance and compete with others on the leaderboard.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={48} />
              </div>
              <h3>Community Driven</h3>
              <p>Join a community of learners and challenge yourself to improve.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
