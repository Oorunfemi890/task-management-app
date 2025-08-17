import React, { useState } from "react";
import {
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTask } from "@context/TaskContext";

const TaskCard = ({ task, isDragging, onClick, teamMembers, projects }) => {
  const { deleteTask } = useTask();
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority) => {
    const baseClass = "h-4 w-4";
    switch (priority) {
      case "high":
        return <Flag className={`${baseClass} text-red-500`} />;
      case "medium":
        return <Flag className={`${baseClass} text-yellow-500`} />;
      case "low":
        return <Flag className={`${baseClass} text-green-500`} />;
      default:
        return <Flag className={`${baseClass} text-gray-400`} />;
    }
  };

  const getAssignedMember = (assigneeId) => {
    return teamMembers?.find((member) => member.id === assigneeId);
  };

  const getProject = (projectId) => {
    return projects?.find((project) => project.id === projectId);
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  };

  const formatDueDate = () => {
    if (!task.dueDate) return null;
    return formatDistanceToNow(new Date(task.dueDate), { addSuffix: true });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
    setShowMenu(false);
  };

  const assignedMember = getAssignedMember(task.assignee);
  const project = getProject(task.projectId);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? "shadow-lg rotate-1 scale-105" : "shadow-sm"
      } ${isOverdue() ? "border-red-200 bg-red-50" : ""}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </h3>
          {project && (
            <p className="text-xs text-gray-500 mt-1">{project.name}</p>
          )}
        </div>

        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Priority and Due Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Priority */}
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              task.priority
            )}`}
          >
            {getPriorityIcon(task.priority)}
            <span className="ml-1 capitalize">{task.priority}</span>
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div
            className={`flex items-center text-xs ${
              isOverdue() ? "text-red-600" : "text-gray-500"
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDueDate()}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Comments */}
          {task.commentCount > 0 && (
            <div className="flex items-center text-gray-500">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">{task.commentCount}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachmentCount > 0 && (
            <div className="flex items-center text-gray-500">
              <Paperclip className="h-4 w-4 mr-1" />
              <span className="text-xs">{task.attachmentCount}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {assignedMember ? (
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {assignedMember.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </div>

      {/* Progress bar for subtasks */}
      {task.subtaskTotal > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {task.subtaskCompleted}/{task.subtaskTotal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  task.subtaskTotal > 0
                    ? (task.subtaskCompleted / task.subtaskTotal) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default TaskCard;

