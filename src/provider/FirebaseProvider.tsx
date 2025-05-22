// provider/NotificationProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { initializeNotifications, setLastNotification } from '@/store/slices/notification/notificationSlice';
import { onMessage } from '@/service/firebaseMessaging';
import { messaging } from '@/service/firebaseMessaging';

export default function NotificationProviderFirebase({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { permission, fcmToken } = useAppSelector((state) => state.notification);

  useEffect(() => {
    // Initialize notifications when component mounts
    dispatch(initializeNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (permission !== 'granted' || !messaging) return;

    // Set up foreground message handler
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      dispatch(setLastNotification(payload));
      
      // Show notification if needed
      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title || 'New notification', {
          body: payload.notification.body,
          icon: '/logo.png',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [permission, dispatch]);

  return <>{children}</>;
}