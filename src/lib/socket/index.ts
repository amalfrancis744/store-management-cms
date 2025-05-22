import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let socket: Socket | null = null;

export const initSocket = (userId: string): Socket => {
  // Only create a new socket if one doesn't exist or if it exists but isn't connected
  if (!socket) {
    console.log(`Creating new socket instance for user: ${userId}`);

    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      // Changed to true to connect immediately when socket is created
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000, // Connection timeout in milliseconds
    });

    // Add base connection listeners for debugging
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
    });
  } else if (!socket.connected) {
    // If socket exists but not connected, update the query params and reconnect
    console.log(
      'Socket exists but disconnected, reconnecting with userId:',
      userId
    );
    socket.io.opts.query = { userId };
    socket.connect();
  } else {
    console.log('Reusing existing connected socket');
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    console.log('Explicitly disconnecting socket');
    socket.disconnect();
    socket = null;
  }
};

// Add a health check function to verify connection status
export const checkSocketConnection = (): boolean => {
  return socket !== null && socket.connected;
};

// Helper function to emit events
export const emitSocketEvent = (event: string, data: any): boolean => {
  if (socket && socket.connected) {
    socket.emit(event, data);
    return true;
  }
  console.warn(`Failed to emit ${event}: Socket not connected`);
  return false;
};

// Helper function to listen for one-time events
export const onSocketEvent = (
  event: string,
  callback: (...args: any[]) => void
): boolean => {
  if (socket) {
    socket.on(event, callback);
    return true;
  }
  console.warn(`Failed to listen for ${event}: Socket not available`);
  return false;
};

// Helper function to remove event listeners
export const offSocketEvent = (
  event: string,
  callback?: (...args: any[]) => void
): boolean => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
    return true;
  }
  return false;
};
