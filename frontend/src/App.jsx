import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './services/AuthContext';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import Quiz from './pages/Quiz';
import CreateQuiz from './pages/CreateQuiz';
import QuizResults from './pages/QuizResults';
import QuizHistory from './pages/QuizHistory';
import './pages/QuizHistory.css';
import QuizAnalytics from './pages/QuizAnalytics';
import './pages/QuizAnalytics.css';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import './styles/App.css';
import './styles/Quiz.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/quiz/:id" element={<Quiz />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/quiz-results" element={<QuizResults />} />
              <Route path="/quiz-history" element={<QuizHistory />} />
              <Route path="/quiz-analytics/:quizId" element={<QuizAnalytics />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
