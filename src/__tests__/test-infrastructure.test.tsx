import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createMockUser, 
  createMockAuthContext, 
  renderWithProviders,
  createMockMeal,
  createMockUserAccount,
  testScenarios
} from './utils';
import { 
  mockFirebaseAuth,
  resetFirebaseMocks,
  simulateAuthStateChange,
  createTestQueryClient
} from './mocks';

// Simple test component to verify rendering works
const TestComponent = ({ text = 'Test Component' }: { text?: string }) => (
  <div data-testid="test-component">{text}</div>
);

describe('Test Infrastructure', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe('Mock Factories', () => {
    it('should create mock user with default values', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('uid', 'test-user-id');
      expect(user).toHaveProperty('email', 'test@example.com');
      expect(user).toHaveProperty('displayName', 'Test User');
      expect(user).toHaveProperty('emailVerified', true);
    });

    it('should create mock user with overrides', () => {
      const user = createMockUser({
        uid: 'custom-id',
        email: 'custom@example.com',
        displayName: 'Custom User'
      });
      
      expect(user.uid).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
      expect(user.displayName).toBe('Custom User');
    });

    it('should create mock auth context', () => {
      const authContext = createMockAuthContext();
      
      expect(authContext).toHaveProperty('user', null);
      expect(authContext).toHaveProperty('loading', false);
      expect(authContext.register).toBeDefined();
      expect(authContext.login).toBeDefined();
      expect(authContext.logout).toBeDefined();
    });

    it('should create mock meal data', () => {
      const meal = createMockMeal();
      
      expect(meal).toHaveProperty('id', 'mock-meal-id');
      expect(meal).toHaveProperty('name', 'Test Meal');
      expect(meal).toHaveProperty('calories', 350);
      expect(meal).toHaveProperty('protein', 25);
    });

    it('should create mock user account', () => {
      const account = createMockUserAccount();
      
      expect(account).toHaveProperty('id', 'test-user-id');
      expect(account).toHaveProperty('email', 'test@example.com');
      expect(account).toHaveProperty('preferences');
    });
  });

  describe('Render Utilities', () => {
    it('should render component with providers', () => {
      const { getByTestId } = renderWithProviders(
        <TestComponent text="Hello Test" />
      );
      
      expect(getByTestId('test-component')).toHaveTextContent('Hello Test');
    });

    it('should render with custom auth context', () => {
      const mockUser = createMockUser();
      const authContext = createMockAuthContext({ 
        user: mockUser,
        loading: false 
      });
      
      const { getByTestId } = renderWithProviders(
        <TestComponent />,
        { authContextValue: authContext }
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
    });

    it('should render with custom query client', () => {
      const queryClient = createTestQueryClient();
      
      const { getByTestId } = renderWithProviders(
        <TestComponent />,
        { queryClient }
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Firebase Mocks', () => {
    it('should have working Firebase auth mocks', () => {
      expect(mockFirebaseAuth.signOut).toBeDefined();
      expect(mockFirebaseAuth.onAuthStateChanged).toBeDefined();
      expect(mockFirebaseAuth.currentUser).toBeNull();
    });

    it('should simulate auth state changes', () => {
      const mockUser = createMockUser();
      
      simulateAuthStateChange(mockUser);
      
      expect(mockFirebaseAuth.currentUser).toBe(mockUser);
    });

    it('should reset Firebase mocks', () => {
      const mockUser = createMockUser();
      mockFirebaseAuth.currentUser = mockUser;
      
      resetFirebaseMocks();
      
      expect(mockFirebaseAuth.currentUser).toBeNull();
    });
  });

  describe('Test Scenarios', () => {
    it('should provide authenticated user scenario', () => {
      const scenario = testScenarios.authenticatedUser;
      
      expect(scenario.user).toBeDefined();
      expect(scenario.user?.uid).toBe('authenticated-user');
      expect(scenario.loading).toBe(false);
    });

    it('should provide unauthenticated user scenario', () => {
      const scenario = testScenarios.unauthenticatedUser;
      
      expect(scenario.user).toBeNull();
      expect(scenario.loading).toBe(false);
    });

    it('should provide loading user scenario', () => {
      const scenario = testScenarios.loadingUser;
      
      expect(scenario.user).toBeNull();
      expect(scenario.loading).toBe(true);
    });
  });
});