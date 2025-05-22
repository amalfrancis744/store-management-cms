import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  dismissNotification,
  markAllAsRead,
  markNotificationAsRead,
  Notification,
  addNotification,
} from '@/store/slices/socket/socketSlice';
import { emitSocketEvent } from '@/lib/socket';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isConnected, connectionAttempts } =
    useSelector((state: RootState) => state.socket);

  /**
   * Dismiss a specific notification
   */
  const dismiss = (id: string) => {
    dispatch(dismissNotification(id));
  };

  /**
   * Mark all notifications as read
   */
  const markAllRead = () => {
    dispatch(markAllAsRead());
  };

  /**
   * Mark a specific notification as read
   */
  const markAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  /**
   * Add a custom notification manually
   */
  const addCustomNotification = (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    dispatch(addNotification(newNotification));
  };

  /**
   * Send a notification to other users
   */
  const sendNotification = (payload: {
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';
    workspaceId?: number;
    recipientId?: string;
  }) => {
    return emitSocketEvent('send-notification', payload);
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionAttempts,
    dismiss,
    markAllRead,
    markAsRead,
    addCustomNotification,
    sendNotification,
  };
};
