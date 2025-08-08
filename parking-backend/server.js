const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { apiLimiter, authLimiter, bookingLimiter } = require("./middleware/rateLimiter");
const { logger } = require("./utils/logger");
const { requestLogger, correlationLogger } = require("./middleware/requestLogger");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Middleware
// Enhanced security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Correlation-ID', 
    'X-Request-ID',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'X-Correlation-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Add request correlation ID and logging
app.use(requestLogger);
app.use(correlationLogger);

app.use(morgan("combined"));

// Apply rate limiting
app.use('/api', apiLimiter);

// Request size limits with better security
app.use(express.json({ 
  limit: process.env.JSON_LIMIT || "5mb",
  verify: (req, res, buf, encoding) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.URLENCODED_LIMIT || "5mb",
  parameterLimit: 100 // Limit number of parameters
}));


// API Info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Parking Management API",
    version: "1.0.0",
    apiVersions: ["v1"],
    currentVersion: "v1",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      locations: "/api/v1/locations", 
      bookings: "/api/v1/bookings",
      admin: "/api/v1/admin",
      payments: "/api/v1/payments"
    },
    documentation: "/api/docs",
    health: "/api/health"
  });
});

// V1 API Routes
const v1Router = express.Router();

// Apply version-specific middleware if needed
v1Router.use('/auth', authLimiter, require('./routes/auth'));
v1Router.use("/users", require("./routes/users")); 
v1Router.use("/admin", require("./routes/admin"));
v1Router.use("/bookings", bookingLimiter, require("./routes/bookings")); 
v1Router.use("/payments", require("./routes/payments"));
v1Router.use('/locations', require('./routes/location'));

// Mount v1 routes
app.use('/api/v1', v1Router);

// Health check routes
app.use('/api/health', require('./routes/health'));

// Legacy routes for backward compatibility (temporarily)
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use("/api/users", require("./routes/users")); 
app.use("/api/admin", require("./routes/admin"));
app.use("/api/bookings", bookingLimiter, require("./routes/bookings")); 
app.use("/api/payments", require("./routes/payments"));
app.use("/api/locations", require("./routes/location"));

// Seed database route - only available in development
if (process.env.NODE_ENV === 'development') {
  const { seedRoute } = require('./utils/seedDatabase');
  app.get('/seed-database', seedRoute);
}


// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Application Error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler - FIXED: Using proper route pattern
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["GET /", "GET /health", "GET /api"],
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB Connected Successfully", {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    });
  } catch (error) {
    logger.error("MongoDB connection error", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        apiUrl: `http://localhost:${PORT}`,
        endpoints: {
          health: `http://localhost:${PORT}/health`,
          api: `http://localhost:${PORT}/api`
        }
      });
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();
