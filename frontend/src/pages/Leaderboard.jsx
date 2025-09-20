import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="rank-icon gold" size={24} />;
      case 2:
        return <Medal className="rank-icon silver" size={24} />;
      case 3:
        return <Award className="rank-icon bronze" size={24} />;
      default:
        return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-1';
      case 2: return 'rank-2';
      case 3: return 'rank-3';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="container">
        <div className="page-header">
          <h1>Leaderboard</h1>
          <p>See how you rank among other quiz masters!</p>
        </div>

        <div className="leaderboard-container">
          {leaderboard.length === 0 ? (
            <div className="no-data">
              <Trophy size={64} className="no-data-icon" />
              <p>No participants yet. Be the first to take a quiz!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="podium">
                  <div className="podium-item second-place">
                    <div className="podium-user">
                      <Medal className="podium-icon silver" size={32} />
                      <span className="podium-name">{leaderboard[1].username}</span>
                      <span className="podium-score">{leaderboard[1].total_score}</span>
                    </div>
                    <div className="podium-base second"></div>
                  </div>
                  
                  <div className="podium-item first-place">
                    <div className="podium-user">
                      <Trophy className="podium-icon gold" size={40} />
                      <span className="podium-name">{leaderboard[0].username}</span>
                      <span className="podium-score">{leaderboard[0].total_score}</span>
                    </div>
                    <div className="podium-base first"></div>
                  </div>
                  
                  <div className="podium-item third-place">
                    <div className="podium-user">
                      <Award className="podium-icon bronze" size={32} />
                      <span className="podium-name">{leaderboard[2].username}</span>
                      <span className="podium-score">{leaderboard[2].total_score}</span>
                    </div>
                    <div className="podium-base third"></div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard Table */}
              <div className="leaderboard-table">
                <div className="table-header">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Total Score</span>
                  <span>Quizzes Taken</span>
                  <span>Avg Score</span>
                </div>
                
                <div className="table-body">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    const avgScore = user.quizzes_taken > 0 
                      ? (user.total_score / user.quizzes_taken).toFixed(1)
                      : '0.0';
                    
                    return (
                      <div 
                        key={user.id} 
                        className={`table-row ${getRankClass(rank)}`}
                      >
                        <div className="rank-cell">
                          {getRankIcon(rank)}
                        </div>
                        <div className="player-cell">
                          <span className="player-name">{user.username}</span>
                        </div>
                        <div className="score-cell">
                          <span className="score-value">{user.total_score}</span>
                        </div>
                        <div className="quizzes-cell">
                          <span>{user.quizzes_taken}</span>
                        </div>
                        <div className="avg-cell">
                          <span>{avgScore}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
