// src/components/common/EnhancedNotificationDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@context/NotificationContext";
import {
  Bell,
  X,
  Reply,
  ExternalLink,
  MessageCircle,
  Send,
  Paperclip,
  Check,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  User,
  ArrowRight,
  Maximize2,
  Minimize2,
  Settings,
  Filter,
  Pin,
  Trash2,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";

const EnhancedNotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    quickReplyToMessage,
    navigateToNotification,
    updateFilters,
    filters,
    isSocketConnected,
    bulkMarkAsRead,
    bulkDelete,
    snoozeNotification,
    pinNotification,
    unpinNotification,
  } = useNotifications();

  const [activeQuickReply, setActiveQuickReply] = useState(null);
  const [quickReplyMessage, setQuickReplyMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleQuickReply = async (notification) => {
    if (!quickReplyMessage.trim()) return;

    try {
      await quickReplyToMessage(notification, quickReplyMessage);
      setActiveQuickReply(null);
      setQuickReplyMessage("");
    } catch (error) {
      // Error is already handled by the context with toast
    }
  };

  const handleNavigate = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.data?.action_url) {
      navigate(notification.data.action_url);
    } else if (notification.project_id) {
      navigate(`/projects/${notification.project_id}`);
    } else if (notification.task_id) {
      navigate(`/tasks/${notification.task_id}`);
    }

    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "project_message":
        return <MessageCircle className="h-4 w-4" />;
      case "task_assigned":
        return <CheckCircle className="h-4 w-4" />;
      case "mention":
        return <User className="h-4 w-4" />;
      case "deadline_reminder":
        return <Clock className="h-4 w-4" />;
      case "team_mention":
        return <Users className="h-4 w-4" />;
      case "task_overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "project_message":
        return "text-blue-600 bg-blue-100";
      case "task_assigned":
        return "text-green-600 bg-green-100";
      case "mention":
      case "team_mention":
        return "text-purple-600 bg-purple-100";
      case "deadline_reminder":
        return "text-yellow-600 bg-yellow-100";
      case "task_overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.size === 0) return;

    const notificationIds = Array.from(selectedNotifications);

    if (action === "markRead") {
      await bulkMarkAsRead(notificationIds);
    } else if (action === "delete") {
      await bulkDelete(notificationIds);
    }

    setSelectedNotifications(new Set());
    setBulkMode(false);
  };

  const toggleNotificationSelection = (notificationId) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  const filterOptions = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    {
      key: "project_message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "project_message").length,
    },
    {
      key: "task_assigned",
      label: "Tasks",
      count: notifications.filter((n) => n.type === "task_assigned").length,
    },
    {
      key: "mention",
      label: "Mentions",
      count: notifications.filter(
        (n) => n.type === "mention" || n.type === "team_mention"
      ).length,
    },
  ];

  const handleFilterChange = (filterKey) => {
    if (filterKey === "unread") {
      updateFilters({ ...filters, unreadOnly: true, type: "all" });
    } else {
      updateFilters({ ...filters, type: filterKey, unreadOnly: false });
    }
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isExpanded ? "w-96 max-h-[700px]" : "w-80 max-h-96"
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bell className="h-5 w-5 text-blue-600" />
                {!isSocketConnected() && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
              {isLoading && (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={soundEnabled ? "Disable sounds" : "Enable sounds"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`p-1 text-gray-400 hover:text-gray-600 transition-colors ${
                  bulkMode ? "text-blue-600" : ""
                }`}
                title="Bulk select"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => navigate("/notifications")}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {!isSocketConnected() && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠️ Disconnected - Real-time updates paused
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-1 mt-3 bg-white rounded-lg p-1 overflow-x-auto">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  (filters.type === filter.key && !filters.unreadOnly) ||
                  (filter.key === "unread" && filters.unreadOnly)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({filter.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {bulkMode && selectedNotifications.size > 0 && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-gray-600">
                {selectedNotifications.size} selected
              </span>
              <button
                onClick={() => handleBulkAction("markRead")}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}

          {/* Quick Actions */}
          {unreadCount > 0 && !bulkMode && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-500 mt-2"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No notifications</p>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                } ${
                  selectedNotifications.has(notification.id)
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Bulk Selection Checkbox */}
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() =>
                        toggleNotificationSelection(notification.id)
                      }
                      className="mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>

                        {/* Project/Context Info */}
                        {notification.project_name && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            {notification.project_name}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {notification.timeAgo ||
                              (() => {
                                const diff =
                                  Date.now() -
                                  new Date(
                                    notification.time || notification.created_at
                                  );
                                const minutes = Math.floor(diff / 60000);
                                return minutes < 1
                                  ? "just now"
                                  : minutes < 60
                                  ? `${minutes}m ago`
                                  : minutes < 1440
                                  ? `${Math.floor(minutes / 60)}h ago`
                                  : `${Math.floor(minutes / 1440)}d ago`;
                              })()}
                          </p>

                          {/* Action Buttons */}
                          {!bulkMode && (
                            <div className="flex items-center space-x-1">
                              {/* Pin/Unpin */}
                              <button
                                onClick={() =>
                                  notification.isPinned
                                    ? unpinNotification(notification.id)
                                    : pinNotification(notification.id)
                                }
                                className={`p-1 transition-colors ${
                                  notification.isPinned
                                    ? "text-yellow-600"
                                    : "text-gray-400 hover:text-yellow-600"
                                }`}
                                title={notification.isPinned ? "Unpin" : "Pin"}
                              >
                                <Pin className="h-4 w-4" />
                              </button>

                              {/* Quick Reply for Messages */}
                              {notification.type === "project_message" &&
                                notification.data?.can_reply && (
                                  <button
                                    onClick={() =>
                                      setActiveQuickReply(
                                        activeQuickReply === notification.id
                                          ? null
                                          : notification.id
                                      )
                                    }
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Quick reply"
                                  >
                                    <Reply className="h-4 w-4" />
                                  </button>
                                )}

                              {/* Mark as read */}
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}

                              {/* Navigate to source */}
                              <button
                                onClick={() => handleNavigate(notification)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Open in project"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Reply Interface */}
                    {activeQuickReply === notification.id && (
                      <div className="mt-3 p-3 bg-white border rounded-lg shadow-sm animate-in slide-in-from-top">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {notification.sender?.avatar || "You"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Reply to {notification.sender?.name}
                          </span>
                        </div>

                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <textarea
                              value={quickReplyMessage}
                              onChange={(e) =>
                                setQuickReplyMessage(e.target.value)
                              }
                              placeholder="Type your reply..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleQuickReply(notification);
                                }
                              }}
                            />
                          </div>

                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleQuickReply(notification)}
                              disabled={!quickReplyMessage.trim()}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Add attachment"
                            >
                              <Paperclip className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && !bulkMode && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                {/* Pinned indicator */}
                {notification.isPinned && (
                  <div className="absolute right-2 top-2">
                    <Pin className="h-3 w-3 text-yellow-500" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                navigate("/notifications");
                onClose();
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center space-x-2"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Backdrop for expanded view */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default EnhancedNotificationDropdown;
