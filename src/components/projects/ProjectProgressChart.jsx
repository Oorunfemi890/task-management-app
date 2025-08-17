import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Calendar, TrendingUp, Target } from 'lucide-react';

const ProjectProgressChart = ({ tasks }) => {
  // Generate progress data over time
  const generateProgressData = () => {
    if (!tasks || tasks.length === 0) return [];

    // Get date range from first task to now
    const now = new Date();
    const startDate = new Date(Math.min(...tasks.map(task => new Date(task.createdAt))));
    const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    
    const data = [];
    
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Calculate cumulative tasks created and completed up to this date
      const tasksCreatedByDate = tasks.filter(task => 
        new Date(task.createdAt) <= currentDate
      ).length;
      
      const tasksCompletedByDate = tasks.filter(task => 
        task.status === 'done' && 
        task.completedAt && 
        new Date(task.completedAt) <= currentDate
      ).length;
      
      // Calculate tasks in progress
      const tasksInProgressByDate = tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        const isCreated = createdDate <= currentDate;
        const isNotCompleted = !task.completedAt || new Date(task.completedAt) > currentDate;
        return isCreated && isNotCompleted;
      }).length;

      data.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: currentDate.toISOString().split('T')[0],
        created: tasksCreatedByDate,
        completed: tasksCompletedByDate,
        inProgress: tasksInProgressByDate,
        completionRate: tasksCreatedByDate > 0 ? Math.round((tasksCompletedByDate / tasksCreatedByDate) * 100) : 0
      });
    }
    
    return data;
  };

  // Generate status distribution data
  const getStatusDistribution = () => {
    const statusCounts = {
      'To Do': tasks.filter(task => task.status === 'todo').length,
      'In Progress': tasks.filter(task => task.status === 'inprogress').length,
      'Review': tasks.filter(task => task.status === 'review').length,
      'Done': tasks.filter(task => task.status === 'done').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    }));
  };

  // Generate daily completion data for the last 7 days
  const getDailyCompletionData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const completedOnDate = tasks.filter(task => 
        task.completedAt && 
        task.completedAt.split('T')[0] === dateString
      ).length;
      
      const createdOnDate = tasks.filter(task => 
        task.createdAt.split('T')[0] === dateString
      ).length;

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedOnDate,
        created: createdOnDate
      });
    }
    
    return data;
  };

  const progressData = generateProgressData();
  const statusData = getStatusDistribution();
  const dailyData = getDailyCompletionData();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No task data available</p>
        <p className="text-sm text-gray-500">Create some tasks to see progress charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900">{totalTasks}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
            </div>
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-purple-200"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${completionRate * 0.75} 75`}
                  className="text-purple-500"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Progress Chart */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `Date: ${label}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Total Created"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#94A3B8" name="Created" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <div className="space-y-3">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-4 h-4 rounded ${
                      item.status === 'To Do' ? 'bg-gray-400' :
                      item.status === 'In Progress' ? 'bg-blue-500' :
                      item.status === 'Review' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === 'To Do' ? 'bg-gray-400' :
                        item.status === 'In Progress' ? 'bg-blue-500' :
                        item.status === 'Review' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rate Trend */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded-md">
            <p className="font-medium text-gray-900">Average Daily Completion</p>
            <p className="text-gray-600">
              {dailyData.length > 0 ? Math.round(dailyData.reduce((sum, day) => sum + day.completed, 0) / dailyData.length) : 0} tasks/day
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-md">
            <p className="font-medium text-gray-900">Most Productive Day</p>
            <p className="text-gray-600">
              {dailyData.length > 0 ? 
                dailyData.reduce((max, day) => day.completed > max.completed ? day : max).date : 'N/A'
              }
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-md">
            <p className="font-medium text-gray-900">Remaining Tasks</p>
            <p className="text-gray-600">
              {totalTasks - completedTasks} tasks ({Math.round(((totalTasks - completedTasks) / totalTasks) * 100) || 0}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressChart;