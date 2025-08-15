const User = require("../models/User");
const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");
const Violation = require("../models/Violation");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// @desc    Get comprehensive system statistics for super admin
// @route   GET /api/super-admin/system-stats
// @access  Private (Super Admin only)
const getSystemStats = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "24h":
        startDate.setHours(endDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get comprehensive statistics
    const [
      userStats,
      locationStats,
      bookingStats,
      revenueStats,
      violationStats
    ] = await Promise.all([
      getUserStatistics(startDate, endDate),
      getLocationStatistics(startDate, endDate),
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getViolationStatistics(startDate, endDate)
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        userStats,
        locationStats,
        bookingStats,
        revenueStats,
        violationStats,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system statistics",
      error: error.message
    });
  }
};

// @desc    Get real-time system metrics
// @route   GET /api/super-admin/real-time-metrics
// @access  Private (Super Admin only)
const getRealTimeMetrics = async (req, res) => {
  try {
    // Get real-time statistics
    const [
      activeBookings,
      todayRevenue,
      onlineUsers,
      systemHealth
    ] = await Promise.all([
      getActiveBookingsCount(),
      getTodayRevenue(),
      getOnlineUsersCount(),
      getSystemHealthMetrics()
    ]);

    const metrics = {
      realTimeStats: {
        activeBookings,
        todayRevenue,
        onlineUsers,
        timestamp: new Date()
      },
      performanceMetrics: await getPerformanceMetrics(),
      databaseMetrics: await getDatabaseMetrics(),
      serverMetrics: systemHealth
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Get real-time metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching real-time metrics",
      error: error.message
    });
  }
};

// @desc    Get user statistics for super admin
// @route   GET /api/super-admin/user-stats
// @access  Private (Super Admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await getUserStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message
    });
  }
};

// @desc    Get location statistics for super admin
// @route   GET /api/super-admin/location-stats
// @access  Private (Super Admin only)
const getLocationStats = async (req, res) => {
  try {
    const stats = await getLocationStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get location stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching location statistics",
      error: error.message
    });
  }
};

// @desc    Get revenue statistics for super admin
// @route   GET /api/super-admin/revenue-stats
// @access  Private (Super Admin only)
const getRevenueStats = async (req, res) => {
  try {
    const stats = await getRevenueStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get revenue stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue statistics",
      error: error.message
    });
  }
};

// @desc    Get system alerts
// @route   GET /api/super-admin/alerts
// @access  Private (Super Admin only)
const getSystemAlerts = async (req, res) => {
  try {
    const alerts = await generateSystemAlerts();
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error("Get system alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system alerts",
      error: error.message
    });
  }
};

// @desc    Get recent system activity
// @route   GET /api/super-admin/recent-activity
// @access  Private (Super Admin only)
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activity = await getSystemActivity(parseInt(limit));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent activity",
      error: error.message
    });
  }
};

// @desc    Get system logs
// @route   GET /api/super-admin/logs
// @access  Private (Super Admin only)
const getSystemLogs = async (req, res) => {
  try {
    const { level = "all", source = "all", dateRange = "24h", limit = 100 } = req.query;
    
    // This would integrate with your logging system
    // For now, returning mock data
    const logs = generateMockLogs(level, source, dateRange, parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("Get system logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system logs",
      error: error.message
    });
  }
};

// @desc    Perform bulk user operations
// @route   POST /api/super-admin/bulk-operations/users
// @access  Private (Super Admin only)
const bulkUserOperations = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { operation, userIds, updateData } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required"
      });
    }

    let result;
    switch (operation) {
      case "activate":
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: true } }
        );
        break;
      case "deactivate":
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: false } }
        );
        break;
      case "update_role":
        if (!updateData?.role) {
          return res.status(400).json({
            success: false,
            message: "Role is required for update_role operation"
          });
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { role: updateData.role } }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid operation"
        });
    }

    res.json({
      success: true,
      message: `Bulk operation completed successfully. Modified ${result.modifiedCount} users.`,
      data: {
        operation,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error("Bulk user operations error:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk operations",
      error: error.message
    });
  }
};

// Helper Functions
async function getUserStatistics(startDate, endDate) {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsers = startDate ? await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  }) : 0;

  const roleDistribution = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]);

  // Calculate growth rate
  const previousPeriodStart = startDate ? new Date(startDate.getTime() - (endDate - startDate)) : null;
  const previousPeriodUsers = previousPeriodStart ? await User.countDocuments({
    createdAt: { $gte: previousPeriodStart, $lt: startDate }
  }) : 0;

  const userGrowth = previousPeriodUsers > 0 ? 
    ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;

  return {
    totalUsers,
    activeUsers,
    newUsers,
    userGrowth,
    roleDistribution,
    inactiveUsers: totalUsers - activeUsers
  };
}

async function getLocationStatistics(startDate, endDate) {
  const totalLocations = await ParkingLocation.countDocuments();
  const activeLocations = await ParkingLocation.countDocuments({ isActive: true });
  const newLocations = startDate ? await ParkingLocation.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  }) : 0;

  // Calculate growth rate
  const previousPeriodStart = startDate ? new Date(startDate.getTime() - (endDate - startDate)) : null;
  const previousPeriodLocations = previousPeriodStart ? await ParkingLocation.countDocuments({
    createdAt: { $gte: previousPeriodStart, $lt: startDate }
  }) : 0;

  const locationGrowth = previousPeriodLocations > 0 ? 
    ((newLocations - previousPeriodLocations) / previousPeriodLocations) * 100 : 0;

  return {
    totalLocations,
    activeLocations,
    newLocations,
    locationGrowth,
    inactiveLocations: totalLocations - activeLocations
  };
}

