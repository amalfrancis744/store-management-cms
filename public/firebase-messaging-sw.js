// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - should match your main config
// Note: You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/logo.png',
    image: payload.notification?.image,
    tag: payload.data?.id || 'general',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icons/open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ],
    data: {
      ...payload.data,
      timestamp: Date.now(),
      click_action: payload.notification?.click_action || payload.data?.url
    }
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked: ', event);
  
  // Close the notification
  event.notification.close();
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Handle different actions
  if (action === 'close') {
    // Just close the notification (already done above)
    return;
  }
  
  // Default action or 'open' action
  let urlToOpen = null;
  
  // Determine URL to open
  if (data.click_action) {
    urlToOpen = data.click_action;
  } else if (data.url) {
    urlToOpen = data.url;
  } else if (data.action) {
    // Handle custom actions
    switch (data.action) {
      case 'open_profile':
        urlToOpen = '/profile';
        break;
      case 'open_messages':
        urlToOpen = '/messages';
        break;
      case 'open_notifications':
        urlToOpen = '/notifications';
        break;
      default:
        if (data.id) {
          urlToOpen = `/notification/${data.id}`;
        } else {
          urlToOpen = '/';
        }
    }
  } else {
    urlToOpen = '/'; // Default to home page
  }
  
  // Handle the click event
  event.waitUntil(
    (async () => {
      try {
        // Get all window clients
        const clientList = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        // Check if there's already a window/tab open with our app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus the existing window and navigate
            await client.focus();
            
            // Send message to the client to handle navigation
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              payload: {
                notification: notification,
                data: data,
                url: urlToOpen
              }
            });
            
            return;
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          const fullUrl = urlToOpen.startsWith('http') 
            ? urlToOpen 
            : `${self.location.origin}${urlToOpen}`;
            
          await clients.openWindow(fullUrl);
        }
        
      } catch (error) {
        console.error('Error handling notification click:', error);
        
        // Fallback: try to open a new window
        if (clients.openWindow) {
          const fallbackUrl = `${self.location.origin}/`;
          await clients.openWindow(fallbackUrl);
        }
      }
    })()
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed: ', event);
  
  // Optional: Track notification dismissals
  const data = event.notification.data || {};
  
  // You could send analytics data here
  // analytics.track('notification_dismissed', { id: data.id });
});

// Handle push events (for when app is completely closed)
self.addEventListener('push', (event) => {
  console.log('Push event received: ', event);
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('Push payload: ', payload);
    
    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/logo.png',
      badge: '/logo.png',
      image: payload.notification?.image,
      tag: payload.data?.id || 'general',
      requireInteraction: true,
      data: {
        ...payload.data,
        timestamp: Date.now(),
        click_action: payload.notification?.click_action || payload.data?.url
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
    
  } catch (error) {
    console.error('Error handling push event: ', error);
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message: ', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('Service Worker error: ', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection: ', event.reason);
});