
"use client";

import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth'; // Using Firebase User type directly
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';

interface AuthContextType {
  user: User | null; // User can be Firebase User or null
  loading: boolean;
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

  const contextValue = useMemo(() => ({
    user,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // Return only the stable context value
};