async function getBookingStatistics(startDate, endDate) {
  const totalBookings = startDate ? await Booking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  }) : await Booking.countDocuments();

  const completedBookings = startDate ? await Booking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: "completed"
  }) : await Booking.countDocuments({ status: "completed" });

  const activeBookings = await Booking.countDocuments({
    status: { $in: ["confirmed", "checked_in"] }
  });

  return {
    totalBookings,
    completedBookings,
    activeBookings,
    completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
  };
}

async function getRevenueStatistics(startDate, endDate) {
  const matchCondition = {
    paymentStatus: "completed",
    ...(startDate && { createdAt: { $gte: startDate, $lte: endDate } })
  };

  const revenueData = await Booking.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalBookings: { $sum: 1 },
        averageBookingValue: { $avg: "$totalAmount" }
      }
    }
  ]);

  const result = revenueData[0] || {
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0
  };

  // Calculate growth rate
  if (startDate) {
    const previousPeriodStart = new Date(startDate.getTime() - (endDate - startDate));
    const previousRevenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const previousRevenue = previousRevenueData[0]?.totalRevenue || 0;
    result.revenueGrowth = previousRevenue > 0 ? 
      ((result.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }

  return result;
}

async function getViolationStatistics(startDate, endDate) {
  const totalViolations = startDate ? await Violation.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  }) : await Violation.countDocuments();

  const resolvedViolations = startDate ? await Violation.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: "resolved"
  }) : await Violation.countDocuments({ status: "resolved" });

  return {
    totalViolations,
    resolvedViolations,
    pendingViolations: totalViolations - resolvedViolations,
    resolutionRate: totalViolations > 0 ? (resolvedViolations / totalViolations) * 100 : 0
  };
}

async function getActiveBookingsCount() {
  return await Booking.countDocuments({
    status: { $in: ["confirmed", "checked_in"] }
  });
}

async function getTodayRevenue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const revenueData = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: today, $lt: tomorrow },
        paymentStatus: "completed"
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" }
      }
    }
  ]);

  return revenueData[0]?.totalRevenue || 0;
}

async function getOnlineUsersCount() {
  // This would integrate with your session management system
  // For now, returning a mock count
  return Math.floor(Math.random() * 500) + 100;
}

async function getSystemHealthMetrics() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    uptime: Math.floor(uptime),
    memoryStatus: memoryUsage.heapUsed / memoryUsage.heapTotal > 0.8 ? "Warning" : "Good",
    diskUsage: Math.floor(Math.random() * 30) + 40 // Mock disk usage
  };
}

async function getPerformanceMetrics() {
  // This would integrate with your monitoring system
  // For now, returning mock data
  const metrics = [];
  for (let i = 0; i < 20; i++) {
    metrics.push({
      timestamp: new Date(Date.now() - i * 60000),
      cpuUsage: Math.floor(Math.random() * 40) + 20,
      memoryUsage: Math.floor(Math.random() * 30) + 50,
      responseTime: Math.floor(Math.random() * 200) + 50
    });
  }
  return metrics.reverse();
}

async function getDatabaseMetrics() {
  const db = mongoose.connection.db;
  const stats = await db.stats();
  
  return {
    connectionStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    responseTime: Math.floor(Math.random() * 50) + 10,
    totalQueries: Math.floor(Math.random() * 10000) + 5000,
    totalBookings: await Booking.countDocuments(),
    totalTransactions: await Booking.countDocuments({ paymentStatus: "completed" })
  };
}

async function generateSystemAlerts() {
  const alerts = [];
  
  // Check for high memory usage
  const memoryUsage = process.memoryUsage();
  const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  if (memoryPercent > 80) {
    alerts.push({
      id: "high_memory",
      title: "High Memory Usage",
      message: `Memory usage is at ${memoryPercent.toFixed(1)}%`,
      severity: "warning",
      timestamp: new Date()
    });
  }

  // Check for recent failed bookings
  const recentFailedBookings = await Booking.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    paymentStatus: "failed"
  });

  if (recentFailedBookings > 10) {
    alerts.push({
      id: "failed_bookings",
      title: "High Booking Failure Rate",
      message: `${recentFailedBookings} bookings failed in the last hour`,
      severity: "critical",
      timestamp: new Date()
    });
  }

  return alerts;
}

async function getSystemActivity(limit) {
  // This would integrate with your audit log system
  // For now, returning mock data
  const activities = [
    {
      id: "1",
      action: "User Registration",
      details: "New user registered: john.doe@example.com",
      icon: "👤",
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: "2",
      action: "Booking Created",
      details: "New booking for Kathmandu Mall Parking",
      icon: "🚗",
      timestamp: new Date(Date.now() - 600000)
    },
    {
      id: "3",
      action: "Payment Processed",
      details: "Payment of Rs. 150 processed successfully",
      icon: "💳",
      timestamp: new Date(Date.now() - 900000)
    }
  ];

  return activities.slice(0, limit);
}

function generateMockLogs(level, source, dateRange, limit) {
  const logs = [];
  const levels = level === "all" ? ["info", "warning", "error", "debug"] : [level];
  const sources = source === "all" ? ["auth", "database", "payment", "booking", "system"] : [source];
  
  for (let i = 0; i < limit; i++) {
    logs.push({
      id: i + 1,
      timestamp: new Date(Date.now() - i * 60000),
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: `Sample log message ${i + 1}`,
      details: { sampleData: `value ${i + 1}` }
    });
  }
  
  return logs;
}

module.exports = {
  getSystemStats,
  getRealTimeMetrics,
  getUserStats,
  getLocationStats,
  getRevenueStats,
  getSystemAlerts,
  getRecentActivity,
  getSystemLogs,
  bulkUserOperations
};