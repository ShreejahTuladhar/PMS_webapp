const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

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


// API routes (will be added later)
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
// app.use('/api/locations', require('./routes/locations'));


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
    console.log("MongoDB Connected Successfully");
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(
      `Host: ${mongoose.connection.host}:${mongoose.connection.port}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`API Info: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
