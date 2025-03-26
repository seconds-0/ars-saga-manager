import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../useAuth';
import { createTestQueryClient } from './setup';

/**
 * Standard hook states for testing
 */
export const HOOK_STATES = {
  IDLE: {
    isLoading: false,
    isError: false,
    error: null,
    data: null
  },
  LOADING: {
    isLoading: true,
    isError: false,
    error: null,
    data: null
  },
  SUCCESS: (data) => ({
    isLoading: false,
    isError: false,
    error: null,
    data
  }),
  ERROR: (error) => ({
    isLoading: false,
    isError: true,
    error: error || new Error('Test error'),
    data: null
  })
};

/**
 * Basic hook setup for testing
 * @param {Function} hook - The hook to test
 * @param {Array} hookParams - Parameters to pass to the hook
 * @param {Object} options - Additional options for setup
 * @returns {Object} The rendered hook result and utility functions
 */
export function setupHook(hook, hookParams = [], options = {}) {
  // Configure testing environment
  const { 
    initialProps = {},
    mockDependencies = {},
    mockReturn = {}
  } = options;

  // Setup mocks for dependencies
  Object.entries(mockDependencies).forEach(([path, mockImplementation]) => {
    jest.mock(path, () => mockImplementation);
  });

  // Mock hook return values if needed
  Object.entries(mockReturn).forEach(([methodName, returnValue]) => {
    if (typeof returnValue === 'function') {
      jest.spyOn(Object.prototype, methodName).mockImplementation(returnValue);
    } else {
      jest.spyOn(Object.prototype, methodName).mockReturnValue(returnValue);
    }
  });

  // Render the hook
  const utils = renderHook(() => hook(...hookParams), { initialProps });
  
  return { 
    ...utils,
    hookParams
  };
}

/**
 * Hook setup wrapped in QueryClientProvider
 * @param {Function} hook - The hook to test
 * @param {Array} hookParams - Parameters to pass to the hook
 * @param {Object} options - Additional options for setup
 * @param {QueryClient} queryClient - Optional custom QueryClient
 * @returns {Object} The rendered hook result and utility functions
 */
export function setupHookWithQueryClient(
  hook,
  hookParams = [],
  options = {},
  queryClient = createTestQueryClient()
) {
  const { initialProps = {} } = options;
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const utils = renderHook(() => hook(...hookParams), { 
    wrapper,
    initialProps 
  });
  
  return { 
    ...utils,
    hookParams,
    queryClient
  };
}

/**
 * Hook setup wrapped in Router
 * @param {Function} hook - The hook to test
 * @param {Array} hookParams - Parameters to pass to the hook
 * @param {Object} options - Additional options for setup
 * @returns {Object} The rendered hook result and utility functions
 */
export function setupHookWithRouter(
  hook,
  hookParams = [],
  options = {}
) {
  const { 
    initialProps = {},
    initialEntries = ['/'],
    initialIndex = 0
  } = options;
  
  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {children}
    </MemoryRouter>
  );

  const utils = renderHook(() => hook(...hookParams), { 
    wrapper,
    initialProps 
  });
  
  return { 
    ...utils,
    hookParams
  };
}

/**
 * Hook setup wrapped in AuthProvider
 * @param {Function} hook - The hook to test
 * @param {Array} hookParams - Parameters to pass to the hook
 * @param {Object} options - Additional options for setup
 * @returns {Object} The rendered hook result and utility functions
 */
export function setupHookWithAuth(
  hook,
  hookParams = [],
  options = {}
) {
  const { 
    initialProps = {},
    authValue = {
      isAuthenticated: true,
      loading: false,
      user: { id: 'test-user-id', email: 'test@example.com', username: 'TestUser' },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateUser: jest.fn(),
    }
  } = options;
  
  const wrapper = ({ children }) => (
    <AuthProvider value={authValue}>
      {children}
    </AuthProvider>
  );

  const utils = renderHook(() => hook(...hookParams), { 
    wrapper,
    initialProps 
  });
  
  return { 
    ...utils,
    hookParams,
    authValue
  };
}

/**
 * Hook setup with all common providers
 * @param {Function} hook - The hook to test
 * @param {Array} hookParams - Parameters to pass to the hook
 * @param {Object} options - Additional options for setup
 * @returns {Object} The rendered hook result and utility functions
 */
export function setupHookWithAllProviders(
  hook,
  hookParams = [],
  options = {}
) {
  const {
    initialProps = {},
    queryClient = createTestQueryClient(),
    authValue = {
      isAuthenticated: true,
      loading: false,
      user: { id: 'test-user-id', email: 'test@example.com', username: 'TestUser' },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateUser: jest.fn(),
    },
    routerOptions = {
      initialEntries: ['/'],
      initialIndex: 0,
    },
  } = options;

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={authValue}>
        <MemoryRouter {...routerOptions}>
          {children}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );

  const utils = renderHook(() => hook(...hookParams), { 
    wrapper,
    initialProps 
  });
  
  return { 
    ...utils,
    hookParams,
    queryClient,
    authValue
  };
}

/**
 * Creates mock axios functions for hook testing
 * @returns {Object} Mock axios functions
 */
export function createAxiosMockForHooks() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  };
}

/**
 * Creates mock React Query hooks for testing
 * @returns {Object} Mock query functions
 */
export function createReactQueryMockForHooks() {
  return {
    useQuery: jest.fn(),
    useMutation: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false
    }),
    useQueryClient: jest.fn().mockReturnValue({
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn()
    })
  };
}

/**
 * Wait for hook promises to resolve
 * @param {Object} hookResult - The result from renderHook
 * @returns {Promise} Promise that resolves when all hook operations complete
 */
export async function waitForHookToSettle(hookResult) {
  // Wait for any pending state updates
  if (hookResult.waitForNextUpdate) {
    try {
      await hookResult.waitForNextUpdate({ timeout: 1000 });
    } catch (error) {
      // If timeout, assume hook is settled
      if (!error.message.includes('Timed out')) {
        throw error;
      }
    }
  }
  
  // Return a promise that resolves on next tick to ensure all microtasks complete
  return new Promise(resolve => setTimeout(resolve, 0));
}