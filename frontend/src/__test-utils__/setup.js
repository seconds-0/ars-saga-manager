import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../useAuth';

/**
 * Creates a new QueryClient for testing purposes
 * @returns {QueryClient} A QueryClient configured for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/**
 * Generic component setup with defaultProps and render
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {Function} renderFn - Custom render function if needed
 * @returns {Object} The rendered component and utility functions
 */
export function setupComponent(Component, defaultProps = {}, customProps = {}, renderFn = render) {
  const props = { ...defaultProps, ...customProps };
  const utils = renderFn(<Component {...props} />);
  return { ...utils, props };
}

/**
 * Component setup wrapped in QueryClientProvider
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {QueryClient} queryClient - Optional custom QueryClient
 * @returns {Object} The rendered component and utility functions
 */
export function setupWithQueryClient(
  Component,
  defaultProps = {},
  customProps = {},
  queryClient = createTestQueryClient()
) {
  const props = { ...defaultProps, ...customProps };
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Component {...props} />
    </QueryClientProvider>
  );
  return { ...utils, props, queryClient };
}

/**
 * Component setup wrapped in MemoryRouter
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {Array} initialEntries - Initial route entries
 * @param {string} initialIndex - Initial route index
 * @returns {Object} The rendered component and utility functions
 */
export function setupWithRouter(
  Component,
  defaultProps = {},
  customProps = {},
  initialEntries = ['/'],
  initialIndex = 0
) {
  const props = { ...defaultProps, ...customProps };
  const utils = render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Component {...props} />
    </MemoryRouter>
  );
  return { ...utils, props };
}

/**
 * Component setup wrapped in full route structure
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {string} path - Route path
 * @param {Array} initialEntries - Initial route entries
 * @returns {Object} The rendered component and utility functions
 */
export function setupWithFullRouter(
  Component,
  defaultProps = {},
  customProps = {},
  path = '/',
  initialEntries = ['/']
) {
  const props = { ...defaultProps, ...customProps };
  const utils = render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={path} element={<Component {...props} />} />
      </Routes>
    </MemoryRouter>
  );
  return { ...utils, props };
}

/**
 * Component setup wrapped in AuthProvider
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {Object} authValue - Mock auth context value
 * @returns {Object} The rendered component and utility functions
 */
export function setupWithAuth(
  Component,
  defaultProps = {},
  customProps = {},
  authValue = {
    isAuthenticated: true,
    loading: false,
    user: { id: 'test-user-id', email: 'test@example.com', username: 'TestUser' },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
  }
) {
  const props = { ...defaultProps, ...customProps };
  const utils = render(
    <AuthProvider value={authValue}>
      <Component {...props} />
    </AuthProvider>
  );
  return { ...utils, props, authValue };
}

/**
 * Component setup with all common providers
 * @param {React.ComponentType} Component - The component to render
 * @param {Object} defaultProps - Default props to provide to the component
 * @param {Object} customProps - Custom props to override defaults
 * @param {Object} options - Options for providers
 * @returns {Object} The rendered component and utility functions
 */
export function setupWithAllProviders(
  Component,
  defaultProps = {},
  customProps = {},
  options = {}
) {
  const {
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

  const props = { ...defaultProps, ...customProps };
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={authValue}>
        <MemoryRouter {...routerOptions}>
          <Component {...props} />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
  return { ...utils, props, queryClient, authValue };
}