const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Listen for connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    logger.error("Database connection failed", { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
};

module.exports = connectDB;
