import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from './api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Special case handling for login page
  const isLoginPage = window.location.pathname === '/login';

  const fetchUser = useCallback(async () => {
    if (isLoginPage) {
      console.log('👋 On login page, no need to fetch user data');
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user data...');
      setIsLoading(true);
      // No need to check for token - the cookie is automatically sent
      console.log('🔍 Fetching user details...');
      const response = await api.get('/auth/me');
      console.log('✅ User data received:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      console.error('📝 Error details:', error.response?.data);
      setIsAuthenticated(false);
      setUser(null);
      
      // If we're not on the login page and get an auth error, redirect to login
      if (error.response?.status === 401 && !isLoginPage) {
        console.log('🔄 Authentication failed, redirecting to login');
        window.location.href = '/login';
      }
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [isLoginPage]);

  const logout = useCallback(async () => {
    console.log('🔄 Starting logout process...');
    try {
      // Call the logout endpoint to clear the cookie
      await api.post('/auth/logout');
      console.log('✅ Successfully called logout endpoint');
    } catch (error) {
      console.error('❌ Error during logout API call:', error);
    }
    console.log('🔓 Resetting auth state...');
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout complete');
    
    // Redirect to login page after logout
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    console.log('🔄 Initializing authentication state...');
    // Initialize auth state only once
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, remove fetchUser from deps

  const login = useCallback((userId) => {
    console.log('🔄 Starting login process...', { userId });
    console.log('🔒 Setting authenticated state...');
    setIsAuthenticated(true);
    setUser({ id: userId });
    console.log('✅ Login process complete');
    // Redirect to home page after login
    window.location.href = '/home';
  }, []);

  // Add a loading state
  if (!isInitialized && isLoading) {
    console.log('⏳ Auth context still initializing...');
    
    // Show a simple loading spinner
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading...</p>
      </div>
    </div>;
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