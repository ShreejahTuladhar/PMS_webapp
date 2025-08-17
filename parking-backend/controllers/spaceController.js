const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");

// @desc    Update space availability in real-time
// @route   PATCH /api/locations/:locationId/spaces/:spaceId/status
// @access  Private (Sensor/Admin)
const updateSpaceStatus = async (req, res) => {
  try {
    const { locationId, spaceId } = req.params;
    const { status } = req.body;

    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    const space = location.spaces.find((s) => s.spaceId === spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Parking space not found",
      });
    }

    const oldStatus = space.status;
    await location.updateSpaceStatus(spaceId, status);

    // Broadcast real-time update (if WebSocket is implemented)
    // io.to(`location-${locationId}`).emit('spaceUpdate', {
    //   spaceId,
    //   oldStatus,
    //   newStatus: status,
    //   availableSpaces: location.availableSpaces
    // });

    res.json({
      success: true,
      message: "Space status updated successfully",
      data: {
        spaceId,
        oldStatus,
        newStatus: status,
        availableSpaces: location.availableSpaces,
        occupancyPercentage: location.occupancyPercentage,
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

// @desc    Get real-time availability for a location
// @route   GET /api/locations/:locationId/availability
// @access  Public
const getLocationAvailability = async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Get active bookings
    const activeBookings = await Booking.find({
      locationId: locationId,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    }).select("spaceId");

    // Mark spaces with active bookings
    const spacesWithBookings = location.spaces.map((space) => {
      const hasActiveBooking = activeBookings.some(
        (booking) => booking.spaceId === space.spaceId
      );
      return {
        ...space.toObject(),
        hasActiveBooking,
        realTimeStatus: hasActiveBooking ? "occupied" : space.status,
      };
    });

    res.json({
      success: true,
      data: {
        locationId,
        totalSpaces: location.totalSpaces,
        availableSpaces: location.availableSpaces,
        occupancyPercentage: location.occupancyPercentage,
        currentStatus: location.currentStatus,
        isCurrentlyOpen: location.isCurrentlyOpen(),
        lastUpdated: new Date(),
        spaces: spacesWithBookings,
        availableSpaceTypes: location.availableSpaceTypes,
      },
    });
  } catch (error) {
    console.error("Get location availability error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving location availability",
      error: error.message,
    });
  }
};

// @desc    Bulk update space statuses (for sensor integration)
// @route   PATCH /api/locations/:locationId/spaces/bulk-update
// @access  Private (Sensor/Admin)
const bulkUpdateSpaceStatus = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { updates } = req.body; // Array of { spaceId, status }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    const updatedSpaces = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { spaceId, status } = update;
        const space = location.spaces.find((s) => s.spaceId === spaceId);
        
        if (!space) {
          errors.push(`Space ${spaceId} not found`);
          continue;
        }

        const oldStatus = space.status;
        space.status = status;
        
        updatedSpaces.push({
          spaceId,
          oldStatus,
          newStatus: status,
        });
      } catch (error) {
        errors.push(`Error updating space ${update.spaceId}: ${error.message}`);
      }
    }

    // Recalculate available spaces
    location.availableSpaces = location.spaces.filter(
      (s) => s.status === "available"
    ).length;

    await location.save();

    res.json({
      success: true,
      message: `Updated ${updatedSpaces.length} spaces successfully`,
      data: {
        updatedSpaces,
        errors,
        availableSpaces: location.availableSpaces,
        occupancyPercentage: location.occupancyPercentage,
      },
    });
  } catch (error) {
    console.error("Bulk update space status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating space statuses",
      error: error.message,
    });
  }
};

module.exports = {
  updateSpaceStatus,
  getLocationAvailability,
  bulkUpdateSpaceStatus,
};