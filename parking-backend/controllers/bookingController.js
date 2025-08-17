const Booking = require("../models/Booking");
const ParkingLocation = require("../models/ParkingLocation");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const QRCode = require("qrcode");
const moment = require("moment");
const crypto = require("crypto");
const {
  emitSpaceUpdate,
  emitAvailabilityUpdate,
  emitBookingUpdate,
  emitUserNotification,
} = require("../utils/socketManager");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
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
      locationId,
      spaceId,
      vehicleInfo,
      startTime,
      endTime,
      paymentMethod,
    } = req.body;

    // Validate location exists and is active
    const location = await ParkingLocation.findById(locationId);
    if (!location || !location.isActive) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found or inactive",
      });
    }

    // Check if location is currently open
    if (!location.isCurrentlyOpen()) {
      return res.status(400).json({
        success: false,
        message: "Parking location is currently closed",
      });
    }

    // Validate space exists and is available
    const space = location.spaces.find((s) => s.spaceId === spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Parking space not found",
      });
    }

    if (space.status !== "available") {
      return res.status(400).json({
        success: false,
        message: `Parking space is ${space.status}`,
      });
    }

    // Validate time slots
    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);
    const now = new Date();

    if (bookingStart <= now) {
      return res.status(400).json({
        success: false,
        message: "Start time must be in the future",
      });
    }

    if (bookingEnd <= bookingStart) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.findConflictingBookings(
      locationId,
      spaceId,
      bookingStart,
      bookingEnd
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Time slot conflicts with existing booking",
        conflictingBookings: conflictingBookings.map((b) => ({
          id: b._id,
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      });
    }

    // Calculate booking amount
    const durationHours = Math.ceil(
      (bookingEnd - bookingStart) / (1000 * 60 * 60)
    );
    const totalAmount = durationHours * location.hourlyRate;

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: crypto.randomBytes(16).toString("hex"),
      locationId: locationId,
      spaceId: spaceId,
      userId: req.user.id,
      timestamp: Date.now(),
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    // Create booking
    const booking = new Booking({
      userId: req.user.id,
      locationId,
      spaceId,
      vehicleInfo: {
        plateNumber: vehicleInfo.plateNumber.toUpperCase(),
        vehicleType: vehicleInfo.vehicleType,
        make: vehicleInfo.make || "",
        model: vehicleInfo.model || "",
      },
      startTime: bookingStart,
      endTime: bookingEnd,
      totalAmount,
      paymentMethod,
      status: paymentMethod === "cash" ? "confirmed" : "pending",
      paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
      qrCode: qrCodeDataURL,
      notes: req.body.notes || "",
    });

    await booking.save();

    // Update space status if payment is completed (cash payment)
    if (paymentMethod === "cash") {
      await location.updateSpaceStatus(spaceId, "reserved");

      //   REAL-TIME UPDATES
      emitSpaceUpdate(locationId, {
        spaceId,
        newStatus: "reserved",
        bookingId: booking._id,
      });

      emitAvailabilityUpdate(locationId, {
        availableSpaces: location.availableSpaces,
        totalSpaces: location.totalSpaces,
      });
    }

    //   BOOKING NOTIFICATION
    emitBookingUpdate(booking._id, req.user.id, {
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      action: "created",
    });

    emitUserNotification(req.user.id, {
      type: "booking_created",
      title: "Booking Created Successfully",
      message: `Your parking booking at ${location.name} has been created for ${durationHours} hours`,
      bookingId: booking._id,
      locationName: location.name,
      amount: totalAmount,
    });

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("locationId", "name address coordinates hourlyRate")
      .populate("userId", "firstName lastName email phoneNumber");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
      paymentRequired: paymentMethod !== "cash",
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// @desc    Get all bookings (with filters)
// @route   GET /api/bookings
// @access  Private (Admin) / Own bookings (Customer)
const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      locationId,
      userId,
      startDate,
      endDate,
      paymentStatus,
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = {};

    // Role-based filtering
    if (req.user.role === "customer") {
      filter.userId = req.user.id;
    } else if (req.user.role === "parking_admin") {
      // Only bookings for assigned locations
      filter.locationId = { $in: req.user.assignedLocations };
    }
    // Super admin can see all bookings (no additional filter)

    // Additional filters
    if (status) filter.status = status;
    if (locationId && req.user.role !== "customer")
      filter.locationId = locationId;
    if (userId && req.user.role === "super_admin") filter.userId = userId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate("locationId", "name address coordinates hourlyRate")
      .populate("userId", "firstName lastName email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

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
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate(
        "locationId",
        "name address coordinates hourlyRate operatingHours"
      )
      .populate("userId", "firstName lastName email phoneNumber");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    if (
      req.user.role === "customer" &&
      booking.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (req.user.role === "parking_admin") {
      const hasAccess = req.user.assignedLocations.some(
        (locId) => locId.toString() === booking.locationId._id.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Add computed fields with safe property access
    let bookingObject;
    try {
      bookingObject = booking.toObject();
    } catch (toObjectError) {
      console.warn("Error converting booking to object:", toObjectError);
      bookingObject = booking.toJSON(); // Fallback to toJSON
    }

    const enhancedBooking = {
      ...bookingObject,
      durationHours: booking.durationHours || 0,
      actualDurationHours: booking.actualDurationHours || 0,
      isCurrentlyActive: booking.isCurrentlyActive ? booking.isCurrentlyActive() : false,
      totalPenalties: booking.totalPenalties || 0,
      finalAmount: booking.finalAmount || booking.totalAmount,
    };

    res.json({
      success: true,
      data: enhancedBooking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// @desc    Update booking status (check-in/check-out)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, qrCode } = req.body; // action: 'checkin' or 'checkout'

    const booking = await Booking.findById(id).populate("locationId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify QR code if provided
    if (qrCode && qrCode !== booking.qrCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    const now = new Date();

    if (action === "checkin") {
      // Validate check-in conditions
      if (booking.status !== "confirmed") {
        return res.status(400).json({
          success: false,
          message: "Only confirmed bookings can be checked in",
        });
      }

      if (now < booking.startTime) {
        return res.status(400).json({
          success: false,
          message: "Cannot check in before booking start time",
        });
      }

      if (now > booking.endTime) {
        return res.status(400).json({
          success: false,
          message: "Booking has expired",
        });
      }

      // Update booking
      booking.status = "active";
      booking.actualEntryTime = now;

      // Update space status
      const location = booking.locationId;
      await location.updateSpaceStatus(booking.spaceId, "occupied");

      //   REAL-TIME UPDATES
      emitSpaceUpdate(booking.locationId._id, {
        spaceId: booking.spaceId,
        newStatus: "occupied",
        bookingId: booking._id,
        action: "checkin",
      });
    } else if (action === "checkout") {
      // Validate check-out conditions
      if (booking.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active bookings can be checked out",
        });
      }

      if (!booking.actualEntryTime) {
        return res.status(400).json({
          success: false,
          message: "Booking was never checked in",
        });
      }

      // Update booking
      booking.status = "completed";
      booking.actualExitTime = now;

      // Calculate overstay penalty if applicable
      if (now > booking.endTime) {
        const penalty = booking.calculateOverstayPenalty(
          booking.locationId.hourlyRate
        );
        if (penalty > 0) {
          booking.penalties.push({
            type: "overstay",
            amount: penalty,
            description: `Overstay penalty: ${Math.ceil((now - booking.endTime) / (1000 * 60 * 60))} hours`,
            issuedAt: now,
          });
        }
      }

      // Update space status
      const location = booking.locationId;
      await location.updateSpaceStatus(booking.spaceId, "available");

      //   REAL-TIME UPDATES
      emitSpaceUpdate(booking.locationId._id, {
        spaceId: booking.spaceId,
        newStatus: "available",
        bookingId: booking._id,
        action: "checkout",
      });

      emitAvailabilityUpdate(booking.locationId._id, {
        availableSpaces: location.availableSpaces,
        totalSpaces: location.totalSpaces,
      });
    }

    await booking.save();

    //   BOOKING STATUS NOTIFICATION
    emitBookingUpdate(booking._id, booking.userId, {
      status: booking.status,
      action: action,
      ...(action === "checkin" && { actualEntryTime: booking.actualEntryTime }),
      ...(action === "checkout" && {
        actualExitTime: booking.actualExitTime,
        penalties: booking.penalties,
        finalAmount: booking.finalAmount,
      }),
    });

    emitUserNotification(booking.userId, {
      type: `booking_${action}`,
      title: `Successfully ${action === "checkin" ? "Checked In" : "Checked Out"}`,
      message: `You have successfully ${action === "checkin" ? "checked in to" : "checked out from"} your parking space at ${booking.locationId.name}`,
      bookingId: booking._id,
      ...(action === "checkout" &&
        booking.penalties.length > 0 && {
          penalties: booking.totalPenalties,
          finalAmount: booking.finalAmount,
        }),
    });

    res.json({
      success: true,
      message: `Booking ${action} successful`,
      data: booking,
      ...(action === "checkout" && {
        penalties: booking.penalties,
        finalAmount: booking.finalAmount,
      }),
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate("locationId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    if (
      req.user.role === "customer" &&
      booking.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings",
      });
    }

    // Check if booking can be cancelled
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`,
      });
    }

    if (booking.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel active booking. Please check out first.",
      });
    }

    const now = new Date();
    const timeTillStart = booking.startTime - now;
    const hoursUntilStart = timeTillStart / (1000 * 60 * 60);

    // Calculate refund based on cancellation policy
    let refundAmount = 0;
    let refundPercentage = 0;

    if (hoursUntilStart > 24) {
      refundPercentage = 100; // Full refund
    } else if (hoursUntilStart > 2) {
      refundPercentage = 50; // 50% refund
    } else {
      refundPercentage = 0; // No refund
    }

    if (booking.paymentStatus === "completed") {
      refundAmount = (booking.totalAmount * refundPercentage) / 100;
    }

    // Update booking
    booking.status = "cancelled";
    booking.cancellation = {
      cancelledAt: now,
      cancelledBy: req.user.id,
      reason: reason || "User requested cancellation",
      refundAmount,
      refundStatus: refundAmount > 0 ? "pending" : "not_applicable",
    };

    await booking.save();

    // Free up the space if it was reserved
    if (booking.status === "confirmed") {
      const location = booking.locationId;
      const space = location.spaces.find((s) => s.spaceId === booking.spaceId);

      if (space && space.status === "reserved") {
        await location.updateSpaceStatus(booking.spaceId, "available");

        //   REAL-TIME UPDATES
        emitSpaceUpdate(booking.locationId._id, {
          spaceId: booking.spaceId,
          newStatus: "available",
          bookingId: booking._id,
          action: "cancelled",
        });

        emitAvailabilityUpdate(booking.locationId._id, {
          availableSpaces: location.availableSpaces,
          totalSpaces: location.totalSpaces,
        });
      }
    }

    //   CANCELLATION NOTIFICATION
    emitBookingUpdate(booking._id, booking.userId, {
      status: "cancelled",
      action: "cancelled",
      refundAmount,
      refundPercentage,
    });

    emitUserNotification(booking.userId, {
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `Your booking at ${booking.locationId.name} has been cancelled${refundAmount > 0 ? ` with ${refundPercentage}% refund (Rs. ${refundAmount})` : ""}`,
      bookingId: booking._id,
      refundAmount,
      refundPercentage,
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
      refund: {
        eligible: refundAmount > 0,
        amount: refundAmount,
        percentage: refundPercentage,
        status: booking.cancellation.refundStatus,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// @desc    Extend booking
// @route   PUT /api/bookings/:id/extend
// @access  Private
const extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEndTime } = req.body;

    const booking = await Booking.findById(id).populate("locationId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only extend your own bookings",
      });
    }

    // Validate booking can be extended
    if (!["confirmed", "active"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Only confirmed or active bookings can be extended",
      });
    }

    const newEnd = new Date(newEndTime);

    if (newEnd <= booking.endTime) {
      return res.status(400).json({
        success: false,
        message: "New end time must be after current end time",
      });
    }

    // Check for conflicts with the extension
    const conflictingBookings = await Booking.findConflictingBookings(
      booking.locationId._id,
      booking.spaceId,
      booking.endTime,
      newEnd,
      booking._id
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Extension conflicts with another booking",
        conflictingBookings: conflictingBookings.map((b) => ({
          id: b._id,
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      });
    }

    // Calculate additional amount
    const additionalHours = Math.ceil(
      (newEnd - booking.endTime) / (1000 * 60 * 60)
    );
    const additionalAmount = additionalHours * booking.locationId.hourlyRate;

    // Add extension record
    booking.extensions.push({
      originalEndTime: booking.endTime,
      newEndTime: newEnd,
      additionalAmount,
      requestedAt: new Date(),
      status: "approved", // Auto-approve for now
    });

    booking.endTime = newEnd;
    booking.totalAmount += additionalAmount;

    await booking.save();

    //   EXTENSION NOTIFICATION
    emitBookingUpdate(booking._id, booking.userId, {
      action: "extended",
      newEndTime: newEnd,
      additionalHours,
      additionalAmount,
      newTotalAmount: booking.totalAmount,
    });

    emitUserNotification(booking.userId, {
      type: "booking_extended",
      title: "Booking Extended Successfully",
      message: `Your booking at ${booking.locationId.name} has been extended by ${additionalHours} hours for Rs. ${additionalAmount}`,
      bookingId: booking._id,
      additionalHours,
      additionalAmount,
      newEndTime: newEnd,
    });

    res.json({
      success: true,
      message: "Booking extended successfully",
      data: booking,
      extension: {
        additionalHours,
        additionalAmount,
        newTotal: booking.totalAmount,
        paymentRequired: true,
      },
    });
  } catch (error) {
    console.error("Extend booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error extending booking",
      error: error.message,
    });
  }
};

// @desc    Get available time slots for a space
// @route   GET /api/bookings/available-slots
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { locationId, spaceId, date } = req.query;

    if (!locationId || !spaceId || !date) {
      return res.status(400).json({
        success: false,
        message: "Location ID, space ID, and date are required",
      });
    }

    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all bookings for this space on the target date
    const existingBookings = await Booking.find({
      locationId,
      spaceId,
      status: { $in: ["confirmed", "active"] },
      $or: [
        {
          startTime: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          endTime: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          startTime: { $lte: startOfDay },
          endTime: { $gte: endOfDay },
        },
      ],
    }).sort({ startTime: 1 });

    // Generate available slots
    const operatingStart = parseInt(
      location.operatingHours.start.split(":")[0]
    );
    const operatingEnd = parseInt(location.operatingHours.end.split(":")[0]);

    const availableSlots = [];
    let currentHour = operatingStart;

    while (currentHour < operatingEnd) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(currentHour + 1, 0, 0, 0);

      // Check if this slot conflicts with any booking
      const hasConflict = existingBookings.some(
        (booking) => booking.startTime < slotEnd && booking.endTime > slotStart
      );

      if (!hasConflict) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
          price: location.hourlyRate,
        });
      }

      currentHour++;
    }

    res.json({
      success: true,
      data: {
        date: targetDate,
        location: {
          id: location._id,
          name: location.name,
          operatingHours: location.operatingHours,
        },
        spaceId,
        availableSlots,
        totalSlots: availableSlots.length,
        existingBookings: existingBookings.length,
      },
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  extendBooking,
  getAvailableSlots,
};
