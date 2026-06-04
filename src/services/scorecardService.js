import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const scorecardService = {
  async getScorecards(params = {}) {
    const response = await api.get(API_ENDPOINTS.SCORECARDS, { params });
    return response.data.data;
  },

  async createScorecard(data) {
    const response = await api.post(API_ENDPOINTS.SCORECARDS, data, { requiresCsrf: true });
    return response.data.data;
  },

  async updateScorecard(scorecardId, data) {
    const response = await api.patch(`${API_ENDPOINTS.SCORECARDS}/${scorecardId}`, data, { requiresCsrf: true });
    return response.data.data;
  },

  async deleteScorecard(scorecardId) {
    const response = await api.delete(`${API_ENDPOINTS.SCORECARDS}/${scorecardId}`, { requiresCsrf: true });
    return response.data.data;
  },
};
