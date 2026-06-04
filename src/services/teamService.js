import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const teamService = {
  // Get teams
  async getTeams(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_TEAMS, { params });
    return response.data.data;
  },

  // Create team
  async createTeam(data) {
    const response = await api.post(API_ENDPOINTS.CREATE_TEAM, data, { requiresCsrf: true });
    return response.data.data;
  },

  // Update team
  async updateTeam(teamId, data) {
    const response = await api.patch(`${API_ENDPOINTS.UPDATE_TEAM}/${teamId}`, data, { requiresCsrf: true });
    return response.data.data;
  },

  // Delete team
  async deleteTeam(teamId) {
    const response = await api.delete(`${API_ENDPOINTS.DELETE_TEAM}/${teamId}`, { requiresCsrf: true });
    return response.data;
  },
};
