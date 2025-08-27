// src/api/endpoints/inviteApi.js
import { apiClient } from '../client/apiClient';

export const inviteApi = {
  // Send email invitations
  sendInvitations: (data) => apiClient.post('/invites/send', data),

  // Generate shareable invite link
  generateInviteLink: (data) => apiClient.post('/invites/generate-link', data),

  // Get invitation details by token
  getInvitationDetails: (token) => apiClient.get(`/invites/details/${token}`),

  // Accept invitation
  acceptInvitation: (token, userData) => apiClient.post(`/invites/accept/${token}`, userData),

  // Get available roles for current user
  getAvailableRoles: () => apiClient.get('/invites/roles'),

  // Get user's sent invitations
  getMyInvitations: () => apiClient.get('/invites/my-invitations'),

  // Revoke invitation
  revokeInvitation: (id) => apiClient.delete(`/invites/${id}`),

  // Get invite link details
  getInviteLinkDetails: (token) => apiClient.get(`/invite-links/details/${token}`),

  // Accept invite link
  acceptInviteLink: (token, userData) => apiClient.post(`/invite-links/accept/${token}`, userData)
};