import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './useAuth';
import App from './App';
import * as authHook from './useAuth';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }))
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui, { route = '/' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

jest.setTimeout(10000); // Increase global timeout to 10 seconds

test('renders login page when not authenticated', async () => {
  jest.spyOn(authHook, 'useAuth').mockImplementation(() => ({
    isAuthenticated: false,
  }));

  await act(async () => {
    renderWithProviders(<App />);
  });

  expect(await screen.findByTestId('login-page')).toBeInTheDocument();
  expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
});

test('renders home page when authenticated', async () => {
  jest.spyOn(authHook, 'useAuth').mockImplementation(() => ({
    isAuthenticated: true,
  }));

  await act(async () => {
    renderWithProviders(<App />);
  });

  expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
});