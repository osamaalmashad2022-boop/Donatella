import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Firebase client keys are public (embedded in client bundle).
// Use env vars when available (.env in dev), fall back to defaults for production builds.
const DEFAULTS = {
  VITE_FIREBASE_API_KEY: 'AIzaSyAJt2lKZJPWRLBXjbzfjceiiK7iCO3dT8Q',
  VITE_FIREBASE_AUTH_DOMAIN: 'donatella-2023.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'donatella-2023',
  VITE_FIREBASE_STORAGE_BUCKET: 'donatella-2023.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '371448235676',
  VITE_FIREBASE_APP_ID: '1:371448235676:web:d3bd91fdfb964bf6d88f59',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-DQ7B16LWJ1',
} as const;

const env = (key: keyof typeof DEFAULTS) =>
  import.meta.env[key] || DEFAULTS[key];

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID'),
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore with persistent offline cache + multi-tab support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
