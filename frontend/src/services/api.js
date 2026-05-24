import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Strip any trailing '/api' from the baseURL to prevent Axios stripping behavior
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach token and ensure /api prefix is present
api.interceptors.request.use((config) => {
  // Prepend /api to relative URLs if it's not already present
  if (config.url && config.url.startsWith('/') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url}`;
  }

  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
