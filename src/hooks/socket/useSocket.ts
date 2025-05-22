import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import {
  connectSocket,
  disconnectSocketThunk,
} from '@/store/slices/socket/socketSlice';
import {
  getSocket,
  emitSocketEvent,
  onSocketEvent,
  offSocketEvent,
} from '@/lib/socket';

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isConnected, connectionAttempts, lastError } = useSelector(
    (state: RootState) => state.socket
  );

  /**
   * Connect to the socket server
   */
  const connect = useCallback(() => {
    if (user?.id) {
      dispatch(connectSocket(user.id));
    } else {
      console.error('Cannot connect: No user ID available');
    }
  }, [dispatch, user?.id]);

  /**
   * Disconnect from the socket server
   */
  const disconnect = useCallback(() => {
    dispatch(disconnectSocketThunk());
  }, [dispatch]);

  /**
   * Emit an event to the socket server
   */
  const emit = useCallback((event: string, data: any) => {
    return emitSocketEvent(event, data);
  }, []);

  /**
   * Add a listener for a socket event
   */
  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      return onSocketEvent(event, callback);
    },
    []
  );

  /**
   * Remove a listener for a socket event
   */
  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      return offSocketEvent(event, callback);
    },
    []
  );

  /**
   * Get the raw socket instance (use with caution)
   */
  const getSocketInstance = useCallback(() => {
    return getSocket();
  }, []);

  // Auto-reconnect if connection is lost
  useEffect(() => {
    if (!isConnected && user?.id && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        console.log('Auto-reconnect attempt');
        connect();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, user?.id, connectionAttempts, connect]);

  return {
    isConnected,
    connectionAttempts,
    lastError,
    connect,
    disconnect,
    emit,
    on,
    off,
    getSocketInstance,
  };
};
