import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Crown, 
  Edit3, 
  Eye, 
  Shield,
  Mail,
  Check,
  Clock,
  Trash2
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';
import './CollaborationModal.css';

const CollaborationModal = ({ isOpen, onClose, quiz }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('collaborators');
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    username: '',
    role: 'editor'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && quiz) {
      fetchCollaborators();
      fetchInvitations();
    }
  }, [isOpen, quiz]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/quiz-collaboration/${quiz.id}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/quiz-collaboration/invitations/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations.filter(inv => inv.quiz_id === quiz.id));
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/quiz-collaboration/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          inviter: user.username,
          invitee: inviteForm.username.trim(),
          role: inviteForm.role
        })
      });

      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setInviteForm({ username: '', role: 'editor' });
        fetchCollaborators();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send invitation');
      }
    } catch (error) {
      toast.error('Error sending invitation');
    }
    setLoading(false);
  };

  const handleRemoveCollaborator = async (username) => {
    if (window.confirm(`Are you sure you want to remove ${username} from this quiz?`)) {
      try {
        const response = await fetch(`/api/quiz-collaboration/${quiz.id}/collaborators/${username}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: user.username })
        });

        if (response.ok) {
          toast.success('Collaborator removed successfully');
          fetchCollaborators();
        } else {
          const error = await response.json();
          toast.error(error.detail || 'Failed to remove collaborator');
        }
      } catch (error) {
        toast.error('Error removing collaborator');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown size={16} className="role-icon owner" />;
      case 'admin': return <Shield size={16} className="role-icon admin" />;
      case 'editor': return <Edit3 size={16} className="role-icon editor" />;
      case 'reviewer': return <Eye size={16} className="role-icon reviewer" />;
      default: return <Users size={16} className="role-icon" />;
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: '#fbbf24',
      admin: '#ef4444',
      editor: '#3b82f6',
      reviewer: '#10b981',
      viewer: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const canManageCollaborators = () => {
    return quiz.creator === user.username;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="collaboration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Users size={24} />
            Collaboration - {quiz.title}
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'collaborators' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborators')}
          >
            <Users size={16} />
            Collaborators ({collaborators.length})
          </button>
          {canManageCollaborators() && (
            <button 
              className={`tab ${activeTab === 'invite' ? 'active' : ''}`}
              onClick={() => setActiveTab('invite')}
            >
              <UserPlus size={16} />
              Invite
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === 'collaborators' && (
            <div className="collaborators-section">
              <div className="collaborators-list">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.username} className="collaborator-item">
                    <div className="collaborator-info">
                      <div className="collaborator-avatar">
                        <Users size={20} />
                      </div>
                      <div className="collaborator-details">
                        <span className="collaborator-name">{collaborator.username}</span>
                        <div className="collaborator-role">
                          {getRoleIcon(collaborator.role)}
                          <span style={{ color: getRoleColor(collaborator.role) }}>
                            {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="collaborator-actions">
                      {collaborator.joined_at && (
                        <span className="join-date">
                          Joined {new Date(collaborator.joined_at).toLocaleDateString()}
                        </span>
                      )}
                      
                      {canManageCollaborators() && collaborator.role !== 'owner' && (
                        <button 
                          onClick={() => handleRemoveCollaborator(collaborator.username)}
                          className="remove-button"
                          title="Remove collaborator"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {collaborators.length === 0 && (
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No collaborators yet</p>
                    {canManageCollaborators() && (
                      <button 
                        onClick={() => setActiveTab('invite')}
                        className="btn btn-primary"
                      >
                        <UserPlus size={16} />
                        Invite Collaborators
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invite' && canManageCollaborators() && (
            <div className="invite-section">
              <form onSubmit={handleInvite} className="invite-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={inviteForm.username}
                    onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                    placeholder="Enter username to invite"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  >
                    <option value="editor">Editor - Can edit quiz content</option>
                    <option value="reviewer">Reviewer - Can review and comment</option>
                    <option value="viewer">Viewer - Can only view the quiz</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Mail size={16} />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>

              <div className="role-descriptions">
                <h4>Role Permissions</h4>
                <div className="role-list">
                  <div className="role-item">
                    <Crown size={16} style={{ color: '#fbbf24' }} />
                    <div>
                      <strong>Owner</strong>
                      <p>Full control including deleting quiz and managing collaborators</p>
                    </div>
                  </div>
                  <div className="role-item">
                    <Edit3 size={16} style={{ color: '#3b82f6' }} />
                    <div>
                      <strong>Editor</strong>
                      <p>Can edit quiz content, questions, and settings</p>
                    </div>
                  </div>
                  <div className="role-item">
                    <Eye size={16} style={{ color: '#10b981' }} />
                    <div>
                      <strong>Reviewer</strong>
                      <p>Can review content and provide feedback</p>
                    </div>
                  </div>
                  <div className="role-item">
                    <Users size={16} style={{ color: '#6b7280' }} />
                    <div>
                      <strong>Viewer</strong>
                      <p>Can only view the quiz content</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationModal;
