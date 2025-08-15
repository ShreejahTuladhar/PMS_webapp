const mongoose = require("mongoose");
const app = require("./app");
const systemHealthService = require("./services/systemHealthService");

const PORT = process.env.PORT || 5000;

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
      
      // Start system health monitoring
      console.log("Starting system health monitoring...");
      systemHealthService.startMonitoring(30000); // Monitor every 30 seconds
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  systemHealthService.stopMonitoring();
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  systemHealthService.stopMonitoring();
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});
