import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // This is critical - tells Axios to send/receive cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🔍 Request Interceptor - Starting request to:', config.url);
    // No longer need to manually add token - it's in the cookie
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Flag to track if we're already refreshing to prevent multiple refreshes
let isRefreshing = false;
let refreshSubscribers = [];

// Add a subscriber to the queue
const subscribeToTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Execute all subscribers when token refresh completes
const onTokenRefreshed = () => {
  refreshSubscribers.forEach(callback => callback());
  refreshSubscribers = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - Status:`, response.status);
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timed out');
    } else if (!error.response) {
      console.error('🌐 Network error:', error);
    } else {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      const originalRequest = error.config;

      console.error(`❌ API Error ${status}:`, message);
      console.error('📝 Full error details:', error.response.data);

      // Skip auth refresh on login page
      const isLoginRequest = originalRequest.url.includes('/auth/login');
      const isRefreshRequest = originalRequest.url.includes('/auth/refresh-token');
      
      // Handle token expiration
      if (status === 401 && !isLoginRequest && !isRefreshRequest && !originalRequest._retry) {
        console.log('🔄 Authentication required, checking if token refresh is needed');
        
        // Mark this request as having been retried already
        originalRequest._retry = true;
        
        // If we're already refreshing, queue this request
        if (isRefreshing) {
          console.log('🔄 Token refresh already in progress, queuing request');
          return new Promise(resolve => {
            subscribeToTokenRefresh(() => {
              resolve(api(originalRequest));
            });
          });
        }
        
        // Set the refreshing flag
        isRefreshing = true;
        
        try {
          // Call the refresh token endpoint
          console.log('🔄 Attempting to refresh token...');
          await api.post('/auth/refresh-token');
          console.log('✅ Token refreshed successfully');
          
          // Reset the flag
          isRefreshing = false;
          
          // Notify all subscribers that the token has been refreshed
          onTokenRefreshed();
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Reset the flag
          isRefreshing = false;
          
          // Clear the subscribers as none of them will be executed
          refreshSubscribers = [];
          
          // Only redirect for auth errors, not for network errors etc.
          if (refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403)) {
            console.log('🔄 Auth error during refresh, redirecting to login page');
            
            // Prevent redirect loops
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          
          return Promise.reject(refreshError);
        }
      }
      
      // Handle other authentication errors
      if ((status === 401 || status === 403) && !isLoginRequest && !originalRequest._retry) {
        console.warn('🚫 Authentication error detected');
        
        // Prevent redirect loops
        if (window.location.pathname !== '/login') {
          console.log('🔄 Redirecting to login page');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;