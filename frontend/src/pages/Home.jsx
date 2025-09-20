import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Trophy, Brain } from 'lucide-react';
import RecommendedQuizzes from '../components/RecommendedQuizzes';
import '../components/RecommendedQuizzes.css';

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
      console.log('Fetching stats from backend...');
      const [quizzesResponse, leaderboardResponse] = await Promise.all([
        fetch('http://localhost:8000/quizzes'),
        fetch('http://localhost:8000/leaderboard'),
      ]);
      
      console.log('Quiz response status:', quizzesResponse.status);
      console.log('Leaderboard response status:', leaderboardResponse.status);
      
      const quizzesData = await quizzesResponse.json();
      const leaderboardData = await leaderboardResponse.json();
      
      console.log('Quizzes data:', quizzesData);
      console.log('Leaderboard data:', leaderboardData);
      
      const newStats = {
        totalUsers: leaderboardData.leaderboard?.length || 0,
        totalQuizzes: quizzesData.quizzes?.length || 0,
        totalAttempts: leaderboardData.leaderboard?.reduce((acc, user) => acc + (user.quizzes_taken || 0), 0) || 0,
      };
      
      console.log('Calculated stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to 0 if API fails
      setStats({
        totalUsers: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
      });
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

      {/* Recommended Quizzes Section */}
      <RecommendedQuizzes />
    </div>
  );
};

export default Home;
