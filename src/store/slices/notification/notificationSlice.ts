// store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { messaging, getToken, registerServiceWorker } from '@/service/firebaseMessaging';
import { authAPI } from '@/api/auth-api';

interface NotificationState {
  permission: NotificationPermission | null | string;
  fcmToken: string | null;
  error: string | null;
  isLoading: boolean;
  lastNotification: any | null;
  showBanner: boolean;
  retryCount: number;
  isServiceWorkerReady: boolean;
}

const initialState: NotificationState = {
  permission: typeof window !== 'undefined' ? Notification.permission : null,
  fcmToken: null,
  error: null,
  isLoading: false,
  lastNotification: null,
  showBanner: true,
  retryCount: 0,
  isServiceWorkerReady: false,
};

// VAPID key from Firebase Console
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_APP_VAPID_KEY;

// Constants for retry logic
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

// Utility function to wait/delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced token retrieval with retry logic
const getFCMTokenWithRetry = async (messagingInstance: any, maxRetries: number = MAX_RETRY_ATTEMPTS): Promise<string | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to get FCM token (attempt ${attempt}/${maxRetries})`);
      
      const fcmToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
      });
      
      if (fcmToken) {
        console.log('FCM Token retrieved successfully:', fcmToken);
        return fcmToken;
      } else {
        console.log(`Attempt ${attempt}: No token received`);
      }
    } catch (error: any) {
      // console.error(`Attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      console.log(`Waiting ${RETRY_DELAY_MS}ms before retry...`);
      await delay(RETRY_DELAY_MS);
    }
  }
  
  return null;
};

// Check if service worker is ready
const waitForServiceWorkerReady = async (maxWaitTime: number = 10000): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (registration && registration.active) {
        console.log('Service Worker is ready');
        return true;
      }
      await delay(500); // Check every 500ms
    } catch (error) {
      console.error('Error checking service worker:', error);
      await delay(500);
    }
  }
  
  console.log('Service Worker not ready within timeout');
  return false;
};

// Request notification permission and get FCM token with retry
export const requestNotificationPermission = createAsyncThunk(
  'notification/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return rejectWithValue('Permission not granted');
      }

      // Register service worker first
      await registerServiceWorker();
      
      // Wait for service worker to be ready
      const isSwReady = await waitForServiceWorkerReady();
      if (!isSwReady) {
        console.warn('Service Worker not ready, but continuing...');
      }

      // Get FCM token if messaging is available
      const messagingInstance = await messaging();
      if (!messagingInstance) {
        return rejectWithValue('Firebase messaging not available');
      }

      const fcmToken = await getFCMTokenWithRetry(messagingInstance);
      
      if (!fcmToken) {
        return rejectWithValue('Failed to get FCM token after retries');
      }

      // Save token to backend
      try {
        await authAPI.saveFcmToken(fcmToken);
      } catch (error) {
        console.error('Failed to save FCM token to backend:', error);
        // Don't reject here, as we still got the token successfully
      }

      return { permission, fcmToken };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to get notification token'
      );
    }
  }
);

export const clearFcmToken = createAsyncThunk(
  'notification/clearToken',
  async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fcmToken');
    }
    return null;
  }
);

// Initialize notifications with enhanced retry logic
export const initializeNotifications = createAsyncThunk(
  'notification/initialize',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        return rejectWithValue('Notifications not supported');
      }

      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        // Ensure service worker is registered
        await registerServiceWorker();
        
        // Wait for service worker to be ready
        const isSwReady = await waitForServiceWorkerReady();
        
        const messagingInstance = await messaging();
        if (messagingInstance) {
          try {
            const fcmToken = await getFCMTokenWithRetry(messagingInstance);
            
            if (fcmToken) {
              console.log('FCM Token initialized:', fcmToken);

              // Save token to backend
              try {
                await authAPI.saveFcmToken(fcmToken);
              } catch (error) {
                console.error('Failed to save FCM token to backend:', error);
              }

              return { 
                permission: 'granted', 
                fcmToken,
                isServiceWorkerReady: isSwReady 
              };
            } else {
              return rejectWithValue('Failed to retrieve FCM token after retries');
            }
          } catch (error: any) {
            // console.error('Error getting FCM token during initialization:', error);
            return rejectWithValue(`Failed to retrieve FCM token: ${error.message}`);
          }
        } else {
          return rejectWithValue(
            'Firebase messaging not supported in this browser'
          );
        }
      }

      // If not granted yet, return current status
      return { 
        permission: Notification.permission, 
        fcmToken: null,
        isServiceWorkerReady: false 
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Notification initialization failed'
      );
    }
  }
);

// Retry getting FCM token (can be called manually if initialization fails)
export const retryGetFCMToken = createAsyncThunk(
  'notification/retryToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { notification: NotificationState };
      
      if (state.notification.permission !== 'granted') {
        return rejectWithValue('Notification permission not granted');
      }

      // Ensure service worker is registered and ready
      await registerServiceWorker();
      const isSwReady = await waitForServiceWorkerReady();
      
      const messagingInstance = await messaging();
      if (!messagingInstance) {
        return rejectWithValue('Firebase messaging not available');
      }

      const fcmToken = await getFCMTokenWithRetry(messagingInstance);
      
      if (!fcmToken) {
        return rejectWithValue('Failed to get FCM token after retries');
      }

      // Save token to backend
      try {
        await authAPI.saveFcmToken(fcmToken);
      } catch (error) {
        console.error('Failed to save FCM token to backend:', error);
      }

      return { fcmToken, isServiceWorkerReady: isSwReady };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to retry FCM token retrieval'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    hideBanner: (state) => {
      state.showBanner = false;
    },
    showBanner: (state) => {
      state.showBanner = true;
    },
    setLastNotification: (state, action: PayloadAction<any>) => {
      state.lastNotification = action.payload;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
    setServiceWorkerReady: (state, action: PayloadAction<boolean>) => {
      state.isServiceWorkerReady = action.payload;
    },
    resetRetryCount: (state) => {
      state.retryCount = 0;
    },
    incrementRetryCount: (state) => {
      state.retryCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Permission
      .addCase(requestNotificationPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestNotificationPermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permission = action.payload.permission;
        state.fcmToken = action.payload.fcmToken;
        state.retryCount = 0;
      })
      .addCase(requestNotificationPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Initialize
      .addCase(initializeNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permission = action.payload.permission;
        state.fcmToken = action.payload.fcmToken;
        state.isServiceWorkerReady = action.payload.isServiceWorkerReady || false;
        state.retryCount = 0;
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.retryCount += 1;
      })
      // Retry FCM Token
      .addCase(retryGetFCMToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retryGetFCMToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fcmToken = action.payload.fcmToken;
        state.isServiceWorkerReady = action.payload.isServiceWorkerReady;
        state.retryCount = 0;
      })
      .addCase(retryGetFCMToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.retryCount += 1;
      })
      // Clear Token
      .addCase(clearFcmToken.fulfilled, (state) => {
        state.fcmToken = null;
      });
  },
});

export const {
  setLastNotification,
  clearNotificationError,
  hideBanner,
  showBanner,
  setServiceWorkerReady,
  resetRetryCount,
  incrementRetryCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;