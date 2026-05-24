import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    const { user, workspace, auth, setupToken, nextStep } = response.data.data;

    if (setupToken) {
      localStorage.setItem('setupToken', setupToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      return { user, workspace: null, setupToken, nextStep };
    }
    
    // Store token and user data
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.removeItem('setupToken');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('workspace', JSON.stringify(workspace));
    
    return { user, workspace };
  },

  // Logout
  async logout() {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('setupToken');
      localStorage.removeItem('user');
      localStorage.removeItem('workspace');
    }
  },

  // Create workspace (signup)
  async createWorkspace(data) {
    const response = await api.post(API_ENDPOINTS.CREATE_WORKSPACE, data);
    const { user, workspace, auth } = response.data.data;
    
    // Store token and user data
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.removeItem('setupToken');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('workspace', JSON.stringify(workspace));
    
    return { user, workspace };
  },

  // Register an email/password account
  async register(email, password) {
    const response = await api.post(API_ENDPOINTS.REGISTER, { email, password });
    return response.data.data;
  },

  async verifyEmail(token) {
    const response = await api.post(API_ENDPOINTS.VERIFY_EMAIL, { token });
    const data = response.data.data;
    if (data.setupToken) {
      localStorage.setItem('setupToken', data.setupToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async resendVerification(email) {
    const response = await api.post(API_ENDPOINTS.RESEND_VERIFICATION, { email });
    return response.data.data;
  },

  // Request forgot password email
  async forgotPassword(email) {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data.data;
  },

  // Reset password with token
  async resetPassword(token, password) {
    const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
    return response.data.data;
  },

  // Get current user
  async getMe() {
    const response = await api.get(API_ENDPOINTS.GET_ME);
    return response.data.data;
  },

  // Accept invite
  async acceptInvite(token, password, name) {
    const response = await api.post(API_ENDPOINTS.ACCEPT_INVITE, { token, password, name });
    const { user, workspace, auth } = response.data.data;
    
    // Store token and user data
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.removeItem('setupToken');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('workspace', JSON.stringify(workspace));
    
    return { user, workspace };
  },

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored workspace
  getStoredWorkspace() {
    const workspaceStr = localStorage.getItem('workspace');
    return workspaceStr ? JSON.parse(workspaceStr) : null;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },
};
