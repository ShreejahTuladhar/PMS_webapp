const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Middleware to add correlation ID and request logging
const requestLogger = (req, res, next) => {
  // Generate or extract correlation ID
  req.correlationId = req.headers['x-correlation-id'] || 
                     req.headers['x-request-id'] || 
                     uuidv4();

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', req.correlationId);

  // Create request metadata
  const requestMeta = {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
    ...(req.user && { userId: req.user.id, userRole: req.user.role })
  };

  // Log request start
  logger.info('HTTP Request Started', requestMeta);

  // Store start time for response time calculation
  const startTime = Date.now();

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    
    const responseMeta = {
      ...requestMeta,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length') || 0
    };

    // Log response (without sensitive data)
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Completed with Error', {
        ...responseMeta,
        error: body.message || body.error || 'Unknown error'
      });
    } else {
      logger.info('HTTP Request Completed', responseMeta);
    }

    // Call original json method
    return originalJson.call(this, body);
  };

  // Override res.send to log response for non-JSON responses
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    const responseMeta = {
      ...requestMeta,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: body ? body.length : 0
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Completed with Error', {
        ...responseMeta,
        error: typeof body === 'string' ? body : 'Unknown error'
      });
    } else {
      logger.info('HTTP Request Completed', responseMeta);
    }

    return originalSend.call(this, body);
  };

  // Handle uncaught response end
  res.on('finish', () => {
    if (!res.headersSent) return;
    
    const responseTime = Date.now() - startTime;
    const responseMeta = {
      ...requestMeta,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Finished with Error', responseMeta);
    } else {
      logger.info('HTTP Request Finished', responseMeta);
    }
  });

  next();
};

// Middleware to add correlation ID to logger context
const correlationLogger = (req, res, next) => {
  // Create a child logger with correlation ID
  req.logger = logger.child({ 
    correlationId: req.correlationId,
    userId: req.user?.id,
    userRole: req.user?.role
  });

  next();
};

module.exports = {
  requestLogger,
  correlationLogger
};