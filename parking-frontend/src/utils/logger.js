/**
 * 🔍 Professional Logging System
 * 
 * Inspired by the Pentium Chronicles - where every crash taught valuable lessons.
 * This logger respects the debugging process while maintaining production excellence.
 * 
 * Root Cause Solution: Replace scattered console statements with systematic logging
 * 
 * Author: Partnership between Human Intuition and AI Systematic Analysis
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  TRACE: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class ProfessionalLogger {
  constructor() {
    // Production level based on environment
    this.currentLevel = process.env.NODE_ENV === 'production' 
      ? LOG_LEVELS.WARN 
      : LOG_LEVELS.DEBUG;
      
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return Math.random().toString(36).substring(7);
  }

  getTimestamp() {
    const elapsed = Date.now() - this.startTime;
    return `[+${elapsed}ms]`;
  }

  formatMessage(level, component, message, data = null) {
    const timestamp = new Date().toISOString();
    const sessionInfo = `[Session:${this.sessionId}]`;
    const timing = this.getTimestamp();
    
    const prefix = `${timestamp} ${timing} ${sessionInfo} [${level}] [${component}]`;
    
    return {
      prefix,
      message,
      data,
      fullMessage: data 
        ? `${prefix} ${message}`
        : `${prefix} ${message}`
    };
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.currentLevel;
  }

  log(level, component, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, component, message, data);
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.RESET;

    // Console output with colors (development)
    if (process.env.NODE_ENV !== 'production') {
      if (data) {
        console.log(`${color}${formatted.fullMessage}${reset}`, data);
      } else {
        console.log(`${color}${formatted.fullMessage}${reset}`);
      }
    }

    // Production logging (could be sent to external service)
    if (process.env.NODE_ENV === 'production' && level === 'ERROR') {
      this.sendToExternalLogger(formatted);
    }

    return formatted;
  }

  error(component, message, error = null) {
    return this.log('ERROR', component, message, error);
  }

  warn(component, message, data = null) {
    return this.log('WARN', component, message, data);
  }

  info(component, message, data = null) {
    return this.log('INFO', component, message, data);
  }

  debug(component, message, data = null) {
    return this.log('DEBUG', component, message, data);
  }

  trace(component, message, data = null) {
    return this.log('TRACE', component, message, data);
  }

  // API call logging
  apiCall(component, method, url, data = null) {
    return this.debug(component, `API ${method} ${url}`, data);
  }

  apiResponse(component, method, url, status, data = null) {
    const message = `API ${method} ${url} -> ${status}`;
    if (status >= 400) {
      return this.error(component, message, data);
    } else if (status >= 300) {
      return this.warn(component, message, data);
    } else {
      return this.debug(component, message, data);
    }
  }

  // Navigation tracking
  navigation(component, from, to, data = null) {
    return this.info(component, `Navigation: ${from} -> ${to}`, data);
  }

  // User interaction tracking
  userAction(component, action, data = null) {
    return this.info(component, `User Action: ${action}`, data);
  }

  // Performance monitoring
  performance(component, operation, timeMs, data = null) {
    const message = `Performance: ${operation} took ${timeMs}ms`;
    if (timeMs > 1000) {
      return this.warn(component, message, data);
    } else {
      return this.debug(component, message, data);
    }
  }

  // GPS and location logging
  gpsEvent(component, event, data = null) {
    return this.info(component, `GPS: ${event}`, data);
  }

  // Booking system logging
  bookingEvent(component, event, bookingId = null, data = null) {
    const message = bookingId 
      ? `Booking[${bookingId}]: ${event}`
      : `Booking: ${event}`;
    return this.info(component, message, data);
  }

  // Security events
  securityEvent(component, event, data = null) {
    return this.warn(component, `Security: ${event}`, data);
  }

  // External service integration (future enhancement)
  sendToExternalLogger(logEntry) {
    // TODO: Implement external logging service
    // Could be Sentry, LogRocket, or custom service
    console.error('PRODUCTION ERROR:', logEntry);
  }

  // Method to replace all console.log calls
  replaceLegacyLogging() {
    if (process.env.NODE_ENV === 'development') {
      const originalConsole = { ...console };
      
      console.log = (...args) => {
        this.debug('LEGACY', 'console.log called', args);
        originalConsole.log(...args);
      };

      console.error = (...args) => {
        this.error('LEGACY', 'console.error called', args);
        originalConsole.error(...args);
      };

      console.warn = (...args) => {
        this.warn('LEGACY', 'console.warn called', args);
        originalConsole.warn(...args);
      };
    }
  }
}

// Create singleton instance
const logger = new ProfessionalLogger();

// Export convenient methods
export const logError = (component, message, error) => logger.error(component, message, error);
export const logWarn = (component, message, data) => logger.warn(component, message, data);
export const logInfo = (component, message, data) => logger.info(component, message, data);
export const logDebug = (component, message, data) => logger.debug(component, message, data);
export const logTrace = (component, message, data) => logger.trace(component, message, data);

export const logApiCall = (component, method, url, data) => logger.apiCall(component, method, url, data);
export const logApiResponse = (component, method, url, status, data) => logger.apiResponse(component, method, url, status, data);

export const logNavigation = (component, from, to, data) => logger.navigation(component, from, to, data);
export const logUserAction = (component, action, data) => logger.userAction(component, action, data);
export const logPerformance = (component, operation, timeMs, data) => logger.performance(component, operation, timeMs, data);

export const logGpsEvent = (component, event, data) => logger.gpsEvent(component, event, data);
export const logBookingEvent = (component, event, bookingId, data) => logger.bookingEvent(component, event, bookingId, data);
export const logSecurityEvent = (component, event, data) => logger.securityEvent(component, event, data);

export default logger;

/**
 * Usage Examples (replacing scattered console statements):
 * 
 * // Instead of: console.log('GPS location updated:', location)
 * logGpsEvent('GPSTracker', 'location_updated', { lat: location.lat, lng: location.lng });
 * 
 * // Instead of: console.error('Booking failed:', error)
 * logError('BookingService', 'booking_creation_failed', error);
 * 
 * // Instead of: console.log('User clicked book button')
 * logUserAction('BookingModal', 'book_button_clicked');
 * 
 * // API calls:
 * logApiCall('BookingService', 'POST', '/api/bookings', requestData);
 * logApiResponse('BookingService', 'POST', '/api/bookings', 201, responseData);
 */