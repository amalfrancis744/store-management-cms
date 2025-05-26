import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import {
  dismissNotification,
  markAllAsRead,
  markNotificationAsRead,
  markNotificationAsReadAPI,
  markAllNotificationsAsReadAPI,
  fetchNotifications,
  clearNotifications,
  Notification,
  addNotification,
  FetchNotificationsParams,
  
} from '@/store/slices/socket/socketSlice';
import { emitSocketEvent } from '@/lib/socket';

interface UseNotificationsOptions {
  workspaceId?: number;
  autoFetch?: boolean;
  limit?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { workspaceId, autoFetch = true, limit = 100 } = options;

  const dispatch = useDispatch<AppDispatch>();
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionAttempts,
    isLoadingNotifications,
    notificationsPagination,
    lastError,
  } = useSelector((state: RootState) => state.socket);

  /**
   * Fetch initial notifications on hook mount
   */
  useEffect(() => {
    if (autoFetch) {
      loadNotifications();
    }
  }, [workspaceId, autoFetch]);

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(
    (params: FetchNotificationsParams = {}) => {
      const fetchParams: FetchNotificationsParams = {
        limit,
        offset: 0,
        isRead: false, // Default to unread notifications
        workspaceId,
        ...params,
      };

      return dispatch(fetchNotifications(fetchParams));
    },
    [dispatch, limit, workspaceId]
  );

  /**
   * Load more notifications (pagination)
   */
  const loadMoreNotifications = useCallback(() => {
    if (!notificationsPagination.hasMore || isLoadingNotifications) {
      return Promise.resolve();
    }

    const fetchParams: FetchNotificationsParams = {
      limit,
      offset: notifications.length,
      isRead: false,
      workspaceId,
    };

    return dispatch(fetchNotifications(fetchParams));
  }, [
    dispatch,
    notifications.length,
    limit,
    workspaceId,
    notificationsPagination.hasMore,
    isLoadingNotifications,
  ]);

  /**
   * Refresh notifications (reload from beginning)
   */
  const refreshNotifications = useCallback(() => {
    return loadNotifications({ offset: 0 });
  }, [loadNotifications]);

  /**
   * Load all notifications (including read ones)
   */
  const loadAllNotifications = useCallback(
    (params: FetchNotificationsParams = {}) => {
      const fetchParams: FetchNotificationsParams = {
        limit,
        offset: 0,
        workspaceId,
        ...params,
        // Don't filter by isRead to get all notifications
      };

      return dispatch(fetchNotifications(fetchParams));
    },
    [dispatch, limit, workspaceId]
  );

  /**
   * Dismiss a specific notification (local only)
   */
  const dismiss = useCallback(
    (id: string) => {
      dispatch(dismissNotification(id));
    },
    [dispatch]
  );

  /**
   * Mark all notifications as read (local + API)
   */
  const markAllRead = useCallback(async () => {
    try {
      // Update API first
      await dispatch(markAllNotificationsAsReadAPI(workspaceId)).unwrap();
      // Local state is updated by the fulfilled case
    } catch (error) {
      // Fallback to local update if API fails
      console.error('Failed to mark all as read on server:', error);
      dispatch(markAllAsRead());
    }
  }, [dispatch, workspaceId]);

  /**
   * Mark a specific notification as read (local + API)
   */
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        // Update API first
        await dispatch(markNotificationAsReadAPI(id)).unwrap();
        // Local state is updated by the fulfilled case
      } catch (error) {
        // Fallback to local update if API fails
        console.error('Failed to mark notification as read on server:', error);
        dispatch(markNotificationAsRead(id));
      }
    },
    [dispatch]
  );

  /**
   * Mark notification as read (local only - for quick UI updates)
   */
  const markAsReadLocal = useCallback(
    (id: string) => {
      dispatch(markNotificationAsRead(id));
    },
    [dispatch]
  );

  /**
   * Mark all as read (local only - for quick UI updates)
   */
  const markAllReadLocal = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  /**
   * Add a custom notification manually
   */
  const addCustomNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      dispatch(addNotification(newNotification));
    },
    [dispatch]
  );

  /**
   * Send a notification to other users via socket
   */
  const sendNotification = useCallback(
    (payload: {
      title: string;
      message: string;
      type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';
      workspaceId?: number;
      recipientId?: string;
    }) => {
      return emitSocketEvent('send-notification', payload);
    },
    []
  );

  /**
   * Clear all notifications (local only)
   */
  const clearAll = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  /**
   * Get unread notifications only
   */

  const unreadNotifications = notifications.filter((n) => !n.read);

  /**
   * Get read notifications only
   */
  const readNotifications = notifications.filter((n) => n.read);

  /**
   * Check if there are more notifications to load
   */
  const hasMoreNotifications = notificationsPagination.hasMore;

  /**
   * Get notification by ID
   */
  const getNotificationById = useCallback(
    (id: string) => {
      return notifications.find((n) => n.id === id);
    },
    [notifications]
  );

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback(
    (type: Notification['type']) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  


  return {
    // State
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isConnected,
    connectionAttempts,
    isLoadingNotifications,
    hasMoreNotifications,
    lastError,

    // Pagination info
    pagination: notificationsPagination,

    // Actions - API + Local
    loadNotifications,
    loadMoreNotifications,
    refreshNotifications,
    loadAllNotifications,
    markAllRead,
    markAsRead,

    // Actions - Local only
    dismiss,
    markAsReadLocal,
    markAllReadLocal,
    addCustomNotification,
    clearAll,

    // Socket actions
    sendNotification,

    // Utilities
    getNotificationById,
    getNotificationsByType,
  };
};
