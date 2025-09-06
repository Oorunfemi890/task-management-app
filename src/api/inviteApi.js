// src/api/endpoints/inviteApi.js
// import { apiClient } from '../client/apiClient';

export const inviteApi = {
  // Send email invitations
  sendInvitations: (data) => apiClient.post('/invites/send', data),

  // Generate shareable invite link
  generateInviteLink: (data) => apiClient.post('/invites/generate-link', data),

  // Get invitation details by token (PUBLIC)
  getInvitationDetails: (token) => {
    // Use fetch directly for public endpoints
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    return fetch(`${API_BASE}/invites/details/${token}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      });
  },

  // Accept invitation (PUBLIC)
  acceptInvitation: (token, userData) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    return fetch(`${API_BASE}/invites/accept/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
  },

  // Get available roles for current user
  getAvailableRoles: () => apiClient.get('/invites/roles'),

  // Get user's sent invitations
  getMyInvitations: () => apiClient.get('/invites/my-invitations'),

  // Revoke invitation
  revokeInvitation: (id) => apiClient.delete(`/invites/${id}`),
};