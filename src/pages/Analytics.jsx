import React, { useState, useEffect } from "react";
import { useTask } from "@context/TaskContext";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const Analytics = () => {
  const {
    tasks,
    projects,
    teamMembers,
    fetchTasks,
    fetchProjects,
    fetchTeamMembers,
  } = useTask();
  const [dateRange, setDateRange] = useState("30d");
  const [selectedProject, setSelectedProject] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchTasks(), fetchProjects(), fetchTeamMembers()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter tasks based on date range
  const getFilteredTasks = () => {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      const matchesDate = taskDate >= startDate;
      const matchesProject =
        selectedProject === "all" ||
        task.projectId === parseInt(selectedProject);
      return matchesDate && matchesProject;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Calculate key metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "done"
  ).length;
  const overdueTasks = filteredTasks.filter(
    (task) =>
      task.status !== "done" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task status distribution
  const statusData = [
    {
      name: "To Do",
      value: filteredTasks.filter((task) => task.status === "todo").length,
      color: "#9CA3AF",
    },
    {
      name: "In Progress",
      value: filteredTasks.filter((task) => task.status === "inprogress")
        .length,
      color: "#3B82F6",
    },
    {
      name: "Review",
      value: filteredTasks.filter((task) => task.status === "review").length,
      color: "#F59E0B",
    },
    {
      name: "Done",
      value: filteredTasks.filter((task) => task.status === "done").length,
      color: "#10B981",
    },
  ];

  // Priority distribution
  const priorityData = [
    {
      name: "High",
      value: filteredTasks.filter((task) => task.priority === "high").length,
      color: "#EF4444",
    },
    {
      name: "Medium",
      value: filteredTasks.filter((task) => task.priority === "medium").length,
      color: "#F59E0B",
    },
    {
      name: "Low",
      value: filteredTasks.filter((task) => task.priority === "low").length,
      color: "#10B981",
    },
  ];

  // Team performance
  const teamPerformance = teamMembers
    .map((member) => {
      const memberTasks = filteredTasks.filter(
        (task) => task.assignee === member.id
      );
      const memberCompleted = memberTasks.filter(
        (task) => task.status === "done"
      );

      return {
        name: member.name,
        total: memberTasks.length,
        completed: memberCompleted.length,
        completionRate:
          memberTasks.length > 0
            ? Math.round((memberCompleted.length / memberTasks.length) * 100)
            : 0,
      };
    })
    .filter((member) => member.total > 0);

  // Tasks created over time (daily for selected period)
  const getTasksOverTime = () => {
    const data = [];
    const now = new Date();
    const days =
      dateRange === "7d"
        ? 7
        : dateRange === "30d"
        ? 30
        : dateRange === "90d"
        ? 90
        : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split("T")[0];

      const tasksCreated = tasks.filter(
        (task) => task.createdAt && task.createdAt.split("T")[0] === dateString
      ).length;

      const tasksCompleted = tasks.filter(
        (task) =>
          task.completedAt && task.completedAt.split("T")[0] === dateString
      ).length;

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        created: tasksCreated,
        completed: tasksCompleted,
      });
    }

    return data;
  };

  const timelineData = getTasksOverTime();

  // Project progress
  const projectProgress = projects
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id
      );
      const completedProjectTasks = projectTasks.filter(
        (task) => task.status === "done"
      );

      return {
        name: project.name,
        total: projectTasks.length,
        completed: completedProjectTasks.length,
        progress:
          projectTasks.length > 0
            ? Math.round(
                (completedProjectTasks.length / projectTasks.length) * 100
              )
            : 0,
      };
    })
    .filter((project) => project.total > 0);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchProjects(), fetchTeamMembers()]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      summary: {
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks,
        dateRange,
        selectedProject,
      },
      teamPerformance,
      projectProgress,
      statusDistribution: statusData,
      priorityDistribution: priorityData,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">
                Track your team's productivity and project insights
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button
              onClick={handleExport}
              className="btn-outline flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {dateRange === "7d"
              ? "Last 7 days"
              : dateRange === "30d"
              ? "Last 30 days"
              : dateRange === "90d"
              ? "Last 90 days"
              : "Last year"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {completedTasks}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            {completionRate}% completion rate
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            {totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}
            % of total tasks
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Projects
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {projects.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">
            {teamMembers.length} team members
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Task Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Over Time */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Created"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance and Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Team Performance
          </h3>
          {teamPerformance.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                No team performance data available
              </p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#9CA3AF" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Project Progress
          </h3>
          {projectProgress.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No project data available</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {projectProgress.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {project.name}
                    </span>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                      {project.completed}/{project.total} ({project.progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Team Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Team Statistics
        </h3>

        {teamPerformance.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No team statistics available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamPerformance.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {member.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.completionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${
                              member.completionRate >= 80
                                ? "bg-green-500"
                                : member.completionRate >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.completionRate >= 80
                              ? "bg-green-100 text-green-800"
                              : member.completionRate >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {member.completionRate >= 80
                            ? "Excellent"
                            : member.completionRate >= 60
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Insights & Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completionRate >= 80 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">
                    Great Performance!
                  </h4>
                  <p className="text-sm text-green-700">
                    Your team has a {completionRate}% completion rate. Keep up
                    the excellent work!
                  </p>
                </div>
              </div>
            </div>
          )}

          {overdueTasks > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Overdue Tasks
                  </h4>
                  <p className="text-sm text-red-700">
                    {overdueTasks} tasks are overdue. Consider reviewing
                    deadlines and priorities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {teamPerformance.some((member) => member.completionRate < 50) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Team Support Needed
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Some team members may need additional support or training.
                  </p>
                </div>
              </div>
            </div>
          )}

          {completionRate < 50 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-orange-800">
                    Low Completion Rate
                  </h4>
                  <p className="text-sm text-orange-700">
                    Consider reviewing workload distribution and task
                    priorities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {teamPerformance.some((member) => member.completionRate >= 90) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Top Performers
                  </h4>
                  <p className="text-sm text-blue-700">
                    Recognize team members with excellent completion rates!
                  </p>
                </div>
              </div>
            </div>
          )}

          {projectProgress.length > 0 &&
            projectProgress.every((project) => project.progress > 75) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-purple-800">
                      Projects on Track
                    </h4>
                    <p className="text-sm text-purple-700">
                      All projects are making excellent progress. Great
                      teamwork!
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
