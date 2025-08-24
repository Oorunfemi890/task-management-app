import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTask } from "@context/TaskContext";
import { useAuth } from "@context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  Settings,
  Plus,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import TaskCard from "@components/tasks/TaskCard";
import CreateTaskModal from "@components/tasks/CreateTaskModal";
import CreateProjectModal from "@components/projects/CreateProjectModal";
import ProjectChat from "@components/projects/ProjectChat";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    projects,
    tasks,
    teamMembers,
    fetchProjects,
    fetchTasks,
    fetchTeamMembers,
  } = useTask();

  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [taskFilters, setTaskFilters] = useState({
    status: "all",
    priority: "all",
    assignee: "all",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchProjects(), fetchTasks(), fetchTeamMembers()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projects.length > 0) {
      const foundProject = projects.find((p) => p.id === parseInt(id));
      setProject(foundProject);
    }
  }, [projects, id]);

  useEffect(() => {
    if (tasks.length > 0) {
      const filteredTasks = tasks.filter(
        (task) => task.project_id === parseInt(id)
      );
      setProjectTasks(filteredTasks);
    }
  }, [tasks, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Project not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/projects"
          className="btn-primary"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const getProjectStats = () => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((task) => task.status === "done").length;
    const inProgressTasks = projectTasks.filter((task) => task.status === "inprogress").length;
    const overdueTasks = projectTasks.filter(
      (task) =>
        task.status !== "done" &&
        task.due_date &&
        new Date(task.due_date) < new Date()
    ).length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      progress: Math.round(progress),
    };
  };

  const getFilteredTasks = () => {
    return projectTasks.filter((task) => {
      if (taskFilters.status !== "all" && task.status !== taskFilters.status) return false;
      if (taskFilters.priority !== "all" && task.priority !== taskFilters.priority) return false;
      if (taskFilters.assignee !== "all" && task.assignee !== parseInt(taskFilters.assignee)) return false;
      return true;
    });
  };

  const stats = getProjectStats();
  const filteredTasks = getFilteredTasks();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-red-300 bg-red-50 text-red-800";
      case "medium": return "border-yellow-300 bg-yellow-50 text-yellow-800";
      case "low": return "border-green-300 bg-green-50 text-green-800";
      default: return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "not_started": return "text-gray-600 bg-gray-100";
      case "in_progress": return "text-blue-600 bg-blue-100";
      case "on_hold": return "text-yellow-600 bg-yellow-100";
      case "completed": return "text-green-600 bg-green-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const canEditProject = () => {
    return (
      project.created_by === user?.id ||
      user?.role === "admin" ||
      user?.role === "manager"
    );
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "tasks", name: "Tasks", icon: CheckCircle },
    { id: "team", name: "Team", icon: Users },
    { id: "goals", name: "Goals", icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/projects"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(project.priority)}`}>
                  {project.priority?.charAt(0).toUpperCase() + project.priority?.slice(1)} Priority
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChat(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </button>

            {canEditProject() && (
              <button
                onClick={() => setShowEditProject(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateTask(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {stats.progress}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  {stats.inProgressTasks}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">In Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                  {stats.overdueTasks}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Overdue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Details
                </h3>
                <div className="space-y-4">
                  {project.client && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.client}</dd>
                    </div>
                  )}

                  {project.budget && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        ${parseFloat(project.budget).toLocaleString()}
                      </dd>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {project.start_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {new Date(project.start_date).toLocaleDateString()}
                        </dd>
                      </div>
                    )}

                    {project.due_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {new Date(project.due_date).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</dt>
                      <dd className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {/* This would be populated with actual activity data */}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Task "Setup Authentication" was completed
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        New team member added to project
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Project milestone updated
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="p-6">
            {/* Task Filters and Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <select
                    value={taskFilters.status}
                    onChange={(e) => setTaskFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>

                  <select
                    value={taskFilters.priority}
                    onChange={(e) => setTaskFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={taskFilters.assignee}
                    onChange={(e) => setTaskFilters(prev => ({ ...prev, assignee: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Assignees</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks Grid/List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first task for this project.
                </p>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary"
                >
                  Create Task
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamMembers={teamMembers}
                    projects={projects}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.team_members && project.team_members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {member.avatar || member.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.role?.charAt(0).toUpperCase() + member.role?.slice(1) || 'Member'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="p-6">
            {project.goals && project.goals.length > 0 ? (
              <div className="space-y-4">
                {project.goals.map((goal, index) => (
                  <div
                    key={goal.id || index}
                    className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                      goal.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {goal.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${
                      goal.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {goal.goal}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No goals defined
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set clear goals for your project to track progress effectively.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          defaultProjectId={parseInt(id)}
        />
      )}

      {showEditProject && (
        <CreateProjectModal
          isOpen={showEditProject}
          onClose={() => setShowEditProject(false)}
          project={project}
        />
      )}

      {showChat && (
        <ProjectChat
          project={project}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;