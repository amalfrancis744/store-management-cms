// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import { Socket } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import {
//   initSocket,
//   disconnectSocket,
//   checkSocketConnection,
// } from '@/lib/socket';

// // Type for a notification
// export interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';
//   createdAt: string;
//   workspaceId: number;
//   read: boolean;
// }

// // Type for socket state management
// interface SocketState {
//   isConnected: boolean;
//   connectionAttempts: number;
//   notifications: Notification[];
//   unreadCount: number;
//   lastError: string | null;
// }

// const initialState: SocketState = {
//   isConnected: false,
//   connectionAttempts: 0,
//   notifications: [],
//   unreadCount: 0,
//   lastError: null,
// };

// // Async thunk for connecting to socket
// export const connectSocket = createAsyncThunk(
//   'socket/connect',
//   async (userId: string, { dispatch }) => {
//     try {
//       const socket = initSocket(userId);

//       // Set up socket event listeners through middleware/listener
//       // This will be handled in the socket middleware

//       return { success: true };
//     } catch (error) {
//       console.error('Failed to connect socket:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//       };
//     }
//   }
// );

// // Async thunk for disconnecting socket
// export const disconnectSocketThunk = createAsyncThunk(
//   'socket/disconnect',
//   async (_, { dispatch }) => {
//     try {
//       disconnectSocket();
//       return { success: true };
//     } catch (error) {
//       console.error('Failed to disconnect socket:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//       };
//     }
//   }
// );

// const socketSlice = createSlice({
//   name: 'socket',
//   initialState,
//   reducers: {
//     setConnected: (state, action: PayloadAction<boolean>) => {
//       state.isConnected = action.payload;
//       // Reset connection attempts on successful connection
//       if (action.payload) {
//         state.connectionAttempts = 0;
//       }
//     },
//     incrementConnectionAttempts: (state) => {
//       state.connectionAttempts += 1;
//     },
//     resetConnectionAttempts: (state) => {
//       state.connectionAttempts = 0;
//     },
//     addNotification: (state, action: PayloadAction<Notification>) => {
//       // Ensure no duplicate IDs
//       const notificationExists = state.notifications.some(
//         (n) => n.id === action.payload.id
//       );

//       if (!notificationExists) {
//         // Add new notification at the beginning
//         state.notifications = [action.payload, ...state.notifications].slice(
//           0,
//           10
//         ); // Keep only latest 10 notifications

//         // Increment unread count
//         state.unreadCount += 1;
//       }
//     },
//     dismissNotification: (state, action: PayloadAction<string>) => {
//       const notification = state.notifications.find(
//         (n) => n.id === action.payload
//       );
//       if (notification && !notification.read) {
//         state.unreadCount = Math.max(0, state.unreadCount - 1);
//       }
//       state.notifications = state.notifications.filter(
//         (notification) => notification.id !== action.payload
//       );
//     },
//     markAllAsRead: (state) => {
//       state.unreadCount = 0;
//       state.notifications = state.notifications.map((notification) => ({
//         ...notification,
//         read: true,
//       }));
//     },
//     markNotificationAsRead: (state, action: PayloadAction<string>) => {
//       const notification = state.notifications.find(
//         (n) => n.id === action.payload
//       );
//       if (notification && !notification.read) {
//         notification.read = true;
//         state.unreadCount = Math.max(0, state.unreadCount - 1);
//       }
//     },
//     setLastError: (state, action: PayloadAction<string | null>) => {
//       state.lastError = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(connectSocket.pending, (state) => {
//         // Connecting state logic if needed
//       })
//       .addCase(connectSocket.fulfilled, (state, action) => {
//         if (!action.payload.success && action.payload.error) {
//           state.lastError = action.payload.error;
//         }
//       })
//       .addCase(connectSocket.rejected, (state, action) => {
//         state.lastError = action.error.message || 'Failed to connect to socket';
//         state.connectionAttempts += 1;
//       })
//       .addCase(disconnectSocketThunk.fulfilled, (state) => {
//         state.isConnected = false;
//       });
//   },
// });

// export const {
//   setConnected,
//   incrementConnectionAttempts,
//   resetConnectionAttempts,
//   addNotification,
//   dismissNotification,
//   markAllAsRead,
//   markNotificationAsRead,
//   setLastError,
// } = socketSlice.actions;

// export default socketSlice.reducer;



