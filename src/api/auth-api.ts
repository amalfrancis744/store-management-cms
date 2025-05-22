import { decryptResponse, encryptPayload } from '@/utils/encryptionHelper';
import axiosInstance from './axios-config';
axiosInstance.defaults.withCredentials = true; //

interface AuthResponse {
  userData: { token: string; refreshToken: string; user: { roles: string[] } };
  data: {
    user: { roles: string; workspaceId: string };
    token: string;
    refreshToken: string;
  };
  message: string;
}

interface EncryptedResponse {
  iv: string;
  encryptedData: string;
}

export const authAPI = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      const encryptedPayload = encryptPayload({ email, password });
      console.log('Encrypted Payload:', encryptedPayload);
      const response = await axiosInstance.post(
        '/auth/signin',
        encryptedPayload
      );

      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<AuthResponse>(
          response.data as EncryptedResponse
        );
        const message = decryptedData.message;

        const { token, refreshToken, user } = decryptedData.data;

        const workspaceId = user.workspaceId;

        // Determine active role (prefer ADMIN, fallback to first role)
        const activeRole = user.roles.includes('ADMIN')
          ? 'ADMIN'
          : user.roles.includes('CUSTOMER')
            ? 'CUSTOMER'
            : user.roles[0];

        // Store auth tokens, user data, and active role
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('activeRole', activeRole);
        localStorage.setItem('workspaceId', workspaceId);

        return { data: { user, token, message, activeRole } };
      } else {
        // Handle unencrypted response (fallback)
        const { token, refreshToken, user } = response.data.data;
        const message = response.data.message;

        // Determine active role
        const activeRole = user.roles.includes('ADMIN')
          ? 'ADMIN'
          : user.roles.includes('CUSTOMER')
            ? 'CUSTOMER'
            : user.roles[0];

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('activeRole', activeRole);

        return { data: { user, token, message, activeRole } };
      }
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    try {
      const payload = encryptPayload({ refreshToken });
      const response = await axiosInstance.post('/auth/refresh-token', payload);

      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<AuthResponse>(
          response.data as EncryptedResponse
        );
        const { token, refreshToken } = decryptedData.data;

        // Update tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        return { data: { token, refreshToken } };
      }
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: string[];
    phone: string;
  }) => {
    try {
      const encryptedPayload = encryptPayload({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        roles: userData.roles,
        phone: userData.phone,
      });

      const response = await axiosInstance.post(
        '/auth/signup',
        encryptedPayload
      );
      console.log('Response from register API:', response.data);

      const decryptedData = decryptResponse<AuthResponse>(
        response.data as EncryptedResponse
      );
      console.log('Decrypted Data from register API:', decryptedData);

      const { token, refreshToken, user } = decryptedData.userData;
      const message = decryptedData.message;

      // Determine active role for new user
      const activeRole = user.roles.includes('ADMIN')
        ? 'ADMIN'
        : user.roles.includes('CUSTOMER')
          ? 'CUSTOMER'
          : user.roles[0];

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('activeRole', activeRole);

      return { data: { user, token, message, activeRole } };
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      localStorage.removeItem('token');
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return { data: { user: response.data.user } };
    } catch (error: any) {
      // If unauthorized, clear token and reject
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email,
      });
      const message = response.data.message;
      return { data: { message } };
    } catch (error) {
      throw error;
    }
  },
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        email,
        otp,
      });
      const message = response.data.message;
      const resetToken = response.data.data.resetToken;

      return { data: { message, resetToken } };
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (resetToken: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        resetToken,
        newPassword: password,
      });
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },
  becomeAdmin: async () => {
    try {
      const response = await axiosInstance.post('/users/become-admin');

      // If response includes encrypted data, decrypt it
      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<AuthResponse>(
          response.data as EncryptedResponse
        );
        const { user } = decryptedData.data;

        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(user));

        return { data: { user } };
      } else {
        // Handle unencrypted response (fallback)
        const { user } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));

        return { data: { user } };
      }
    } catch (error) {
      throw error;
    }
  },
};
