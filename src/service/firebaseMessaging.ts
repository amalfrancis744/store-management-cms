// service/firebaseMessaging.ts
import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  deleteToken,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: ReturnType<typeof getMessaging> | null = null;

// Async function to get messaging instance
const getMessagingInstance = async () => {
  if (messaging) return messaging;

  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
    return null;
  }
};

// Enhanced service worker registration with retry logic
const registerServiceWorker = async (maxRetries: number = 3): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Registering Service Worker (attempt ${attempt}/${maxRetries})`);
      
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Check if service worker is active
      if (registration.active) {
        console.log('Service Worker is active and ready');
        return registration;
      } else {
        console.log('Service Worker registered but not yet active');
        
        // Wait a bit more for activation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (registration.active) {
          return registration;
        }
      }
      
    } catch (error) {
      console.error(`Service Worker registration attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('All Service Worker registration attempts failed');
        return null;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  return null;
};

// Check if service worker is ready and active
const isServiceWorkerReady = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    return !!(registration && registration.active);
  } catch (error) {
    console.error('Error checking service worker status:', error);
    return false;
  }
};

// Enhanced service worker unregistration
const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    const unregisterPromises = registrations.map(async (registration) => {
      try {
        const result = await registration.unregister();
        console.log('Service Worker unregistered:', result);
        return result;
      } catch (error) {
        console.error('Error unregistering service worker:', error);
        return false;
      }
    });
    
    await Promise.all(unregisterPromises);
    console.log('All Service Workers unregistered successfully');
    
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

// Get all active service worker registrations
const getActiveServiceWorkers = async (): Promise<ServiceWorkerRegistration[]> => {
  if (!('serviceWorker' in navigator)) {
    return [];
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.filter(reg => reg.active);
  } catch (error) {
    console.error('Error getting active service workers:', error);
    return [];
  }
};

// Clear all FCM tokens and clean up
const clearAllFCMData = async () => {
  try {
    const messagingInstance = await getMessagingInstance();
    if (messagingInstance) {
      // Delete the current token
      await deleteToken(messagingInstance);
      console.log('FCM token deleted successfully');
    }
    
    // Clear any stored tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fcmToken');
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('firebase_token');
    }
    
    // Unregister service workers
    await unregisterServiceWorker();
    
  } catch (error) {
    console.error('Error clearing FCM data:', error);
  }
};

// Setup push subscription with proper error handling
const setupPushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration || !registration.active) {
      console.log('Service worker not ready for push subscription');
      return null;
    }

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Push subscription already exists');
      return existingSubscription;
    }

    // Create new subscription
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_APP_VAPID_KEY;
    if (!vapidKey) {
      throw new Error('VAPID key not found');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey
    });

    console.log('Push subscription created successfully');
    return subscription;
    
  } catch (error) {
    console.error('Error setting up push subscription:', error);
    return null;
  }
};

// Enhanced messaging instance with health check
const getHealthyMessagingInstance = async () => {
  try {
    // Ensure service worker is registered and ready
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service worker registration failed');
    }

    // Get messaging instance
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      throw new Error('Firebase messaging not supported');
    }

    // Verify push subscription is working
    await setupPushSubscription();

    return messagingInstance;
  } catch (error) {
    console.error('Error getting healthy messaging instance:', error);
    return null;
  }
};

// Utility to check notification permissions and requirements
const checkNotificationRequirements = (): {
  isSupported: boolean;
  hasPermission: boolean;
  hasServiceWorker: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  const isSupported = 'Notification' in window;
  if (!isSupported) {
    errors.push('Notifications not supported in this browser');
  }

  const hasPermission = Notification.permission === 'granted';
  if (!hasPermission) {
    errors.push('Notification permission not granted');
  }

  const hasServiceWorker = 'serviceWorker' in navigator;
  if (!hasServiceWorker) {
    errors.push('Service Worker not supported in this browser');
  }

  return {
    isSupported,
    hasPermission,
    hasServiceWorker,
    errors
  };
};





export { 
  app, 
  getMessagingInstance as messaging, 
  getToken, 
  onMessage, 
  deleteToken,
  registerServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerReady,
  getActiveServiceWorkers,
  clearAllFCMData,
  setupPushSubscription,
  getHealthyMessagingInstance,
  checkNotificationRequirements
};