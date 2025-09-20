import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, filters]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;
    
    if (filters.category) {
      filtered = filtered.filter(quiz => quiz.category === filters.category);
    }
    
    if (filters.difficulty) {
      filtered = filtered.filter(quiz => quiz.difficulty === filters.difficulty);
    }
    
    setFilteredQuizzes(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const startQuiz = (quizId) => {
    if (!isAuthenticated) {
      toast.error('Please login to take quizzes');
      return;
    }
    navigate(`/quiz/${quizId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Quizzes</h1>
          <p>Challenge yourself with our collection of interactive quizzes</p>
        </div>

        {/* Filters */}
        <div className="quiz-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="General Knowledge">General Knowledge</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Difficulty:</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="quiz-grid">
          {filteredQuizzes.length === 0 ? (
            <div className="no-quizzes">
              <p>No quizzes found matching your criteria.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span 
                    className={`difficulty-badge ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
                
                <p className="quiz-description">{quiz.description}</p>
                
                <div className="quiz-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{quiz.time_limit / 60} min</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{quiz.question_count} questions</span>
                  </div>
                  <div className="meta-item">
                    <Star size={16} />
                    <span>{quiz.category}</span>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => startQuiz(quiz.id)}
                >
                  Start Quiz
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
