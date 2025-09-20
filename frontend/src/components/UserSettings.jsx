import React, { useState, useEffect } from 'react';
import { User, Bell, Globe, Eye, EyeOff, Save, Shield, Palette } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const UserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: (user && user.username) || '',
    email: (user && user.email) || '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    
    // Privacy Settings
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showStats: true,
    showHistory: true,
    
    // Notification Settings
    emailNotifications: true,
    quizReminders: true,
    achievementNotifications: true,
    leaderboardUpdates: false,
    weeklyDigest: true,
    
    // Appearance Settings
    theme: localStorage.getItem('theme') || 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Quiz Preferences
    defaultDifficulty: 'any',
    preferredCategories: [],
    autoAdvance: true,
    showHints: true,
    skipConfirmation: false,
    timerWarnings: true
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  };

  useEffect(() => {
    loadUserSettings();
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  useEffect(() => {
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanged);
  }, [settings, originalSettings]);


  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setSettings(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to the backend
      localStorage.setItem(`userSettings_${user && user.username}`, JSON.stringify(settings));
      
      // Update theme immediately
      if (settings.theme !== originalSettings.theme) {
        localStorage.setItem('theme', settings.theme);
        document.body.className = settings.theme === 'dark' ? 'dark' : '';
      }
      
      setOriginalSettings(settings);
      setHasChanges(false);
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      // In a real app, this would call the backend
      alert('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Failed to change password');
    }
  };

  const availableCategories = [
    'Programming', 'Data Science', 'General Knowledge', 'Science', 
    'History', 'Technology', 'Math', 'Literature'
  ];

  return (
    <div className="user-settings">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Customize your QuizMaster experience</p>
      </div>

      <div className="settings-content">
        {/* Profile Settings */}
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h3>Profile Information</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Display Name</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) => handleInputChange('profile', 'displayName', e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div className="setting-item">
              <label>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="setting-item full-width">
              <label>Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
            
            <div className="setting-item">
              <label>Location</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="setting-item">
              <label>Website</label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h3>Privacy & Visibility</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Profile Visibility</label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={(e) => handleInputChange('privacy', 'showEmail', e.target.checked)}
                />
                Show email address on profile
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showStats}
                  onChange={(e) => handleInputChange('privacy', 'showStats', e.target.checked)}
                />
                Show quiz statistics publicly
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showHistory}
                  onChange={(e) => handleInputChange('privacy', 'showHistory', e.target.checked)}
                />
                Show quiz history to others
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                />
                Email notifications
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.quizReminders}
                  onChange={(e) => handleInputChange('notifications', 'quizReminders', e.target.checked)}
                />
                Quiz reminders
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.achievementNotifications}
                  onChange={(e) => handleInputChange('notifications', 'achievementNotifications', e.target.checked)}
                />
                Achievement notifications
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.leaderboardUpdates}
                  onChange={(e) => handleInputChange('notifications', 'leaderboardUpdates', e.target.checked)}
                />
                Leaderboard updates
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.weeklyDigest}
                  onChange={(e) => handleInputChange('notifications', 'weeklyDigest', e.target.checked)}
                />
                Weekly digest email
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h3>Appearance & Language</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Timezone</label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => handleInputChange('appearance', 'timezone', e.target.value)}
                placeholder="Auto-detected"
              />
            </div>
          </div>
        </div>

        {/* Quiz Preferences */}
        <div className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h3>Quiz Preferences</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Default Difficulty</label>
              <select
                value={settings.defaultDifficulty}
                onChange={(e) => handleInputChange('quiz', 'defaultDifficulty', e.target.value)}
              >
                <option value="any">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="setting-item full-width">
              <label>Preferred Categories</label>
              <div className="checkbox-grid">
                {availableCategories.map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.preferredCategories.includes(category)}
                      onChange={(e) => handleArrayChange('preferredCategories', category, e.target.checked)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoAdvance}
                  onChange={(e) => handleInputChange('quiz', 'autoAdvance', e.target.checked)}
                />
                Auto-advance to next question
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showHints}
                  onChange={(e) => handleInputChange('quiz', 'showHints', e.target.checked)}
                />
                Show hints when available
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.skipConfirmation}
                  onChange={(e) => handleInputChange('quiz', 'skipConfirmation', e.target.checked)}
                />
                Skip submission confirmation
              </label>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.timerWarnings}
                  onChange={(e) => handleInputChange('quiz', 'timerWarnings', e.target.checked)}
                />
                Show timer warnings
              </label>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h3>Change Password</h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="setting-item">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="setting-item">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
            
            <div className="setting-item">
              <button 
                onClick={handlePasswordChange}
                className="btn btn-secondary"
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-footer">
        <button 
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="btn btn-primary save-button"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {hasChanges && (
          <p className="unsaved-changes">You have unsaved changes</p>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
