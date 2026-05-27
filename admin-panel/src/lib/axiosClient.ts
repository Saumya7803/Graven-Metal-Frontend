import axios from 'axios';
import { clearAuth } from './auth';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isLoginAttempt =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/login/admin') ||
      requestUrl.includes('/auth/login/super-admin');

    if (status === 401 && !isLoginAttempt) {
      clearAuth();
      if (window.location.pathname !== '/auth') {
        window.location.replace('/auth');
      }
    }
    return Promise.reject(error);
  }
);
