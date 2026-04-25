import 'server-only';

/**
 * Authentication helpers for session management.
 * Uses HTTP-only cookies for secure session storage.
 */

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/constants';

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * @param idToken - The Firebase ID token to verify
 * @returns The decoded token or null if invalid
 */
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch {
    return null;
  }
}

/**
 * Creates a session cookie from a Firebase ID token.
 * @param idToken - The Firebase ID token
 * @returns Whether the session was created successfully
 */
export async function createSessionCookie(idToken: string): Promise<boolean> {
  try {
    const auth = getAdminAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates the current session cookie and returns the user ID.
 * @returns The user ID if session is valid, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch {
    return null;
  }
}

/**
 * Destroys the current session by deleting the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
