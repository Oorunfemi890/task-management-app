import React, { useEffect } from 'react';
import { useTask } from '@context/TaskContext';
import { useAuth } from '@context/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import StatsCard from '@components/dashboard/StatsCard';
import RecentTasks from '@components/dashboard/RecentTasks';
import ProjectProgress from '@components/dashboard/ProjectProgress';
import TeamActivity from '@components/dashboard/TeamActivity';
import UpcomingDeadlines from '@components/dashboard/UpcomingDeadlines';
import TaskDistributionChart from '@components/dashboard/TaskDistributionChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    projects, 
    teamMembers, 
    fetchTasks, 
    fetchProjects, 
    fetchTeamMembers 
  } = useTask();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress').length;
  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== 'done';
  }).length;

  const myTasks = tasks.filter(task => task.assignee === user?.id);
  const myCompletedTasks = myTasks.filter(task => task.status === 'done').length;
  const completionRate = myTasks.length > 0 ? (myCompletedTasks / myTasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={CheckCircle}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="In Progress"
          value={inProgressTasks}
          icon={Clock}
          color="yellow"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Overdue"
          value={overdueTasks}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Task Distribution
            </h2>
            <TaskDistributionChart tasks={tasks} />
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Tasks
            </h2>
            <RecentTasks tasks={tasks.slice(0, 5)} />
          </div>

          {/* Project Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Progress
            </h2>
            <ProjectProgress projects={projects} tasks={tasks} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* My Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Performance
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{myTasks.length}</p>
                  <p className="text-sm text-gray-600">My Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{myCompletedTasks}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Deadlines
            </h2>
            <UpcomingDeadlines tasks={tasks} />
          </div>

          {/* Team Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Team Activity
            </h2>
            <TeamActivity teamMembers={teamMembers} tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;