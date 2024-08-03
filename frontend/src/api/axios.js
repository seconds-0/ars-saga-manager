import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Please try again later.');
    } else if (!error.response) {
      console.error('Unable to connect to the server. Please check your internet connection or try again later.');
    } else {
      const status = error.response.status;
      const message = error.response.data.message || error.message;

      console.error(`Error ${status}:`, message);
      console.error('Full error response:', error.response.data);

      switch (status) {
        case 400:
          console.error('Bad request:', message);
          break;
        case 401:
          console.error('Unauthorized:', message);
          // Optionally, you can redirect to login page or clear local storage
          break;
        case 404:
          console.error('Not found:', message);
          break;
        case 500:
          console.error('Internal server error:', message);
          break;
        default:
          console.error(`An error occurred (${status}):`, message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;