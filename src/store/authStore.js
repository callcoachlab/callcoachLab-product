import { create } from 'zustand';
import { authService } from '../services/authService';
import { workspaceService } from '../services/workspaceService';

export const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  workspace: authService.getStoredWorkspace(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, workspace } = await authService.login(email, password);
      const isAuthenticated = Boolean(workspace);
      set({ user, workspace, isAuthenticated, isLoading: false });
      return { user, workspace };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ user: null, workspace: null, isAuthenticated: false, isLoading: true, error: null });
    try {
      await authService.logout();
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, workspace } = await authService.createWorkspace(data);
      set({ user, workspace, isAuthenticated: true, isLoading: false });
      return { user, workspace };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Workspace creation failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(email, password);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  acceptInvite: async (token, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { user, workspace } = await authService.acceptInvite(token, password, name);
      set({ user, workspace, isAuthenticated: true, isLoading: false });
      return { user, workspace };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Invite acceptance failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.verifyEmail(token);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Email verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateUser: (userData) => {
    set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));
  },

  fetchWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspace = await workspaceService.getMyWorkspace();
      set({ workspace, isLoading: false });
      localStorage.setItem('workspace', JSON.stringify(workspace));
      return workspace;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch workspace';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
