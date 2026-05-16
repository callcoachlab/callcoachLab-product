import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const inviteService = {
  async getInvites(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_INVITES, { params });
    return response.data.data;
  },

  async createInvites(invites) {
    const response = await api.post(API_ENDPOINTS.CREATE_INVITE, { invites });
    return response.data.data;
  },

  async resendInvite(inviteId) {
    const response = await api.post(`${API_ENDPOINTS.RESEND_INVITE}/${inviteId}/resend`);
    return response.data.data;
  },

  async revokeInvite(inviteId) {
    const response = await api.post(`${API_ENDPOINTS.REVOKE_INVITE}/${inviteId}/revoke`);
    return response.data.data;
  },
};
