import { vi } from 'vitest';

// Mock server actions for meal management
export const mockMealActions = {
  addMeal: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'mock-meal-id',
      name: 'Test Meal',
      calories: 350,
    },
  }),
  
  updateMeal: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'mock-meal-id',
      name: 'Updated Meal',
    },
  }),
  
  deleteMeal: vi.fn().mockResolvedValue({
    success: true,
  }),
  
  fetchMealsByUserId: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
  
  fetchMealById: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'mock-meal-id',
      name: 'Test Meal',
    },
  }),
};

// Mock server actions for user management
export const mockUserActions = {
  addUserAccount: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  }),
  
  fetchUserAccount: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  }),
  
  updateUserAccount: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'test-user-id',
      email: 'updated@example.com',
    },
  }),
  
  deleteUserAccount: vi.fn().mockResolvedValue({
    success: true,
  }),
};

// Mock AI-related server actions
export const mockAiActions = {
  analyzeImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      calories: 350,
      protein: 25,
      carbs: 30,
      fat: 15,
      description: 'Grilled chicken with vegetables',
    },
  }),
};

// Helper to reset all server action mocks
export const resetServerActionMocks = () => {
  Object.values({
    ...mockMealActions,
    ...mockUserActions,
    ...mockAiActions,
  }).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Helper to simulate server action errors
export const simulateServerActionError = (actionMock: any, error: any) => {
  actionMock.mockRejectedValueOnce(error);
};

// Helper to simulate successful responses
export const simulateServerActionSuccess = (actionMock: any, data: any) => {
  actionMock.mockResolvedValueOnce({
    success: true,
    data,
  });
};

// Helper to simulate validation errors
export const simulateValidationError = (actionMock: any, fieldErrors: any) => {
  actionMock.mockResolvedValueOnce({
    success: false,
    error: {
      type: 'validation',
      fieldErrors,
    },
  });
};