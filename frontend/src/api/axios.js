import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000, // 5 seconds timeout
});

instance.interceptors.request.use(
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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.log('Request timed out. Please try again later.');
    } else if (!error.response) {
      console.log('Unable to connect to the server. Please check your internet connection or try again later.');
    } else {
      console.log('An error occurred:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;