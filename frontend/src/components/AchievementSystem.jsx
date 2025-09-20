import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Award, Medal } from 'lucide-react';

const AchievementSystem = ({ userStats, onBadgeEarned }) => {
  const [achievements, setAchievements] = useState([]);
  const [newBadges, setNewBadges] = useState([]);

  const badgeDefinitions = [
    {
      id: 'first_quiz',
      name: 'Getting Started',
      description: 'Complete your first quiz',
      icon: Star,
      color: '#10b981',
      requirement: (stats) => stats.quizzesCompleted >= 1
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: Trophy,
      color: '#f59e0b',
      requirement: (stats) => stats.quizzesCompleted >= 10
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      description: 'Get 100% on any quiz',
      icon: Target,
      color: '#ef4444',
      requirement: (stats) => stats.perfectScores >= 1
    },
    {
      id: 'high_achiever',
      name: 'High Achiever',
      description: 'Maintain 80%+ average score',
      icon: Award,
      color: '#8b5cf6',
      requirement: (stats) => stats.averageScore >= 80 && stats.quizzesCompleted >= 5
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: Zap,
      color: '#06b6d4',
      requirement: (stats) => stats.fastestTime <= 120
    },
    {
      id: 'knowledge_seeker',
      name: 'Knowledge Seeker',
      description: 'Try quizzes from 3 different categories',
      icon: Medal,
      color: '#84cc16',
      requirement: (stats) => stats.categoriesExplored >= 3
    },
    {
      id: 'creator',
      name: 'Quiz Creator',
      description: 'Create your first quiz',
      icon: Star,
      color: '#f97316',
      requirement: (stats) => stats.quizzesCreated >= 1
    },
    {
      id: 'prolific_creator',
      name: 'Prolific Creator',
      description: 'Create 5 quizzes',
      icon: Trophy,
      color: '#dc2626',
      requirement: (stats) => stats.quizzesCreated >= 5
    }
  ];

  useEffect(() => {
    checkForNewAchievements();
  }, [userStats]);

  const checkForNewAchievements = () => {
    const earnedBadges = badgeDefinitions.filter(badge => 
      badge.requirement(userStats) && !achievements.includes(badge.id)
    );

    if (earnedBadges.length > 0) {
      const newBadgeIds = earnedBadges.map(badge => badge.id);
      setAchievements(prev => [...prev, ...newBadgeIds]);
      setNewBadges(earnedBadges);
      
      // Show notification for new badges
      earnedBadges.forEach(badge => {
        if (onBadgeEarned) {
          onBadgeEarned(badge);
        }
      });
    }
  };

  const getBadgeProgress = (badge) => {
    const stats = userStats;
    switch (badge.id) {
      case 'first_quiz':
        return Math.min(stats.quizzesCompleted, 1);
      case 'quiz_master':
        return Math.min(stats.quizzesCompleted, 10);
      case 'perfect_score':
        return Math.min(stats.perfectScores, 1);
      case 'high_achiever':
        return stats.quizzesCompleted >= 5 ? Math.min(stats.averageScore, 80) : 0;
      case 'speed_demon':
        return stats.fastestTime <= 120 ? 1 : 0;
      case 'knowledge_seeker':
        return Math.min(stats.categoriesExplored, 3);
      case 'creator':
        return Math.min(stats.quizzesCreated, 1);
      case 'prolific_creator':
        return Math.min(stats.quizzesCreated, 5);
      default:
        return 0;
    }
  };

  const getProgressPercentage = (badge) => {
    const progress = getBadgeProgress(badge);
    const requirement = getRequirementValue(badge);
    return Math.min((progress / requirement) * 100, 100);
  };

  const getRequirementValue = (badge) => {
    switch (badge.id) {
      case 'first_quiz': return 1;
      case 'quiz_master': return 10;
      case 'perfect_score': return 1;
      case 'high_achiever': return 80;
      case 'speed_demon': return 1;
      case 'knowledge_seeker': return 3;
      case 'creator': return 1;
      case 'prolific_creator': return 5;
      default: return 1;
    }
  };

  return (
    <div className="achievement-system">
      <div className="achievements-header">
        <h3>Achievements & Badges</h3>
        <p>Earn badges by completing challenges and milestones</p>
      </div>

      <div className="achievements-grid">
        {badgeDefinitions.map(badge => {
          const isEarned = achievements.includes(badge.id);
          const progress = getProgressPercentage(badge);
          const IconComponent = badge.icon;

          return (
            <div 
              key={badge.id} 
              className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon" style={{ color: isEarned ? badge.color : '#ccc' }}>
                <IconComponent size={32} />
              </div>
              
              <div className="achievement-info">
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                
                {!isEarned && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: badge.color 
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {Math.round(progress)}% complete
                    </span>
                  </div>
                )}
                
                {isEarned && (
                  <div className="achievement-earned">
                    <Award size={16} color={badge.color} />
                    <span>Earned!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="achievement-stats">
        <div className="stat-item">
          <strong>{achievements.length}</strong>
          <span>Badges Earned</span>
        </div>
        <div className="stat-item">
          <strong>{badgeDefinitions.length - achievements.length}</strong>
          <span>Remaining</span>
        </div>
        <div className="stat-item">
          <strong>{Math.round((achievements.length / badgeDefinitions.length) * 100)}%</strong>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;
