import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Speedy Van
const firebaseConfig = {
  apiKey: 'AIzaSyAvNbrKi9fnTRKGO4omZVozcL8uqzX6Pv0',
  authDomain: 'speedy-van-9b6d5.firebaseapp.com',
  projectId: 'speedy-van-9b6d5',
  storageBucket: 'speedy-van-9b6d5.appspot.com',
  messagingSenderId: '996738112783',
  appId: '1:996738112783:web:9eb17a262cd2aded74b27a',
};

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);