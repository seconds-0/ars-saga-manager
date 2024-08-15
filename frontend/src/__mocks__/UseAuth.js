import React from 'react';

const mockUseAuth = jest.fn();

// Default to unauthenticated state
mockUseAuth.mockReturnValue({
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn()
});

const AuthProvider = ({ children }) => <>{children}</>;

export { mockUseAuth as useAuth, AuthProvider };

// Helper function to set the mock authentication state
export const setMockAuthState = (isAuthenticated, user = null) => {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user,
    login: jest.fn(),
    logout: jest.fn()
  });
};