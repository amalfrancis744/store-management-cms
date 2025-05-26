// Add this to your OrdersPage component or create a separate hook file

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderStatesBySocket } from '@/store/slices/manager/customerOrderSlice';
import type { RootState } from '@/store';

export const useOrderNotifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.socket.notifications);
  
  useEffect(() => {
    // Filter for unprocessed order-related notifications
    const orderNotifications = notifications.filter(notification => 
      !notification.processed && (
        notification.data?.type === 'ORDER_UPDATE' ||
        notification.title?.includes('Order') ||
        notification.message?.includes('order')
      )
    );
    
    if (orderNotifications.length > 0) {
      console.log('Processing order notifications:', orderNotifications);
      dispatch(updateOrderStatesBySocket(orderNotifications));
      
      // Mark notifications as processed (you'll need to add this action to your socket slice)
      // dispatch(markNotificationsAsProcessed(orderNotifications.map(n => n.id)));
    }
  }, [notifications, dispatch]);
};

// Then in your OrdersPage component, add this line after your existing hooks:
// useOrderNotifications();