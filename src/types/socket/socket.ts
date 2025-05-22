// types/socket.ts
import { Socket } from 'socket.io-client';
import { ApplicationEvent } from '@/lib/socket/events';

export interface SocketConnectionOptions {
  userId?: string;
  autoConnect?: boolean;
  token?: string;
}

export interface SocketConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastConnected: Date | null;
  error: Error | null;
}

export interface SocketHookOptions {
  userId?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export interface SocketHookResult {
  socket: Socket | null;
  status: SocketConnectionStatus;
  connect: (userId?: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: ApplicationEvent, callback: (data: T) => void) => void;
  off: (event: ApplicationEvent, callback?: Function) => void;
}

// Event payload types
export interface UserStatusChangedEvent {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

export interface MessageReceivedEvent {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  roomId?: string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
  readBy?: string[];
}

export interface ActivityUpdateEvent {
  type: string;
  userId: string;
  data: Record<string, any>;
  timestamp: string;
}

// Redux state for socket connection
export interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  userId: string | null;
  lastActivity: string | null;
}
