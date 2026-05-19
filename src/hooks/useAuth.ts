import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

/**
 * Sync user profile data to Firestore.
 * Creates or updates the /users/{uid} document with the latest
 * displayName, email, photoURL, and lastLogin timestamp.
 */
async function syncUserProfile(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync user profile:', err);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result (when signInWithRedirect was used)
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect sign-in error:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Sync profile to Firestore whenever user is authenticated
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // Fallback to redirect if popup is blocked by COOP or popup blockers
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('Cross-Origin-Opener-Policy')
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { user, loading, signInWithGoogle, logout };
}
