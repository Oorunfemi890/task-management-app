import React from 'react';
import { X, Filter, User, Flag, FolderOpen, Calendar } from 'lucide-react';

const TaskFilters = ({ filters, setFilters, projects, teamMembers, onClearAll }) => {
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilter = (filterType) => {
    setFilters({
      ...filters,
      [filterType]: 'all'
    });
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      project: 'all'
    });
    if (onClearAll) onClearAll();
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

  const getFilterBadgeColor = (filterType, value) => {
    if (value === 'all') return '';
    
    switch (filterType) {
      case 'status':
        switch (value) {
          case 'todo': return 'bg-gray-100 text-gray-800';
          case 'inprogress': return 'bg-blue-100 text-blue-800';
          case 'review': return 'bg-yellow-100 text-yellow-800';
          case 'done': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      case 'priority':
        switch (value) {
          case 'high': return 'bg-red-100 text-red-800';
          case 'medium': return 'bg-yellow-100 text-yellow-800';
          case 'low': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <X className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([filterType, value]) => {
            if (value === 'all') return null;
            
            let displayValue = value;
            if (filterType === 'assignee' && value !== 'all') {
              const member = teamMembers.find(m => m.id === parseInt(value));
              displayValue = member ? member.name : 'Unknown';
            } else if (filterType === 'project' && value !== 'all') {
              const project = projects.find(p => p.id === parseInt(value));
              displayValue = project ? project.name : 'Unknown';
            }

            return (
              <span
                key={filterType}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilterBadgeColor(filterType, value)}`}
              >
                {filterType}: {displayValue}
                <button
                  onClick={() => clearFilter(filterType)}
                  className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Status</span>
            </div>
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Flag className="w-3 h-3 text-red-500" />
              <span>Priority</span>
            </div>
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-green-500" />
              <span>Assignee</span>
            </div>
          </label>
          <select
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <FolderOpen className="w-3 h-3 text-purple-500" />
              <span>Project</span>
            </div>
          </label>
          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">All Projects</option>
            <option value="no-project">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="pt-4 border-t border-gray-200">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            <span>Advanced Filters</span>
            <span className="ml-2 group-open:rotate-180 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-orange-500" />
                  <span>Due Date</span>
                </div>
              </label>
              <select
                value={filters.dueDate || 'all'}
                onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All Due Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="this-week">Due This Week</option>
                <option value="next-week">Due Next Week</option>
                <option value="no-due-date">No Due Date</option>
              </select>
            </div>

            {/* Created Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span>Created</span>
              </label>
              <select
                value={filters.createdDate || 'all'}
                onChange={(e) => handleFilterChange('createdDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="last-week">Last Week</option>
                <option value="this-month">This Month</option>
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Quick Filter Buttons */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ ...filters, status: 'todo' })}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            My To Do
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'inprogress' })}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            In Progress
          </button>
          <button
            onClick={() => setFilters({ ...filters, priority: 'high' })}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            High Priority
          </button>
          <button
            onClick={() => setFilters({ ...filters, dueDate: 'overdue' })}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
          >
            Overdue
          </button>
          <button
            onClick={() => setFilters({ ...filters, assignee: 'unassigned' })}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            Unassigned
          </button>
        </div>
      </div>

      {/* Filter Results Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>{' '}
            Showing tasks that match {Object.values(filters).filter(f => f !== 'all').length} filter criteria
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;