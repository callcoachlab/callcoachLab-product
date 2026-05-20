export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CoachLab';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ACCEPT_INVITE: '/auth/accept-invite',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Workspace
  CREATE_WORKSPACE: '/workspaces/setup',
  GET_MY_WORKSPACE: '/workspaces/me',
  UPDATE_MY_WORKSPACE: '/workspaces/me',
  
  // User
  GET_ME: '/me',
  UPDATE_ME: '/me',
  CHANGE_PASSWORD: '/me/change-password',
  GET_USERS: '/users',
  UPDATE_USER: '/users',
  DISABLE_USER: '/users',
  ENABLE_USER: '/users',
  
  // Teams
  CREATE_TEAM: '/teams',
  GET_TEAMS: '/teams',
  UPDATE_TEAM: '/teams',
  DELETE_TEAM: '/teams',
  
  // Invites
  CREATE_INVITE: '/invites',
  GET_INVITES: '/invites',
  RESEND_INVITE: '/invites',
  REVOKE_INVITE: '/invites',
  
  // Settings
  GET_SETTINGS: '/settings',
  UPDATE_SETTINGS: '/settings/permissions',
  
  // Audit Logs
  GET_AUDIT_LOGS: '/audit-logs',

  // Scorecards
  SCORECARDS: '/workspaces/me/scorecards',

  // Health
  HEALTH: '/health',
  
  // CSRF
  GET_CSRF_TOKEN: '/csrf',
};
