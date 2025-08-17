import React from 'react';
import { Users, TrendingUp, Award } from 'lucide-react';

const TeamActivity = ({ teamMembers, tasks }) => {
  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter(task => task.assignee === memberId);
    const completedTasks = memberTasks.filter(task => task.status === 'done');
    
    return {
      total: memberTasks.length,
      completed: completedTasks.length,
      completionRate: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0
    };
  };

  const activeMembers = teamMembers
    .map(member => ({
      ...member,
      stats: getMemberStats(member.id)
    }))
    .filter(member => member.stats.total > 0)
    .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
    .slice(0, 5);

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No team activity</p>
        <p className="text-sm text-gray-500">Team member activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeMembers.map((member, index) => (
        <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {index === 0 && member.stats.completionRate >= 90 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Award className="h-2.5 w-2.5 text-yellow-800" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {member.name}
              </h4>
              <span className="text-xs text-gray-500">
                {member.stats.completed}/{member.stats.total} tasks
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    member.stats.completionRate >= 90 ? 'bg-green-500' :
                    member.stats.completionRate >= 70 ? 'bg-blue-500' :
                    member.stats.completionRate >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${member.stats.completionRate}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {member.stats.completionRate}%
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {activeMembers.length === 0 && (
        <div className="text-center py-6">
          <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No active team members</p>
          <p className="text-xs text-gray-500">Assign tasks to see team activity</p>
        </div>
      )}
      
      {teamMembers.length > 5 && (
        <div className="text-center pt-2">
          <button className="text-sm text-primary-600 hover:text-primary-500">
            View all team members ({teamMembers.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamActivity;