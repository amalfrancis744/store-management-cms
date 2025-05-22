import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  initSocket,
  disconnectSocket,
  checkSocketConnection,
} from '@/lib/socket';

// Type for a notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';
  createdAt: string;
  workspaceId: number;
  read: boolean;
}

// Type for socket state management
interface SocketState {
  isConnected: boolean;
  connectionAttempts: number;
  notifications: Notification[];
  unreadCount: number;
  lastError: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  connectionAttempts: 0,
  notifications: [],
  unreadCount: 0,
  lastError: null,
};

// Async thunk for connecting to socket
export const connectSocket = createAsyncThunk(
  'socket/connect',
  async (userId: string, { dispatch }) => {
    try {
      const socket = initSocket(userId);

      // Set up socket event listeners through middleware/listener
      // This will be handled in the socket middleware

      return { success: true };
    } catch (error) {
      console.error('Failed to connect socket:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

// Async thunk for disconnecting socket
export const disconnectSocketThunk = createAsyncThunk(
  'socket/disconnect',
  async (_, { dispatch }) => {
    try {
      disconnectSocket();
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect socket:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      // Reset connection attempts on successful connection
      if (action.payload) {
        state.connectionAttempts = 0;
      }
    },
    incrementConnectionAttempts: (state) => {
      state.connectionAttempts += 1;
    },
    resetConnectionAttempts: (state) => {
      state.connectionAttempts = 0;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Ensure no duplicate IDs
      const notificationExists = state.notifications.some(
        (n) => n.id === action.payload.id
      );

      if (!notificationExists) {
        // Add new notification at the beginning
        state.notifications = [action.payload, ...state.notifications].slice(
          0,
          10
        ); // Keep only latest 10 notifications

        // Increment unread count
        state.unreadCount += 1;
      }
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setLastError: (state, action: PayloadAction<string | null>) => {
      state.lastError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.pending, (state) => {
        // Connecting state logic if needed
      })
      .addCase(connectSocket.fulfilled, (state, action) => {
        if (!action.payload.success && action.payload.error) {
          state.lastError = action.payload.error;
        }
      })
      .addCase(connectSocket.rejected, (state, action) => {
        state.lastError = action.error.message || 'Failed to connect to socket';
        state.connectionAttempts += 1;
      })
      .addCase(disconnectSocketThunk.fulfilled, (state) => {
        state.isConnected = false;
      });
  },
});

export const {
  setConnected,
  incrementConnectionAttempts,
  resetConnectionAttempts,
  addNotification,
  dismissNotification,
  markAllAsRead,
  markNotificationAsRead,
  setLastError,
} = socketSlice.actions;

export default socketSlice.reducer;
