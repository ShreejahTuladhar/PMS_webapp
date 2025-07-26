const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console for development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = "Duplicate field value entered";

    // Extract field name from error
    if (err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      message = `${field} '${value}' already exists`;
    }

    error = {
      message,
      statusCode: 400,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = {
      message,
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    error = {
      message,
      statusCode: 401,
    };
  }

  // PayPal errors
  if (err.name === "PAYMENT_CREATION_ERROR") {
    const message = "Payment processing failed. Please try again.";
    error = {
      message,
      statusCode: 400,
    };
  }

  // Socket.io errors
  if (err.message && err.message.includes("socket")) {
    const message = "Real-time connection error";
    error = {
      message,
      statusCode: 500,
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = "Too many requests. Please try again later.";
    error = {
      message,
      statusCode: 429,
    };
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large. Maximum size allowed is 5MB.";
    error = {
      message,
      statusCode: 400,
    };
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files uploaded. Maximum 5 files allowed.";
    error = {
      message,
      statusCode: 400,
    };
  }

  // Database connection errors
  if (err.message && err.message.includes("ECONNREFUSED")) {
    const message = "Database connection failed";
    error = {
      message,
      statusCode: 500,
    };
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      originalError: err.message,
    }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = errorHandler;
