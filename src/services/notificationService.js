// src/services/notificationService.js
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

class NotificationService {
  constructor() {
    this.baseURL = API_BASE;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("taskflow_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Notification API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get user notifications with filtering
  async getNotifications(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/notifications${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return await this.apiCall(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  // Mark all notifications as read
  async markAllAsRead() {
    return await this.apiCall("/notifications/read-all", {
      method: "PUT",
    });
  }

  // Delete notification
  async deleteNotification(notificationId) {
    return await this.apiCall(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Get notification statistics
  async getNotificationStats() {
    return await this.apiCall("/notifications/stats");
  }

  // Get notification preferences
  async getNotificationPreferences() {
    return await this.apiCall("/notifications/preferences");
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    return await this.apiCall("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    });
  }

  // Quick reply to project message
  async quickReplyToMessage(projectId, messageId, message) {
    return await this.apiCall(`/projects/${projectId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message,
        replyTo: messageId,
      }),
    });
  }

  // Get project messages (for context in notifications)
  async getProjectMessages(projectId, options = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/projects/${projectId}/messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  // Send message to project
  async sendProjectMessage(projectId, messageData) {
    return await this.apiCall(`/projects/${projectId}/messages`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  // Upload and send file message
  async uploadAndSendFile(projectId, file, message = "") {
    const token = localStorage.getItem("taskflow_token");
    const formData = new FormData();
    formData.append("file", file);
    if (message) {
      formData.append("message", message);
    }

    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/messages/upload`,
      {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload failed");
    }

    return await response.json();
  }

  // Get project chat participants
  async getProjectChatParticipants(projectId) {
    return await this.apiCall(`/projects/${projectId}/messages/participants`);
  }

  // Mark project messages as read
  async markProjectMessagesAsRead(projectId, lastMessageId) {
    return await this.apiCall(`/projects/${projectId}/messages/read`, {
      method: "POST",
      body: JSON.stringify({ lastMessageId }),
    });
  }

  // Search messages in project
  async searchProjectMessages(projectId, query, options = {}) {
    const queryParams = new URLSearchParams({ query, ...options });
    return await this.apiCall(
      `/projects/${projectId}/messages/search?${queryParams.toString()}`
    );
  }

  // React to message
  async addMessageReaction(projectId, messageId, emoji) {
    return await this.apiCall(
      `/projects/${projectId}/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }
    );
  }

  // Edit message
  async editMessage(projectId, messageId, newMessage) {
    return await this.apiCall(`/projects/${projectId}/messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify({ message: newMessage }),
    });
  }

  // Delete message
  async deleteMessage(projectId, messageId) {
    return await this.apiCall(`/projects/${projectId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  // Helper method to format notification data for display
  formatNotificationForDisplay(notification) {
    const formatted = {
      ...notification,
      timeAgo: this.getTimeAgo(new Date(notification.created_at)),
      icon: this.getNotificationIcon(notification.type),
      color: this.getNotificationColor(notification.type),
      canReply:
        notification.type === "project_message" && notification.message_id,
      actionText: this.getActionText(notification.type),
    };

    return formatted;
  }

  // Get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  // Get notification icon name
  getNotificationIcon(type) {
    const iconMap = {
      project_message: "MessageCircle",
      task_assigned: "CheckCircle",
      task_completed: "CheckCircle",
      mention: "User",
      team_mention: "Users",
      deadline_reminder: "Clock",
      task_overdue: "AlertTriangle",
      project_invitation: "Users",
      member_added: "UserPlus",
      system: "Bell",
    };
    return iconMap[type] || "Bell";
  }

  // Get notification color theme
  getNotificationColor(type) {
    const colorMap = {
      project_message: "blue",
      task_assigned: "green",
      task_completed: "green",
      mention: "purple",
      team_mention: "purple",
      deadline_reminder: "yellow",
      task_overdue: "red",
      project_invitation: "blue",
      member_added: "green",
      system: "gray",
    };
    return colorMap[type] || "gray";
  }

  // Get action text for notification type
  getActionText(type) {
    const actionMap = {
      project_message: "View Message",
      task_assigned: "View Task",
      task_completed: "View Task",
      mention: "View Context",
      team_mention: "View Project",
      deadline_reminder: "View Task",
      task_overdue: "View Task",
      project_invitation: "View Project",
      member_added: "View Project",
      system: "View Details",
    };
    return actionMap[type] || "View Details";
  }

  // Batch operations
  async batchMarkAsRead(notificationIds) {
    return await this.apiCall("/notifications/batch-read", {
      method: "PUT",
      body: JSON.stringify({ notificationIds }),
    });
  }

  async batchDelete(notificationIds) {
    return await this.apiCall("/notifications/batch-delete", {
      method: "DELETE",
      body: JSON.stringify({ notificationIds }),
    });
  }

  // Real-time notification handling
  handleRealtimeNotification(notification, callbacks = {}) {
    const formattedNotification =
      this.formatNotificationForDisplay(notification);

    // Execute callbacks based on notification type
    if (callbacks.onNewMessage && notification.type === "project_message") {
      callbacks.onNewMessage(formattedNotification);
    }

    if (callbacks.onTaskUpdate && notification.type.startsWith("task_")) {
      callbacks.onTaskUpdate(formattedNotification);
    }

    if (
      callbacks.onMention &&
      (notification.type === "mention" || notification.type === "team_mention")
    ) {
      callbacks.onMention(formattedNotification);
    }

    if (callbacks.onGeneric) {
      callbacks.onGeneric(formattedNotification);
    }

    return formattedNotification;
  }

  // Notification sound/visual feedback
  playNotificationSound(type = "default") {
    // Only play sound if user hasn't disabled it
    const preferences = JSON.parse(
      localStorage.getItem("notification_preferences") || "{}"
    );
    if (preferences.soundEnabled !== false) {
      // In a real app, you'd play different sounds for different types
      // For now, we'll just use the browser's default notification sound
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback: use browser notification API sound
          console.log("Playing notification sound for type:", type);
        });
      } catch (error) {
        console.log("Could not play notification sound:", error);
      }
    }
  }

  // Browser notification API integration
  async showBrowserNotification(notification) {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: `notification-${notification.id}`,
        data: {
          notificationId: notification.id,
          actionUrl: notification.action_url,
        },
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.action_url) {
          // Navigate to the notification context
          window.location.href = notification.action_url;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.showBrowserNotification(notification);
      }
    }
  }

  // Initialize notification preferences
  initializePreferences() {
    const defaultPreferences = {
      soundEnabled: true,
      browserNotifications: true,
      emailNotifications: {
        project_message: false,
        task_assigned: true,
        mention: true,
        deadline_reminder: true,
      },
      pushNotifications: {
        project_message: true,
        task_assigned: true,
        mention: true,
        deadline_reminder: true,
      },
    };

    const stored = localStorage.getItem("notification_preferences");
    if (!stored) {
      localStorage.setItem(
        "notification_preferences",
        JSON.stringify(defaultPreferences)
      );
    }

    return JSON.parse(localStorage.getItem("notification_preferences"));
  }
}

export const notificationService = new NotificationService();
