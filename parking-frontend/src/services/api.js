import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(` ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      // Token expired or unauthorized
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login or show auth modal
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        toast.error('Session expired. Please login again.');
        return Promise.reject(new Error('Session expired'));
      }
      
      // Handle other HTTP errors
      const errorMessage = data?.message || data?.error || `HTTP Error ${status}`;
      
      switch (status) {
        case 400:
          toast.error('Invalid request: ' + errorMessage);
          break;
        case 403:
          toast.error('Access denied: ' + errorMessage);
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 409:
          toast.error('Conflict: ' + errorMessage);
          break;
        case 422:
          // Validation errors - don't show toast, let form handle it
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error('An error occurred: ' + errorMessage);
      }
      
      console.error(`❌ ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
        status,
        data,
        error: errorMessage,
      });
      
      // Return structured error
      return Promise.reject({
        message: errorMessage,
        status,
        data,
        originalError: error,
      });
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      toast.error('Request failed: ' + error.message);
      return Promise.reject(error);
    }
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'GET request failed' };
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'POST request failed' };
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'PUT request failed' };
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'PATCH request failed' };
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'DELETE request failed' };
    }
  },
};

export default api;