import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  initSocket,
  disconnectSocket,
  checkSocketConnection,
} from '@/lib/socket';
import axiosInstance from '@/api/axios-config';

// Type for a notification (updated to match API response)
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM' | 'ORDER_UPDATE';
  createdAt: string;
  updatedAt?: string;
  workspaceId: number;
  read?: boolean;
  isRead?: boolean; // API uses isRead, but we'll normalize to read
}

// Type for notification fetch params
export interface FetchNotificationsParams {
  isRead?: boolean;
  limit?: number;
  offset?: number;
  workspaceId?: number;
}

// Type for notification fetch response
interface NotificationResponse {
  userId: string;
  total: number;
  notifications: Notification[];
  pagination: {
    limit: number;
    offset: number;
    isRead: boolean;
    workspaceId: string;
  };
}

// Type for socket state management
interface SocketState {
  isConnected: boolean;
  connectionAttempts: number;
  notifications: Notification[];
  unreadCount: number;
  lastError: string | null;
  isLoadingNotifications: boolean;
  notificationsPagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const initialState: SocketState = {
  isConnected: false,
  connectionAttempts: 0,
  notifications: [],
  unreadCount: 0,
  lastError: null,
  isLoadingNotifications: false,
  notificationsPagination: {
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  },
};

// Async thunk for fetching notification history
export const fetchNotifications = createAsyncThunk(
  'socket/fetchNotifications',
  async (params: FetchNotificationsParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId.toString());

      const response = await axiosInstance.get<NotificationResponse>(
        `/notifications?${queryParams.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

// Async thunk for marking notification as read
export const markNotificationAsReadAPI = createAsyncThunk(
  'socket/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  }
);

// Async thunk for marking all notifications as read
export const markAllNotificationsAsReadAPI = createAsyncThunk(
  'socket/markAllNotificationsAsRead',
  async (workspaceId?: number, { rejectWithValue }) => {
    try {
      const url = workspaceId 
        ? `/notifications/mark-all-read?workspaceId=${workspaceId}`
        : '/notifications/mark-all-read';
      
      await axiosInstance.patch(url);
      return true;
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark all notifications as read'
      );
    }
  }
);

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
      // Normalize the notification (convert isRead to read)
      const normalizedNotification = {
        ...action.payload,
        read: action.payload.read ?? !action.payload.isRead,
      };

      // Ensure no duplicate IDs
      const notificationExists = state.notifications.some(
        (n) => n.id === normalizedNotification.id
      );

      if (!notificationExists) {
        // Add new notification at the beginning
        state.notifications = [normalizedNotification, ...state.notifications].slice(
          0, 50 // Keep more notifications for better UX
        );

        // Increment unread count if notification is unread
        if (!normalizedNotification.read) {
          state.unreadCount += 1;
        }
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
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect socket cases
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
      })
      
      // Fetch notifications cases
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoadingNotifications = true;
        state.lastError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoadingNotifications = false;
        
        const { notifications, total, pagination } = action.payload;
        
        // Normalize notifications (convert isRead to read)
        const normalizedNotifications = notifications.map(notification => ({
          ...notification,
          read: notification.read ?? !notification.isRead,
        }));

        if (pagination.offset === 0) {
          // First load - replace notifications
          state.notifications = normalizedNotifications;
          state.unreadCount = normalizedNotifications.filter(n => !n.read).length;
        } else {
          // Pagination - append notifications
          const existingIds = new Set(state.notifications.map(n => n.id));
          const newNotifications = normalizedNotifications.filter(n => !existingIds.has(n.id));
          state.notifications = [...state.notifications, ...newNotifications];
        }

        // Update pagination info
        state.notificationsPagination = {
          total,
          limit: pagination.limit,
          offset: pagination.offset,
          hasMore: state.notifications.length < total,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoadingNotifications = false;
        state.lastError = action.payload as string;
      })
      
      // Mark as read API cases
      .addCase(markNotificationAsReadAPI.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsReadAPI.rejected, (state, action) => {
        state.lastError = action.payload as string;
      })
      
      // Mark all as read API cases
      .addCase(markAllNotificationsAsReadAPI.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true,
        }));
      })
      .addCase(markAllNotificationsAsReadAPI.rejected, (state, action) => {
        state.lastError = action.payload as string;
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
  clearNotifications,
  updateUnreadCount,
} = socketSlice.actions;

export default socketSlice.reducer;
