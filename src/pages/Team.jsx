import React, { useEffect, useState } from "react";
import { useTask } from "@context/TaskContext";
import { useAuth } from "@context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  MoreHorizontal,
  UserPlus,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
} from "lucide-react";
import InviteMemberModal from "@components/team/InviteMemberModal";

const Team = () => {
  const {
    teamMembers,
    tasks,
    projects,
    fetchTeamMembers,
    fetchTasks,
    fetchProjects,
  } = useTask();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
    fetchTasks();
    fetchProjects();
  }, []);

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter((task) => task.assignee === memberId);
    const completedTasks = memberTasks.filter((task) => task.status === "done");
    const overdueTasks = memberTasks.filter(
      (task) =>
        task.status !== "done" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date()
    );

    return {
      totalTasks: memberTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate:
        memberTasks.length > 0
          ? Math.round((completedTasks.length / memberTasks.length) * 100)
          : 0,
      activeProjects: [
        ...new Set(memberTasks.map((task) => task.projectId).filter(Boolean)),
      ].length,
    };
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <BarChart3 className="h-4 w-4" />;
      case "member":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter((member) => member.status === "active").length,
    admins: teamMembers.filter((member) => member.role === "admin").length,
    managers: teamMembers.filter((member) => member.role === "manager").length,
    members: teamMembers.filter((member) => member.role === "member").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Team Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-blue-900">
                  {teamStats.total}
                </div>
                <div className="text-sm text-blue-700">Total Members</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-green-900">
                  {teamStats.active}
                </div>
                <div className="text-sm text-green-700">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-red-900">
                  {teamStats.admins}
                </div>
                <div className="text-sm text-red-700">Admins</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-purple-900">
                  {teamStats.managers}
                </div>
                <div className="text-sm text-purple-700">Managers</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-yellow-900">
                  {teamStats.members}
                </div>
                <div className="text-sm text-yellow-700">Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-6">
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || roleFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Invite your first team member to get started"}
            </p>
            {!searchQuery && roleFilter === "all" && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary"
              >
                Invite Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const stats = getMemberStats(member.id);
              const isCurrentUser = member.id === user?.id;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {member.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(
                              member.status
                            )}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </div>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.joinedAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Joined{" "}
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">
                            {stats.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.totalTasks}
                          </div>
                          <div className="text-xs text-gray-600">Tasks</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {stats.completedTasks}
                          </div>
                          <div className="text-xs text-gray-600">Done</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {stats.activeProjects}
                          </div>
                          <div className="text-xs text-gray-600">Projects</div>
                        </div>
                      </div>

                      {stats.overdueTasks > 0 && (
                        <div className="flex items-center justify-center p-2 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-700">
                            {stats.overdueTasks} overdue task
                            {stats.overdueTasks > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {/* Top Performer Badge */}
                      {stats.completionRate >= 90 && stats.totalTasks >= 5 && (
                        <div className="flex items-center justify-center p-2 bg-yellow-50 rounded-lg">
                          <Award className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700 font-medium">
                            Top Performer
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center space-x-2">
                      <button className="flex-1 btn-outline text-sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Message
                      </button>
                      <button className="flex-1 btn-outline text-sm">
                        View Tasks
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default Team;
