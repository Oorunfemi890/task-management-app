import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useTask } from '@context/TaskContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Building,
  Edit,
  Camera,
  Save,
  X,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { tasks, projects } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    location: user?.location || '',
    bio: user?.bio || '',
    title: user?.title || '',
    timezone: user?.timezone || 'UTC'
  });
  const [isLoading, setIsLoading] = useState(false);

  const userTasks = tasks.filter(task => task.assignee === user?.id);
  const completedTasks = userTasks.filter(task => task.status === 'done');
  const overdueTasks = userTasks.filter(task => 
    task.status !== 'done' && 
    task.dueDate && 
    new Date(task.dueDate) < new Date()
  );
  const activeProjects = [...new Set(userTasks.map(task => task.projectId).filter(Boolean))];

  const stats = {
    totalTasks: userTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    activeProjects: activeProjects.length,
    completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
      location: user?.location || '',
      bio: user?.bio || '',
      title: user?.title || '',
      timezone: user?.timezone || 'UTC'
    });
    setIsEditing(false);
  };

  const recentTasks = userTasks
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="relative -mt-16">
                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                  <div className="h-full w-full rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || 'User Name'}
                </h1>
                <p className="text-gray-600">{user?.title || user?.role || 'Team Member'}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {user?.company || 'No company'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="spinner" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.location || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your job title"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.title || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Company name"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.company || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{user?.bio || 'No bio provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{user?.timezone || 'UTC'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Tasks
            </h2>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No recent tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'inprogress' ? 'bg-blue-500' :
                      task.status === 'review' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance
            </h2>
            
            <div className="space-y-4">
              {/* Completion Rate */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                  <div className="text-xs text-blue-700">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.activeProjects}</div>
                  <div className="text-xs text-purple-700">Projects</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                  <div className="text-xs text-red-700">Overdue</div>
                </div>
              </div>

              {/* Achievement Badge */}
              {stats.completionRate >= 90 && stats.totalTasks >= 10 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-yellow-800">High Performer</div>
                  <div className="text-xs text-yellow-700">Excellent completion rate!</div>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {user?.role || 'Member'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <button className="w-full btn-outline text-left">
                Change Password
              </button>
              <button className="w-full btn-outline text-left">
                Notification Settings
              </button>
              <button className="w-full btn-outline text-left">
                Privacy Settings
              </button>
              <button className="w-full btn-outline text-left">
                Download My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;