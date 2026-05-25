import api from './api';
import { API_ENDPOINTS } from '../config/api';

const clearStoredSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('setupToken');
  localStorage.removeItem('csrfToken');
  localStorage.removeItem('user');
  localStorage.removeItem('workspace');
};

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password }, { skipAuth: true, skipRefresh: true });
    const { user, workspace, auth, setupToken, nextStep } = response.data.data;

    if (setupToken) {
      localStorage.removeItem('accessToken');
      localStorage.setItem('setupToken', setupToken);
      localStorage.removeItem('workspace');
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
    const accessToken = localStorage.getItem('accessToken');
    clearStoredSession();

    try {
      await api.post(API_ENDPOINTS.LOGOUT, {}, {
        skipRefresh: true,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch {
      // The local session is already gone; logout must not restore protected UI.
    }
  },

  // Create workspace (signup)
  async createWorkspace(data) {
    const response = await api.post(API_ENDPOINTS.CREATE_WORKSPACE, data, { authToken: 'setup', skipRefresh: true });
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
    const response = await api.post(API_ENDPOINTS.REGISTER, { email, password }, { skipAuth: true, skipRefresh: true });
    return response.data.data;
  },

  async verifyEmail(token) {
    const response = await api.get(API_ENDPOINTS.VERIFY_EMAIL, { params: { token }, skipAuth: true, skipRefresh: true });
    return response.data.data;
  },

  async resendVerification(email) {
    const response = await api.post(API_ENDPOINTS.RESEND_VERIFICATION, { email }, { skipAuth: true, skipRefresh: true });
    return response.data.data;
  },

  // Request forgot password email
  async forgotPassword(email) {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email }, { skipAuth: true, skipRefresh: true });
    return response.data.data;
  },

  // Reset password with token
  async resetPassword(token, password) {
    const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, { token, password }, { skipAuth: true, skipRefresh: true });
    return response.data.data;
  },

  // Get current user
  async getMe() {
    const response = await api.get(API_ENDPOINTS.GET_ME);
    return response.data.data;
  },

  // Accept invite
  async acceptInvite(token, password, name) {
    const response = await api.post(API_ENDPOINTS.ACCEPT_INVITE, { token, password, name }, {
      skipAuth: true,
      skipRefresh: true,
      requiresCsrf: true,
    });
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
