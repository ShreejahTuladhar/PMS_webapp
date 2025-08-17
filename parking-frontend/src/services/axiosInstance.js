import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "../store/authSlice";
import { store } from "../redux/store";

// Helper function to generate correlation ID
const generateCorrelationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

// Create axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    
    // Add timestamp for request timing
    config.metadata = { startTime: new Date() };
    
    // Add authentication token
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Token is expired, remove it and redirect
      localStorage.removeItem("token");
      store.dispatch(logout());
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    // Log response time for performance monitoring
    if (response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      if (duration > 5000) { // Log slow requests (>5s)
        console.warn(`Slow API request detected: ${response.config.url} took ${duration}ms`);
      }
    }
    
    return response;
  },
  (error) => {
    // Enhanced error handling
    const { response, request, config } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          store.dispatch(logout());
          if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message || 'Insufficient permissions');
          break;
          
        case 404:
          console.error('Resource not found:', config?.url);
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', data.errors || data.message);
          break;
          
        case 429:
          // Rate limited
          console.error('Rate limited. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error:', data.message || 'Internal server error');
          break;
          
        default:
          console.error(`HTTP ${status}:`, data.message || 'Unknown error');
      }
      
      // Attach user-friendly error message
      error.userMessage = data.message || getDefaultErrorMessage(status);
      
    } else if (request) {
      // Request was made but no response received (network error)
      console.error('Network error:', error.message);
      error.userMessage = 'Network connection failed. Please check your internet connection.';
      
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get default error messages
const getDefaultErrorMessage = (status) => {
  const messages = {
    400: 'Bad request. Please check your input.',
    401: 'You need to log in to access this resource.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    422: 'Please check your input and try again.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    502: 'Server is temporarily unavailable.',
    503: 'Service temporarily unavailable.',
    504: 'Request timeout. Please try again.',
  };
  
  return messages[status] || 'An unexpected error occurred.';
};

// Helper function for making API calls with better error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.userMessage || error.message,
      originalError: error 
    };
  }
};

export default API;
