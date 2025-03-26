/**
 * Creates a standardized mock for the useAuth hook
 * @param {Object} overrides - Values to override default state
 * @returns {Object} Mock auth context value
 */
export function createMockAuthState(overrides = {}) {
  return {
    isAuthenticated: true,
    loading: false,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'TestUser',
    },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    ...overrides,
  };
}

/**
 * Predefined auth states for different test scenarios
 */
export const AUTH_STATES = {
  AUTHENTICATED: createMockAuthState(),
  
  UNAUTHENTICATED: createMockAuthState({
    isAuthenticated: false,
    user: null,
  }),
  
  LOADING: createMockAuthState({
    loading: true,
  }),
  
  ERROR: createMockAuthState({
    error: 'Authentication error',
  }),
};

/**
 * Mock useAuth implementation for testing
 * @param {Object} authState - Auth state to return 
 * @returns {Function} Mocked useAuth hook
 */
export function mockUseAuth(authState = AUTH_STATES.AUTHENTICATED) {
  return jest.fn().mockReturnValue(authState);
}

/**
 * Creates authenticated user for tests
 * @param {Object} userProps - Properties to override
 * @returns {Object} User object
 */
export function createTestUser(userProps = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'TestUser',
    ...userProps,
  };
}