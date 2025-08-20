import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem("token");

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Setup event listeners
    this.setupEventListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupEventListeners() {
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

    // Comment events
    this.socket.on("comment:added", (data) => {
      this.emit("commentAdded", data);
    });

    this.socket.on("comment:updated", (data) => {
      this.emit("commentUpdated", data);
    });

    this.socket.on("comment:deleted", (data) => {
      this.emit("commentDeleted", data);
    });

    // Notification events
    this.socket.on("notification:new", (data) => {
      this.emit("newNotification", data);
    });

    // User activity events
    this.socket.on("user:online", (data) => {
      this.emit("userOnline", data);
    });

    this.socket.on("user:offline", (data) => {
      this.emit("userOffline", data);
    });

    this.socket.on("user:typing", (data) => {
      this.emit("userTyping", data);
    });
  }

  // Event emitter methods
  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((callback) => callback(data));
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

  // Comment event handlers
  onCommentAdded(callback) {
    this.on("commentAdded", callback);
  }

  onCommentUpdated(callback) {
    this.on("commentUpdated", callback);
  }

  onCommentDeleted(callback) {
    this.on("commentDeleted", callback);
  }

  // Notification event handlers
  onNewNotification(callback) {
    this.on("newNotification", callback);
  }

  // User activity event handlers
  onUserOnline(callback) {
    this.on("userOnline", callback);
  }

  onUserOffline(callback) {
    this.on("userOffline", callback);
  }

  onUserTyping(callback) {
    this.on("userTyping", callback);
  }

  // Socket emission methods
  joinProject(projectId) {
    if (this.socket) {
      this.socket.emit("join:project", projectId);
    }
  }

  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit("leave:project", projectId);
    }
  }

  joinTask(taskId) {
    if (this.socket) {
      this.socket.emit("join:task", taskId);
    }
  }

  leaveTask(taskId) {
    if (this.socket) {
      this.socket.emit("leave:task", taskId);
    }
  }

  sendTyping(taskId, isTyping) {
    if (this.socket) {
      this.socket.emit("typing", { taskId, isTyping });
    }
  }

  updateUserStatus(status) {
    if (this.socket) {
      this.socket.emit("user:status", status);
    }
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

export const socketService = new SocketService();
