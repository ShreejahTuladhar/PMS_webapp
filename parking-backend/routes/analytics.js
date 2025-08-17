/**
 * Analytics Routes
 * Routes for advanced analytics and business intelligence
 * Author: Claude & Shreeraj Tuladhar
 */

const express = require('express');
const { query } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getRevenueAnalytics,
  getOccupancyAnalytics,
  getCustomerAnalytics,
  getDemandForecast,
  getDatabaseHealth,
  getDashboardSummary
} = require('../controllers/analyticsController');

const router = express.Router();

// Validation middleware
const validateDateRange = [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('groupBy').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('GroupBy must be hour, day, week, or month')
];

const validateLocationId = [
  query('locationId').optional().isMongoId().withMessage('Location ID must be valid MongoDB ObjectId')
];

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard summary data
 * @access  Private (All authenticated users)
 */
router.get('/dashboard', [
  query('timeframe').optional().isIn(['1d', '7d', '30d', '90d']).withMessage('Timeframe must be 1d, 7d, 30d, or 90d')
], getDashboardSummary);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private (Admin roles only)
 */
router.get('/revenue', [
  ...validateDateRange,
  ...validateLocationId
], (req, res, next) => {
  // Check admin privileges
  if (req.user.role !== 'super_admin' && req.user.role !== 'parking_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
}, getRevenueAnalytics);

/**
 * @route   GET /api/analytics/occupancy
 * @desc    Get occupancy analytics
 * @access  Private (All authenticated users)
 */
router.get('/occupancy', [
  ...validateLocationId
], getOccupancyAnalytics);

/**
 * @route   GET /api/analytics/customers
 * @desc    Get customer behavior analytics
 * @access  Private (Admin roles only)
 */
router.get('/customers', [
  ...validateDateRange,
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
], (req, res, next) => {
  // Check admin privileges
  if (req.user.role !== 'super_admin' && req.user.role !== 'parking_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
}, getCustomerAnalytics);

/**
 * @route   GET /api/analytics/forecast
 * @desc    Get demand forecasting
 * @access  Private (Admin roles only)
 */
router.get('/forecast', [
  ...validateLocationId,
  query('forecastDays').optional().isInt({ min: 1, max: 30 }).withMessage('Forecast days must be between 1 and 30'),
  query('historicalDays').optional().isInt({ min: 7, max: 365 }).withMessage('Historical days must be between 7 and 365')
], (req, res, next) => {
  // Check admin privileges
  if (req.user.role !== 'super_admin' && req.user.role !== 'parking_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
}, getDemandForecast);

/**
 * @route   GET /api/analytics/health
 * @desc    Get database health metrics
 * @access  Private (Super admin only)
 */
router.get('/health', getDatabaseHealth);

module.exports = router;