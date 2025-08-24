import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  X,
  MoreHorizontal,
  Check,
  MessageSquare,
  FolderOpen,
  UserPlus,
  Bell,
  BellOff,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@context/AuthContext";
import { socketService } from "@services/socketService";

const NotificationDropdown = ({ onClose }) => {
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unread, project, task

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

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time notifications
    socketService.onNewNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    });

    socketService.onNotificationMarkedRead(({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    socketService.onAllNotificationsMarkedRead(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date() }))
      );
      setUnreadCount(0);
    });

    return () => {
      // Clean up socket listeners if needed
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date() }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read_at: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "project_invitation":
      case "project_message":
        return FolderOpen;
      case "task_assigned":
      case "task_completed":
        return CheckCircle;
      case "team_mention":
      case "mention":
        return MessageSquare;
      case "deadline_reminder":
        return Clock;
      case "member_added":
        return UserPlus;
      case "task_overdue":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "urgent")
      return "text-red-600 bg-red-100 dark:bg-red-900/30";
    if (priority === "high")
      return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";

    switch (type) {
      case "project_invitation":
      case "project_message":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "task_assigned":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      case "task_completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "team_mention":
      case "mention":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "deadline_reminder":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "task_overdue":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700";
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navigate to the relevant page if action_url exists
    if (notification.action_url) {
      window.location.href = notification.action_url;
      onClose();
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read_at);
      case "project":
        return notifications.filter(
          (n) => n.type.includes("project") || n.project_id
        );
      case "task":
        return notifications.filter(
          (n) => n.type.includes("task") || n.task_id
        );
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden transition-colors"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 mt-3">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "project", label: "Projects" },
            { key: "task", label: "Tasks" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === key
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 mt-2 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="spinner" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="flex flex-col items-center">
              {filter === "unread" ? (
                <BellOff className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              ) : (
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              )}
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "We'll notify you when something happens"}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const isUnread = !notification.read_at;

            return (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors relative cursor-pointer ${
                  isUnread ? "bg-primary-50 dark:bg-primary-900/10" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(
                      notification.type,
                      notification.priority
                    )}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Priority indicator */}
                        <div className="flex items-center space-x-2 mb-1">
                          <p
                            className={`text-sm font-medium ${
                              isUnread
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.priority === "urgent" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                              Urgent
                            </span>
                          )}
                          {notification.priority === "high" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                              High
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm mb-1 ${
                            isUnread
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {notification.message}
                        </p>

                        {/* Additional context */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                          <span>
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>

                          {notification.project_name && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {notification.project_name}
                              </span>
                            </>
                          )}

                          {notification.task_title && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {notification.task_title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 transition-colors">
          <div className="flex items-center justify-between">
            <button
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
              onClick={() => {
                // Navigate to full notifications page
                window.location.href = "/notifications";
                onClose();
              }}
            >
              View all notifications
            </button>

            <button
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Notification settings"
              onClick={() => {
                window.location.href = "/settings#notifications";
                onClose();
              }}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
