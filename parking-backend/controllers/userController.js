const User = require("../models/User");
const Booking = require("../models/Booking");
const ParkingLocation = require("../models/ParkingLocation");
const { validationResult } = require("express-validator");

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate(
        "assignedLocations",
        "name address coordinates totalSpaces availableSpaces"
      )
      .select("-password");

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    // Get user statistics
    const userStats = await getUserStatistics(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          city: user.city,
          emergencyContact: user.emergencyContact,
          role: user.role,
          isActive: user.isActive,
          vehicles: user.vehicles,
          assignedLocations: user.assignedLocations,
          lastLogin: user.lastLogin,
          accountCreatedAt: user.accountCreatedAt,
          preferences: user.preferences,
        },
        statistics: userStats,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      email, 
      dateOfBirth, 
      gender, 
      address, 
      city, 
      emergencyContact 
    } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
    }

    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      email: email ? email.toLowerCase() : req.user.email,
    };

    // Add optional fields if provided
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .populate("assignedLocations", "name address");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Add vehicle to user account
// @route   POST /api/users/vehicles
// @access  Private
const addVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { plateNumber, vehicleType, make, model } = req.body;

    const user = await User.findById(req.user.id);

    // Check if vehicle already exists for this user
    const existingVehicle = user.vehicles.find(
      (v) => v.plateNumber === plateNumber.toUpperCase()
    );

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle with this plate number already exists in your account",
      });
    }

    // Check vehicle limit (max 5 vehicles per user)
    if (user.vehicles.length >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 vehicles allowed per account",
      });
    }

    user.vehicles.push({
      plateNumber: plateNumber.toUpperCase(),
      vehicleType,
      make: make || "",
      model: model || "",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: {
        vehicles: user.vehicles,
        totalVehicles: user.vehicles.length,
      },
    });
  } catch (error) {
    console.error("Add vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding vehicle",
      error: error.message,
    });
  }
};

// @desc    Update vehicle information
// @route   PUT /api/users/vehicles/:vehicleId
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { vehicleId } = req.params;
    const { plateNumber, vehicleType, make, model } = req.body;

    const user = await User.findById(req.user.id);
    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check if new plate number conflicts with existing vehicles
    if (plateNumber && plateNumber.toUpperCase() !== vehicle.plateNumber) {
      const conflictingVehicle = user.vehicles.find(
        (v) =>
          v.plateNumber === plateNumber.toUpperCase() &&
          v._id.toString() !== vehicleId
      );

      if (conflictingVehicle) {
        return res.status(400).json({
          success: false,
          message:
            "Another vehicle with this plate number already exists in your account",
        });
      }
    }

    // Update vehicle details
    if (plateNumber) vehicle.plateNumber = plateNumber.toUpperCase();
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (make !== undefined) vehicle.make = make;
    if (model !== undefined) vehicle.model = model;

    await user.save();

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: {
        vehicle: vehicle,
        vehicles: user.vehicles,
      },
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vehicle",
      error: error.message,
    });
  }
};

