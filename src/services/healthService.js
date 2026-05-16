import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const healthService = {
  async checkHealth() {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};
