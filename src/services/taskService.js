// src/services/taskService.js - Enhanced version
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

class TaskService {
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

  // Helper method to handle API calls
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
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Task operations
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/tasks${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  async getTask(taskId) {
    return await this.apiCall(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return await this.apiCall("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return await this.apiCall(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return await this.apiCall(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  async bulkUpdateTasks(taskIds, updateData) {
    return await this.apiCall("/tasks/bulk-update", {
      method: "PUT",
      body: JSON.stringify({ taskIds, updateData }),
    });
  }

  // Project operations
  async getProjects() {
    return await this.apiCall("/projects");
  }

  async getProject(projectId) {
    return await this.apiCall(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return await this.apiCall("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, projectData) {
    return await this.apiCall(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    return await this.apiCall(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async getProjectTasks(projectId) {
    return await this.apiCall(`/projects/${projectId}/tasks`);
  }

  async getProjectStats(projectId) {
    return await this.apiCall(`/projects/${projectId}/stats`);
  }

  // Project messaging operations
  async getProjectMessages(projectId, options = {}) {
    const queryParams = new URLSearchParams(options);
    const endpoint = `/projects/${projectId}/messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  async sendProjectMessage(projectId, messageData) {
    return await this.apiCall(`/projects/${projectId}/messages`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  async editProjectMessage(projectId, messageId, messageData) {
    return await this.apiCall(`/projects/${projectId}/messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify(messageData),
    });
  }

  async deleteProjectMessage(projectId, messageId) {
    return await this.apiCall(`/projects/${projectId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async uploadProjectFile(projectId, file, message = "") {
    const formData = new FormData();
    formData.append("file", file);
    if (message) {
      formData.append("message", message);
    }

    const token = localStorage.getItem("taskflow_token");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/messages/upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload failed");
    }

    return await response.json();
  }

  async addMessageReaction(projectId, messageId, emoji) {
    return await this.apiCall(
      `/projects/${projectId}/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }
    );
  }

  async getProjectChatParticipants(projectId) {
    return await this.apiCall(`/projects/${projectId}/messages/participants`);
  }

  async markProjectMessagesAsRead(projectId, lastMessageId) {
    return await this.apiCall(`/projects/${projectId}/messages/read`, {
      method: "POST",
      body: JSON.stringify({ lastMessageId }),
    });
  }

  async searchProjectMessages(projectId, query, limit = 20) {
    const queryParams = new URLSearchParams({ query, limit });
    return await this.apiCall(
      `/projects/${projectId}/messages/search?${queryParams.toString()}`
    );
  }

  async archiveProjectMessages(projectId, beforeDate) {
    return await this.apiCall(`/projects/${projectId}/messages/archive`, {
      method: "POST",
      body: JSON.stringify({ beforeDate }),
    });
  }

  // Team member operations
  async getTeamMembers() {
    return await this.apiCall("/team/members");
  }

  async getTeamMember(memberId) {
    return await this.apiCall(`/team/members/${memberId}`);
  }

  async inviteTeamMember(inviteData) {
    return await this.apiCall("/team/invite", {
      method: "POST",
      body: JSON.stringify(inviteData),
    });
  }

  async updateTeamMember(memberId, memberData) {
    return await this.apiCall(`/team/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(memberData),
    });
  }

  async removeTeamMember(memberId) {
    return await this.apiCall(`/team/members/${memberId}`, {
      method: "DELETE",
    });
  }

  // Notification operations
  async getNotifications(options = {}) {
    const queryParams = new URLSearchParams(options);
    const endpoint = `/notifications${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  async markNotificationAsRead(notificationId) {
    return await this.apiCall(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return await this.apiCall("/notifications/read-all", {
      method: "PUT",
    });
  }

  async deleteNotification(notificationId) {
    return await this.apiCall(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async deleteAllReadNotifications() {
    return await this.apiCall("/notifications/read-all", {
      method: "DELETE",
    });
  }

  async getNotificationPreferences() {
    return await this.apiCall("/notifications/preferences");
  }

  async updateNotificationPreferences(preferences) {
    return await this.apiCall("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    });
  }

  async getNotificationStats() {
    return await this.apiCall("/notifications/stats");
  }

  // Analytics and reporting
  async getTaskAnalytics(dateRange = {}) {
    const queryParams = new URLSearchParams(dateRange);
    const endpoint = `/analytics/tasks${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  async getProjectAnalytics(projectId, dateRange = {}) {
    const queryParams = new URLSearchParams(dateRange);
    const endpoint = `/analytics/projects/${projectId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  async getTeamProductivity(dateRange = {}) {
    const queryParams = new URLSearchParams(dateRange);
    const endpoint = `/analytics/team/productivity${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await this.apiCall(endpoint);
  }

  // Comments and activity
  async getTaskComments(taskId) {
    return await this.apiCall(`/tasks/${taskId}/comments`);
  }

  async addTaskComment(taskId, commentData) {
    return await this.apiCall(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  async updateTaskComment(taskId, commentId, commentData) {
    return await this.apiCall(`/tasks/${taskId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(commentData),
    });
  }

  async deleteTaskComment(taskId, commentId) {
    return await this.apiCall(`/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  async getTaskActivity(taskId) {
    return await this.apiCall(`/tasks/${taskId}/activity`);
  }

  // File attachments
  async uploadTaskAttachment(taskId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("taskflow_token");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${this.baseURL}/tasks/${taskId}/attachments`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload failed");
    }

    return await response.json();
  }

  async deleteTaskAttachment(taskId, attachmentId) {
    return await this.apiCall(`/tasks/${taskId}/attachments/${attachmentId}`, {
      method: "DELETE",
    });
  }

  // Search
  async searchTasks(query, filters = {}) {
    const queryParams = new URLSearchParams({ q: query, ...filters });
    return await this.apiCall(`/search/tasks?${queryParams.toString()}`);
  }

  async searchProjects(query) {
    const queryParams = new URLSearchParams({ q: query });
    return await this.apiCall(`/search/projects?${queryParams.toString()}`);
  }

  async searchGlobal(query, filters = {}) {
    const queryParams = new URLSearchParams({ q: query, ...filters });
    return await this.apiCall(`/search/global?${queryParams.toString()}`);
  }

  // System operations
  async getSystemHealth() {
    return await this.apiCall("/health");
  }

  async getSystemStatus() {
    return await this.apiCall("/status");
  }

  // Helper methods for common operations
  async createProjectTask(projectId, taskData) {
    return await this.createTask({
      ...taskData,
      projectId: parseInt(projectId),
    });
  }

  async getProjectTasksWithStats(projectId) {
    const [tasks, stats] = await Promise.all([
      this.getProjectTasks(projectId),
      this.getProjectStats(projectId),
    ]);

    return {
      tasks,
      stats,
    };
  }

  async getTasksWithProjects(filters = {}) {
    const [tasks, projects] = await Promise.all([
      this.getTasks(filters),
      this.getProjects(),
    ]);

    // Enrich tasks with project information
    const enrichedTasks = tasks.map((task) => ({
      ...task,
      project: projects.find((p) => p.id === task.project_id) || null,
    }));

    return enrichedTasks;
  }

  async getFullProjectData(projectId) {
    const [project, tasks, messages, participants, stats] = await Promise.all([
      this.getProject(projectId),
      this.getProjectTasks(projectId),
      this.getProjectMessages(projectId, { limit: 50 }),
      this.getProjectChatParticipants(projectId),
      this.getProjectStats(projectId),
    ]);

    return {
      project,
      tasks,
      messages,
      participants,
      stats,
    };
  }
}

export const taskService = new TaskService();
