import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !messaging) {
    console.warn('Firebase Messaging is not available');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (typeof window === 'undefined' || !messaging) {
    console.warn('Firebase Messaging is not available');
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, callback);
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return () => {};
  }
};