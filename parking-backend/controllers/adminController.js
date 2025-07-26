const User = require("../models/User");
const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");
const Violation = require("../models/Violation");
const { validationResult } = require("express-validator");

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Super Admin only)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = {};

    // Filter by role
    if (role && role !== "all") {
      filter.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Search by name, username, or email
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const users = await User.find(filter)
      .select("-password")
      .populate("assignedLocations", "name address")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get user role statistics
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      count: users.length,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      roleStatistics: roleStats,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Update user role and status
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { role, isActive, assignedLocations } = req.body;

    // Prevent self-modification of super admin
    if (id === req.user.id && req.user.role === "super_admin") {
      if (role !== "super_admin" || isActive === false) {
        return res.status(400).json({
          success: false,
          message:
            "Super admin cannot modify their own role or deactivate their account",
        });
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    // Update role
    if (role) {
      updateData.role = role;
    }

    // Update active status
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Handle location assignments for parking admin
    if (role === "parking_admin" && assignedLocations) {
      // Validate that all provided location IDs exist
      const validLocations = await ParkingLocation.find({
        _id: { $in: assignedLocations },
        isActive: true,
      });

      if (validLocations.length !== assignedLocations.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid location IDs provided",
        });
      }

      updateData.assignedLocations = assignedLocations;
    } else if (role && role !== "parking_admin") {
      // Clear location assignments for non-parking-admin roles
      updateData.assignedLocations = [];
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("assignedLocations", "name address");

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Get system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Super Admin and Parking Admin)
const getDashboardStats = async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1d":
        startDate.setDate(endDate.getDate() - 1);
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
        startDate.setDate(endDate.getDate() - 7);
    }

    // Build filter for parking admin (only their assigned locations)
    let locationFilter = {};
    if (req.user.role === "parking_admin") {
      locationFilter._id = { $in: req.user.assignedLocations };
    }

    // Get basic counts
    const [userCount, locationCount, bookingCount, violationCount] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        ParkingLocation.countDocuments({ isActive: true, ...locationFilter }),
        Booking.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          ...(req.user.role === "parking_admin"
            ? { locationId: { $in: req.user.assignedLocations } }
            : {}),
        }),
        Violation.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          ...(req.user.role === "parking_admin"
            ? { locationId: { $in: req.user.assignedLocations } }
            : {}),
        }),
      ]);

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "completed",
          ...(req.user.role === "parking_admin"
            ? { locationId: { $in: req.user.assignedLocations } }
            : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageBookingValue: { $avg: "$totalAmount" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // Get booking status distribution
    const bookingStatusStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          ...(req.user.role === "parking_admin"
            ? { locationId: { $in: req.user.assignedLocations } }
            : {}),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily booking trends
    const dailyTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          ...(req.user.role === "parking_admin"
            ? { locationId: { $in: req.user.assignedLocations } }
            : {}),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Get top performing locations (for super admin)
    let topLocations = [];
    if (req.user.role === "super_admin") {
      topLocations = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: "$locationId",
            bookings: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        {
          $lookup: {
            from: "parkinglocations",
            localField: "_id",
            foreignField: "_id",
            as: "location",
          },
        },
        { $unwind: "$location" },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]);
    }

    const dashboard = {
      period: {
        startDate,
        endDate,
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
      },
      overview: {
        totalUsers: userCount,
        totalLocations: locationCount,
        totalBookings: bookingCount,
        totalViolations: violationCount,
      },
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        averageBookingValue: 0,
        totalBookings: 0,
      },
      bookingStatusDistribution: bookingStatusStats,
      dailyTrends,
      ...(req.user.role === "super_admin" && { topLocations }),
    };

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// @desc    Get system health and performance metrics
// @route   GET /api/admin/system-health
// @access  Private (Super Admin only)
const getSystemHealth = async (req, res) => {
  try {
    // Database connection status
    const dbStatus = {
      connected: require("mongoose").connection.readyState === 1,
      host: require("mongoose").connection.host,
      name: require("mongoose").connection.name,
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // Active connections (if using clustering)
    const activeConnections = {
      total: 0, // This would be implemented with proper connection tracking
      current: 1,
    };

    // Recent error logs (this would be implemented with proper logging)
    const recentErrors = [];

    const systemHealth = {
      status: "healthy",
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      connections: activeConnections,
      recentErrors,
      lastChecked: new Date(),
    };

    res.json({
      success: true,
      data: systemHealth,
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system health",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  getDashboardStats,
  getSystemHealth,
};
