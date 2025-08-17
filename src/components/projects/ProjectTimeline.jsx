import React, { useState } from 'react';
import { Calendar, Clock, Flag, User, CheckCircle, Circle } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const ProjectTimeline = ({ tasks, project }) => {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'gantt'
  const [filterStatus, setFilterStatus] = useState('all');

  // Sort tasks by due date and creation date
  const sortedTasks = tasks
    .filter(task => {
      if (filterStatus === 'all') return true;
      return task.status === filterStatus;
    })
    .sort((a, b) => {
      // First sort by due date, then by creation date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  // Group tasks by date for timeline view
  const groupTasksByDate = () => {
    const groups = {};
    
    sortedTasks.forEach(task => {
      const date = task.dueDate || task.createdAt;
      const dateKey = format(parseISO(date), 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: parseISO(date),
          tasks: []
        };
      }
      
      groups[dateKey].tasks.push(task);
    });

    return Object.values(groups).sort((a, b) => a.date - b.date);
  };

  // Generate Gantt chart data
  const generateGanttData = () => {
    if (sortedTasks.length === 0) return { startDate: new Date(), endDate: new Date(), tasks: [] };

    // Find project date range
    const projectStart = project?.startDate ? parseISO(project.startDate) : parseISO(sortedTasks[0].createdAt);
    const projectEnd = project?.dueDate ? parseISO(project.dueDate) : new Date();
    
    // Calculate task durations and positions
    const ganttTasks = sortedTasks.map(task => {
      const taskStart = task.startDate ? parseISO(task.startDate) : parseISO(task.createdAt);
      const taskEnd = task.dueDate ? parseISO(task.dueDate) : new Date();
      
      // Calculate position and width as percentages
      const totalDuration = projectEnd - projectStart;
      const taskStartOffset = taskStart - projectStart;
      const taskDuration = taskEnd - taskStart;
      
      const left = Math.max(0, (taskStartOffset / totalDuration) * 100);
      const width = Math.min(100 - left, (taskDuration / totalDuration) * 100);
      
      return {
        ...task,
        startDate: taskStart,
        endDate: taskEnd,
        left: left,
        width: Math.max(width, 2) // Minimum width for visibility
      };
    });

    return {
      startDate: projectStart,
      endDate: projectEnd,
      tasks: ganttTasks
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-400';
      case 'inprogress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getTaskBarColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-300';
      case 'inprogress': return 'bg-blue-400';
      case 'review': return 'bg-yellow-400';
      case 'done': return 'bg-green-400';
      default: return 'bg-gray-300';
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return isAfter(startOfDay(new Date()), endOfDay(parseISO(task.dueDate)));
  };

  const timelineGroups = groupTasksByDate();
  const ganttData = generateGanttData();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No tasks to display in timeline</p>
        <p className="text-sm text-gray-500">Add tasks with due dates to see the project timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gantt Chart
            </button>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="space-y-8">
          {timelineGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="relative">
              {/* Date Header */}
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {format(group.date, 'MMM dd, yyyy')}
                </div>
                <div className="flex-1 h-px bg-gray-200 ml-4"></div>
              </div>

              {/* Tasks for this date */}
              <div className="pl-8 space-y-3">
                {group.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className={`relative p-4 bg-white border rounded-lg hover:shadow-md transition-shadow ${
                      isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Timeline connector */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-8"></div>
                    <div className={`absolute left-0 top-6 w-3 h-3 rounded-full border-2 border-white -ml-[1.375rem] ${getStatusColor(task.status)}`}></div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            <Flag className="w-3 h-3 mr-1" />
                            {task.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Created {format(parseISO(task.createdAt), 'MMM dd')}</span>
                          </div>
                          
                          {task.dueDate && (
                            <div className={`flex items-center ${isOverdue(task) ? 'text-red-600' : ''}`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Due {format(parseISO(task.dueDate), 'MMM dd')}</span>
                              {isOverdue(task) && <span className="ml-1 font-medium">(Overdue)</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Gantt Chart View */
        <div className="space-y-4">
          {/* Timeline Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Project Timeline</span>
              <span className="text-xs text-gray-500">
                {format(ganttData.startDate, 'MMM dd')} - {format(ganttData.endDate, 'MMM dd, yyyy')}
              </span>
            </div>
            
            {/* Date markers */}
            <div className="relative h-6 bg-white rounded border">
              {/* Generate month markers */}
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(ganttData.startDate.getFullYear(), ganttData.startDate.getMonth() + i, 1);
                if (monthDate > ganttData.endDate) return null;
                
                const totalDuration = ganttData.endDate - ganttData.startDate;
                const monthOffset = monthDate - ganttData.startDate;
                const left = (monthOffset / totalDuration) * 100;
                
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-gray-300"
                    style={{ left: `${left}%` }}
                  >
                    <span className="absolute top-1 left-1 text-xs text-gray-500">
                      {format(monthDate, 'MMM')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gantt Tasks */}
          <div className="space-y-2">
            {ganttData.tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4">
                {/* Task Info */}
                <div className="w-64 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {task.assignee && (
                      <span className="inline-flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Gantt Bar */}
                <div className="flex-1 relative h-8 bg-gray-100 rounded">
                  <div
                    className={`absolute top-1 bottom-1 rounded ${getTaskBarColor(task.status)} ${
                      isOverdue(task) ? 'ring-2 ring-red-400' : ''
                    }`}
                    style={{
                      left: `${task.left}%`,
                      width: `${task.width}%`
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      {task.status === 'done' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Duration tooltip */}
                  <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
                    {format(task.startDate, 'MMM dd')} - {format(task.endDate, 'MMM dd')}
                  </div>
                </div>

                {/* Status */}
                <div className="w-20 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'inprogress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Review</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Done</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;