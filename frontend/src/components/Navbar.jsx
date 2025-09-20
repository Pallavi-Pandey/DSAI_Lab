import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, User, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import CollaborationInvitations from './CollaborationInvitations';
import './CollaborationInvitations.css';
import LoginModal from './LoginModal.jsx';
import RegisterModal from './RegisterModal.jsx';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Brain size={32} />
            <span>QuizMaster</span>
          </Link>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/quizzes" 
              className={`nav-link ${isActive('/quizzes') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Quizzes
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/create-quiz" 
                  className={`nav-link ${isActive('/create-quiz') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus size={16} />
                  Create Quiz
                </Link>
                <Link 
                  to="/quiz-history" 
                  className={`nav-link ${isActive('/quiz-history') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  History
                </Link>
              </>
            )}
            <Link 
              to="/leaderboard" 
              className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  Profile
                </Link>
                <div className="nav-user">
                  <CollaborationInvitations />
                  <span>Welcome, {user?.username || 'User'}!</span>
                  <button onClick={logout} className="logout-btn">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register
                </button>
              </div>
            )}
          </div>
          
          <div 
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />
    </>
  );
};

export default Navbar;
