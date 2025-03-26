import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './useAuth';
import api from './api/axios';

// Mock api
jest.mock('./api/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Test component that uses the useAuth hook
function TestComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'No User'}</div>
      <button data-testid="login-button" onClick={() => login('123')}>Login</button>
      <button data-testid="logout-button" onClick={logout}>Logout</button>
    </div>
  );
}

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockReset();
    api.post.mockReset();
  });

  test('initializes with unauthenticated state', async () => {
    api.get.mockRejectedValueOnce(new Error('Unauthorized'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-data')).toHaveTextContent('No User');
    });
  });

  test('fetchUser sets authenticated state when API call succeeds', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    api.get.mockResolvedValueOnce({ data: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  test('login function sets authenticated state and calls fetchUser', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    api.get.mockRejectedValueOnce(new Error('Unauthorized')); // First call fails (initialization)
    api.get.mockResolvedValueOnce({ data: mockUser }); // Second call succeeds (after login)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    
    // Click login button
    act(() => {
      screen.getByTestId('login-button').click();
    });
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  test('logout function clears authentication state and calls API', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    api.get.mockResolvedValueOnce({ data: mockUser }); // Initial load succeeds
    api.post.mockResolvedValueOnce({ data: { message: 'Logged out successfully' } });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Click logout button
    act(() => {
      screen.getByTestId('logout-button').click();
    });
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-data')).toHaveTextContent('No User');
    });
  });
});