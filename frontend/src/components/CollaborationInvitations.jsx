import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Users, 
  Check, 
  X, 
  Clock,
  Mail
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';
import './CollaborationInvitations.css';

const CollaborationInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInvitations();
      // Poll for new invitations every 30 seconds
      const interval = setInterval(fetchInvitations, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/quiz-collaboration/invitations/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const respondToInvitation = async (invitationId, action) => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz-collaboration/respond-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitation_id: invitationId,
          action: action,
          username: user.username
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchInvitations();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to respond to invitation');
      }
    } catch (error) {
      toast.error('Error responding to invitation');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      editor: '#3b82f6',
      reviewer: '#10b981',
      viewer: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  if (!user || invitations.length === 0) {
    return null;
  }

  return (
    <div className="collaboration-invitations">
      <button 
        className="invitations-bell"
        onClick={() => setShowInvitations(!showInvitations)}
        title="Collaboration invitations"
      >
        <Bell size={20} />
        {invitations.length > 0 && (
          <span className="notification-badge">{invitations.length}</span>
        )}
      </button>

      {showInvitations && (
        <div className="invitations-dropdown">
          <div className="dropdown-header">
            <h3>
              <Mail size={16} />
              Collaboration Invitations
            </h3>
          </div>

          <div className="invitations-list">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="invitation-item">
                <div className="invitation-content">
                  <div className="invitation-header">
                    <Users size={16} />
                    <span className="quiz-title">{invitation.quiz_title}</span>
                  </div>
                  
                  <div className="invitation-details">
                    <p>
                      <strong>{invitation.inviter}</strong> invited you to collaborate as{' '}
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(invitation.role) }}
                      >
                        {invitation.role}
                      </span>
                    </p>
                    
                    <div className="invitation-meta">
                      <Clock size={14} />
                      <span>{formatDate(invitation.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="invitation-actions">
                  <button
                    onClick={() => respondToInvitation(invitation.id, 'accept')}
                    className="action-button accept"
                    disabled={loading}
                    title="Accept invitation"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => respondToInvitation(invitation.id, 'decline')}
                    className="action-button decline"
                    disabled={loading}
                    title="Decline invitation"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {invitations.length === 0 && (
            <div className="no-invitations">
              <Mail size={32} />
              <p>No pending invitations</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaborationInvitations;
