import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🔍 Request Interceptor - Starting request to:', config.url);
    const token = localStorage.getItem('token');
    console.log('🔑 Token state:', token ? 'Token exists' : 'No token found');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔒 Added auth header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ No token available for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - Status:`, response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timed out');
    } else if (!error.response) {
      console.error('🌐 Network error:', error);
    } else {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      console.error(`❌ API Error ${status}:`, message);
      console.error('📝 Full error details:', error.response.data);

      // Handle authentication errors
      if (status === 401 || status === 403) {
        console.warn('🚫 Authentication error detected');
        console.log('🗑️ Clearing authentication state');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;