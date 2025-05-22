// service/firebaseMessaging.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB51Mvu5wA4I7SvANV5q45Eu18n4-o5odY",
  authDomain: "bakery-b426a.firebaseapp.com",
  projectId: "bakery-b426a",
  storageBucket: "bakery-b426a.firebasestorage.app",
  messagingSenderId: "548551748923",
  appId: "1:548551748923:web:ead31619ed09678c5d5b1e",
  measurementId: "G-8SSYMZT17F"
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
    console.error("Firebase messaging initialization error:", error);
    return null;
  }
};

export { app, getMessagingInstance as messaging, getToken, onMessage };