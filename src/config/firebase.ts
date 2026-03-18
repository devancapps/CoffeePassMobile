/**
 * Firebase Configuration
 *
 * Initializes the Firebase app and exports service singletons.
 * Uses the modular JS SDK (v9+) which is compatible with Expo managed workflow.
 *
 * TODO: Replace placeholder values with real Firebase project config.
 * These should come from environment variables in production.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? 'PLACEHOLDER_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'coffeepass.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID ?? 'coffeepass-dev',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'coffeepass-dev.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.FIREBASE_APP_ID ?? '1:000000000000:web:placeholder',
};

// Prevent re-initialization during hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
