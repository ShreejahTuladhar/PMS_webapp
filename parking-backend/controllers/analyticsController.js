/**
 * Analytics Controller
 * Provides advanced analytics endpoints for business intelligence
 * Author: Claude & Shreeraj Tuladhar
 */

const advancedDB = require('../services/advancedDatabaseService');
const { validationResult } = require('express-validator');

/**
 * Get comprehensive revenue analytics
 * GET /api/analytics/revenue
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      startDate,
      endDate,
      locationId,
      groupBy = 'day'
    } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (locationId) options.locationId = locationId;
    options.groupBy = groupBy;

    const analytics = await advancedDB.getRevenueAnalytics(options);

    res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get real-time occupancy analytics
 * GET /api/analytics/occupancy
 */
exports.getOccupancyAnalytics = async (req, res) => {
  try {
    const { locationId } = req.query;
    const options = {};
    if (locationId) options.locationId = locationId;

    const analytics = await advancedDB.getOccupancyAnalytics(options);

    res.status(200).json({
      success: true,
      message: 'Occupancy analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Occupancy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve occupancy analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get customer behavior analytics
 * GET /api/analytics/customers
 */
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      limit = 100
    } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    options.limit = parseInt(limit);

    const analytics = await advancedDB.getCustomerAnalytics(options);

    res.status(200).json({
      success: true,
      message: 'Customer analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get demand forecasting
 * GET /api/analytics/forecast
 */
exports.getDemandForecast = async (req, res) => {
  try {
    const {
      locationId,
      forecastDays = 7,
      historicalDays = 30
    } = req.query;

    const options = {};
    if (locationId) options.locationId = locationId;
    options.forecastDays = parseInt(forecastDays);
    options.historicalDays = parseInt(historicalDays);

    const forecast = await advancedDB.getDemandForecast(options);

    res.status(200).json({
      success: true,
      message: 'Demand forecast retrieved successfully',
      data: forecast,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Demand forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve demand forecast',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get database health metrics
 * GET /api/analytics/health
 */
exports.getDatabaseHealth = async (req, res) => {
  try {
    // Only allow super admins to access database health
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const health = await advancedDB.getDatabaseHealth();

    res.status(200).json({
      success: true,
      message: 'Database health retrieved successfully',
      data: health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve database health',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get dashboard summary data
 * GET /api/analytics/dashboard
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const { role } = req.user;
    const { timeframe = '7d' } = req.query;

    // Calculate date range based on timeframe
    const timeframes = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = timeframes[timeframe] || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Get relevant analytics based on user role
    const promises = [
      advancedDB.getRevenueAnalytics({ startDate, endDate, groupBy: 'day' }),
      advancedDB.getOccupancyAnalytics()
    ];

    // Add customer analytics for admin roles
    if (role === 'super_admin' || role === 'parking_admin') {
      promises.push(advancedDB.getCustomerAnalytics({ startDate, endDate, limit: 10 }));
    }

    const results = await Promise.all(promises);
    
    const dashboardData = {
      revenue: results[0],
      occupancy: results[1],
      customers: results[2] || null,
      period: { startDate, endDate, timeframe }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};