import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTask } from "@context/TaskContext";
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Download,
  Share,
  Edit,
  Archive,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
} from "lucide-react";
import TaskCard from "@components/tasks/TaskCard";
import CreateTaskModal from "@components/tasks/CreateTaskModal";
import ProjectProgressChart from "@components/projects/ProjectProgressChart";
import ProjectTimeline from "@components/projects/ProjectTimeline";

const ProjectDetails = () => {
  const { id } = useParams();
  const {
    projects,
    tasks,
    teamMembers,
    fetchProjects,
    fetchTasks,
    fetchTeamMembers,
    setCurrentProject,
    currentProject,
  } = useTask();

  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");

  const project = projects.find((p) => p.id === parseInt(id)) || currentProject;
  const projectTasks = tasks.filter((task) => task.projectId === parseInt(id));

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchTeamMembers();
  }, [id]);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const getProjectStats = () => {
    const total = projectTasks.length;
    const completed = projectTasks.filter(
      (task) => task.status === "done"
    ).length;
    const inProgress = projectTasks.filter(
      (task) => task.status === "inprogress"
    ).length;
    const overdue = projectTasks.filter(
      (task) =>
        task.status !== "done" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date()
    ).length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const getProjectMembers = () => {
    const memberIds = [
      ...new Set(projectTasks.map((task) => task.assignee).filter(Boolean)),
    ];
    return memberIds
      .map((id) => teamMembers.find((member) => member.id === id))
      .filter(Boolean);
  };

  const filteredTasks = projectTasks.filter((task) => {
    if (taskFilter === "all") return true;
    return task.status === taskFilter;
  });

  const stats = getProjectStats();
  const members = getProjectMembers();

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "team", label: "Team", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statusColors = {
    not_started: "text-gray-600 bg-gray-100",
    in_progress: "text-blue-600 bg-blue-100",
    completed: "text-green-600 bg-green-100",
    on_hold: "text-yellow-600 bg-yellow-100",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="btn-outline flex items-center space-x-2">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Project</span>
              </button>
            </div>
          </div>

          {/* Project Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div
                className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[project.status] || "text-gray-600 bg-gray-100"
                }`}
              >
                {project.status?.replace("_", " ").toUpperCase() ||
                  "NOT STARTED"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Progress</div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{stats.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Due Date</div>
              <div className="mt-1 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-medium">
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : "No due date"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Team Members</div>
              <div className="mt-1 flex items-center">
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center border-2 border-white"
                      title={member.name}
                    >
                      <span className="text-white text-xs font-medium">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {members.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center border-2 border-white">
                      <span className="text-white text-xs font-medium">
                        +{members.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <span className="ml-3 text-sm font-medium">
                  {members.length} members
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Completed
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      In Progress
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.inProgress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.overdue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Progress
              </h3>
              <ProjectProgressChart tasks={projectTasks} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {projectTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 py-2"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === "done"
                          ? "bg-green-500"
                          : task.status === "inprogress"
                          ? "bg-blue-500"
                          : task.status === "review"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated{" "}
                        {new Date(
                          task.updatedAt || task.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.status === "done"
                          ? "bg-green-100 text-green-800"
                          : task.status === "inprogress"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "tasks" && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Task Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="input-field w-auto"
                  >
                    <option value="all">
                      All Tasks ({projectTasks.length})
                    </option>
                    <option value="todo">
                      To Do (
                      {projectTasks.filter((t) => t.status === "todo").length})
                    </option>
                    <option value="inprogress">
                      In Progress (
                      {
                        projectTasks.filter((t) => t.status === "inprogress")
                          .length
                      }
                      )
                    </option>
                    <option value="review">
                      Review (
                      {projectTasks.filter((t) => t.status === "review").length}
                      )
                    </option>
                    <option value="done">
                      Done (
                      {projectTasks.filter((t) => t.status === "done").length})
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="p-6">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {taskFilter === "all"
                      ? "Create your first task to get started"
                      : `No tasks in ${taskFilter.replace("_", " ")} status`}
                  </p>
                  {taskFilter === "all" && (
                    <button
                      onClick={() => setShowCreateTask(true)}
                      className="btn-primary"
                    >
                      Create First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Timeline
            </h3>
            <ProjectTimeline tasks={projectTasks} project={project} />
          </div>
        )}

        {activeTab === "team" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Team Members
              </h3>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No team members
                </h3>
                <p className="text-gray-600">
                  Assign tasks to team members to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => {
                  const memberTasks = projectTasks.filter(
                    (task) => task.assignee === member.id
                  );
                  const completedTasks = memberTasks.filter(
                    (task) => task.status === "done"
                  );

                  return (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {member.role || "Team Member"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks Assigned</span>
                          <span className="font-medium">
                            {memberTasks.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed</span>
                          <span className="font-medium text-green-600">
                            {completedTasks.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${
                                memberTasks.length > 0
                                  ? (completedTasks.length /
                                      memberTasks.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Project Settings
            </h3>

            <div className="space-y-6">
              {/* General Settings */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  General
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      className="input-field"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={project.description || ""}
                      rows={3}
                      className="input-field"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="input-field"
                      value={project.status || "not_started"}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Danger Zone
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <h5 className="font-medium text-yellow-800">
                        Archive Project
                      </h5>
                      <p className="text-sm text-yellow-700">
                        Archive this project and all its tasks
                      </p>
                    </div>
                    <button className="btn-outline border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h5 className="font-medium text-red-800">
                        Delete Project
                      </h5>
                      <p className="text-sm text-red-700">
                        Permanently delete this project and all its data
                      </p>
                    </div>
                    <button className="btn-danger">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
