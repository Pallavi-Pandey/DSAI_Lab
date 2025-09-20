import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Clock, Share2, X, Star, TrendingUp, Upload } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import ExportImportModal from '../components/ExportImportModal';
import CollaborationModal from '../components/CollaborationModal';
import '../components/ShareModal.css';
import '../components/ExportImportModal.css';
import '../components/CollaborationModal.css';
import { useAuth } from '../services/AuthContext';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [shareModal, setShareModal] = useState({ isOpen: false, quiz: null });
  const [exportImportModal, setExportImportModal] = useState(false);
  const [collaborationModal, setCollaborationModal] = useState({ isOpen: false, quiz: null });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, []);

  const filterQuizzes = useCallback(() => {
    let filtered = quizzes;

    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, quizzes]);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, selectedCategory, selectedDifficulty, quizzes, filterQuizzes]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:8000/quizzes');
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };


  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  const startQuiz = (quizId) => {
    if (!isAuthenticated) {
      alert('Please login to take quizzes');
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

  const handleShare = (quiz) => {
    setShareModal({ isOpen: true, quiz });
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
          <div className="header-content">
            <h1>Available Quizzes</h1>
            <p>Challenge yourself with our collection of interactive quizzes</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setExportImportModal(true)}
              className="btn btn-outline"
              title="Export/Import Quizzes"
            >
              <Upload size={16} />
              Import/Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="quiz-controls">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search quizzes by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-container">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {(searchTerm || selectedCategory || selectedDifficulty) && (
              <button onClick={resetFilters} className="reset-filters">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            {(searchTerm || selectedCategory || selectedDifficulty) && (
              <span className="filter-indicator"> (filtered)</span>
            )}
          </p>
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
                
                <div className="quiz-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => startQuiz(quiz.id)}
                  >
                    Start Quiz
                  </button>
                  <button 
                    onClick={() => navigate(`/quiz-analytics/${quiz.id}`)}
                    className="quiz-action-btn analytics-btn"
                    title="View Analytics"
                  >
                    <TrendingUp size={16} />
                  </button>
                  <button 
                    onClick={() => setCollaborationModal({ isOpen: true, quiz })}
                    className="quiz-action-btn collaboration-btn"
                    title="Manage Collaborators"
                  >
                    <Users size={16} />
                  </button>
                  <button 
                    onClick={() => handleShare(quiz)}
                    className="quiz-action-btn share-btn"
                    title="Share Quiz"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, quiz: null })}
        shareData={shareModal.quiz ? {
          title: shareModal.quiz.title,
          description: shareModal.quiz.description,
          url: `${window.location.origin}/quiz/${shareModal.quiz.id}`,
        } : null}
      />

      <ExportImportModal
        isOpen={exportImportModal}
        onClose={() => setExportImportModal(false)}
        quizzes={quizzes}
        onQuizzesUpdate={fetchQuizzes}
      />

      <CollaborationModal
        isOpen={collaborationModal.isOpen}
        onClose={() => setCollaborationModal({ isOpen: false, quiz: null })}
        quiz={collaborationModal.quiz}
      />
    </div>
  );
};

export default Quizzes;
