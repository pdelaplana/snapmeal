
"use client";

import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth'; // Using Firebase User type directly
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

interface AuthContextType {
  user: User | null; // User can be Firebase User or null
  loading: boolean;
  // login and signOut are now primarily handled by server actions and onAuthStateChanged
  // If direct client-side triggers are needed for Firebase signout, they can be added.
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      console.log("AuthContext: Auth state changed, user:", firebaseUser?.email);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Mock login/signout for components that might still expect them (to be phased out)
  // These do NOT perform actual Firebase operations but can update local state for UI transitions
  // if needed before onAuthStateChanged picks up the change from server actions.
  // Ideally, rely on onAuthStateChanged as the source of truth.
  const mockLogin = useCallback((email: string) => {
    // This function's utility is reduced as actual login happens via server actions
    // and onAuthStateChanged will update the user state.
    // It could be used for optimistic UI updates if desired.
    console.warn("AuthContext: mockLogin called with", email, "- This should ideally be handled by Firebase onAuthStateChanged.");
  }, []);

  const mockSignOut = useCallback(() => {
    // Similar to mockLogin, actual signout is a server action.
    // onAuthStateChanged will handle setting user to null.
    console.warn("AuthContext: mockSignOut called - This should ideally be handled by Firebase onAuthStateChanged.");
  }, []);


  return (
    // Provide the actual user and loading state.
    // The mockLogin and mockSignOut are less relevant now but kept if some components call them during transition.
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // For components that were using the mockLogin/mockSignOut from the old context
  // we provide dummy functions here to avoid breaking them immediately.
  // These should be refactored out of components eventually.
  return {
    ...context,
    mockLogin: (email: string) => console.warn("useAuth: mockLogin called, ensure component is updated to new auth flow for email:", email),
    mockSignOut: () => console.warn("useAuth: mockSignOut called, ensure component is updated to new auth flow")
  };
};
