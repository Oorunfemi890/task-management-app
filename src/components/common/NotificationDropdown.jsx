import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  X,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "task_assigned",
      title: "New task assigned",
      message: 'You have been assigned to "Update user interface"',
      time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      icon: CheckCircle,
      color: "blue",
    },
    {
      id: 2,
      type: "task_completed",
      title: "Task completed",
      message: 'John completed "Fix login bug"',
      time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      icon: CheckCircle,
      color: "green",
    },
    {
      id: 3,
      type: "deadline_approaching",
      title: "Deadline approaching",
      message: '"Database migration" is due tomorrow',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true,
      icon: Clock,
      color: "yellow",
    },
    {
      id: 4,
      type: "team_mention",
      title: "You were mentioned",
      message: "Sarah mentioned you in a comment",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: true,
      icon: Users,
      color: "purple",
    },
    {
      id: 5,
      type: "task_overdue",
      title: "Task overdue",
      message: '"Review documentation" is overdue',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      icon: AlertTriangle,
      color: "red",
    },
  ]);

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

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const getNotificationBgColor = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-100";
      case "green":
        return "bg-green-100";
      case "yellow":
        return "bg-yellow-100";
      case "purple":
        return "bg-purple-100";
      case "red":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getNotificationTextColor = (color) => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      case "yellow":
        return "text-yellow-600";
      case "purple":
        return "text-purple-600";
      case "red":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-500 mt-1"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No notifications</p>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const IconComponent = notification.icon;

            return (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full ${getNotificationBgColor(
                      notification.color
                    )} flex-shrink-0`}
                  >
                    <IconComponent
                      className={`h-4 w-4 ${getNotificationTextColor(
                        notification.color
                      )}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(notification.time, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-center text-sm text-primary-600 hover:text-primary-500 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
