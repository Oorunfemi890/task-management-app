// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { notificationService } from "@services/notificationService";
import { enhancedSocketService } from "@services/enhancedSocketService";
import { useAuth } from "@context/AuthContext";
import toast from "react-hot-toast";

const NotificationContext = createContext(null);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetched: null,
  preferences: null,
  stats: null,
  filters: {
    type: "all",
    unreadOnly: false,
    page: 1,
    limit: 20,
  },
  socket: {
    isConnected: false,
    error: null,
  },
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount || 0,
        lastFetched: new Date().toISOString(),
        isLoading: false,
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.isRead ? 0 : 1),
      };

    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
        unreadCount: action.payload.updates.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };

    case "REMOVE_NOTIFICATION":
      const removedNotification = state.notifications.find(
        (n) => n.id === action.payload
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
        unreadCount:
          removedNotification && !removedNotification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };

    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case "SET_PREFERENCES":
      return {
        ...state,
        preferences: action.payload,
      };

    case "SET_STATS":
      return {
        ...state,
        stats: action.payload,
      };

    case "SET_SOCKET_STATUS":
      return {
        ...state,
        socket: { ...state.socket, ...action.payload },
      };

    case "BULK_UPDATE_NOTIFICATIONS":
      const { action: bulkAction, notificationIds } = action.payload;
      if (bulkAction === "markRead") {
        const updatedNotifications = state.notifications.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        );
        const newUnreadCount = updatedNotifications.filter(
          (n) => !n.isRead
        ).length;
        return {
          ...state,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      } else if (bulkAction === "delete") {
        const remainingNotifications = state.notifications.filter(
          (n) => !notificationIds.includes(n.id)
        );
        const newUnreadCount = remainingNotifications.filter(
          (n) => !n.isRead
        ).length;
        return {
          ...state,
          notifications: remainingNotifications,
          unreadCount: newUnreadCount,
        };
      }
      return state;

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection and event handlers
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to socket
    enhancedSocketService.connect();

    // Setup notification handlers
    enhancedSocketService.setupNotificationHandlers({
      onNewNotification: (notification) => {
        dispatch({ type: "ADD_NOTIFICATION", payload: notification });

        // Show toast notification based on type
        if (notification.type === "project_message") {
          toast.success(
            `💬 ${notification.sender?.name}: ${notification.message.substring(
              0,
              50
            )}...`,
            {
              duration: 4000,
              onClick: () => navigateToNotification(notification),
            }
          );
        } else if (notification.type === "mention") {
          toast(`👋 You were mentioned by ${notification.sender?.name}`, {
            icon: "💬",
            duration: 5000,
          });
        } else if (notification.type === "task_assigned") {
          toast.success(
            `📋 New task assigned: ${notification.message.substring(0, 40)}...`
          );
        }
      },

      onConnected: () => {
        dispatch({
          type: "SET_SOCKET_STATUS",
          payload: { isConnected: true, error: null },
        });
      },

      onDisconnected: (data) => {
        dispatch({
          type: "SET_SOCKET_STATUS",
          payload: { isConnected: false },
        });
      },

      onConnectionError: (data) => {
        dispatch({
          type: "SET_SOCKET_STATUS",
          payload: { error: data.error, isConnected: false },
        });
      },
    });

    // Listen for notification updates
    enhancedSocketService.onNotificationMarkedRead((data) => {
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { id: data.notificationId, updates: { isRead: true } },
      });
    });

    enhancedSocketService.onNotificationDeleted((data) => {
      dispatch({ type: "REMOVE_NOTIFICATION", payload: data.notificationId });
    });

    enhancedSocketService.on("allNotificationsMarkedRead", () => {
      dispatch({ type: "MARK_ALL_READ" });
    });

    enhancedSocketService.on("bulkNotificationUpdate", (data) => {
      dispatch({ type: "BULK_UPDATE_NOTIFICATIONS", payload: data });
    });

    // Cleanup on unmount
    return () => {
      enhancedSocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Fetch initial notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchPreferences();
      fetchStats();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async (filters = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await notificationService.getNotifications({
        ...state.filters,
        ...filters,
      });
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: {
          notifications: response.notifications || [],
          unreadCount: response.unreadCount || 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchPreferences = async () => {
    try {
      const preferences =
        await notificationService.getNotificationPreferences();
      dispatch({ type: "SET_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await notificationService.getNotificationStats();
      dispatch({ type: "SET_STATS", payload: stats });
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { id: notificationId, updates: { isRead: true } },
      });

      // Also update via socket for real-time sync
      enhancedSocketService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: "MARK_ALL_READ" });
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const quickReplyToMessage = async (notification, message) => {
    try {
      if (!notification.project_id || !notification.message_id) {
        throw new Error("Invalid notification for quick reply");
      }

      const result = await notificationService.quickReplyToMessage(
        notification.project_id,
        notification.message_id,
        message
      );

      // Mark the notification as read after successful reply
      await markAsRead(notification.id);

      toast.success("Message sent successfully!");
      return result;
    } catch (error) {
      console.error("Failed to send quick reply:", error);
      toast.error("Failed to send message");
      throw error;
    }
  };

  const navigateToNotification = (notification) => {
    // Mark as read when navigating
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.action_url) {
      window.location.href = notification.data.action_url;
    } else if (notification.project_id) {
      window.location.href = `/projects/${notification.project_id}`;
    } else if (notification.task_id) {
      window.location.href = `/tasks/${notification.task_id}`;
    }
  };

  const updateFilters = (newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
    fetchNotifications(newFilters);
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await notificationService.updateNotificationPreferences(newPreferences);
      dispatch({ type: "SET_PREFERENCES", payload: newPreferences });

      // Store locally for immediate access
      localStorage.setItem(
        "notification_preferences",
        JSON.stringify(newPreferences)
      );

      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const joinProjectRoom = (projectId) => {
    enhancedSocketService.joinProject(projectId);
  };

  const leaveProjectRoom = (projectId) => {
    enhancedSocketService.leaveProject(projectId);
  };

  const getFilteredNotifications = () => {
    let filtered = [...state.notifications];

    if (state.filters.type !== "all") {
      filtered = filtered.filter((n) => n.type === state.filters.type);
    }

    if (state.filters.unreadOnly) {
      filtered = filtered.filter((n) => !n.isRead);
    }

    return filtered;
  };

  const getNotificationsByType = (type) => {
    return state.notifications.filter((n) => n.type === type);
  };

  const getUnreadNotificationsByType = (type) => {
    return state.notifications.filter((n) => n.type === type && !n.isRead);
  };

  const bulkMarkAsRead = async (notificationIds) => {
    try {
      await enhancedSocketService.handleBulkNotificationUpdate(
        "markRead",
        notificationIds
      );
      toast.success(`${notificationIds.length} notifications marked as read`);
    } catch (error) {
      console.error("Failed bulk mark as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const bulkDelete = async (notificationIds) => {
    try {
      await enhancedSocketService.handleBulkNotificationUpdate(
        "delete",
        notificationIds
      );
      toast.success(`${notificationIds.length} notifications deleted`);
    } catch (error) {
      console.error("Failed bulk delete:", error);
      toast.error("Failed to delete notifications");
    }
  };

  // Advanced notification management
  const snoozeNotification = async (notificationId, duration = 3600000) => {
    // Hide notification for specified duration (default 1 hour)
    dispatch({
      type: "UPDATE_NOTIFICATION",
      payload: {
        id: notificationId,
        updates: {
          snoozedUntil: new Date(Date.now() + duration).toISOString(),
        },
      },
    });

    toast.success("Notification snoozed for 1 hour");

    // Set timeout to bring it back
    setTimeout(() => {
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { id: notificationId, updates: { snoozedUntil: null } },
      });
    }, duration);
  };

  const pinNotification = async (notificationId) => {
    dispatch({
      type: "UPDATE_NOTIFICATION",
      payload: { id: notificationId, updates: { isPinned: true } },
    });
    toast.success("Notification pinned");
  };

  const unpinNotification = async (notificationId) => {
    dispatch({
      type: "UPDATE_NOTIFICATION",
      payload: { id: notificationId, updates: { isPinned: false } },
    });
    toast.success("Notification unpinned");
  };

  // Real-time status helpers
  const isSocketConnected = () => {
    return state.socket.isConnected;
  };

  const getConnectionStatus = () => {
    return {
      isConnected: state.socket.isConnected,
      error: state.socket.error,
      socketId: enhancedSocketService.getSocketId(),
    };
  };

  // Notification summary helpers
  const getNotificationSummary = () => {
    const total = state.notifications.length;
    const unread = state.unreadCount;
    const byType = state.notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read: total - unread,
      byType,
      recentCount: state.notifications.filter((n) => {
        const notifTime = new Date(n.created_at || n.time);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return notifTime > oneDayAgo;
      }).length,
    };
  };

  const value = {
    // State
    ...state,

    // Derived state
    filteredNotifications: getFilteredNotifications(),
    summary: getNotificationSummary(),

    // Core actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    quickReplyToMessage,
    navigateToNotification,

    // Filters and preferences
    updateFilters,
    updatePreferences,
    fetchPreferences,
    fetchStats,

    // Project room management
    joinProjectRoom,
    leaveProjectRoom,

    // Bulk actions
    bulkMarkAsRead,
    bulkDelete,

    // Advanced features
    snoozeNotification,
    pinNotification,
    unpinNotification,

    // Helpers
    getNotificationsByType,
    getUnreadNotificationsByType,
    isSocketConnected,
    getConnectionStatus,

    // Socket service access
    socketService: enhancedSocketService,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Custom hooks for specific notification types
export const useProjectMessageNotifications = () => {
  const { getNotificationsByType, getUnreadNotificationsByType } =
    useNotifications();

  return {
    all: getNotificationsByType("project_message"),
    unread: getUnreadNotificationsByType("project_message"),
  };
};

export const useTaskNotifications = () => {
  const { getNotificationsByType, getUnreadNotificationsByType } =
    useNotifications();

  const taskTypes = [
    "task_assigned",
    "task_completed",
    "task_overdue",
    "deadline_reminder",
  ];

  return taskTypes.reduce((acc, type) => {
    acc[type] = {
      all: getNotificationsByType(type),
      unread: getUnreadNotificationsByType(type),
    };
    return acc;
  }, {});
};

export const useMentionNotifications = () => {
  const { getNotificationsByType, getUnreadNotificationsByType } =
    useNotifications();

  return {
    mentions: getNotificationsByType("mention"),
    teamMentions: getNotificationsByType("team_mention"),
    unreadMentions: getUnreadNotificationsByType("mention"),
    unreadTeamMentions: getUnreadNotificationsByType("team_mention"),
  };
};
