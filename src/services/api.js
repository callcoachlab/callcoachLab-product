import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token promise to ensure token is always fetched first
let csrfTokenPromise = null;

const fetchCSRFToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/csrf`, {
      withCredentials: true,
    });
    const csrfToken = response.data.data.csrfToken;
    localStorage.setItem('csrfToken', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Initialize CSRF token on module load
csrfTokenPromise = fetchCSRFToken();

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for non-GET requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      let csrfToken = localStorage.getItem('csrfToken');
      
      // If no token in storage, wait for the promise or fetch it
      if (!csrfToken) {
        if (csrfTokenPromise) {
          csrfToken = await csrfTokenPromise;
        } else {
          csrfToken = await fetchCSRFToken();
        }
      }
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If CSRF token missing/invalid, fetch new token and retry
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.code === 'CSRF' &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfTokenPromise = fetchCSRFToken();
      const newToken = await csrfTokenPromise;
      if (newToken) {
        originalRequest.headers['X-CSRF-Token'] = newToken;
        return api(originalRequest);
      }
    }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data.auth;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { fetchCSRFToken };
