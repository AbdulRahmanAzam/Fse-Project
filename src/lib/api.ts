import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401 && window.location.pathname !== '/auth') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth';
    }
    
    return Promise.reject({
      status: response?.status || 500,
      name: response?.data?.error?.name || 'INTERNAL_SERVER_ERROR',
      message: response?.data?.error?.message || 'An unknown error occurred',
      info: response?.data?.error?.info,
      stack: response?.data?.error?.stack,
    });
  }
);

export default api; 