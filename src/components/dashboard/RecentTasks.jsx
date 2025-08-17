import React from 'react';
import { Clock, Calendar, Flag, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentTasks = ({ tasks }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'inprogress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No recent tasks</p>
        <p className="text-sm text-gray-500">Your recent tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status === 'inprogress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {task.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Flag className={`w-3 h-3 mr-1 ${getPriorityColor(task.priority)}`} />
                <span className="capitalize">{task.priority}</span>
              </div>
              
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTasks;