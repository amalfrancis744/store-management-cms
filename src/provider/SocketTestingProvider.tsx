'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSocket } from '@/hooks/socket/useSocket';

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isConnected, connectionAttempts, connect, disconnect } = useSocket();

  console.log('NotificationProvider initialized', {
    user,
    isConnected,
    connectionAttempts,
  });

  // Effect to initialize socket as soon as user is available
  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID available, skipping socket connection');
      return;
    }

    console.log('Initializing socket connection for user', user.id);
    connect();

    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection on unmount');
      disconnect();
    };
  }, [user?.id, connect, disconnect]); // Only depend on user ID and socket functions

  return <div className="relative">{children}</div>;
}
