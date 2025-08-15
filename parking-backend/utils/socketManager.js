const socketIo = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join user-specific room
    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 Socket ${socket.id} joined user room ${userId}`);
    });

    // Join location-specific rooms
    socket.on("join_location", (locationId) => {
      socket.join(`location_${locationId}`);
      console.log(` Socket ${socket.id} joined location ${locationId}`);
    });

    // Join booking-specific room
    socket.on("join_booking", (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`📅 Socket ${socket.id} joined booking ${bookingId}`);
    });

    // Admin room for system-wide updates
    socket.on("join_admin", (userRole) => {
      if (["super_admin", "parking_admin"].includes(userRole)) {
        socket.join("admin_room");
        console.log(`👨‍💼 Admin ${socket.id} joined admin room`);
      }
    });

    // Leave rooms
    socket.on("leave_location", (locationId) => {
      socket.leave(`location_${locationId}`);
      console.log(` Socket ${socket.id} left location ${locationId}`);
    });

    socket.on("leave_booking", (bookingId) => {
      socket.leave(`booking_${bookingId}`);
      console.log(`📅 Socket ${socket.id} left booking ${bookingId}`);
    });

    // Handle booking status requests
    socket.on("request_booking_status", async (bookingId) => {
      try {
        const Booking = require("../models/Booking");
        const booking = await Booking.findById(bookingId)
          .populate("locationId", "name")
          .select(
            "status paymentStatus startTime endTime actualEntryTime actualExitTime"
          );

        if (booking) {
          socket.emit("booking_status_update", {
            bookingId,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            startTime: booking.startTime,
            endTime: booking.endTime,
            actualEntryTime: booking.actualEntryTime,
            actualExitTime: booking.actualExitTime,
            isCurrentlyActive: booking.isCurrentlyActive(),
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error fetching booking status:", error);
        socket.emit("error", { message: "Failed to fetch booking status" });
      }
    });

    // Handle live location updates request
    socket.on("request_location_status", async (locationId) => {
      try {
        const ParkingLocation = require("../models/ParkingLocation");
        const location = await ParkingLocation.findById(locationId).select(
          "name totalSpaces availableSpaces currentStatus"
        );

        if (location) {
          socket.emit("location_status_update", {
            locationId,
            name: location.name,
            totalSpaces: location.totalSpaces,
            availableSpaces: location.availableSpaces,
            currentStatus: location.currentStatus,
            occupancyPercentage: location.occupancyPercentage,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error fetching location status:", error);
        socket.emit("error", { message: "Failed to fetch location status" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Emit space status update
const emitSpaceUpdate = (locationId, spaceData) => {
  if (io) {
    io.to(`location_${locationId}`).emit("space_updated", {
      locationId,
      ...spaceData,
      timestamp: new Date(),
    });

    // Also notify admin room
    io.to("admin_room").emit("admin_space_update", {
      locationId,
      ...spaceData,
      timestamp: new Date(),
    });
  }
};

// Emit availability update
const emitAvailabilityUpdate = (locationId, availabilityData) => {
  if (io) {
    io.to(`location_${locationId}`).emit("availability_updated", {
      locationId,
      ...availabilityData,
      timestamp: new Date(),
    });

    // Also notify admin room
    io.to("admin_room").emit("admin_availability_update", {
      locationId,
      ...availabilityData,
      timestamp: new Date(),
    });
  }
};

// Emit booking status update
const emitBookingUpdate = (bookingId, userId, bookingData) => {
  if (io) {
    // Notify the specific user
    io.to(`user_${userId}`).emit("booking_updated", {
      bookingId,
      ...bookingData,
      timestamp: new Date(),
    });

    // Notify anyone watching this specific booking
    io.to(`booking_${bookingId}`).emit("booking_status_changed", {
      bookingId,
      ...bookingData,
      timestamp: new Date(),
    });

    // Notify admin room
    io.to("admin_room").emit("admin_booking_update", {
      bookingId,
      userId,
      ...bookingData,
      timestamp: new Date(),
    });
  }
};

// Emit payment status update
const emitPaymentUpdate = (bookingId, userId, paymentData) => {
  if (io) {
    // Notify the user
    io.to(`user_${userId}`).emit("payment_updated", {
      bookingId,
      ...paymentData,
      timestamp: new Date(),
    });

    // Notify booking watchers
    io.to(`booking_${bookingId}`).emit("payment_status_changed", {
      bookingId,
      ...paymentData,
      timestamp: new Date(),
    });

    // Notify admin room
    io.to("admin_room").emit("admin_payment_update", {
      bookingId,
      userId,
      ...paymentData,
      timestamp: new Date(),
    });
  }
};

// Emit system alert (for admins)
const emitSystemAlert = (alertData) => {
  if (io) {
    io.to("admin_room").emit("system_alert", {
      ...alertData,
      timestamp: new Date(),
    });
  }
};

// Emit notification to user
const emitUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit("notification", {
      ...notification,
      timestamp: new Date(),
    });
  }
};

// Get connected users count
const getConnectedUsersCount = () => {
  return io ? io.engine.clientsCount : 0;
};

// Get room information
const getRoomInfo = (roomName) => {
  if (!io) return null;

  const room = io.sockets.adapter.rooms.get(roomName);
  return room
    ? {
        name: roomName,
        size: room.size,
        members: Array.from(room),
      }
    : null;
};

module.exports = {
  initializeSocket,
  getIO,
  emitSpaceUpdate,
  emitAvailabilityUpdate,
  emitBookingUpdate,
  emitPaymentUpdate,
  emitSystemAlert,
  emitUserNotification,
  getConnectedUsersCount,
  getRoomInfo,
};
