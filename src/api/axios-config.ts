import axios from 'axios';
import { decryptResponse, encryptPayload } from '@/utils/encryptionHelper';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://back-end-71mc.onrender.com/api/v1';

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

    // Handle token refresh
    if (isRefreshing) {
      // Queue this request to retry after token refresh
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

    // Try to refresh the token
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the refresh token endpoint
      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken,
      });

      let newToken, newRefreshToken;

      if (response.data.iv && response.data.encryptedData) {
        const decryptedData: any = decryptResponse(response.data);
        newToken = decryptedData.data.token;
        newRefreshToken = decryptedData.data.refreshToken;
      } else {
        // Handle unencrypted response (fallback)
        newToken = response.data.data?.token;
        newRefreshToken = response.data.data?.refreshToken;
      }

      if (!newToken) {
        throw new Error('No new token received');
      }

      // Update tokens in localStorage
      localStorage.setItem('token', newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Update Authorization header and retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Process any queued requests
      processQueue(null, newToken);

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear auth and reject all queued requests
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('activeRole');

      // Reject all queued requests
      processQueue(refreshError, null);

      // Redirect to login page
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
