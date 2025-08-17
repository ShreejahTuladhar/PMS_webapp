const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLocation",
      required: [true, "Location ID is required"],
    },
    spaceId: {
      type: String,
      required: [true, "Space ID is required"],
      trim: true,
    },
    vehicleInfo: {
      plateNumber: {
        type: String,
        required: [true, "Vehicle plate number is required"],
        uppercase: true,
        trim: true,
      },
      vehicleType: {
        type: String,
        enum: {
          values: ["car", "motorcycle", "bus", "truck"],
          message: "Vehicle type must be car, motorcycle, bus, or truck",
        },
        required: [true, "Vehicle type is required"],
      },
      make: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
    },
    // Booking time slots
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Start time must be in the future",
      },
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    // Actual entry/exit times (for billing)
    actualEntryTime: {
      type: Date,
    },
    actualExitTime: {
      type: Date,
    },
    // Booking status
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "active",
          "completed",
          "cancelled",
          "expired",
          "no_show",
        ],
        message: "Invalid booking status",
      },
      default: "pending",
    },
    // Payment information
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: [
          "pending",
          "completed",
          "failed",
          "refunded",
          "partial_refund",
        ],
        message: "Invalid payment status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["paypal", "esewa", "cash", "card"],
        message: "Invalid payment method",
      },
      required: [true, "Payment method is required"],
    },
    paymentTransactionId: {
      type: String,
      trim: true,
    },
    // QR code for entry/exit
    qrCode: {
      type: String,
      // sparse is handled by the index definition below
    },
    // Extension and modifications
    extensions: [
      {
        originalEndTime: {
          type: Date,
          required: true,
        },
        newEndTime: {
          type: Date,
          required: true,
        },
        additionalAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
    // Penalties and violations
    penalties: [
      {
        type: {
          type: String,
          enum: ["overstay", "wrong_space", "no_show", "other"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
          required: true,
        },
        issuedAt: {
          type: Date,
          default: Date.now,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Notes and special instructions
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      trim: true,
    },
    specialInstructions: {
      type: String,
      maxlength: [300, "Special instructions cannot exceed 300 characters"],
      trim: true,
    },
    // Cancellation information
    cancellation: {
      cancelledAt: {
        type: Date,
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
        trim: true,
      },
      refundAmount: {
        type: Number,
        min: 0,
      },
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ locationId: 1, startTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ qrCode: 1 }, { unique: true, sparse: true });
bookingSchema.index({ paymentStatus: 1 });

// Compound indexes for common queries
bookingSchema.index({ locationId: 1, spaceId: 1, startTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ locationId: 1, status: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });

// Index for conflict checking queries
bookingSchema.index({ 
  locationId: 1, 
  spaceId: 1, 
  status: 1, 
  startTime: 1, 
  endTime: 1 
});

// Index for vehicle plate number searches
bookingSchema.index({ 'vehicleInfo.plateNumber': 1 });

// Index for payment tracking
bookingSchema.index({ paymentTransactionId: 1 }, { sparse: true });

// TTL index for expired bookings (optional cleanup)
bookingSchema.index({ 
  endTime: 1 
}, { 
  expireAfterSeconds: 2592000 // 30 days after endTime
});

// Virtual for booking duration in hours
bookingSchema.virtual("durationHours").get(function () {
  if (!this.startTime || !this.endTime) return 0;
  return Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
});

// Virtual for actual duration (if checked in/out)
bookingSchema.virtual("actualDurationHours").get(function () {
  if (!this.actualEntryTime || !this.actualExitTime) return 0;
  return Math.ceil(
    (this.actualExitTime - this.actualEntryTime) / (1000 * 60 * 60)
  );
});

// Virtual for total penalties amount
bookingSchema.virtual("totalPenalties").get(function () {
  return this.penalties.reduce((total, penalty) => total + penalty.amount, 0);
});

// Virtual for final amount (including penalties)
bookingSchema.virtual("finalAmount").get(function () {
  return this.totalAmount + this.totalPenalties;
});

// Method to check if booking is currently active
bookingSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.actualEntryTime &&
    !this.actualExitTime &&
    now >= this.startTime &&
    now <= this.endTime
  );
};

// Method to calculate overstay penalty
bookingSchema.methods.calculateOverstayPenalty = function (
  hourlyRate,
  penaltyMultiplier = 1.5
) {
  if (!this.actualExitTime || this.actualExitTime <= this.endTime) return 0;

  const overstayHours = Math.ceil(
    (this.actualExitTime - this.endTime) / (1000 * 60 * 60)
  );
  return overstayHours * hourlyRate * penaltyMultiplier;
};

// Method to generate QR code (placeholder - integrate with QR library)
bookingSchema.methods.generateQRCode = function () {
  const qrData = `${this._id}-${this.userId}-${this.locationId}-${Date.now()}`;
  // In real implementation, use a QR code library
  this.qrCode = Buffer.from(qrData).toString("base64");
  return this.qrCode;
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflictingBookings = function (
  locationId,
  spaceId,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const query = {
    locationId,
    spaceId,
    status: { $in: ["confirmed", "active"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query);
};

// Pre-save middleware
bookingSchema.pre("save", function (next) {
  // Generate QR code if booking is confirmed and QR doesn't exist
  if (this.status === "confirmed" && !this.qrCode) {
    this.generateQRCode();
  }

  // Auto-update status based on time
  const now = new Date();
  if (this.status === "confirmed" && now >= this.startTime) {
    this.status = "active";
  } else if (
    this.status === "active" &&
    now > this.endTime &&
    !this.actualExitTime
  ) {
    this.status = "expired";
  }

  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
