import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  HelpCircle,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Lock,
  Key,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Loader,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: {
      taskAssigned: true,
      taskCompleted: true,
      projectUpdates: true,
      deadlineReminders: true,
      weeklyDigest: false
    },
    push: {
      taskAssigned: true,
      taskCompleted: false,
      projectUpdates: true,
      deadlineReminders: true
    },
    inApp: {
      taskAssigned: true,
      taskCompleted: true,
      projectUpdates: true,
      deadlineReminders: true,
      mentions: true
    }
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    startOfWeek: 'monday',
    defaultView: 'board'
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    activityVisibility: 'team',
    taskVisibility: 'assigned',
    allowMentions: true,
    showOnlineStatus: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    showDeleteAccount: false,
    showDeleteData: false,
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Load settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await authService.getUserSettings();
      if (settings.settings) {
        if (settings.settings.notifications) setNotifications(settings.settings.notifications);
        if (settings.settings.preferences) setPreferences(settings.settings.preferences);
        if (settings.settings.privacy) setPrivacy(settings.settings.privacy);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't show error toast as default settings are fine
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleNotificationChange = (category, setting) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveSettings = async (settingsType) => {
    setIsSaving(true);
    try {
      switch (settingsType) {
        case 'general':
          await authService.updateAppearanceSettings(preferences);
          break;
        case 'notifications':
          await authService.updateNotificationSettings(notifications);
          break;
        case 'appearance':
          await authService.updateAppearanceSettings(preferences);
          break;
        case 'privacy':
          await authService.updatePrivacySettings(privacy);
          break;
        default:
          const allSettings = { notifications, preferences, privacy };
          await authService.updateSettings(allSettings);
      }
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      await authService.exportUserData();
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(error.message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmation.confirmPassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    setIsSaving(true);
    try {
      await authService.deleteAccount(deleteConfirmation.confirmPassword);
      toast.success('Account deleted successfully');
      // Redirect will happen automatically via logout in authService
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsSaving(false);
      setDeleteConfirmation({ showDeleteAccount: false, showDeleteData: false, confirmPassword: '' });
    }
  };

  const handleDeleteAllData = async () => {
    if (!deleteConfirmation.confirmPassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    setIsSaving(true);
    try {
      await authService.deleteAllData(deleteConfirmation.confirmPassword);
      toast.success('All data deleted successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error(error.message || 'Failed to delete data');
    } finally {
      setIsSaving(false);
      setDeleteConfirmation({ showDeleteAccount: false, showDeleteData: false, confirmPassword: '' });
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/(?=.*[a-z])/.test(password)) strength += 1;
    if (/(?=.*[A-Z])/.test(password)) strength += 1;
    if (/(?=.*\d)/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h2>
                  <p className="text-sm text-gray-600">Configure your general application settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline h-4 w-4 mr-1" />
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start of Week
                    </label>
                    <select
                      value={preferences.startOfWeek}
                      onChange={(e) => handlePreferenceChange('startOfWeek', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Task View
                    </label>
                    <select
                      value={preferences.defaultView}
                      onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="board">Kanban Board</option>
                      <option value="list">List View</option>
                      <option value="calendar">Calendar View</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Choose how you want to be notified about updates.</p>
                </div>

                {/* Email Notifications */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                          </span>
                          {key === 'weeklyDigest' && (
                            <p className="text-xs text-gray-500">Get a weekly summary of your activity</p>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={() => handleNotificationChange('email', key)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">Push Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={() => handleNotificationChange('push', key)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-App Notifications */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Monitor className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">In-App Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(notifications.inApp).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={() => handleNotificationChange('inApp', key)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
                  <p className="text-sm text-gray-600">Customize how TaskFlow looks and feels.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handlePreferenceChange('theme', 'light')}
                      className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-all ${
                        preferences.theme === 'light'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Sun className="h-8 w-8" />
                      <span className="text-sm font-medium">Light</span>
                      <span className="text-xs text-center">Clean and bright interface</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange('theme', 'dark')}
                      className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-all ${
                        preferences.theme === 'dark'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Moon className="h-8 w-8" />
                      <span className="text-sm font-medium">Dark</span>
                      <span className="text-xs text-center">Easy on the eyes</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange('theme', 'auto')}
                      className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-all ${
                        preferences.theme === 'auto'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Monitor className="h-8 w-8" />
                      <span className="text-sm font-medium">Auto</span>
                      <span className="text-xs text-center">Follows system setting</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
                  <p className="text-sm text-gray-600">Control your privacy and security settings.</p>
                </div>

                {/* Change Password */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}

                      {/* Password Strength Indicator */}
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 w-6 rounded-full ${
                                    level <= passwordStrength
                                      ? passwordStrength < 2
                                        ? 'bg-red-500'
                                        : passwordStrength < 3
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {passwordStrength < 2 && 'Weak'}
                              {passwordStrength === 2 && 'Fair'}
                              {passwordStrength === 3 && 'Good'}
                              {passwordStrength === 4 && 'Strong'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <div className={`flex items-center ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-1 h-1 rounded-full mr-2 ${passwordForm.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              At least 8 characters
                            </div>
                            <div className={`flex items-center ${/(?=.*[a-z])/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-1 h-1 rounded-full mr-2 ${/(?=.*[a-z])/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              One lowercase letter
                            </div>
                            <div className={`flex items-center ${/(?=.*[A-Z])/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-1 h-1 rounded-full mr-2 ${/(?=.*[A-Z])/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              One uppercase letter
                            </div>
                            <div className={`flex items-center ${/(?=.*\d)/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-1 h-1 rounded-full mr-2 ${/(?=.*\d)/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              One number
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <button 
                      onClick={handlePasswordSubmit}
                      disabled={isSaving || passwordStrength < 4}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSaving ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="public">Public - Everyone can see your profile</option>
                        <option value="team">Team Only - Only team members can see</option>
                        <option value="private">Private - Only you can see</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Visibility
                      </label>
                      <select
                        value={privacy.activityVisibility}
                        onChange={(e) => handlePrivacyChange('activityVisibility', e.target.value)}
                        className="max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="public">Public - Everyone can see your activity</option>
                        <option value="team">Team Only - Only team members can see</option>
                        <option value="private">Private - Only you can see</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Allow Mentions</span>
                        <p className="text-xs text-gray-500">Allow others to mention you in comments and discussions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={privacy.allowMentions}
                          onChange={(e) => handlePrivacyChange('allowMentions', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Online Status</span>
                        <p className="text-xs text-gray-500">Let others see when you're online and active</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={privacy.showOnlineStatus}
                          onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data & Storage</h2>
                  <p className="text-sm text-gray-600">Manage your data and storage settings.</p>
                </div>

                {/* Data Export */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of all your data including tasks, projects, comments, and settings.
                  </p>
                  <button 
                    onClick={handleExportData}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Complete Data</span>
                  </button>
                </div>

                {/* Storage Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Storage Usage
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Used Storage</span>
                      <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full w-1/4 transition-all duration-300"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>• Tasks: 145 MB</div>
                      <div>• Projects: 89 MB</div>
                      <div>• Attachments: 2.1 GB</div>
                      <div>• Comments: 32 MB</div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="text-base font-medium text-red-800">Danger Zone</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-800">Delete All Data</h4>
                        <p className="text-sm text-red-700">Permanently delete all your tasks, projects, and data</p>
                      </div>
                      <button 
                        onClick={() => setDeleteConfirmation({...deleteConfirmation, showDeleteData: true})}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Data
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-800">Delete Account</h4>
                        <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                      </div>
                      <button 
                        onClick={() => setDeleteConfirmation({...deleteConfirmation, showDeleteAccount: true})}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h2>
                  <p className="text-sm text-gray-600">Get help and support for using TaskFlow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <HelpCircle className="h-8 w-8 text-primary-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Help Center</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Browse our comprehensive help articles and guides
                    </p>
                    <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Visit Help Center
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <Mail className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get in touch with our support team for assistance
                    </p>
                    <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Contact Support
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <Globe className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Community</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Join our community forum to connect with other users
                    </p>
                    <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Join Community
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <Key className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">API Documentation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to integrate with TaskFlow using our API
                    </p>
                    <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      View API Docs
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Application Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-gray-600 block">Version:</span>
                      <span className="font-medium text-gray-900">1.0.0</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Last Updated:</span>
                      <span className="font-medium text-gray-900">August 19, 2025</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">License:</span>
                      <span className="font-medium text-gray-900">MIT</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Support:</span>
                      <span className="font-medium text-gray-900">24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button for Settings */}
            {(activeTab === 'general' || activeTab === 'notifications' || activeTab === 'appearance' || activeTab === 'privacy') && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button 
                    onClick={() => saveSettings(activeTab)}
                    disabled={isSaving}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSaving ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modals */}
      {(deleteConfirmation.showDeleteAccount || deleteConfirmation.showDeleteData) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                {deleteConfirmation.showDeleteAccount ? 'Delete Account' : 'Delete All Data'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  {deleteConfirmation.showDeleteAccount 
                    ? 'This will permanently delete your account and all associated data. This action cannot be undone.'
                    : 'This will permanently delete all your tasks, projects, and data. This action cannot be undone.'
                  }
                </p>
                <div className="mt-4">
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deleteConfirmation.confirmPassword}
                    onChange={(e) => setDeleteConfirmation({
                      ...deleteConfirmation,
                      confirmPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirmation({ showDeleteAccount: false, showDeleteData: false, confirmPassword: '' })}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteConfirmation.showDeleteAccount ? handleDeleteAccount : handleDeleteAllData}
                  disabled={!deleteConfirmation.confirmPassword || isSaving}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;