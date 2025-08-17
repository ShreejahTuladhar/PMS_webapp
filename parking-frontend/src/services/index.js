// Export all services from a single entry point
export { default as authService } from './authService';
export { default as bookingService } from './bookingService';
export { default as locationService } from './locationService';
export { default as userService } from './userService';
export { default as analyticsService } from './analyticsService';
export { default as api, apiHelpers } from './api';

// Service types for TypeScript (if needed later)
export const ServiceTypes = {
  AUTH: 'auth',
  BOOKING: 'booking', 
  LOCATION: 'location',
};

// Common service utilities
export const serviceUtils = {
  handleServiceResponse: (response) => {
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || 'Service request failed');
    }
  },
  
  formatError: (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  },
  
  retry: async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  },
};