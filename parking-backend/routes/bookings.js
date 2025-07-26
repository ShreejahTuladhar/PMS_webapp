const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  extendBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body("locationId").isMongoId().withMessage("Invalid location ID"),

  body("spaceId")
    .notEmpty()
    .withMessage("Space ID is required")
    .trim()
    .escape(),

  body("vehicleInfo.plateNumber")
    .notEmpty()
    .withMessage("Vehicle plate number is required")
    .isLength({ min: 2, max: 15 })
    .withMessage("Plate number must be between 2 and 15 characters")
    .trim()
    .escape(),

  body("vehicleInfo.vehicleType")
    .isIn(["car", "motorcycle", "bus", "truck"])
    .withMessage("Invalid vehicle type"),

  body("startTime")
    .isISO8601()
    .withMessage("Start time must be a valid ISO date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Start time must be in the future");
      }
      return true;
    }),

  body("endTime")
    .isISO8601()
    .withMessage("End time must be a valid ISO date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("paymentMethod")
    .isIn(["paypal", "esewa", "cash"])
    .withMessage("Payment method must be paypal, esewa, or cash"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters")
    .trim()
    .escape(),
];

const updateBookingStatusValidation = [
  param("id").isMongoId().withMessage("Invalid booking ID"),

  body("action")
    .isIn(["checkin", "checkout"])
    .withMessage("Action must be checkin or checkout"),

  body("qrCode")
    .optional()
    .notEmpty()
    .withMessage("QR code cannot be empty if provided"),
];

const cancelBookingValidation = [
  param("id").isMongoId().withMessage("Invalid booking ID"),

  body("reason")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Reason cannot exceed 200 characters")
    .trim()
    .escape(),
];

const extendBookingValidation = [
  param("id").isMongoId().withMessage("Invalid booking ID"),

  body("newEndTime")
    .isISO8601()
    .withMessage("New end time must be a valid ISO date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("New end time must be in the future");
      }
      return true;
    }),
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

  query("locationId").optional().isMongoId().withMessage("Invalid location ID"),

  query("userId").optional().isMongoId().withMessage("Invalid user ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  query("paymentStatus")
    .optional()
    .isIn(["pending", "completed", "failed", "refunded"])
    .withMessage("Invalid payment status"),
];

const availableSlotsValidation = [
  query("locationId").isMongoId().withMessage("Valid location ID is required"),

  query("spaceId")
    .notEmpty()
    .withMessage("Space ID is required")
    .trim()
    .escape(),

  query("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO date")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        throw new Error("Date cannot be in the past");
      }
      return true;
    }),
];

const bookingIdValidation = [
  param("id").isMongoId().withMessage("Invalid booking ID"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Public booking routes (for customers)
router.post("/", createBookingValidation, createBooking);
router.get("/", bookingQueryValidation, getBookings);
router.get("/available-slots", availableSlotsValidation, getAvailableSlots);
router.get("/:id", bookingIdValidation, getBookingById);

// Customer booking management
router.put("/:id/status", updateBookingStatusValidation, updateBookingStatus);
router.put("/:id/cancel", cancelBookingValidation, cancelBooking);
router.put("/:id/extend", extendBookingValidation, extendBooking);

module.exports = router;
