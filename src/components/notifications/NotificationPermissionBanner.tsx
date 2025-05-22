// components/notifications/NotificationPermissionBanner.tsx
'use client';

import { useAppDispatch } from '@/hooks/redux';
import { requestNotificationPermission } from '@/store/slices/notification/notificationSlice';
import { useEffect } from 'react';

export default function NotificationPermissionBanner() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleAutoRequest = async () => {
      // Only prompt if notifications are supported and permission hasn't been determined
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          // This will trigger the browser's native permission prompt
          await dispatch(requestNotificationPermission());
        } catch (error) {
          console.error('Notification permission request failed:', error);
        }
      }
    };

    // Add a small delay to avoid immediate prompt on page load
    const timer = setTimeout(handleAutoRequest, 2000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return null; // This component doesn't render anything
}