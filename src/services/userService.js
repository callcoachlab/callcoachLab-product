import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const userService = {
  async getMe() {
    const response = await api.get(API_ENDPOINTS.GET_ME);
    return response.data.data;
  },

  async updateProfile(data) {
    const response = await api.patch(API_ENDPOINTS.UPDATE_ME, data, { requiresCsrf: true });
    return response.data.data;
  },

  async changePassword(data) {
    const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, data, { requiresCsrf: true });
    return response.data.data;
  },

  // Get users
  async getUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_USERS, { params });
    return response.data.data;
  },

  // Update user
  async updateUser(userId, data) {
    const response = await api.patch(`${API_ENDPOINTS.UPDATE_USER}/${userId}`, data, { requiresCsrf: true });
    return response.data.data;
  },

  // Disable user
  async disableUser(userId) {
    const response = await api.post(`${API_ENDPOINTS.DISABLE_USER}/${userId}/disable`, {}, { requiresCsrf: true });
    return response.data.data;
  },

  // Enable user
  async enableUser(userId) {
    const response = await api.post(`${API_ENDPOINTS.ENABLE_USER}/${userId}/enable`, {}, { requiresCsrf: true });
    return response.data.data;
  },
};
