// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyB51Mvu5wA4I7SvANV5q45Eu18n4-o5odY",
  authDomain: "bakery-b426a.firebaseapp.com",
  projectId: "bakery-b426a",
  storageBucket: "bakery-b426a.firebasestorage.app",
  messagingSenderId: "548551748923",
  appId: "1:548551748923:web:ead31619ed09678c5d5b1e",
  measurementId: "G-8SSYMZT17F"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: '/logo.png', // Add your logo path here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});