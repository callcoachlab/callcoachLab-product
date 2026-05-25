import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const workspaceService = {
  // Get my workspace
  async getMyWorkspace() {
    const response = await api.get(API_ENDPOINTS.GET_MY_WORKSPACE);
    return response.data.data;
  },

  // Update workspace settings
  async updateSettings(settings) {
    const payload = settings.permissions || settings;
    const response = await api.patch(API_ENDPOINTS.UPDATE_SETTINGS, payload, { requiresCsrf: true });
    return response.data.data;
  },

  // Update workspace profile
  async updateWorkspace(data) {
    const response = await api.patch(API_ENDPOINTS.UPDATE_MY_WORKSPACE, data, { requiresCsrf: true });
    return response.data.data;
  },

  // Get settings
  async getSettings() {
    const response = await api.get(API_ENDPOINTS.GET_SETTINGS);
    return response.data.data;
  },
};
