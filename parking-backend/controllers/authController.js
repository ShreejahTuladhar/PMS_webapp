const AuthService = require("../services/authService");
const { validationResult } = require("express-validator");
const { ValidationError, AuthenticationError } = require("../utils/errors");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Create new user
    const user = await AuthService.createUser(req.body);

    // Update last login
    await AuthService.updateLastLogin(user._id);

    // Generate token and send response
    const token = AuthService.generateToken(user._id);
    const userResponse = AuthService.formatUserResponse(user, token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: userResponse.token,
      user: userResponse.user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle custom validation errors
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Validate credentials
    const user = await AuthService.validateCredentials(username, password);

    // Update last login
    await AuthService.updateLastLogin(user._id);

    // Generate token and send response
    const token = AuthService.generateToken(user._id);
    const userResponse = AuthService.formatUserResponse(user, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: userResponse.token,
      user: userResponse.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle custom authentication errors
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const userResponse = AuthService.formatUserResponse(req.user);

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful. Please remove token from client storage.",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
