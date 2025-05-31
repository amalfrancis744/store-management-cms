import { decryptResponse, encryptPayload } from '@/utils/encryptionHelper';
import axiosInstance from './axios-config';
import { unregisterServiceWorker } from '@/service/firebaseMessaging';
axiosInstance.defaults.withCredentials = true; //

interface AuthResponse {
  userData: { token: string; refreshToken: string; user: { roles: string[] } };
  data: {
    user: { roles: string; workspaceId: string };
    token: string;
    refreshToken: string;
  };
  message: string;
  result?: any;
}

interface EncryptedResponse {
  iv: string;
  encryptedData: string;
}

export const authAPI = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      const encryptedPayload = encryptPayload({
        email,
        password,
      });
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
    const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });

    // Handle the standardized response format
    if (response.data?.success && response.data?.data) {
      return {
        data: {
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken
        }
      };
    }
    throw new Error(response.data?.message || 'Invalid refresh token response');
  } catch (error) {
    console.error('Refresh token failed:', error);
    throw error;
  }
},



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

      // Registration now just returns success message, no user data/tokens
      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<{
          message: string;
          email: string;
        }>(response.data as EncryptedResponse);
        console.log('Decrypted Data from register API:', decryptedData);

        return {
          data: {
            message: decryptedData.message,
            email: decryptedData.email || userData.email,
            requiresOTP: true,
          },
        };
      } else {
        // Handle unencrypted response (fallback)
        return {
          data: {
            message:
              response.data.message ||
              'Registration successful. Please verify your email with OTP.',
            email: userData.email,
            requiresOTP: true,
          },
        };
      }
    } catch (error) {
      throw error;
    }
  },

  // Verify signup OTP
  verifySignupOTP: async (email: string, otp: string) => {
    try {
      // const encryptedPayload = encryptPayload({
      //   email,
      //   otp,
      // });

      const response = await axiosInstance.post('/auth/signup-verify-otp', {
        email,
        otp,
      });

      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<AuthResponse>(
          response.data as EncryptedResponse
        );
        console.log('Decrypted OTP verification data:', decryptedData);

        const { token, refreshToken, user } =
          decryptedData.result || decryptedData.data;
        const message = decryptedData.message;

        // Determine active role
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

        if (user.workspaceId) {
          localStorage.setItem('workspaceId', user.workspaceId);
        }

        return { data: { user, token, message, activeRole } };
      } else {
        // Handle unencrypted response (fallback)
        const { token, refreshToken, user } = response.data.data;
        const message = response.data.message;

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

  // Resend signup OTP
  resendSignupOTP: async (email: string) => {
    try {
      const encryptedPayload = encryptPayload({ email });

      const response = await axiosInstance.post(
        '/auth/resend-signup-otp', // Assuming this endpoint exists
        encryptedPayload
      );

      if (response.data.iv && response.data.encryptedData) {
        const decryptedData = decryptResponse<{ message: string }>(
          response.data as EncryptedResponse
        );
        return { data: { message: decryptedData.message } };
      } else {
        return { data: { message: response.data.message } };
      }
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Remove token from local storage

      const response = await axiosInstance.post('/auth/logout', {
        platform: 'web',
      });
    await   unregisterServiceWorker()
      console.log('Logout response:', response.data);
      // Check if logout was successful
      if (response.data && response.data.success) {
        localStorage.removeItem('token');
        return { data: { success: true } };
      } else {
        throw new Error(response.data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
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

  // save user data with fcm token (for push notifications)
  saveFcmToken: async (fcmToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/addToken', {
        fcmToken,
        platform: 'web',
      });
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },
};
