// src/services/socketService.js - Enhanced version
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    const token = localStorage.getItem("taskflow_token");

    if (!token) {
      console.warn("No token available for socket connection");
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

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
      if (reason === "io server disconnect") {
        // Server initiated disconnect, don't reconnect
        return;
      }

      this.handleReconnection();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnected = false;
      this.emit("connectionError", { error });
      this.handleReconnection();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.emit("error", { error });
    });

    // Project messaging events
    this.socket.on("project:message_received", (data) => {
      this.emit("projectMessageReceived", data);
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

    this.socket.on("project:user_joined", (data) => {
      this.emit("projectUserJoined", data);
    });

    this.socket.on("project:user_left", (data) => {
      this.emit("projectUserLeft", data);
    });

    this.socket.on("project:user_typing", (data) => {
      this.emit("projectUserTyping", data);
    });

    this.socket.on("project:user_stopped_typing", (data) => {
      this.emit("projectUserStoppedTyping", data);
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

    this.socket.on("task:assigned", (data) => {
      this.emit("taskAssigned", data);
    });

    this.socket.on("task:status_changed", (data) => {
      this.emit("taskStatusChanged", data);
    });

    this.socket.on("task:comment_added", (data) => {
      this.emit("taskCommentAdded", data);
    });

    // Project events
    this.socket.on("project:created", (data) => {
      this.emit("projectCreated", data);
    });

    this.socket.on("project:updated", (data) => {
      this.emit("projectUpdated", data);
    });

    this.socket.on("project:deleted", (data) => {
      this.emit("projectDeleted", data);
    });

    // Team events
    this.socket.on("team:member_added", (data) => {
      this.emit("teamMemberAdded", data);
    });

    this.socket.on("team:member_removed", (data) => {
      this.emit("teamMemberRemoved", data);
    });

    // Notification events
    this.socket.on("notification:new", (data) => {
      this.emit("newNotification", data);
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

    // User activity events
    this.socket.on("user:online", (data) => {
      this.emit("userOnline", data);
    });

    this.socket.on("user:offline", (data) => {
      this.emit("userOffline", data);
    });

    this.socket.on("user:status_changed", (data) => {
      this.emit("userStatusChanged", data);
    });

    this.socket.on("users:online_list", (data) => {
      this.emit("onlineUsersList", data);
    });

    // Room events
    this.socket.on("project:joined", (data) => {
      this.emit("projectJoined", data);
    });

    this.socket.on("project:left", (data) => {
      this.emit("projectLeft", data);
    });

    this.socket.on("task:joined", (data) => {
      this.emit("taskJoined", data);
    });

    this.socket.on("task:left", (data) => {
      this.emit("taskLeft", data);
    });

    // Ping-pong for connection health
    this.socket.on("pong", () => {
      this.emit("pong");
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, delay);
    } else {
      console.error("Max reconnection attempts reached");
      this.emit("maxReconnectAttemptsReached");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
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

  // Project messaging methods
  joinProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:join", projectId);
    }
  }

  leaveProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:leave", projectId);
    }
  }

  sendProjectMessage(projectId, messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:send_message", {
        projectId,
        ...messageData,
      });
    }
  }

  editProjectMessage(projectId, messageId, newContent) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:edit_message", {
        projectId,
        messageId,
        content: newContent,
      });
    }
  }

  deleteProjectMessage(projectId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:delete_message", {
        projectId,
        messageId,
      });
    }
  }

  addMessageReaction(projectId, messageId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:add_reaction", {
        projectId,
        messageId,
        emoji,
      });
    }
  }

  startTyping(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:typing", { projectId, isTyping: true });
    }
  }

  stopTyping(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("project:typing", { projectId, isTyping: false });
    }
  }

  // Task methods
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

  updateTaskStatus(taskId, status, oldStatus) {
    if (this.socket && this.isConnected) {
      this.socket.emit("task:status_change", {
        taskId,
        status,
        oldStatus,
      });
    }
  }

  addTaskComment(taskId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit("comment:add", {
        taskId,
        content,
      });
    }
  }

  // User status methods
  updateUserStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit("user:status_update", status);
    }
  }

  // Notification methods
  markNotificationAsRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("notification:mark_read", notificationId);
    }
  }

  // Health check
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit("ping");
    }
  }

  // Project messaging event handlers
  onProjectMessageReceived(callback) {
    this.on("projectMessageReceived", callback);
  }

  onProjectMessageEdited(callback) {
    this.on("projectMessageEdited", callback);
  }

  onProjectMessageDeleted(callback) {
    this.on("projectMessageDeleted", callback);
  }

  onProjectMessageReactionUpdated(callback) {
    this.on("projectMessageReactionUpdated", callback);
  }

  onProjectUserJoined(callback) {
    this.on("projectUserJoined", callback);
  }

  onProjectUserLeft(callback) {
    this.on("projectUserLeft", callback);
  }

  onProjectUserTyping(callback) {
    this.on("projectUserTyping", callback);
  }

  onProjectUserStoppedTyping(callback) {
    this.on("projectUserStoppedTyping", callback);
  }

  // Task event handlers
  onTaskCreated(callback) {
    this.on("taskCreated", callback);
  }

  onTaskUpdated(callback) {
    this.on("taskUpdated", callback);
  }

  onTaskDeleted(callback) {
    this.on("taskDeleted", callback);
  }

  onTaskAssigned(callback) {
    this.on("taskAssigned", callback);
  }

  onTaskStatusChanged(callback) {
    this.on("taskStatusChanged", callback);
  }

  onTaskCommentAdded(callback) {
    this.on("taskCommentAdded", callback);
  }

  // Project event handlers
  onProjectCreated(callback) {
    this.on("projectCreated", callback);
  }

  onProjectUpdated(callback) {
    this.on("projectUpdated", callback);
  }

  onProjectDeleted(callback) {
    this.on("projectDeleted", callback);
  }

  // Team event handlers
  onTeamMemberAdded(callback) {
    this.on("teamMemberAdded", callback);
  }

  onTeamMemberRemoved(callback) {
    this.on("teamMemberRemoved", callback);
  }

  // Notification event handlers
  onNewNotification(callback) {
    this.on("newNotification", callback);
  }

  onNotificationMarkedRead(callback) {
    this.on("notificationMarkedRead", callback);
  }

  onAllNotificationsMarkedRead(callback) {
    this.on("allNotificationsMarkedRead", callback);
  }

  onNotificationDeleted(callback) {
    this.on("notificationDeleted", callback);
  }

  // User activity event handlers
  onUserOnline(callback) {
    this.on("userOnline", callback);
  }

  onUserOffline(callback) {
    this.on("userOffline", callback);
  }

  onUserStatusChanged(callback) {
    this.on("userStatusChanged", callback);
  }

  onOnlineUsersList(callback) {
    this.on("onlineUsersList", callback);
  }

  // Connection event handlers
  onConnected(callback) {
    this.on("connected", callback);
  }

  onDisconnected(callback) {
    this.on("disconnected", callback);
  }

  onConnectionError(callback) {
    this.on("connectionError", callback);
  }

  onMaxReconnectAttemptsReached(callback) {
    this.on("maxReconnectAttemptsReached", callback);
  }

  // Utility methods
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  getReconnectAttempts() {
    return this.reconnectAttempts;
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

export const socketService = new SocketService();
