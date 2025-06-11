'use client';

import { addUserAccount, fetchUserAccount } from '@/actions';
import { auth, db } from '@/lib/firebase';
import type { AuthError, User } from 'firebase/auth'; // Using Firebase User type directly
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';

const emailPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function formatFirebaseError(error: AuthError) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return { email: ['This email address is already in use.'] };
    case 'auth/invalid-email':
      return { email: ['Please enter a valid email address.'] };
    case 'auth/weak-password':
      return {
        password: ['Password is too weak. It must be at least 6 characters.'],
      };
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': // Covers both user-not-found and wrong-password in newer SDK versions
      return { form: ['Invalid email or password. Please try again.'] };
    default:
      console.error('Firebase Auth Error:', error);
      return { form: ['An unexpected error occurred. Please try again.'] };
  }
}

interface ProfileUpdate {
  displayName?: string;
  photoURL?: string;
  email?: string;
  // Add any other profile fields you want to update
}

interface AuthContextError {
  email?: string[];
  password?: string[];
  form?: string[];
}

interface AuthContextType {
  user: User | null; // User can be Firebase User or null
  loading: boolean;
  register: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; email?: string; error?: AuthContextError }>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; email?: string; error?: AuthContextError }>;
  logout: () => Promise<boolean>;
  updateUserProfile: (profileData: ProfileUpdate) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => ({ success: false, error: {} }),
  login: async () => ({ success: false, error: {} }),
  logout: async () => true,
  updateUserProfile: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const register = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Assert that email is never null
      if (!userCredential.user.email) {
        // This should theoretically not happen with email/password sign-up
        throw new Error('User created but email is null.');
      }

      setUser(userCredential.user); // Update user state on successful registration

      await addUserAccount({ userId: userCredential.user.uid, email: userCredential.user.email });

      return { success: true, email: userCredential.user.email || '' };
    } catch (error) {
      return { success: false, error: formatFirebaseError(error as AuthError) };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Assert that email is never null
      if (!userCredential.user.email) {
        // This should theoretically not happen with email/password sign-in
        throw new Error('User signed in but email is null.');
      }
      setUser(userCredential.user); // Update user state on successful login

      // check if user has a firestore document
      const userAccount = await fetchUserAccount(userCredential.user.uid);
      if (!userAccount) {
        console.warn('User account not found in Firestore, creating new account.');
        // Optionally, you could create a new user account here
        await addUserAccount({ userId: userCredential.user.uid, email: userCredential.user.email });
      }

      return { success: true, email: userCredential.user.email as string };
    } catch (error) {
      return {
        success: false,
        error: formatFirebaseError(error as AuthError),
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null); // Clear user state on logout
      return true; // Indicate successful logout
    } catch (error) {
      console.error('Logout failed:', error);
      return false; // Indicate failed logout
    }
  }, []);

  const updateUserProfile = useCallback(
    async (profileData: ProfileUpdate): Promise<boolean> => {
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }

      try {
        await updateProfile(user, {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL,
        });

        return true;
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error instanceof Error ? error : new Error('Failed to update profile');
      }
    },
    [user],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      console.log('AuthContext: Auth state changed, user:', firebaseUser?.email);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      updateUserProfile,
    }),
    [user, loading, register, login, logout, updateUserProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Return only the stable context value
};
