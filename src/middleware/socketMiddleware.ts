import { Middleware } from 'redux';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  setConnected,
  incrementConnectionAttempts,
  resetConnectionAttempts,
  addNotification,
  setLastError,
  Notification,
} from '@/store/slices/socket/socketSlice';
import { getSocket } from '@/lib/socket';

const MAX_CONNECTION_ATTEMPTS = 3;

export const socketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  // Clear any existing reconnect timers
  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  // Setup connection event listeners for an existing socket
  const setupSocketListeners = (socket: Socket) => {
    // Connection status listeners
    socket.on('connect', () => {
      console.log('Socket connected via middleware:', socket.id);
      store.dispatch(setConnected(true));
      store.dispatch(resetConnectionAttempts());
      clearReconnectTimer();
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected via middleware:', reason);
      store.dispatch(setConnected(false));

      //   // Only show toast for unexpected disconnects
      //   if (reason !== 'io client disconnect') {
      //     toast.warning(`Disconnected from notification server: ${reason}`);
      //   }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error via middleware:', error.message);
      store.dispatch(setConnected(false));
      store.dispatch(setLastError(error.message));

      // Handle reconnection attempts
      const connectionAttempts = store.getState().socket.connectionAttempts;
      store.dispatch(incrementConnectionAttempts());

      // Only show toast for the first few attempts to avoid spamming
      if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        toast.error(`Connection error: ${error.message}. Retrying...`);

        // Attempt to reconnect after a delay if not at max attempts
        if (
          connectionAttempts + 1 < MAX_CONNECTION_ATTEMPTS &&
          socket &&
          !socket.connected
        ) {
          clearReconnectTimer();
          reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect via middleware...');
            socket.connect();
          }, 2000);
        }
      }
    });

    // Order event handlers
    socket.on('order:new', (data: any) => {
      console.log('New order received:', data);
      toast.info(
        `🛒 New order received from ${data.user?.name || 'customer'} - $${data.totalAmount}`
      );

      // Add to notifications list
      const newNotification: Notification = {
        id: `order-new-${Date.now()}`,
        title: 'New Order',
        message: `New order received from ${data.user?.name || 'customer'} - $${data.totalAmount}`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: data.workspaceId || 0,
        read: false,
      };
      store.dispatch(addNotification(newNotification));
    });

    socket.on('order:statusUpdated', (payload: any) => {
      console.log('Order status updated:', payload);
      toast.info(`Order ${payload.orderId} updated to ${payload.status}`);

      // Add to notifications list
      const newNotification: Notification = {
        id: `order-status-${Date.now()}`,
        title: 'Order Status Update',
        message: `Order ${payload.orderId} updated to ${payload.status}`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: payload.workspaceId || 0,
        read: false,
      };
      store.dispatch(addNotification(newNotification));
    });

    socket.on('order:updated', (data: any) => {
      console.log('Order updated:', data);
      toast.info(`📦 Order ${data.id} updated to ${data.status}`);

      // Add to notifications list
      const newNotification: Notification = {
        id: `order-update-${Date.now()}`,
        title: 'Order Updated',
        message: `Order ${data.id} updated to ${data.status}`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: data.workspaceId || 0,
        read: false,
      };
      store.dispatch(addNotification(newNotification));
    });

    socket.on('order:created', (payload: any) => {
      console.log('New order created:', payload);
      toast.info(`New order #${payload.id || 'unknown'} created`);

      // Add to notifications list
      const newNotification: Notification = {
        id: `order-created-${Date.now()}`,
        title: 'Order Created',
        message: `New order #${payload.id || 'unknown'} created`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: payload.workspaceId || 0,
        read: false,
      };
      store.dispatch(addNotification(newNotification));
    });

    // Notification event handler
    socket.on(
      'receive-notification',
      (notification: Omit<Notification, 'read'>) => {
        console.log('Received notification:', notification);

        // Ensure notification has a unique ID
        const notificationWithId: Notification = {
          ...notification,
          id:
            notification.id ||
            `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          read: false,
        };

        store.dispatch(addNotification(notificationWithId));

        // Use correct toast method based on type
        switch (notification.type) {
          case 'INFO':
            toast.info(notification.message, { autoClose: 5000 });
            break;
          case 'SUCCESS':
            toast.success(notification.message, { autoClose: 5000 });
            break;
          case 'WARNING':
            toast.warning(notification.message, { autoClose: 5000 });
            break;
          case 'ERROR':
            toast.error(notification.message, { autoClose: 5000 });
            break;
          default:
            toast.info(notification.message, { autoClose: 5000 });
            break;
        }
      }
    );

    // Debug event registration
    console.log(
      'All notification listeners registered successfully in middleware'
    );

    // Test with server ping to confirm event handling
    socket.emit('ping', { timestamp: new Date().toISOString() });
  };

  return (next) => (action: any) => {
    // Intercept connectSocket actions
    if (action.type === 'socket/connect/fulfilled') {
      socket = getSocket();
      if (socket) {
        // Remove any existing listeners before adding new ones to prevent duplicates
        socket.removeAllListeners();
        setupSocketListeners(socket);
      }
    }

    // Intercept disconnectSocket actions
    if (action.type === 'socket/disconnect/fulfilled') {
      clearReconnectTimer();
      if (socket) {
        socket.removeAllListeners();
        socket = null;
      }
    }

    return next(action);
  };
};

export default socketMiddleware;
