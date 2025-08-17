import React, { useState } from "react";
import { useTask } from "@context/TaskContext";
import { useAuth } from "@context/AuthContext";
import {
  X,
  Edit,
  Trash2,
  Calendar,
  Flag,
  User,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle,
  Plus,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TaskDetailsModal = ({ task, isOpen, onClose }) => {
  const { updateTask, deleteTask, teamMembers, projects } = useTask();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { id: 1, name: "John Doe", avatar: "JD" },
      content:
        "I've started working on this task. Will update the progress soon.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isEdited: false,
    },
    {
      id: 2,
      author: { id: 2, name: "Jane Smith", avatar: "JS" },
      content:
        "Great! Let me know if you need any help with the implementation.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isEdited: false,
    },
  ]);

  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      type: "status_change",
      author: "John Doe",
      description: 'moved this task from "To Do" to "In Progress"',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 2,
      type: "assignment",
      author: "Jane Smith",
      description: "assigned this task to John Doe",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      type: "creation",
      author: "Jane Smith",
      description: "created this task",
      timestamp: new Date(task.createdAt),
    },
  ]);

  if (!isOpen || !task) return null;

  const assignedMember = teamMembers?.find(
    (member) => member.id === task.assignee
  );
  const project = projects?.find((p) => p.id === task.projectId);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "text-gray-600 bg-gray-100";
      case "inprogress":
        return "text-blue-600 bg-blue-100";
      case "review":
        return "text-yellow-600 bg-yellow-100";
      case "done":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      // In a real app, this would trigger a refresh or the parent would update
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.name?.charAt(0) || "U",
      },
      content: newComment,
      createdAt: new Date(),
      isEdited: false,
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${getStatusColor(task.status)}`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {task.title}
                </h2>
                {project && (
                  <p className="text-sm text-gray-600">{project.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex h-96">
            {/* Left Panel - Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Task Details */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </p>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Attachments
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No attachments</p>
                    <button className="text-primary-600 text-sm hover:text-primary-500 mt-1">
                      Add attachment
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Comments
                  </h3>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {comment.author.avatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(comment.createdAt, {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-4 flex space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddComment()
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          placeholder="Add a comment..."
                        />
                        <button
                          onClick={handleAddComment}
                          className="btn-primary px-3 py-2 text-sm"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Sidebar */}
            <div className="w-80 border-l border-gray-200 flex flex-col">
              {/* Task Properties */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Task Details
                </h3>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Priority
                    </label>
                    <div
                      className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Assignee
                    </label>
                    <div className="mt-1">
                      {assignedMember ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {assignedMember.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">
                            {assignedMember.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Due Date
                    </label>
                    <div className="mt-1">
                      {task.dueDate ? (
                        <div
                          className={`flex items-center space-x-2 ${
                            isOverdue() ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue() && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">No due date</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Created/Updated */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Timeline
                    </label>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">
                          Created{" "}
                          {formatDistanceToNow(new Date(task.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {task.updatedAt && (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">
                            Updated{" "}
                            {formatDistanceToNow(new Date(task.updatedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Activity
                </h3>
                <div className="space-y-3">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.author}</span>{" "}
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
