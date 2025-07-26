const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getAllUsers,
  updateUser,
  getDashboardStats,
  getSystemHealth,
} = require("../controllers/adminController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

// Validation rules
const updateUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),

  body("role")
    .optional()
    .isIn(["customer", "parking_admin", "super_admin"])
    .withMessage("Role must be customer, parking_admin, or super_admin"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("assignedLocations")
    .optional()
    .isArray()
    .withMessage("Assigned locations must be an array"),

  body("assignedLocations.*")
    .optional()
    .isMongoId()
    .withMessage("Each assigned location must be a valid location ID"),
];

const userQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("role")
    .optional()
    .isIn(["customer", "parking_admin", "super_admin", "all"])
    .withMessage("Invalid role filter"),

  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "firstName", "lastName", "email", "lastLogin"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

const dashboardQueryValidation = [
  query("period")
    .optional()
    .isIn(["1d", "7d", "30d", "90d"])
    .withMessage("Period must be 1d, 7d, 30d, or 90d"),
];

// Routes

// Dashboard - Available to both Super Admin and Parking Admin
router.get(
  "/dashboard",
  requireRole("super_admin", "parking_admin"),
  dashboardQueryValidation,
  getDashboardStats
);

// User management - Super Admin only
router.get(
  "/users",
  requireRole("super_admin"),
  userQueryValidation,
  getAllUsers
);

router.put(
  "/users/:id",
  requireRole("super_admin"),
  updateUserValidation,
  updateUser
);

// System health - Super Admin only
router.get("/system-health", requireRole("super_admin"), getSystemHealth);

module.exports = router;
