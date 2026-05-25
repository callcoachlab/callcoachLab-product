import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF is fetched on demand for API operations that require it, never on app load.
localStorage.removeItem('csrfToken');

let refreshPromise = null;
let csrfPromise = null;

const fetchCSRFToken = async () => {
  const response = await axios.get(`${API_BASE_URL}/csrf`, {
    withCredentials: true,
  });
  const csrfToken = response.data.csrfToken || response.data.data?.csrfToken;

  if (!csrfToken) {
    throw new Error('CSRF token missing from /csrf response');
  }

  return csrfToken;
};

const getCSRFToken = async () => {
  if (!csrfPromise) {
    csrfPromise = fetchCSRFToken().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
};

const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('setupToken');
  localStorage.removeItem('csrfToken');
  localStorage.removeItem('user');
  localStorage.removeItem('workspace');
};

const refreshAccessToken = async () => {
  const csrfToken = await getCSRFToken();
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: { 'X-CSRF-Token': csrfToken },
    }
  );
  const accessToken = response.data.data.auth.accessToken;
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
};

api.interceptors.request.use(
  async (config) => {
    const token = config.authToken === 'setup'
      ? localStorage.getItem('setupToken')
      : localStorage.getItem('accessToken');

    if (config.skipAuth) {
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.requiresCsrf) {
      config.headers['X-CSRF-Token'] = await getCSRFToken();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.code?.startsWith('CSRF') &&
      originalRequest?.requiresCsrf &&
      !originalRequest?._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      originalRequest.headers['X-CSRF-Token'] = await getCSRFToken();
      return api(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipRefresh &&
      localStorage.getItem('accessToken')
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearSession();
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
