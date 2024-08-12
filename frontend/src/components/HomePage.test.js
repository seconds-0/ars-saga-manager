import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../useAuth';
import HomePage from './HomePage';

const queryClient = new QueryClient();

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <HomePage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    const welcomeMessage = screen.getByText(/Welcome to Ars Saga Manager/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});