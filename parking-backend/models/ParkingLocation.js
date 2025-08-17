const mongoose = require("mongoose");

const parkingLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      maxlength: [100, "Location name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, "Latitude is required"],
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        required: [true, "Longitude is required"],
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
    },
    totalSpaces: {
      type: Number,
      required: [true, "Total spaces is required"],
      min: [1, "Total spaces must be at least 1"],
      max: [10000, "Total spaces cannot exceed 10000"],
    },
    availableSpaces: {
      type: Number,
      required: [true, "Available spaces is required"],
      min: [0, "Available spaces cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.totalSpaces;
        },
        message: "Available spaces cannot exceed total spaces",
      },
    },
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Hourly rate cannot be negative"],
    },
    rate: {
      base: {
        type: Number,
        required: [true, "Base rate is required"],
        min: [0, "Base rate cannot be negative"],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [50, "Discount cannot exceed 50%"],
      },
    },
    images: {
      type: [String],
      default: ["/images/default-parking.jpg"],
      validate: {
        validator: function(images) {
          return images.length <= 3;
        },
        message: "Maximum 3 images allowed",
      },
    },
    operatingHours: {
      start: {
        type: String,
        required: [true, "Operating start time is required"],
        match: [
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Invalid time format. Use HH:MM format",
        ],
      },
      end: {
        type: String,
        required: [true, "Operating end time is required"],
        match: [
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Invalid time format. Use HH:MM format",
        ],
      },
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-\(\)]+$/, "Please provide a valid contact number"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // For future expansion - parking owner management
    parkingOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Individual parking spaces
    spaces: [
      {
        spaceId: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: {
            values: ["regular", "handicapped", "ev-charging", "reserved"],
            message:
              "Space type must be regular, handicapped, ev-charging, or reserved",
          },
          default: "regular",
        },
        status: {
          type: String,
          enum: {
            values: ["available", "occupied", "maintenance", "reserved"],
            message:
              "Space status must be available, occupied, maintenance, or reserved",
          },
          default: "available",
        },
        level: {
          type: String,
          trim: true,
        },
        section: {
          type: String,
          trim: true,
        },
        // For sensor integration (future feature)
        sensors: {
          sensorId: {
            type: String,
            trim: true,
          },
          isActive: {
            type: Boolean,
            default: false,
          },
          lastUpdate: {
            type: Date,
            default: Date.now,
          },
        },
      },
    ],
    // Pricing tiers for different durations
    rates: [
      {
        rateId: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        rateType: {
          type: String,
          enum: ["hourly", "daily", "monthly", "special"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        duration: {
          type: Number, // in hours
          required: true,
          min: 1,
        },
        effectiveDate: {
          type: Date,
          default: Date.now,
        },
        expiryDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Amenities and features
    amenities: [
      {
        type: String,
        enum: [
          "cctv",
          "security_guard",
          "covered",
          "ev_charging",
          "car_wash",
          "valet",
          "bike_parking",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Operating status
    currentStatus: {
      type: String,
      enum: ["open", "closed", "maintenance", "full"],
      default: "open",
    },
    // Statistics for analytics
    stats: {
      totalBookings: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageOccupancy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    //automatic timestamps for createdAt and updatedAt
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
parkingLocationSchema.index({
  "coordinates.latitude": 1,
  "coordinates.longitude": 1,
});
parkingLocationSchema.index({ isActive: 1 });
parkingLocationSchema.index({ currentStatus: 1 });
parkingLocationSchema.index({ availableSpaces: 1 });
parkingLocationSchema.index({ "spaces.status": 1 });

// Virtual for occupancy percentage
parkingLocationSchema.virtual("occupancyPercentage").get(function () {
  if (this.totalSpaces === 0) return 0;
  const occupiedSpaces = this.totalSpaces - this.availableSpaces;
  return Math.round((occupiedSpaces / this.totalSpaces) * 100);
});

// Virtual for discounted rate
parkingLocationSchema.virtual("discountedRate").get(function () {
  if (!this.rate || !this.rate.base) return this.hourlyRate || 0;
  const base = this.rate.base;
  const discount = this.rate.discount || 0;
  return Math.ceil(base - (base * discount / 100));
});

// Virtual for available space types
parkingLocationSchema.virtual("availableSpaceTypes").get(function () {
  const availableTypes = {};
  if (this.spaces && Array.isArray(this.spaces)) {
    this.spaces.forEach((space) => {
      if (space.status === "available") {
        availableTypes[space.type] = (availableTypes[space.type] || 0) + 1;
      }
    });
  }
  return availableTypes;
});

// Method to check if location is currently open
parkingLocationSchema.methods.isCurrentlyOpen = function () {
  if (!this.isActive || this.currentStatus !== "open") return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    currentTime >= this.operatingHours.start &&
    currentTime <= this.operatingHours.end
  );
};

// Method to update space status and available count
parkingLocationSchema.methods.updateSpaceStatus = function (
  spaceId,
  newStatus
) {
  if (!this.spaces || !Array.isArray(this.spaces)) {
    throw new Error("No spaces available");
  }
  
  const space = this.spaces.find((s) => s.spaceId === spaceId);
  if (!space) {
    throw new Error("Space not found");
  }

  const oldStatus = space.status;
  space.status = newStatus;

  // Update available spaces count
  if (oldStatus === "available" && newStatus !== "available") {
    this.availableSpaces = Math.max(0, this.availableSpaces - 1);
  } else if (oldStatus !== "available" && newStatus === "available") {
    this.availableSpaces = Math.min(this.totalSpaces, this.availableSpaces + 1);
  }

  return this.save();
};

// Static method to find nearby locations
parkingLocationSchema.statics.findNearby = function (
  latitude,
  longitude,
  maxDistance = 5000
) {
  return this.find({
    isActive: true,
    coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

module.exports = mongoose.model("ParkingLocation", parkingLocationSchema, "locations");
