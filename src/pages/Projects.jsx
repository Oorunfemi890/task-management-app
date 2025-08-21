import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTask } from "@context/TaskContext";
import {
  Plus,
  Search,
  Grid,
  List,
  Calendar,
  Users,
  MoreHorizontal,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import CreateProjectModal from "@components/projects/CreateProjectModal";

const Projects = () => {
  const {
    projects,
    tasks,
    teamMembers,
    fetchProjects,
    fetchTasks,
    fetchTeamMembers,
  } = useTask();

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchTeamMembers();
  }, []);

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    const completedTasks = projectTasks.filter(
      (task) => task.status === "done"
    );
    const totalTasks = projectTasks.length;
    const progress =
      totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      progress: Math.round(progress),
      overdueTasks: projectTasks.filter(
        (task) =>
          task.status !== "done" &&
          task.dueDate &&
          new Date(task.dueDate) < new Date()
      ).length,
    };
  };

  const getProjectMembers = (projectId) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    const memberIds = [
      ...new Set(projectTasks.map((task) => task.assignee).filter(Boolean)),
    ];
    return memberIds
      .map((id) => teamMembers.find((member) => member.id === id))
      .filter(Boolean);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;

    const stats = getProjectStats(project.id);
    if (filterStatus === "active") return matchesSearch && stats.progress < 100;
    if (filterStatus === "completed")
      return matchesSearch && stats.progress === 100;

    return matchesSearch;
  });

  const ProjectCard = ({ project }) => {
    const stats = getProjectStats(project.id);
    const members = getProjectMembers(project.id);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link
                to={`/projects/${project.id}`}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {project.name}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalTasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {stats.completedTasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stats.overdueTasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>

          {/* Team Members */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className="h-8 w-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center border-2 border-white dark:border-gray-800"
                    title={member.name}
                  >
                    <span className="text-white text-xs font-medium">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <span className="text-white text-xs font-medium">
                      +{members.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Due Date */}
            {project.dueDate && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProjectListItem = ({ project }) => {
    const stats = getProjectStats(project.id);
    const members = getProjectMembers(project.id);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <FolderOpen className="h-8 w-8 text-primary-500 dark:text-primary-400" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {project.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="w-32">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.totalTasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
            </div>

            {/* Members */}
            <div className="flex -space-x-1">
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="h-6 w-6 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center border border-white dark:border-gray-800"
                  title={member.name}
                >
                  <span className="text-white text-xs">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              ))}
              {members.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center border border-white dark:border-gray-800">
                  <span className="text-white text-xs">
                    +{members.length - 3}
                  </span>
                </div>
              )}
            </div>

            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </button>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your project progress
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* View Toggle */}
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

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {projects.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Projects</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {
                    projects.filter(
                      (p) => getProjectStats(p.id).progress === 100
                    ).length
                  }
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  {
                    projects.filter((p) => {
                      const stats = getProjectStats(p.id);
                      return stats.progress > 0 && stats.progress < 100;
                    }).length
                  }
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">In Progress</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {teamMembers.length}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center transition-colors">
            <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first project to get started"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredProjects.map((project) =>
              viewMode === "grid" ? (
                <ProjectCard key={project.id} project={project} />
              ) : (
                <ProjectListItem key={project.id} project={project} />
              )
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Projects;