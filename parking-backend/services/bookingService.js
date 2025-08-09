const Booking = require("../models/Booking");
const ParkingLocation = require("../models/ParkingLocation");
const QRCode = require("qrcode");
const crypto = require("crypto");

class BookingService {
  static async validateBookingRequest(locationId, spaceId, startTime, endTime) {
    const location = await ParkingLocation.findById(locationId);
    if (!location || !location.isActive) {
      throw new Error("Parking location not found or inactive");
    }

    if (!location.isCurrentlyOpen()) {
      throw new Error("Parking location is currently closed");
    }

    const space = location.spaces.find((s) => s.spaceId === spaceId);
    if (!space) {
      throw new Error("Parking space not found");
    }

    if (space.status !== "available") {
      throw new Error(`Parking space is ${space.status}`);
    }

    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);
    const now = new Date();

    if (bookingStart <= now) {
      throw new Error("Start time must be in the future");
    }

    if (bookingEnd <= bookingStart) {
      throw new Error("End time must be after start time");
    }

    return { location, space, bookingStart, bookingEnd };
  }

  static async checkConflictingBookings(locationId, spaceId, startTime, endTime, excludeBookingId = null) {
    const conflictingBookings = await Booking.findConflictingBookings(
      locationId,
      spaceId,
      startTime,
      endTime,
      excludeBookingId
    );

    if (conflictingBookings.length > 0) {
      throw new Error("Time slot conflicts with existing booking");
    }

    return true;
  }

  static calculateBookingAmount(startTime, endTime, hourlyRate) {
    const durationHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    return durationHours * hourlyRate;
  }

  static async generateQRCode(bookingData) {
    const qrData = JSON.stringify({
      bookingId: crypto.randomBytes(16).toString("hex"),
      locationId: bookingData.locationId,
      spaceId: bookingData.spaceId,
      userId: bookingData.userId,
      timestamp: Date.now(),
    });

    return await QRCode.toDataURL(qrData);
  }

  static async createBooking(bookingData) {
    const {
      userId,
      locationId,
      spaceId,
      vehicleInfo,
      startTime,
      endTime,
      paymentMethod,
      totalAmount,
      notes,
    } = bookingData;

    const qrCodeDataURL = await this.generateQRCode(bookingData);

    const booking = new Booking({
      userId,
      locationId,
      spaceId,
      vehicleInfo: {
        plateNumber: vehicleInfo.plateNumber.toUpperCase(),
        vehicleType: vehicleInfo.vehicleType,
        make: vehicleInfo.make || "",
        model: vehicleInfo.model || "",
      },
      startTime,
      endTime,
      totalAmount,
      paymentMethod,
      status: paymentMethod === "cash" ? "confirmed" : "pending",
      paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
      qrCode: qrCodeDataURL,
      notes: notes || "",
    });

    return await booking.save();
  }

  static calculateCancellationRefund(booking) {
    const now = new Date();
    const timeTillStart = booking.startTime - now;
    const hoursUntilStart = timeTillStart / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (hoursUntilStart > 24) {
      refundPercentage = 100;
    } else if (hoursUntilStart > 2) {
      refundPercentage = 50;
    }

    const refundAmount = booking.paymentStatus === "completed" 
      ? (booking.totalAmount * refundPercentage) / 100 
      : 0;

    return { refundAmount, refundPercentage };
  }

  static async generateAvailableSlots(locationId, spaceId, date) {
    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingBookings = await Booking.find({
      locationId,
      spaceId,
      status: { $in: ["confirmed", "active"] },
      $or: [
        { startTime: { $gte: startOfDay, $lte: endOfDay } },
        { endTime: { $gte: startOfDay, $lte: endOfDay } },
        { startTime: { $lte: startOfDay }, endTime: { $gte: endOfDay } },
      ],
    }).sort({ startTime: 1 });

    const operatingStart = parseInt(location.operatingHours.start.split(":")[0]);
    const operatingEnd = parseInt(location.operatingHours.end.split(":")[0]);

    const availableSlots = [];
    let currentHour = operatingStart;

    while (currentHour < operatingEnd) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(currentHour + 1, 0, 0, 0);

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

    return {
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
    };
  }
}

module.exports = BookingService;