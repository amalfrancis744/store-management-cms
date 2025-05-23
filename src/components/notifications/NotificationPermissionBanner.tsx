// components/notifications/NotificationPermissionBanner.tsx
'use client';

import { useAppDispatch } from '@/hooks/redux';
import {
  initializeNotifications,
  requestNotificationPermission,
} from '@/store/slices/notification/notificationSlice';
import { useEffect, useRef } from 'react';

export default function NotificationPermissionBanner() {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false); // Prevents multiple inits

  useEffect(() => {
    const handleNotificationSetup = async () => {
      console.log(
        'Requesting notification permission...',
        Notification.permission
      );

      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications.');
        return;
      }

      try {
        if (Notification.permission === 'default') {
          // Ask for permission if not yet decided
          await dispatch(requestNotificationPermission());
        }

        // Initialize if permission is granted and not yet initialized
        if (Notification.permission === 'granted' && !hasInitialized.current) {
          hasInitialized.current = true;
          await dispatch(initializeNotifications());
        }
      } catch (error) {
        console.error('Notification setup failed:', error);
      }
    };

    const timer = setTimeout(handleNotificationSetup, 2000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return null;
}
