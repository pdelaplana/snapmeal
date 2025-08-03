import { vi } from 'vitest';

// Mock Firebase Auth
export const mockFirebaseAuth = {
  currentUser: null,
  signOut: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return vi.fn(); // unsubscribe function
  }),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  updatePassword: vi.fn().mockResolvedValue(undefined),
  reauthenticateWithCredential: vi.fn().mockResolvedValue(undefined),
};

// Mock Firebase Firestore
export const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({}),
        id: 'mock-doc-id',
      }),
      set: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
    add: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    where: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
    })),
    orderBy: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
    })),
  })),
  doc: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({}),
      id: 'mock-doc-id',
    }),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
};

// Mock Firebase Storage
export const mockFirebaseStorage = {
  ref: vi.fn(() => ({
    child: vi.fn(() => ({
      put: vi.fn().mockResolvedValue({
        ref: {
          getDownloadURL: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
        },
      }),
      getDownloadURL: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
    })),
    put: vi.fn().mockResolvedValue({
      ref: {
        getDownloadURL: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
      },
    }),
    getDownloadURL: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
};

// Mock Firebase Admin Auth
export const mockFirebaseAdminAuth = {
  verifyIdToken: vi.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
  }),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  createUser: vi.fn().mockResolvedValue({
    uid: 'new-user-id',
    email: 'newuser@example.com',
  }),
  updateUser: vi.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'updated@example.com',
  }),
};

// Mock Firebase Admin Firestore
export const mockFirebaseAdminFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
        id: 'mock-doc-id',
      }),
      set: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
    add: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    where: vi.fn(() => ({
      get: vi.fn().mockResolvedValue([]),
    })),
  })),
  doc: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({}),
      id: 'mock-doc-id',
    }),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
};

// Helper function to reset all Firebase mocks
export const resetFirebaseMocks = () => {
  Object.values(mockFirebaseAuth).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
  
  // Reset auth state
  mockFirebaseAuth.currentUser = null;
  
  // Reset other mocks similarly if needed
};

// Helper to simulate auth state changes
export const simulateAuthStateChange = (user: any) => {
  mockFirebaseAuth.currentUser = user;
  const callback = mockFirebaseAuth.onAuthStateChanged.mock.calls[0]?.[0];
  if (callback) {
    callback(user);
  }
};