// @desc    Remove vehicle from user account
// @route   DELETE /api/users/vehicles/:vehicleId
// @access  Private
const removeVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const user = await User.findById(req.user.id);
    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check if vehicle has active bookings
    const activeBookings = await Booking.countDocuments({
      userId: user._id,
      "vehicleInfo.plateNumber": vehicle.plateNumber,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove vehicle - ${activeBookings} active bookings exist for this vehicle`,
      });
    }

    user.vehicles.pull(vehicleId);
    await user.save();

    res.json({
      success: true,
      message: "Vehicle removed successfully",
      data: {
        vehicles: user.vehicles,
        totalVehicles: user.vehicles.length,
      },
    });
  } catch (error) {
    console.error("Remove vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing vehicle",
      error: error.message,
    });
  }
};

// @desc    Get user booking history
// @route   GET /api/users/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      locationId,
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { userId: req.user.id };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Filter by location
    if (locationId) {
      filter.locationId = locationId;
    }

    const bookings = await Booking.find(filter)
      .populate("locationId", "name address coordinates hourlyRate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Booking.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          activeBookings: {
            $sum: {
              $cond: [{ $in: ["$status", ["confirmed", "active"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      count: bookings.length,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      statistics: stats[0] || {
        totalBookings: 0,
        totalAmount: 0,
        completedBookings: 0,
        activeBookings: 0,
      },
      data: bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking history",
      error: error.message,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Get user statistics for dashboard
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserStatistics(userId);
    
    // Get favorite location (most booked location)
    const favoriteLocationResult = await Booking.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$locationId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { 
        $lookup: {
          from: "parkinglocations",
          localField: "_id",
          foreignField: "_id",
          as: "location"
        }
      }
    ]);

    const favoriteLocation = favoriteLocationResult.length > 0 
      ? favoriteLocationResult[0].location[0]?.name || ''
      : '';

    // Calculate total hours parked
    const totalHoursResult = await Booking.aggregate([
      { $match: { userId: req.user._id, status: "completed" } },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ["$endTime", "$startTime"] },
                3600000
              ]
            }
          }
        }
      }
    ]);

    const totalHoursParked = totalHoursResult.length > 0 
      ? Math.round(totalHoursResult[0].totalHours) 
      : 0;

    // Calculate average booking value
    const averageBookingValue = stats.totalBookings > 0 
      ? Math.round(stats.totalSpent / stats.totalBookings)
      : 0;

    // Calculate saved amount (mock calculation - 10% of total spent)
    const savedAmount = Math.round(stats.totalSpent * 0.1);

    res.json({
      success: true,
      totalBookings: stats.totalBookings,
      totalSpent: stats.totalSpent,
      savedAmount: savedAmount,
      averageBookingValue: averageBookingValue,
      totalHoursParked: totalHoursParked,
      favoriteLocation: favoriteLocation
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// @desc    Get user vehicles
// @route   GET /api/users/vehicles
// @access  Private
const getUserVehicles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('vehicles');
    
    res.json({
      success: true,
      vehicles: user.vehicles || []
    });
  } catch (error) {
    console.error("Get user vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles",
      error: error.message,
    });
  }
};

// @desc    Get user transaction history
// @route   GET /api/users/transactions
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, dateRange } = req.query;
    const skip = (page - 1) * limit;

    // Build date filter
    let dateFilter = {};
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case '7days':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30days':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '90days':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case '1year':
          dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    let filter = { userId: req.user.id };
    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    // For now, use booking data as transaction data
    // In a real app, you'd have a separate transactions collection
    const transactions = await Booking.find(filter)
      .populate("locationId", "name address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Transform bookings to transaction format
    const transactionData = transactions.map(booking => ({
      id: booking._id,
      transactionId: `TXN${booking._id.toString().slice(-8).toUpperCase()}`,
      bookingId: `BK${booking._id.toString().slice(-6).toUpperCase()}`,
      amount: booking.totalAmount,
      type: 'payment',
      status: booking.status === 'completed' ? 'completed' : 
              booking.status === 'cancelled' ? 'refunded' : 'pending',
      description: `Parking at ${booking.locationId?.name || 'Unknown Location'}`,
      paymentMethod: booking.paymentMethod || 'Credit Card',
      createdAt: booking.createdAt,
      date: booking.createdAt
    }));

    res.json({
      success: true,
      transactions: transactionData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction history",
      error: error.message,
    });
  }
};

// @desc    Get user favorite locations
// @route   GET /api/users/favorites
// @access  Private
const getFavoriteLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteLocations');
    
    res.json({
      success: true,
      favorites: user.favoriteLocations || []
    });
  } catch (error) {
    console.error("Get favorite locations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching favorite locations",
      error: error.message,
    });
  }
};

// @desc    Add favorite location
// @route   POST /api/users/favorites
// @access  Private
const addFavoriteLocation = async (req, res) => {
  try {
    const { locationId } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (user.favoriteLocations && user.favoriteLocations.includes(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Location is already in favorites"
      });
    }

    if (!user.favoriteLocations) {
      user.favoriteLocations = [];
    }
    
    user.favoriteLocations.push(locationId);
    await user.save();
    
    res.json({
      success: true,
      message: "Location added to favorites"
    });
  } catch (error) {
    console.error("Add favorite location error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding favorite location",
      error: error.message,
    });
  }
};

// @desc    Remove favorite location
// @route   DELETE /api/users/favorites/:locationId
// @access  Private
const removeFavoriteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user.favoriteLocations || !user.favoriteLocations.includes(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Location is not in favorites"
      });
    }
    
    user.favoriteLocations = user.favoriteLocations.filter(
      id => id.toString() !== locationId
    );
    await user.save();
    
    res.json({
      success: true,
      message: "Location removed from favorites"
    });
  } catch (error) {
    console.error("Remove favorite location error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing favorite location",
      error: error.message,
    });
  }
};

// @desc    Export user data
// @route   GET /api/users/export
// @access  Private
const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoriteLocations')
      .select('-password');
    
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('locationId', 'name address');
    
    const userData = {
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        vehicles: user.vehicles,
        favoriteLocations: user.favoriteLocations,
        accountCreatedAt: user.accountCreatedAt,
        lastLogin: user.lastLogin
      },
      bookings: bookings,
      exportDate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error("Export user data error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting user data",
      error: error.message,
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const preferences = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: preferences },
      { new: true, runValidators: true }
    ).select('preferences');
    
    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating preferences",
      error: error.message,
    });
  }
};

// Helper function to get user statistics
const getUserStatistics = async (userId) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          averageBookingDuration: {
            $avg: {
              $divide: [
                { $subtract: ["$endTime", "$startTime"] },
                3600000, // Convert to hours
              ],
            },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          activeBookings: {
            $sum: {
              $cond: [{ $in: ["$status", ["confirmed", "active"]] }, 1, 0],
            },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalBookings: 0,
        totalSpent: 0,
        averageBookingDuration: 0,
        completedBookings: 0,
        activeBookings: 0,
        cancelledBookings: 0,
      }
    );
  } catch (error) {
    console.error("Error getting user statistics:", error);
    return {};
  }
};

module.exports = {
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
};
