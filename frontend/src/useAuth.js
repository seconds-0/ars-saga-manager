import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from './api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      console.log('🔄 Fetching user data...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found during user fetch');
        logout();
        return;
      }

      console.log('🔍 Token found, fetching user details...');
      const response = await api.get('/auth/me');
      console.log('✅ User data received:', response.data);
      setUser(response.data);
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      console.error('📝 Error details:', error.response?.data);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🔄 Starting logout process...');
    console.log('🗑️ Clearing local storage...');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    console.log('🔓 Resetting auth state...');
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout complete');
  }, []);

  useEffect(() => {
    console.log('🔄 Initializing authentication state...');
    const token = localStorage.getItem('token');
    console.log('🔑 Token state:', token ? 'Token exists' : 'No token found');
    
    if (token) {
      console.log('✅ Valid token found, setting authenticated state');
      setIsAuthenticated(true);
      fetchUser();
    } else {
      console.log('❌ No valid token found');
      setIsAuthenticated(false);
      setIsInitialized(true);
    }
  }, [fetchUser]);

  const login = useCallback((token, userId) => {
    console.log('🔄 Starting login process...', { userId });
    console.log('💾 Storing authentication data...');
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    console.log('🔒 Setting authenticated state...');
    setIsAuthenticated(true);
    console.log('🔄 Fetching user data...');
    fetchUser();
    console.log('✅ Login process complete');
  }, [fetchUser]);

  // Add a loading state
  if (!isInitialized) {
    console.log('⏳ Auth context still initializing...');
    return <div>Loading...</div>;
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}