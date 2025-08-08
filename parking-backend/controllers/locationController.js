const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

// @desc    Get all parking locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      available,
      latitude,
      longitude,
      maxDistance = 5000,
      spaceType,
      priceRange,
      amenities,
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { isActive: true };
    let sort = { name: 1 };

    // Search by name or address using MongoDB text search
    if (search) {
      filter.$text = { $search: search };
      sort = { score: { $meta: "textScore" } }; // Sort by relevance
    }

    // Filter by availability
    if (available === "true") {
      filter.availableSpaces = { $gt: 0 };
      filter.currentStatus = "open";
    }

    // Filter by specific space type availability
    if (spaceType) {
      filter[`spaces.type`] = spaceType;
      filter[`spaces.status`] = "available";
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (minPrice) filter.hourlyRate = { $gte: minPrice };
      if (maxPrice)
        filter.hourlyRate = { ...filter.hourlyRate, $lte: maxPrice };
    }

    // Filter by amenities
    if (amenities) {
      const amenityList = amenities.split(",");
      filter.amenities = { $in: amenityList };
    }

    let query = ParkingLocation.find(filter);

    // Geolocation-based search
    if (latitude && longitude) {
      query = ParkingLocation.find({
        ...filter,
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(maxDistance),
          },
        },
      });
      sort = {}; // Remove default sorting for geo queries
    }

    // Apply sorting, pagination, and select fields
    const locations = await query
      .select("-spaces") // Exclude individual spaces for list view
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parkingOwnerId", "firstName lastName email phoneNumber")
      .exec();

    // Get total count for pagination
    const total = await ParkingLocation.countDocuments(filter);

    // Add additional computed fields
    const enhancedLocations = locations.map((location) => ({
      ...location.toObject(),
      distance:
        latitude && longitude
          ? calculateDistance(
              latitude,
              longitude,
              location.coordinates.latitude,
              location.coordinates.longitude
            )
          : null,
      isCurrentlyOpen: location.isCurrentlyOpen(),
      occupancyPercentage: location.occupancyPercentage,
      availableSpaceTypes: location.availableSpaceTypes,
    }));

    res.json({
      success: true,
      count: locations.length,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: enhancedLocations,
    });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving parking locations",
      error: error.message,
    });
  }
};

// @desc    Get single parking location by ID
// @route   GET /api/locations/:id
// @access  Public
const getLocationById = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id).populate(
      "parkingOwnerId",
      "firstName lastName email phoneNumber"
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    if (!location.isActive) {
      return res.status(404).json({
        success: false,
        message: "Parking location is currently unavailable",
      });
    }

    // Get current active bookings for this location
    const activeBookings = await Booking.find({
      locationId: location._id,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    }).select("spaceId startTime endTime");

    // Mark spaces as occupied if they have active bookings
    const enhancedSpaces = location.spaces.map((space) => {
      const hasActiveBooking = activeBookings.some(
        (booking) => booking.spaceId === space.spaceId
      );
      return {
        ...space.toObject(),
        hasActiveBooking,
        actualStatus: hasActiveBooking ? "occupied" : space.status,
      };
    });

    const enhancedLocation = {
      ...location.toObject(),
      spaces: enhancedSpaces,
      isCurrentlyOpen: location.isCurrentlyOpen(),
      occupancyPercentage: location.occupancyPercentage,
      availableSpaceTypes: location.availableSpaceTypes,
      activeBookingsCount: activeBookings.length,
    };

    res.json({
      success: true,
      data: enhancedLocation,
    });
  } catch (error) {
    console.error("Get location by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error retrieving parking location",
      error: error.message,
    });
  }
};

// @desc    Create new parking location
// @route   POST /api/locations
// @access  Private (Super Admin only)
const createLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const locationData = {
      ...req.body,
      parkingOwnerId: req.body.parkingOwnerId || req.user.id,
    };

    // Generate spaces if not provided
    if (!locationData.spaces || locationData.spaces.length === 0) {
      locationData.spaces = generateSpaces(locationData.totalSpaces);
    }

    // Set initial available spaces
    locationData.availableSpaces = locationData.spaces.filter(
      (s) => s.status === "available"
    ).length;

    const location = new ParkingLocation(locationData);
    await location.save();

    res.status(201).json({
      success: true,
      message: "Parking location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Create location error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A location with similar details already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating parking location",
      error: error.message,
    });
  }
};

// @desc    Update parking location
// @route   PUT /api/locations/:id
// @access  Private (Super Admin or assigned Parking Admin)
const updateLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const location = await ParkingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions
    if (req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this location",
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        location[key] = req.body[key];
      }
    });

    await location.save();

    res.json({
      success: true,
      message: "Parking location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating parking location",
      error: error.message,
    });
  }
};

