// store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { messaging, getToken } from '@/service/firebaseMessaging';
import axiosInstance from '@/api/axios-config';

interface NotificationState {
  permission: NotificationPermission | null;
  fcmToken: string | null;
  error: string | null;
  isLoading: boolean;
  lastNotification: any | null;
  showBanner: boolean;
}

const initialState: NotificationState = {
  permission: typeof window !== 'undefined' ? Notification.permission : null,
  fcmToken: null,
  error: null,
  isLoading: false,
  lastNotification: null,
  showBanner: true,
};

// VAPID key from Firebase Console
const VAPID_KEY =
  'BLhxG221hi7OLGxREEwnCWAwIvVlsBBL1WwQe77TY5HtHK2k5QFl6LIzGXr-EifCafZKd_g9IKON2gVb-kFVbFs'; // Replace with your actual key

// Save FCM token to backend

// Request notification permission and get FCM token
export const requestNotificationPermission = createAsyncThunk(
  'notification/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return rejectWithValue('Permission not granted');
      }

      // Get FCM token if messaging is available
      const messagingInstance = await messaging();
      if (!messagingInstance) {
        return rejectWithValue('Firebase messaging not available');
      }

      const fcmToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
      });

      // Save token to backend
  

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

// Initialize notifications (to be called when app loads)
export const initializeNotifications = createAsyncThunk(
  'notification/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        return rejectWithValue('Notifications not supported');
      }

      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        const messagingInstance = await messaging(); // Await the async function
        if (messagingInstance) {
          try {
            const fcmToken = await getToken(messagingInstance, {
              vapidKey: VAPID_KEY,
            });
            if (fcmToken) {
                localStorage.setItem('permission', 'granted');
              //   await saveTokenToServer(fcmToken);
              return { permission: 'granted', fcmToken };
            }
          } catch (error) {
            console.error('Error getting existing FCM token:', error);
            return rejectWithValue('Failed to retrieve FCM token');
          }
        } else {
          return rejectWithValue(
            'Firebase messaging not supported in this browser'
          );
        }
      }

      // If not granted yet, return current status (e.g., 'default' or 'denied')
      return { permission: Notification.permission, fcmToken: null };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Notification initialization failed'
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
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
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
} = notificationSlice.actions;
export default notificationSlice.reducer;
