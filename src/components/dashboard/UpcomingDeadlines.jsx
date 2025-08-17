import React from 'react';
import { Calendar, Clock, AlertTriangle, Flag } from 'lucide-react';
import { formatDistanceToNow, isAfter, startOfDay, endOfDay, addDays } from 'date-fns';

const UpcomingDeadlines = ({ tasks }) => {
  const now = new Date();
  const nextWeek = addDays(now, 7);

  // Filter and sort tasks by due date
  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= nextWeek; // Show tasks due within next 7 days
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);

  const isOverdue = (dueDate) => {
    return isAfter(startOfDay(now), endOfDay(new Date(dueDate)));
  };

  const isDueToday = (dueDate) => {
    const due = new Date(dueDate);
    return due.toDateString() === now.toDateString();
  };

  const isDueTomorrow = (dueDate) => {
    const due = new Date(dueDate);
    const tomorrow = addDays(now, 1);
    return due.toDateString() === tomorrow.toDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDeadlineColor = (dueDate) => {
    if (isOverdue(dueDate)) return 'text-red-600 bg-red-50';
    if (isDueToday(dueDate)) return 'text-orange-600 bg-orange-50';
    if (isDueTomorrow(dueDate)) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getDeadlineIcon = (dueDate) => {
    if (isOverdue(dueDate)) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (isDueToday(dueDate)) return <Clock className="h-4 w-4 text-orange-500" />;
    return <Calendar className="h-4 w-4 text-gray-500" />;
  };

  if (upcomingTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No upcoming deadlines</p>
        <p className="text-sm text-gray-500">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingTasks.map((task) => (
        <div
          key={task.id}
          className={`p-3 rounded-lg border transition-colors hover:shadow-sm cursor-pointer ${getDeadlineColor(task.dueDate)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getDeadlineIcon(task.dueDate)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </h4>
                <Flag className={`w-3 h-3 ml-2 ${getPriorityColor(task.priority)}`} />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${
                  isOverdue(task.dueDate) ? 'text-red-600' :
                  isDueToday(task.dueDate) ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {isOverdue(task.dueDate) ? 'Overdue' :
                   isDueToday(task.dueDate) ? 'Due today' :
                   isDueTomorrow(task.dueDate) ? 'Due tomorrow' :
                   `Due ${formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}`
                  }
                </span>
                
                <span className="text-gray-500 capitalize">
                  {task.status === 'inprogress' ? 'In Progress' : task.status}
                </span>
              </div>
              
              {task.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {upcomingTasks.filter(task => isOverdue(task.dueDate)).length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {upcomingTasks.filter(task => isDueToday(task.dueDate)).length}
            </div>
            <div className="text-xs text-gray-600">Due Today</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {upcomingTasks.filter(task => 
                !isOverdue(task.dueDate) && !isDueToday(task.dueDate)
              ).length}
            </div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;