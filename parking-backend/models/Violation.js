const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
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
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    violationType: {
      type: String,
      enum: {
        values: [
          "expired_time",
          "unauthorized_parking",
          "wrong_space_type",
          "no_payment",
          "blocking_exit",
          "handicapped_violation",
          "double_parking",
          "fire_lane_violation",
          "other",
        ],
        message: "Invalid violation type",
      },
      required: [true, "Violation type is required"],
    },
    description: {
      type: String,
      required: [true, "Violation description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    fineAmount: {
      type: Number,
      required: [true, "Fine amount is required"],
      min: [0, "Fine amount cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "disputed", "cancelled", "waived"],
        message: "Invalid violation status",
      },
      default: "pending",
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Issuer ID is required"],
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ["photo", "video", "document"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    violationTime: {
      type: Date,
      required: [true, "Violation time is required"],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    // Vehicle information at time of violation
    vehicleInfo: {
      plateNumber: {
        type: String,
        required: [true, "Vehicle plate number is required"],
        uppercase: true,
        trim: true,
      },
      vehicleType: {
        type: String,
        enum: ["car", "motorcycle", "bus", "truck", "unknown"],
        default: "unknown",
      },
      make: String,
      model: String,
      color: String,
    },
    // Payment tracking
    payment: {
      paidAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      paidAt: {
        type: Date,
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "card", "paypal", "esewa", "bank_transfer"],
      },
      transactionId: {
        type: String,
        trim: true,
      },
    },
    // Dispute information
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      disputeReason: {
        type: String,
        trim: true,
        maxlength: [500, "Dispute reason cannot exceed 500 characters"],
      },
      disputedAt: {
        type: Date,
      },
      disputeStatus: {
        type: String,
        enum: ["under_review", "approved", "rejected"],
        default: "under_review",
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: {
        type: Date,
      },
      reviewNotes: {
        type: String,
        trim: true,
      },
    },
    // Location of violation
    violationLocation: {
      spaceId: {
        type: String,
        trim: true,
      },
      level: {
        type: String,
        trim: true,
      },
      section: {
        type: String,
        trim: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    // Additional notes
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
violationSchema.index({ userId: 1, createdAt: -1 });
violationSchema.index({ locationId: 1, violationTime: -1 });
violationSchema.index({ status: 1 });
violationSchema.index({ violationType: 1 });
violationSchema.index({ dueDate: 1 });
violationSchema.index({ "vehicleInfo.plateNumber": 1 });

// Virtual for days until due
violationSchema.virtual("daysUntilDue").get(function () {
  if (!this.dueDate) return 0;
  const today = new Date();
  const diffTime = this.dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
violationSchema.virtual("isOverdue").get(function () {
  return this.status === "pending" && new Date() > this.dueDate;
});

// Virtual for remaining balance
violationSchema.virtual("remainingBalance").get(function () {
  return Math.max(0, this.fineAmount - (this.payment.paidAmount || 0));
});

// Method to mark as paid
violationSchema.methods.markAsPaid = function (
  amount,
  paymentMethod,
  transactionId
) {
  this.payment.paidAmount = amount;
  this.payment.paidAt = new Date();
  this.payment.paymentMethod = paymentMethod;
  this.payment.transactionId = transactionId;

  if (amount >= this.fineAmount) {
    this.status = "paid";
  }

  return this.save();
};

// Static method to get violation statistics
violationSchema.statics.getViolationStats = function (
  locationId = null,
  startDate = null,
  endDate = null
) {
  const match = {};

  if (locationId) match.locationId = mongoose.Types.ObjectId(locationId);
  if (startDate || endDate) {
    match.violationTime = {};
    if (startDate) match.violationTime.$gte = startDate;
    if (endDate) match.violationTime.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$violationType",
        count: { $sum: 1 },
        totalFines: { $sum: "$fineAmount" },
        totalPaid: { $sum: "$payment.paidAmount" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

module.exports = mongoose.model("Violation", violationSchema);
