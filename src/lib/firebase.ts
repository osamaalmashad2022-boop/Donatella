import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAJt2lKZJPWRLBXjbzfjceiiK7iCO3dT8Q',
  authDomain: 'donatella-2023.firebaseapp.com',
  projectId: 'donatella-2023',
  storageBucket: 'donatella-2023.firebasestorage.app',
  messagingSenderId: '371448235676',
  appId: '1:371448235676:web:d3bd91fdfb964bf6d88f59',
  measurementId: 'G-DQ7B16LWJ1',
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
