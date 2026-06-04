import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const inviteService = {
  async getInvites(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_INVITES, { params });
    return response.data.data;
  },

  async createInvites(invites) {
    const response = await api.post(API_ENDPOINTS.CREATE_INVITE, { invites }, { requiresCsrf: true });
    return response.data.data;
  },

  async previewInvite(token) {
    const response = await api.get(API_ENDPOINTS.PREVIEW_INVITE, { params: { token } });
    return response.data.data;
  },

  async resendInvite(inviteId) {
    const response = await api.post(`${API_ENDPOINTS.RESEND_INVITE}/${inviteId}/resend`, {}, { requiresCsrf: true });
    return response.data.data;
  },

  async revokeInvite(inviteId) {
    const response = await api.post(`${API_ENDPOINTS.REVOKE_INVITE}/${inviteId}/revoke`, {}, { requiresCsrf: true });
    return response.data.data;
  },
};
