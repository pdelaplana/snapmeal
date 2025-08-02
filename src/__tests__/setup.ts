import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    currentUser: null,
  },
  db: {},
}));

// Mock Firebase Admin
vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    deleteUser: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}));

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  onAuthStateChanged: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast notifications
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Key: () => 'Key',
  KeyRound: () => 'KeyRound',
  Lock: () => 'Lock',
  LogOut: () => 'LogOut',
  Trash2: () => 'Trash2',
  UserCog: () => 'UserCog',
  Mail: () => 'Mail',
  User: () => 'User',
  Settings2: () => 'Settings2',
  Users: () => 'Users',
  Utensils: () => 'Utensils',
  ArrowLeft: () => 'ArrowLeft',
  ChevronDown: () => 'ChevronDown',
  ShieldAlert: () => 'ShieldAlert',
}));

// Mock Sentry
vi.mock('@/components/shared/sentry-error-boundary', () => ({
  setUserContext: vi.fn(),
}));

// Global test environment setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  vi.restoreAllMocks();
});

// Increase timeout for integration tests
vi.setConfig({ testTimeout: 10000 });