import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/context/auth-context';
import type { User } from 'firebase/auth';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock user factory
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  providerId: 'password',
  metadata: {
    creationTime: '2023-01-01T00:00:00.000Z',
    lastSignInTime: '2023-01-01T00:00:00.000Z',
    toJSON: vi.fn(),
  },
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  ...overrides,
} as User);

// Mock auth context value factory
export const createMockAuthContext = (overrides: Partial<any> = {}) => ({
  user: null,
  loading: false,
  register: vi.fn().mockResolvedValue({ success: true }),
  login: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn().mockResolvedValue(true),
  updateUserProfile: vi.fn().mockResolvedValue(true),
  changePassword: vi.fn().mockResolvedValue({ success: true }),
  ...overrides,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authContextValue?: any;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    authContextValue = createMockAuthContext(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    authContextValue,
  };
};

// Utility to wait for React Query to settle
export const waitForQueryToSettle = async (queryClient: QueryClient) => {
  await new Promise(resolve => setTimeout(resolve, 0));
  // Wait for all queries to finish
  const queries = queryClient.getQueryCache().getAll();
  await Promise.all(
    queries.map(query => {
      if (query.state.fetchStatus === 'fetching') {
        return new Promise(resolve => {
          const interval = setInterval(() => {
            if (query.state.fetchStatus === 'idle') {
              clearInterval(interval);
              resolve(void 0);
            }
          }, 10);
        });
      }
      return Promise.resolve();
    })
  );
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';