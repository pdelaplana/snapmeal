// Test data factories for consistent test data generation

export const createMockMeal = (overrides: any = {}) => ({
  id: 'mock-meal-id',
  userId: 'test-user-id',
  name: 'Test Meal',
  description: 'A delicious test meal',
  calories: 350,
  protein: 25,
  carbs: 30,
  fat: 15,
  fiber: 5,
  sugar: 10,
  sodium: 400,
  imageUrl: 'https://example.com/meal-image.jpg',
  createdAt: new Date('2023-01-01T12:00:00.000Z'),
  updatedAt: new Date('2023-01-01T12:00:00.000Z'),
  tags: ['healthy', 'protein'],
  ...overrides,
});

export const createMockUserAccount = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  preferences: {
    theme: 'light',
    notifications: true,
    shareProfile: false,
  },
  ...overrides,
});

export const createMockFormData = () => {
  const formData = new FormData();
  
  // Helper method to easily add fields
  const addField = (key: string, value: string | File) => {
    formData.append(key, value);
    return addField; // Allow chaining
  };

  return { formData, addField };
};

export const createMockFile = (
  name = 'test-image.jpg',
  type = 'image/jpeg',
  size = 1024
): File => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Common test scenarios
export const testScenarios = {
  authenticatedUser: {
    user: {
      uid: 'authenticated-user',
      email: 'authenticated@example.com',
      displayName: 'Auth User',
      emailVerified: true,
    },
    loading: false,
  },
  unauthenticatedUser: {
    user: null,
    loading: false,
  },
  loadingUser: {
    user: null,
    loading: true,
  },
} as const;