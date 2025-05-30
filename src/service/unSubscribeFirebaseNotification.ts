import { getMessaging, deleteToken } from 'firebase/messaging';

async function unsubscribeFromNotifications() {
  try {
    const messaging = getMessaging();
    
    // Delete the FCM token
    await deleteToken(messaging);
    console.log('Successfully unsubscribed from notifications');
    
    // Optional: Remove the service worker if you no longer need it
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service worker unregistered');
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return false;
  }
}

// Usage
unsubscribeFromNotifications().then(success => {
  if (success) {
    // Update UI or state to reflect unsubscription
  }
});