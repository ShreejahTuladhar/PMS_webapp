const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .trim()
    .escape(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number"),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number")
    .trim(),
];

const loginValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username or email is required")
    .trim()
    .escape(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticateToken, getMe);
router.post("/logout", authenticateToken, logout);

module.exports = router;
