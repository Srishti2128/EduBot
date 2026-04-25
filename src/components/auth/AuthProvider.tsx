'use client';

/**
 * Authentication context provider.
 * Wraps the app to provide auth state to all client components.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

/** Auth context state */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

/**
 * Hook to access the auth context.
 * @returns The current auth state and methods
 */
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

/** Props for AuthProvider component */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication state and methods to the component tree.
 * @param props - Component props
 * @param props.children - Child components to wrap
 * @returns The provider wrapper
 */
export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        /* Create server-side session cookie */
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
