/**
 * 🛡️ API Safety Utilities - Professional Grade Error Handling
 * 
 * These utilities implement defensive programming patterns to prevent
 * runtime errors and improve code reliability.
 * 
 * Author: Your AI Coding Coach
 * Level: Professional/Enterprise
 */

/**
 * Safely extract array data from API response
 * @param {any} response - API response object
 * @param {string} path - Path to array (e.g., 'data.bookings' or 'bookings')
 * @param {Array} defaultValue - Default array to return
 * @returns {Array} Safe array or default
 */
export const safeArray = (response, path = '', defaultValue = []) => {
  try {
    if (!response) return defaultValue;
    
    // Handle direct array
    if (Array.isArray(response)) return response;
    
    // Handle nested path (e.g., 'data.bookings')
    if (path) {
      const keys = path.split('.');
      let current = response;
      
      for (const key of keys) {
        current = current?.[key];
        if (current === undefined || current === null) {
          return defaultValue;
        }
      }
      
      return Array.isArray(current) ? current : defaultValue;
    }
    
    // Common API response patterns
    const possibleArrays = [
      response.data?.bookings,
      response.data?.items,
      response.data?.results,
      response.bookings,
      response.items,
      response.results,
      response.data
    ];
    
    for (const arr of possibleArrays) {
      if (Array.isArray(arr)) return arr;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn('safeArray extraction failed:', error);
    return defaultValue;
  }
};

/**
 * Safely extract object data from API response
 * @param {any} response - API response object
 * @param {string} path - Path to object
 * @param {Object} defaultValue - Default object to return
 * @returns {Object} Safe object or default
 */
export const safeObject = (response, path = '', defaultValue = {}) => {
  try {
    if (!response) return defaultValue;
    
    if (path) {
      const keys = path.split('.');
      let current = response;
      
      for (const key of keys) {
        current = current?.[key];
        if (current === undefined || current === null) {
          return defaultValue;
        }
      }
      
      return typeof current === 'object' && current !== null ? current : defaultValue;
    }
    
    // Try common patterns
    return response.data || response || defaultValue;
  } catch (error) {
    console.warn('safeObject extraction failed:', error);
    return defaultValue;
  }
};

/**
 * Safely extract primitive values
 * @param {any} response - API response
 * @param {string} path - Path to value
 * @param {any} defaultValue - Default value
 * @returns {any} Safe value or default
 */
export const safeValue = (response, path, defaultValue = null) => {
  try {
    if (!response || !path) return defaultValue;
    
    const keys = path.split('.');
    let current = response;
    
    for (const key of keys) {
      current = current?.[key];
      if (current === undefined || current === null) {
        return defaultValue;
      }
    }
    
    return current;
  } catch (error) {
    console.warn('safeValue extraction failed:', error);
    return defaultValue;
  }
};

/**
 * Validate booking object structure
 * @param {Object} booking - Booking object to validate
 * @returns {boolean} True if valid booking
 */
export const isValidBooking = (booking) => {
  if (!booking || typeof booking !== 'object') return false;
  
  const requiredFields = ['_id', 'status'];
  const optionalButCommon = ['startTime', 'endTime', 'locationId', 'userId'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!booking.hasOwnProperty(field)) return false;
  }
  
  // Validate dates if present
  if (booking.startTime && isNaN(new Date(booking.startTime).getTime())) return false;
  if (booking.endTime && isNaN(new Date(booking.endTime).getTime())) return false;
  
  return true;
};

/**
 * Filter valid bookings from array
 * @param {Array} bookings - Array of booking objects
 * @returns {Array} Array of valid bookings only
 */
export const filterValidBookings = (bookings) => {
  return safeArray(bookings).filter(isValidBooking);
};

/**
 * Safe async function wrapper with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {any} fallbackValue - Value to return on error
 * @returns {Function} Wrapped safe async function
 */
export const safeAsync = (asyncFn, fallbackValue = null) => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      console.error('Safe async operation failed:', error);
      return fallbackValue;
    }
  };
};

/**
 * Create type-safe data transformer
 * @param {Object} schema - Expected data structure schema
 * @returns {Function} Data transformer function
 */
export const createSafeTransformer = (schema) => {
  return (data) => {
    const result = {};
    
    for (const [key, config] of Object.entries(schema)) {
      const { path, type, defaultValue } = config;
      const value = safeValue(data, path || key, defaultValue);
      
      // Type coercion
      switch (type) {
        case 'array':
          result[key] = safeArray(value, '', defaultValue || []);
          break;
        case 'number':
          result[key] = Number(value) || defaultValue || 0;
          break;
        case 'string':
          result[key] = String(value || defaultValue || '');
          break;
        case 'boolean':
          result[key] = Boolean(value);
          break;
        default:
          result[key] = value;
      }
    }
    
    return result;
  };
};

// Pre-built transformers for common use cases
export const dashboardDataTransformer = createSafeTransformer({
  recentBookings: { type: 'array', path: 'bookings' },
  totalBookings: { type: 'number', path: 'totalBookings', defaultValue: 0 },
  totalSpent: { type: 'number', path: 'totalSpent', defaultValue: 0 },
  savedAmount: { type: 'number', path: 'savedAmount', defaultValue: 0 },
  loading: { type: 'boolean', defaultValue: false }
});