import { QueryClient } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a test query client with disabled retries and caching
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Disable caching
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Mock React Query hooks
export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn();
export const mockUseQueryClient = vi.fn();

// Helper to create mock query results
export const createMockQueryResult = (overrides: any = {}) => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: true,
  status: 'success' as const,
  refetch: vi.fn(),
  ...overrides,
});

// Helper to create mock mutation results
export const createMockMutationResult = (overrides: any = {}) => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  isPending: false,
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  ...overrides,
});

// Mock query states
export const mockQueryStates = {
  loading: {
    data: undefined,
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'pending' as const,
  },
  success: {
    data: { id: 'mock-data' },
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success' as const,
  },
  error: {
    data: undefined,
    error: new Error('Mock error'),
    isLoading: false,
    isError: true,
    isSuccess: false,
    status: 'error' as const,
  },
};

// Helper to simulate query invalidation
export const createMockQueryClient = () => {
  const queryClient = createTestQueryClient();
  
  return {
    ...queryClient,
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn(),
    clear: vi.fn(),
  };
};

// Helper to reset React Query mocks
export const resetReactQueryMocks = () => {
  mockUseQuery.mockClear();
  mockUseMutation.mockClear();
  mockUseQueryClient.mockClear();
};