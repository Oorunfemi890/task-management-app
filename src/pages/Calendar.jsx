import React, { useState, useEffect } from "react";
import { useTask } from "@context/TaskContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  List,
  Grid,
  Clock,
  Flag,
  User,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import CreateTaskModal from "@components/tasks/CreateTaskModal";
import TaskDetailsModal from "@components/tasks/TaskDetailsModal";

const Calendar = () => {
  const {
    tasks,
    projects,
    teamMembers,
    fetchTasks,
    fetchProjects,
    fetchTeamMembers,
  } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    priority: "all",
    status: "all",
    assignee: "all",
    project: "all",
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      const matchesDate = isSameDay(taskDate, date);

      // Apply filters
      const matchesPriority =
        filters.priority === "all" || task.priority === filters.priority;
      const matchesStatus =
        filters.status === "all" || task.status === filters.status;
      const matchesAssignee =
        filters.assignee === "all" ||
        task.assignee === parseInt(filters.assignee);
      const matchesProject =
        filters.project === "all" ||
        task.projectId === parseInt(filters.project);

      return (
        matchesDate &&
        matchesPriority &&
        matchesStatus &&
        matchesAssignee &&
        matchesProject
      );
    });
  };

  const getTasksForSelectedDate = () => {
    return getTasksForDate(selectedDate);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-400";
      case "inprogress":
        return "bg-blue-500";
      case "review":
        return "bg-yellow-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  };

  const TaskCard = ({ task, isCompact = false }) => {
    const assignee = teamMembers.find((member) => member.id === task.assignee);

    return (
      <div
        className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(
          task.priority
        ).replace("bg-", "border-")} ${
          isOverdue(task) ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium truncate ${
                isCompact ? "text-xs" : "text-sm"
              } ${isOverdue(task) ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"}`}
            >
              {task.title}
            </p>
            {!isCompact && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1 ml-2">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}
            />
            {assignee && (
              <div className="w-4 h-4 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs">
                  {assignee.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your tasks by date
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(currentDate, "MMMM yyyy")}
              </h2>

              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn-outline text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const tasksForDay = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? "ring-2 ring-primary-500" : ""
                  } ${!isCurrentMonth ? "opacity-40" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isTodayDate ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {tasksForDay.slice(0, 3).map((task) => (
                      <TaskCard key={task.id} task={task} isCompact={true} />
                    ))}

                    {tasksForDay.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                        +{tasksForDay.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Selected Date Tasks */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getTasksForSelectedDate().length} task
              {getTasksForSelectedDate().length !== 1 ? "s" : ""} scheduled
            </p>
          </div>

          {/* Tasks for Selected Date */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-outline text-sm flex items-center space-x-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>

            {getTasksForSelectedDate().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">No tasks for this date</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-primary-600 dark:text-primary-400 text-sm hover:text-primary-500 dark:hover:text-primary-300 mt-2"
                >
                  Create a task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {getTasksForSelectedDate().map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          {/* Calendar Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legend</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">High Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Medium Priority
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Low Priority</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">To Do</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Calendar;