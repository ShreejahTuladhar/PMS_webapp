const { body, param, query, validationResult } = require("express-validator");

// Generic validation result checker
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Common validation rules
const validationRules = {
  // Email validation
  email: body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  // Password validation
  password: body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number"),

  // Name validation
  firstName: body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces")
    .trim()
    .escape(),

  lastName: body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces")
    .trim()
    .escape(),

  // Username validation
  username: body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .trim()
    .escape(),

  // Phone number validation (Nepal format)
  phoneNumber: body("phoneNumber")
    .matches(/^(\+977[-\s]?)?[9][6-9]\d{8}$/)
    .withMessage("Please provide a valid Nepali phone number")
    .trim(),

  // International phone number validation
  phoneNumberIntl: body("phoneNumber")
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits")
    .trim(),

  // Vehicle plate number validation (Nepal format)
  plateNumber: body("vehicleInfo.plateNumber")
    .matches(/^[A-Z]{2}\s?\d{1,4}\s?[A-Z]{0,3}$/)
    .withMessage(
      "Please provide a valid Nepali vehicle plate number (e.g., BA 1234 PA)"
    )
    .trim()
    .escape(),

  // International plate number validation
  plateNumberIntl: body("vehicleInfo.plateNumber")
    .isLength({ min: 2, max: 15 })
    .withMessage("Plate number must be between 2 and 15 characters")
    .matches(/^[A-Z0-9\s\-]+$/i)
    .withMessage(
      "Plate number can only contain letters, numbers, spaces, and hyphens"
    )
    .trim()
    .escape(),

  // Vehicle type validation
  vehicleType: body("vehicleInfo.vehicleType")
    .isIn(["car", "motorcycle", "bus", "truck"])
    .withMessage("Vehicle type must be car, motorcycle, bus, or truck"),

  // MongoDB ObjectId validation
  mongoId: (field) =>
    param(field).isMongoId().withMessage(`Invalid ${field} format`),

  // Date validation
  futureDate: (field) =>
    body(field)
      .isISO8601()
      .withMessage(`${field} must be a valid date`)
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error(`${field} must be in the future`);
        }
        return true;
      }),

  // Date range validation
  dateRange: (startField, endField) => [
    body(startField)
      .isISO8601()
      .withMessage(`${startField} must be a valid date`),
    body(endField)
      .isISO8601()
      .withMessage(`${endField} must be a valid date`)
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body[startField])) {
          throw new Error(`${endField} must be after ${startField}`);
        }
        return true;
      }),
  ],

  // Coordinates validation
  latitude: body("coordinates.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  longitude: body("coordinates.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  // Price validation
  price: (field) =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`)
      .toFloat(),

  // Pagination validation
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
  ],

  // Time format validation (HH:MM)
  timeFormat: (field) =>
    body(field)
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(`${field} must be in HH:MM format`),

  // Payment method validation
  paymentMethod: body("paymentMethod")
    .isIn(["paypal", "esewa", "cash", "card"])
    .withMessage("Payment method must be paypal, esewa, cash, or card"),

  // Booking status validation
  bookingStatus: body("status")
    .isIn([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "expired",
    ])
    .withMessage("Invalid booking status"),

  // Space status validation
  spaceStatus: body("status")
    .isIn(["available", "occupied", "maintenance", "reserved"])
    .withMessage(
      "Space status must be available, occupied, maintenance, or reserved"
    ),

  // Role validation
  userRole: body("role")
    .isIn(["customer", "parking_admin", "super_admin"])
    .withMessage("Role must be customer, parking_admin, or super_admin"),

  // File validation
  fileUpload: (field, maxSize = 5) =>
    body(field).custom((value, { req }) => {
      if (!req.file) {
        throw new Error(`${field} is required`);
      }
      if (req.file.size > maxSize * 1024 * 1024) {
        throw new Error(`${field} must be less than ${maxSize}MB`);
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(`${field} must be a valid image file (JPEG, PNG, GIF)`);
      }
      return true;
    }),
};

// Pre-built validation chains
const validationChains = {
  // User registration
  userRegistration: [
    validationRules.username,
    validationRules.email,
    validationRules.password,
    validationRules.firstName,
    validationRules.lastName,
    validationRules.phoneNumberIntl,
    checkValidationResult,
  ],

  // User login
  userLogin: [
    body("username")
      .notEmpty()
      .withMessage("Username or email is required")
      .trim()
      .escape(),
    body("password").notEmpty().withMessage("Password is required"),
    checkValidationResult,
  ],

  // Vehicle addition
  addVehicle: [
    validationRules.plateNumberIntl,
    validationRules.vehicleType,
    body("vehicleInfo.make")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Make cannot exceed 50 characters")
      .trim()
      .escape(),
    body("vehicleInfo.model")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Model cannot exceed 50 characters")
      .trim()
      .escape(),
    checkValidationResult,
  ],

  // Location creation
  createLocation: [
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
    validationRules.latitude,
    validationRules.longitude,
    body("totalSpaces")
      .isInt({ min: 1, max: 10000 })
      .withMessage("Total spaces must be between 1 and 10000"),
    validationRules.price("hourlyRate"),
    validationRules.timeFormat("operatingHours.start"),
    validationRules.timeFormat("operatingHours.end"),
    checkValidationResult,
  ],

  // Booking creation
  createBooking: [
    validationRules.mongoId("locationId"),
    body("spaceId")
      .notEmpty()
      .withMessage("Space ID is required")
      .trim()
      .escape(),
    validationRules.plateNumberIntl,
    validationRules.vehicleType,
    validationRules.futureDate("startTime"),
    validationRules.dateRange("startTime", "endTime")[1], // Only end time validation
    validationRules.paymentMethod,
    checkValidationResult,
  ],
};

module.exports = {
  checkValidationResult,
  validationRules,
  validationChains,
};
