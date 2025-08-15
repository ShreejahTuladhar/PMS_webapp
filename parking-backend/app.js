const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration - allow multiple frontend ports in development
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost origins
      if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "Parking Management API v1.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      admin: "/api/admin",
      superAdmin: "/api/super-admin",
      locations: "/api/locations",
      bookings: "/api/bookings",
      payments: "/api/payments",
    },
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/setup', require('./routes/setup')); // REMOVE IN PRODUCTION
// Add this temporary route for seeding
const { seedRoute } = require('./utils/seedDatabase');
app.get('/seed-database', seedRoute);
app.use("/api/users", require("./routes/users")); 
app.use("/api/admin", require("./routes/admin"));
app.use("/api/super-admin", require("./routes/superAdmin"));
app.use("/api/bookings", require("./routes/bookings")); 
app.use("/api/payments", require("./routes/payments"));
app.use("/api/locations", require("./routes/location"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["GET /", "GET /health", "GET /api"],
  });
});

module.exports = app;