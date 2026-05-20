import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const auditLogService = {
  async getAuditLogs(params = {}) {
    const response = await api.get(API_ENDPOINTS.GET_AUDIT_LOGS, { params });
    return response.data.data;
  },
};
