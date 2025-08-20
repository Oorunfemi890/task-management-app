import React, { useState } from "react";
import { Users, TrendingUp, Award, ChevronDown, ChevronUp } from "lucide-react";

const TeamActivity = ({ teamMembers, tasks }) => {
  const [showAllMembers, setShowAllMembers] = useState(false);

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter((task) => task.assignee === memberId);
    const completedTasks = memberTasks.filter((task) => task.status === "done");

    return {
      total: memberTasks.length,
      completed: completedTasks.length,
      completionRate:
        memberTasks.length > 0
          ? Math.round((completedTasks.length / memberTasks.length) * 100)
          : 0,
    };
  };

  const allMembersWithStats = teamMembers
    .map((member) => ({
      ...member,
      stats: getMemberStats(member.id),
    }))
    .sort((a, b) => b.stats.completionRate - a.stats.completionRate);

  // Show only active members (those with tasks) by default
  const activeMembersOnly = allMembersWithStats.filter(
    (member) => member.stats.total > 0
  );

  // Determine which members to display
  const membersToShow = showAllMembers
    ? allMembersWithStats
    : activeMembersOnly.slice(0, 5);

  const shouldShowToggle =
    teamMembers.length > 5 || activeMembersOnly.length > 5;

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No team members</p>
        <p className="text-sm text-gray-500">
          Add team members to see activity
        </p>
      </div>
    );
  }

  const renderMember = (member, index) => (
    <div
      key={member.id}
      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {member.avatar || member.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        {index === 0 &&
          member.stats.completionRate >= 90 &&
          member.stats.total > 0 && (
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

        {member.stats.total > 0 ? (
          <div className="flex items-center justify-between mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  member.stats.completionRate >= 90
                    ? "bg-green-500"
                    : member.stats.completionRate >= 70
                    ? "bg-blue-500"
                    : member.stats.completionRate >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${member.stats.completionRate}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {member.stats.completionRate}%
            </span>
          </div>
        ) : (
          <div className="mt-1">
            <span className="text-xs text-gray-500 italic">
              No tasks assigned
            </span>
          </div>
        )}

        {/* Additional member info */}
        <div className="flex items-center mt-1 text-xs text-gray-400">
          <span>{member.email}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {activeMembersOnly.length} active of {teamMembers.length} total
          members
        </div>
        {shouldShowToggle && (
          <button
            onClick={() => setShowAllMembers(!showAllMembers)}
            className="text-xs text-primary-600 hover:text-primary-500 flex items-center"
          >
            {showAllMembers ? (
              <>
                Show less
                <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                Show all
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Team members list */}
      <div className="space-y-3">
        {membersToShow.map((member, index) => renderMember(member, index))}
      </div>

      {activeMembersOnly.length === 0 && (
        <div className="text-center py-6">
          <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No active team members</p>
          <p className="text-xs text-gray-500">
            Assign tasks to see team activity
          </p>
        </div>
      )}

      {/* Summary statistics */}
      {activeMembersOnly.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-primary-600">
                {activeMembersOnly.length}
              </div>
              <div className="text-xs text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {
                  activeMembersOnly.filter(
                    (member) => member.stats.completionRate >= 80
                  ).length
                }
              </div>
              <div className="text-xs text-gray-600">High Performers</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(
                  activeMembersOnly.reduce(
                    (acc, member) => acc + member.stats.completionRate,
                    0
                  ) / activeMembersOnly.length
                ) || 0}
                %
              </div>
              <div className="text-xs text-gray-600">Avg Completion</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamActivity;
