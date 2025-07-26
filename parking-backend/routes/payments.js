const express = require("express");
const { body, query } = require("express-validator");
const {
  calculateFee,
  createPayPalPayment,
  executePayPalPayment,
  createESewaPayment,
  verifyESewaPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const calculateFeeValidation = [
  body("locationId").isMongoId().withMessage("Invalid location ID"),

  body("startTime")
    .isISO8601()
    .withMessage("Start time must be a valid ISO date"),

  body("endTime").isISO8601().withMessage("End time must be a valid ISO date"),

  body("spaceType")
    .optional()
    .isIn(["regular", "handicapped", "ev-charging", "reserved"])
    .withMessage("Invalid space type"),
];

const paymentValidation = [
  body("bookingId").isMongoId().withMessage("Valid booking ID is required"),
];

const paypalExecuteValidation = [
  body("paymentId").notEmpty().withMessage("PayPal payment ID is required"),

  body("PayerID").notEmpty().withMessage("PayPal payer ID is required"),

  body("bookingId").isMongoId().withMessage("Valid booking ID is required"),
];

const esewaVerifyValidation = [
  body("bookingId").isMongoId().withMessage("Valid booking ID is required"),

  body("oid").notEmpty().withMessage("eSewa order ID is required"),

  body("amt").isNumeric().withMessage("Amount must be a number"),

  body("refId").notEmpty().withMessage("eSewa reference ID is required"),
];

const paymentHistoryValidation = [
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
    .isIn(["pending", "completed", "failed", "refunded"])
    .withMessage("Invalid payment status"),

  query("method")
    .optional()
    .isIn(["paypal", "esewa", "cash"])
    .withMessage("Invalid payment method"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Payment calculation
router.post("/calculate-fee", calculateFeeValidation, calculateFee);

// PayPal routes
router.post("/paypal/create", paymentValidation, createPayPalPayment);
router.post("/paypal/execute", paypalExecuteValidation, executePayPalPayment);

// eSewa routes
router.post("/esewa/create", paymentValidation, createESewaPayment);
router.post("/esewa/verify", esewaVerifyValidation, verifyESewaPayment);

// Payment history
router.get("/history", paymentHistoryValidation, getPaymentHistory);

module.exports = router;
