import axios from 'axios';
import { decryptResponse, encryptPayload } from '@/utils/encryptionHelper';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add authorization token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken,
      });

      // Handle the standardized response format
      if (!response.data?.success || !response.data?.data?.token) {
        throw new Error(response.data?.message || 'Invalid token refresh response');
      }

      const newToken = response.data.data.token;
      const newRefreshToken = response.data.data.refreshToken;

      // Update tokens in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update Authorization header
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Process queued requests
      processQueue(null, newToken);

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Clear auth and reject queued requests
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('activeRole');

      processQueue(refreshError, null);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
