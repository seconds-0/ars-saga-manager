import React from 'react';

const mockUseAuth = jest.fn(() => ({
  isAuthenticated: true,
  user: { id: '1', username: 'testuser' },
  login: jest.fn(),
  logout: jest.fn(),
  // Add other methods as needed
}));

const AuthProvider = ({ children }) => <>{children}</>;

export { mockUseAuth as useAuth, AuthProvider };