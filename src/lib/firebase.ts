'use client';

/**
 * Firebase Client SDK initialization.
 * Uses singleton pattern to prevent re-initialization during hot-reload.
 * Only public Firebase config values are used (safe for NEXT_PUBLIC_).
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

/** Firebase client configuration from public environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Returns the Firebase App instance, creating one if it doesn't exist.
 * @returns The Firebase App singleton
 */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Returns the Firebase Auth instance.
 * @returns The Firebase Auth singleton
 */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/**
 * Returns the Firestore instance.
 * @returns The Firestore singleton
 */
export function getFirebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Analytics instance (lazily initialized, browser-only) */
let analyticsInstance: Analytics | null = null;

/**
 * Returns the Firebase Analytics instance if supported.
 * Only initializes in browser environment.
 * @returns The Analytics instance or null if unsupported
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(getFirebaseApp());
  }
  return analyticsInstance;
}
