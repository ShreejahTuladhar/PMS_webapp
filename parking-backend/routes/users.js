const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getProfile,
  updateProfile,
  addVehicle,
  updateVehicle,
  removeVehicle,
  getUserBookings,
  changePassword,
  getUserStats,
  getUserVehicles,
  getTransactionHistory,
  getFavoriteLocations,
  addFavoriteLocation,
  removeFavoriteLocation,
  exportUserData,
  updatePreferences,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("phoneNumber")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage("Invalid phone number format")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Gender must be male, female, other, or prefer_not_to_say"),

  body("address")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim(),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters")
    .trim(),

  body("emergencyContact.name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Emergency contact name cannot exceed 100 characters")
    .trim(),

  body("emergencyContact.phoneNumber")
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage("Invalid emergency contact phone number format")
    .trim(),

  body("emergencyContact.relationship")
    .optional()
    .isIn(["spouse", "parent", "sibling", "child", "friend", "other"])
    .withMessage("Relationship must be spouse, parent, sibling, child, friend, or other"),
];

const addVehicleValidation = [
  body("plateNumber")
    .notEmpty()
    .withMessage("Plate number is required")
    .isLength({ min: 2, max: 15 })
    .withMessage("Plate number must be between 2 and 15 characters")
    .matches(/^[A-Z0-9\s\-]+$/i)
    .withMessage(
      "Plate number can only contain letters, numbers, spaces, and hyphens"
    )
    .trim()
    .escape(),

  body("vehicleType")
    .isIn(["car", "motorcycle", "bus", "truck"])
    .withMessage("Vehicle type must be car, motorcycle, bus, or truck"),

  body("make")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Make cannot exceed 50 characters")
    .trim()
    .escape(),

  body("model")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Model cannot exceed 50 characters")
    .trim()
    .escape(),
];

const updateVehicleValidation = [
  param("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),

  body("plateNumber")
    .optional()
    .isLength({ min: 2, max: 15 })
    .withMessage("Plate number must be between 2 and 15 characters")
    .matches(/^[A-Z0-9\s\-]+$/i)
    .withMessage(
      "Plate number can only contain letters, numbers, spaces, and hyphens"
    )
    .trim()
    .escape(),

  body("vehicleType")
    .optional()
    .isIn(["car", "motorcycle", "bus", "truck"])
    .withMessage("Vehicle type must be car, motorcycle, bus, or truck"),

  body("make")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Make cannot exceed 50 characters")
    .trim()
    .escape(),

  body("model")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Model cannot exceed 50 characters")
    .trim()
    .escape(),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one letter and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),
];

const vehicleIdValidation = [
  param("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),
];

const bookingQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "expired",
    ])
    .withMessage("Invalid booking status"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  query("locationId").optional().isMongoId().withMessage("Invalid location ID"),
];

// Routes - All require authentication
router.use(authenticateToken);

// Dashboard statistics
router.get("/stats", getUserStats);

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, updateProfile);

// Vehicle management
router.get("/vehicles", getUserVehicles);
router.post("/vehicles", addVehicleValidation, addVehicle);
router.put("/vehicles/:vehicleId", updateVehicleValidation, updateVehicle);
router.delete("/vehicles/:vehicleId", vehicleIdValidation, removeVehicle);

// Booking history
router.get("/bookings", bookingQueryValidation, getUserBookings);

// Transaction history
router.get("/transactions", getTransactionHistory);

// Favorite locations
router.get("/favorites", getFavoriteLocations);
router.post("/favorites", addFavoriteLocation);
router.delete("/favorites/:locationId", removeFavoriteLocation);

// Data export
router.get("/export", exportUserData);

// Preferences
router.put("/preferences", updatePreferences);

// Password management
router.put("/change-password", changePasswordValidation, changePassword);

module.exports = router;
