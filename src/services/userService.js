import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const userService = {
  // Get users
  async getUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_USERS, { params });
    return response.data.data;
  },

  // Update user
  async updateUser(userId, data) {
    const response = await api.patch(`${API_ENDPOINTS.UPDATE_USER}/${userId}`, data);
    return response.data.data;
  },

  // Disable user
  async disableUser(userId) {
    const response = await api.post(`${API_ENDPOINTS.DISABLE_USER}/${userId}/disable`);
    return response.data.data;
  },

  // Enable user
  async enableUser(userId) {
    const response = await api.post(`${API_ENDPOINTS.ENABLE_USER}/${userId}/enable`);
    return response.data.data;
  },
};
