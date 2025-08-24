// src/services/enhancedSocketService.js
import { io } from "socket.io-client";
import { notificationService } from "./notificationService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

class EnhancedSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.notificationCallbacks = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const token = localStorage.getItem("taskflow_token");

    if (!token) {
      console.warn("No token found, cannot connect to socket");
      return null;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connected", { socketId: this.socket.id });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
      this.emit("disconnected", { reason });

      // Auto-reconnect logic
      if (
        reason !== "io client disconnect" &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        setTimeout(() => {
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts + 1}/${
              this.maxReconnectAttempts
            })`
          );
          this.reconnectAttempts++;
          this.connect();
        }, 2000 * this.reconnectAttempts);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.emit("connectionError", { error });
    });

    // Notification events
    this.socket.on("notification:new", (notification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on("notification:marked_read", (data) => {
      this.emit("notificationMarkedRead", data);
    });

    this.socket.on("notification:all_marked_read", (data) => {
      this.emit("allNotificationsMarkedRead", data);
    });

    this.socket.on("notification:deleted", (data) => {
      this.emit("notificationDeleted", data);
    });

    // Project message events
    this.socket.on("project:message_received", (data) => {
      this.handleProjectMessage(data);
    });

    this.socket.on("project:message_edited", (data) => {
      this.emit("projectMessageEdited", data);
    });

    this.socket.on("project:message_deleted", (data) => {
      this.emit("projectMessageDeleted", data);
    });

    this.socket.on("project:message_reaction_updated", (data) => {
      this.emit("projectMessageReactionUpdated", data);
    });

    // User activity events
    this.socket.on("user:online", (data) => {
      this.emit("userOnline", data);
    });

    this.socket.on("user:offline", (data) => {
      this.emit("userOffline", data);
    });

    this.socket.on("users:online_list", (data) => {
      this.emit("onlineUsersList", data);
    });

    this.socket.on("user:status_changed", (data) => {
      this.emit("userStatusChanged", data);
    });

    // Project room events
    this.socket.on("project:joined", (data) => {
      this.emit("projectJoined", data);
    });

    this.socket.on("project:left", (data) => {
      this.emit("projectLeft", data);
    });

    this.socket.on("project:user_joined", (data) => {
      this.emit("projectUserJoined", data);
    });

    this.socket.on("project:user_left", (data) => {
      this.emit("projectUserLeft", data);
    });

    // Task events
    this.socket.on("task:created", (data) => {
      this.emit("taskCreated", data);
    });

    this.socket.on("task:updated", (data) => {
      this.emit("taskUpdated", data);
    });

    this.socket.on("task:deleted", (data) => {
      this.emit("taskDeleted", data);
    });

    this.socket.on("task:status_changed", (data) => {
      this.emit("taskStatusChanged", data);
    });

    // Comment events
    this.socket.on("comment:added", (data) => {
      this.emit("commentAdded", data);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.emit("socketError", { error });
    });
  }

  // Handle new notifications with enhanced features
  handleNewNotification(notification) {
    console.log("New notification received:", notification);

    // Format notification for display
    const formattedNotification =
      notificationService.formatNotificationForDisplay(notification);

    // Play sound if enabled
    notificationService.playNotificationSound(notification.type);

    // Show browser notification if enabled
    const preferences = JSON.parse(
      localStorage.getItem("notification_preferences") || "{}"
    );
    if (preferences.browserNotifications !== false) {
      notificationService.showBrowserNotification(formattedNotification);
    }

    // Emit to listeners
    this.emit("newNotification", formattedNotification);

    // Type-specific handling
    if (notification.type === "project_message") {
      this.emit("newProjectMessage", formattedNotification);
    }

    if (
      notification.type === "mention" ||
      notification.type === "team_mention"
    ) {
      this.emit("mentioned", formattedNotification);
    }

    if (notification.type.startsWith("task_")) {
      this.emit("taskNotification", formattedNotification);
    }
  }

  // Handle project messages
  handleProjectMessage(data) {
    console.log("Project message received:", data);
    this.emit("projectMessageReceived", data);

    // Also emit as a notification if it's from someone else
    const currentUserId = this.getCurrentUserId();
    if (data.message.user_id !== currentUserId) {
      const notification = {
        type: "project_message",
        title: `New message in ${data.projectName || "project"}`,
        message: `${data.message.user_name}: ${data.message.message}`,
        project_id: data.projectId,
        message_id: data.message.id,
        sender: {
          id: data.message.user_id,
          name: data.message.user_name,
          avatar: data.message.user_avatar,
        },
        data: {
          action_url: `/projects/${data.projectId}`,
          can_reply: true,
        },
      };

      this.handleNewNotification(notification);
    }
  }

  // Project room management
  joinProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:join", projectId);
      console.log(`Joining project room: ${projectId}`);
    }
  }

  leaveProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:leave", projectId);
      console.log(`Leaving project room: ${projectId}`);
    }
  }

  // Task room management
  joinTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("task:join", taskId);
    }
  }

  leaveTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("task:leave", taskId);
    }
  }

  // Send typing indicators
  sendTypingIndicator(taskId, isTyping) {
    if (this.socket && this.isConnected) {
      if (isTyping) {
        this.socket.emit("task:typing", { taskId });
      } else {
        this.socket.emit("task:stop_typing", { taskId });
      }
    }
  }

  // Update user status
  updateUserStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit("user:status_update", status);
    }
  }

  // Mark notification as read via socket
  markNotificationAsRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("notification:mark_read", notificationId);
    }
  }

  // Event emitter methods
  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in socket event listener for ${event}:`, error);
      }
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Notification-specific event handlers
  onNewNotification(callback) {
    this.on("newNotification", callback);
  }

  onNewProjectMessage(callback) {
    this.on("newProjectMessage", callback);
  }

  onProjectMessageReceived(callback) {
    this.on("projectMessageReceived", callback);
  }

  onMentioned(callback) {
    this.on("mentioned", callback);
  }

  onTaskNotification(callback) {
    this.on("taskNotification", callback);
  }

  onNotificationMarkedRead(callback) {
    this.on("notificationMarkedRead", callback);
  }

  onNotificationDeleted(callback) {
    this.on("notificationDeleted", callback);
  }

  // User activity handlers
  onUserOnline(callback) {
    this.on("userOnline", callback);
  }

  onUserOffline(callback) {
    this.on("userOffline", callback);
  }

  onOnlineUsersList(callback) {
    this.on("onlineUsersList", callback);
  }

  // Project activity handlers
  onProjectJoined(callback) {
    this.on("projectJoined", callback);
  }

  onProjectUserJoined(callback) {
    this.on("projectUserJoined", callback);
  }

  onProjectUserLeft(callback) {
    this.on("projectUserLeft", callback);
  }

  // Task activity handlers
  onTaskCreated(callback) {
    this.on("taskCreated", callback);
  }

  onTaskUpdated(callback) {
    this.on("taskUpdated", callback);
  }

  onTaskStatusChanged(callback) {
    this.on("taskStatusChanged", callback);
  }

  onCommentAdded(callback) {
    this.on("commentAdded", callback);
  }

  // Connection status handlers
  onConnected(callback) {
    this.on("connected", callback);
  }

  onDisconnected(callback) {
    this.on("disconnected", callback);
  }

  onConnectionError(callback) {
    this.on("connectionError", callback);
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem("taskflow_user") || "{}");
      return user.id;
    } catch {
      return null;
    }
  }

  // Notification management helpers
  setupNotificationHandlers(callbacks = {}) {
    // Setup default notification handlers
    this.onNewNotification((notification) => {
      if (callbacks.onNewNotification) {
        callbacks.onNewNotification(notification);
      }
    });

    this.onNewProjectMessage((notification) => {
      if (callbacks.onNewProjectMessage) {
        callbacks.onNewProjectMessage(notification);
      }
    });

    this.onMentioned((notification) => {
      if (callbacks.onMentioned) {
        callbacks.onMentioned(notification);
      }
    });

    this.onTaskNotification((notification) => {
      if (callbacks.onTaskNotification) {
        callbacks.onTaskNotification(notification);
      }
    });

    // Setup connection status handlers
    this.onConnected((data) => {
      console.log("Socket connected successfully");
      if (callbacks.onConnected) {
        callbacks.onConnected(data);
      }
    });

    this.onDisconnected((data) => {
      console.log("Socket disconnected:", data.reason);
      if (callbacks.onDisconnected) {
        callbacks.onDisconnected(data);
      }
    });

    this.onConnectionError((data) => {
      console.error("Socket connection error:", data.error);
      if (callbacks.onConnectionError) {
        callbacks.onConnectionError(data);
      }
    });
  }

  // Bulk notification actions
  async handleBulkNotificationUpdate(action, notificationIds) {
    try {
      if (action === "markRead") {
        await notificationService.batchMarkAsRead(notificationIds);
      } else if (action === "delete") {
        await notificationService.batchDelete(notificationIds);
      }

      // Emit local event for UI updates
      this.emit("bulkNotificationUpdate", { action, notificationIds });
    } catch (error) {
      console.error("Failed bulk notification update:", error);
      throw error;
    }
  }
}

export const enhancedSocketService = new EnhancedSocketService();