// @desc    Update space status
// @route   PUT /api/locations/:id/spaces/:spaceId/status
// @access  Private (Super Admin or assigned Parking Admin)
const updateSpaceStatus = async (req, res) => {
  try {
    const { id: locationId, spaceId } = req.params;
    const { status, reason } = req.body;

    const location = await ParkingLocation.findById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions for parking admin
    if (req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update spaces in this location",
        });
      }
    }

    // Check if space has active booking
    const activeBooking = await Booking.findOne({
      locationId,
      spaceId,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    });

    if (activeBooking && status === "maintenance") {
      return res.status(400).json({
        success: false,
        message: "Cannot set space to maintenance - active booking exists",
        booking: activeBooking._id,
      });
    }

    // Update space status
    await location.updateSpaceStatus(spaceId, status);

    // Emit real-time updates
    const {
      emitSpaceUpdate,
      emitAvailabilityUpdate,
    } = require("../utils/socketManager");
    emitSpaceUpdate(locationId, {
      spaceId,
      newStatus: status,
      reason,
      updatedBy: req.user.id,
    });

    emitAvailabilityUpdate(locationId, {
      availableSpaces: location.availableSpaces,
      totalSpaces: location.totalSpaces,
      occupancyPercentage: location.occupancyPercentage,
    });

    res.json({
      success: true,
      message: "Space status updated successfully",
      data: {
        locationId,
        spaceId,
        newStatus: status,
        reason,
        availableSpaces: location.availableSpaces,
        updatedBy: req.user.id,
      },
    });
  } catch (error) {
    console.error("Update space status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating space status",
      error: error.message,
    });
  }
};

// @desc    Get location statistics
// @route   GET /api/locations/:id/stats
// @access  Private (Super Admin or assigned Parking Admin)
const getLocationStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, period = "7d" } = req.query;

    const location = await ParkingLocation.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions
    if (req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view stats for this location",
        });
      }
    }

    // Calculate date range
    const endDateTime = endDate ? new Date(endDate) : new Date();
    const startDateTime = startDate
      ? new Date(startDate)
      : new Date(endDateTime - getPeriodInMs(period));

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          locationId: location._id,
          createdAt: { $gte: startDateTime, $lte: endDateTime },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageDuration: {
            $avg: {
              $divide: [{ $subtract: ["$endTime", "$startTime"] }, 3600000],
            },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get hourly utilization
    const hourlyStats = await Booking.aggregate([
      {
        $match: {
          locationId: location._id,
          createdAt: { $gte: startDateTime, $lte: endDateTime },
          status: { $in: ["completed", "active"] },
        },
      },
      {
        $group: {
          _id: { $hour: "$startTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      location: {
        id: location._id,
        name: location.name,
        totalSpaces: location.totalSpaces,
        availableSpaces: location.availableSpaces,
        occupancyPercentage: location.occupancyPercentage,
      },
      period: {
        startDate: startDateTime,
        endDate: endDateTime,
        days: Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24)),
      },
      bookings: bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageDuration: 0,
        completedBookings: 0,
        cancelledBookings: 0,
      },
      hourlyUtilization: hourlyStats,
      currentStatus: {
        isOpen: location.isCurrentlyOpen(),
        status: location.currentStatus,
        lastUpdated: location.updatedAt,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get location stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving location statistics",
      error: error.message,
    });
  }
};

// @desc    Delete parking location (soft delete)
// @route   DELETE /api/locations/:id
// @access  Private (Super Admin only)
const deleteLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      locationId: location._id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete location - ${activeBookings} active bookings exist`,
      });
    }

    // Soft delete
    location.isActive = false;
    location.currentStatus = "closed";
    await location.save();

    res.json({
      success: true,
      message: "Parking location deactivated successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting parking location",
      error: error.message,
    });
  }
};

// Helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000); // Distance in meters
};

const generateSpaces = (totalSpaces) => {
  const spaces = [];
  for (let i = 1; i <= totalSpaces; i++) {
    const level = Math.ceil(i / 20);
    const section = String.fromCharCode(65 + Math.floor((i - 1) / 20));

    let spaceType = "regular";
    if (i <= Math.floor(totalSpaces * 0.05)) spaceType = "handicapped";
    else if (i <= Math.floor(totalSpaces * 0.15)) spaceType = "ev-charging";
    else if (i <= Math.floor(totalSpaces * 0.2)) spaceType = "reserved";

    spaces.push({
      spaceId: `${section}${String(i).padStart(3, "0")}`,
      type: spaceType,
      status: "available",
      level: level.toString(),
      section: section,
    });
  }
  return spaces;
};

const getPeriodInMs = (period) => {
  const periods = {
    "1d": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };
  return periods[period] || periods["7d"];
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  updateSpaceStatus,
  getLocationStats,
  deleteLocation,
};
