
"use client";

import type { User, UserMetadata } from 'firebase/auth'; // UserMetadata might be needed for full User type
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define a more complete mock user structure based on Firebase's User type
interface MockUser extends User {
  // Ensure all properties are covered or provide sensible defaults
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  mockLogin: (email: string) => void;
  mockSignOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Will be set to false after initial check
  mockLogin: () => {},
  mockSignOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mockLogin = useCallback((email: string) => {
    const now = new Date().toISOString();
    const mockUserData: MockUser = {
      uid: 'mock-uid-' + Date.now(),
      email: email,
      emailVerified: true,
      isAnonymous: false,
      metadata: { creationTime: now, lastSignInTime: now } as UserMetadata,
      providerData: [{
        providerId: 'password', // or 'mock-provider'
        uid: 'mock-provider-uid-' + email,
        displayName: email.split('@')[0],
        email: email,
        phoneNumber: null,
        photoURL: null,
      }],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => { console.log('MockUser: delete called'); },
      getIdToken: async () => 'mock-id-token',
      getIdTokenResult: async () => ({
        token: 'mock-id-token',
        expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        authTime: now,
        issuedAtTime: now,
        signInProvider: 'password',
        signInSecondFactor: null,
        claims: { mockClaim: true },
      }),
      reload: async () => { console.log('MockUser: reload called'); },
      toJSON: () => ({ uid: 'mock-uid-' + Date.now(), email: email, emailVerified: true }),
      displayName: email.split('@')[0],
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase', // Standard for email/password
    };
    setUser(mockUserData);
    setLoading(false);
    console.log("AuthContext: Mock user logged in:", email);
  }, []);

  const mockSignOut = useCallback(() => {
    setUser(null);
    setLoading(false);
    console.log("AuthContext: Mock user signed out.");
  }, []);

  // On initial load, set loading to false as there's no async auth check
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mockLogin, mockSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
