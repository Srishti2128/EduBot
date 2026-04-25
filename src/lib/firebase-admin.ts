import 'server-only';

/**
 * Firebase Admin SDK initialization.
 * Server-only module — never imported in client components.
 * Uses service account credentials for secure server-side operations.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Returns the Firebase Admin App instance.
 * Creates a new app if none exists, using service account credentials.
 * @returns The Firebase Admin App singleton
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  /* Fallback: uses Application Default Credentials (ADC) on Cloud Run */
  return initializeApp();
}

/**
 * Returns the Firebase Admin Auth instance.
 * @returns The Admin Auth singleton
 */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/**
 * Returns the Firebase Admin Firestore instance.
 * @returns The Admin Firestore singleton
 */
export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
