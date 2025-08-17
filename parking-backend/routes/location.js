const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  updateSpaceStatus,
  getLocationStats,
  deleteLocation,
  getPopularLocations,
  getLocationSuggestions,
} = require("../controllers/locationController");

const {
  updateSpaceStatus: spaceUpdate,
  getLocationAvailability,
  bulkUpdateSpaceStatus,
} = require("../controllers/spaceController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createLocationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Location name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim()
    .escape(),

  body("coordinates.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("coordinates.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("totalSpaces")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Total spaces must be between 1 and 10000"),

  body("hourlyRate")
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),

  body("operatingHours.start")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),

  body("operatingHours.end")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),

  body("contactNumber")
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage("Invalid contact number format"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .trim()
    .escape(),
];

const updateLocationValidation = [
  body("name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim()
    .escape(),

  body("coordinates.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("coordinates.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),

  body("operatingHours.start")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),

  body("operatingHours.end")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
];

const updateSpaceStatusValidation = [
  param("id").isMongoId().withMessage("Invalid location ID"),

  param("spaceId")
    .notEmpty()
    .withMessage("Space ID is required")
    .trim()
    .escape(),

  body("status")
    .isIn(["available", "occupied", "maintenance", "reserved"])
    .withMessage(
      "Status must be available, occupied, maintenance, or reserved"
    ),

  body("reason")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Reason cannot exceed 200 characters")
    .trim()
    .escape(),
];

const locationIdValidation = [
  param("id").isMongoId().withMessage("Invalid location ID"),
];

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  query("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  query("maxDistance")
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage("Max distance must be between 100 and 50000 meters"),
];

const suggestionQueryValidation = [
  query("q")
    .notEmpty()
    .withMessage("Query parameter 'q' is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Query must be between 2 and 100 characters")
    .trim(),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Limit must be between 1 and 20"),
];

// Public routes
router.get("/", queryValidation, getLocations);
router.get("/popular", getPopularLocations);
router.get("/search/suggestions", suggestionQueryValidation, getLocationSuggestions);
router.get("/:id", locationIdValidation, getLocationById);
router.get("/:locationId/availability", getLocationAvailability);

// Protected routes - Super Admin only
router.post(
  "/",
  authenticateToken,
  requireRole("super_admin"),
  createLocationValidation,
  createLocation
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("super_admin"),
  locationIdValidation,
  deleteLocation
);

// Protected routes - Super Admin or assigned Parking Admin
router.put(
  "/:id",
  authenticateToken,
  requireRole("super_admin", "parking_admin"),
  locationIdValidation,
  updateLocationValidation,
  updateLocation
);

router.put(
  "/:id/spaces/:spaceId/status",
  authenticateToken,
  requireRole("super_admin", "parking_admin"),
  updateSpaceStatusValidation,
  updateSpaceStatus
);

router.patch(
  "/:locationId/spaces/:spaceId/status",
  authenticateToken,
  requireRole("super_admin", "parking_admin"),
  spaceUpdate
);

router.patch(
  "/:locationId/spaces/bulk-update",
  authenticateToken,
  requireRole("super_admin", "parking_admin"),
  bulkUpdateSpaceStatus
);

router.get(
  "/:id/stats",
  authenticateToken,
  requireRole("super_admin", "parking_admin"),
  locationIdValidation,
  getLocationStats
);

module.exports = router;
