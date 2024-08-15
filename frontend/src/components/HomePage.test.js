import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../useAuth';
import HomePage from './HomePage';

jest.mock('../useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: true, user: { name: 'Test User' } }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderHomePage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders welcome message', async () => {
    renderHomePage();
    await waitFor(() => {
      const welcomeMessage = screen.getByText(/Welcome to Ars Saga Manager/i);
      expect(welcomeMessage).toBeInTheDocument();
    });
  });

  it('renders with correct test id', async () => {
    renderHomePage();
    await waitFor(() => {
      const homePageElement = screen.getByTestId('home-page');
      expect(homePageElement).toBeInTheDocument();
    });
  });

  // Add more test cases as needed, for example:
  // it('displays user name when authenticated', async () => {
  //   renderHomePage();
  //   await waitFor(() => {
  //     expect(screen.getByText(/Test User/)).toBeInTheDocument();
  //   });
  // });
});