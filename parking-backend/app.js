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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "Parking Management API v1.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      locations: "/api/locations",
      bookings: "/api/bookings",
    },
  });
});

app.use('/api/auth', require('./routes/auth'));
// Add this temporary route for seeding
const { seedRoute } = require('./utils/seedDatabase');
app.get('/seed-database', seedRoute);
app.use("/api/users", require("./routes/users")); 
app.use("/api/admin", require("./routes/admin"));
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