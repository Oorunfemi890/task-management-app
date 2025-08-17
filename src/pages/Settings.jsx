import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
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
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
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
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Task View
                    </label>
                    <select
                      value={preferences.defaultView}
                      onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
                      className="input-field"
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
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    {Object.entries(notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
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
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">Push Notifications</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    {Object.entries(notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
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
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Monitor className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-medium text-gray-900">In-App Notifications</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    {Object.entries(notifications.inApp).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
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
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handlePreferenceChange('theme', 'light')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        preferences.theme === 'light'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Sun className="h-6 w-6 text-yellow-500" />
                      <span className="text-sm font-medium">Light</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange('theme', 'dark')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        preferences.theme === 'dark'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Moon className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange('theme', 'auto')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        preferences.theme === 'auto'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Monitor className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium">Auto</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Auto theme switches between light and dark based on your system preference
                  </p>
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
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Change Password</h3>
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
                          className="input-field pr-10"
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
                          className="input-field pr-10"
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
                          className="input-field pr-10"
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
                    </div>

                    <button className="btn-primary">
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="input-field max-w-xs"
                      >
                        <option value="public">Public</option>
                        <option value="team">Team Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Visibility
                      </label>
                      <select
                        value={privacy.activityVisibility}
                        onChange={(e) => handlePrivacyChange('activityVisibility', e.target.value)}
                        className="input-field max-w-xs"
                      >
                        <option value="public">Public</option>
                        <option value="team">Team Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Allow Mentions</span>
                        <p className="text-xs text-gray-500">Allow others to mention you in comments</p>
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

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Online Status</span>
                        <p className="text-xs text-gray-500">Let others see when you're online</p>
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
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Export Data</h3>
                  <div className="space-y-3">
                    <button className="btn-outline flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export All Tasks</span>
                    </button>
                    <button className="btn-outline flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Projects</span>
                    </button>
                    <button className="btn-outline flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Complete Data</span>
                    </button>
                  </div>
                </div>

                {/* Data Import */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Import Data</h3>
                  <div className="space-y-3">
                    <button className="btn-outline flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import from CSV</span>
                    </button>
                    <button className="btn-outline flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import from Trello</span>
                    </button>
                    <button className="btn-outline flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import from Asana</span>
                    </button>
                  </div>
                </div>

                {/* Storage Info */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Storage Usage</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Used Storage</span>
                      <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full w-1/4"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Includes tasks, projects, attachments, and other data
                    </p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-base font-medium text-red-600 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">Delete All Data</h4>
                          <p className="text-sm text-red-700">Permanently delete all your tasks, projects, and data</p>
                        </div>
                        <button className="btn-danger">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Data
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">Delete Account</h4>
                          <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                        </div>
                        <button className="btn-danger">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
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
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <HelpCircle className="h-8 w-8 text-primary-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Help Center</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Browse our comprehensive help articles and guides
                    </p>
                    <button className="btn-outline">Visit Help Center</button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Mail className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get in touch with our support team for assistance
                    </p>
                    <button className="btn-outline">Contact Support</button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Globe className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Community</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Join our community forum to connect with other users
                    </p>
                    <button className="btn-outline">Join Community</button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Key className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">API Documentation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to integrate with TaskFlow using our API
                    </p>
                    <button className="btn-outline">View API Docs</button>
                  </div>
                </div>

                {/* App Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-4">App Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium text-gray-900 ml-2">1.0.0</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium text-gray-900 ml-2">March 15, 2024</span>
                      </div>
                      <div>
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium text-gray-900 ml-2">MIT</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Support:</span>
                        <span className="font-medium text-gray-900 ml-2">24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button for General Settings */}
            {(activeTab === 'general' || activeTab === 'notifications' || activeTab === 'appearance' || activeTab === 'privacy') && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;