const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[+]?[\d\s\-\(\)]+$/, "Please provide a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer_not_to_say"],
        message: "Gender must be male, female, other, or prefer_not_to_say",
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Emergency contact name cannot exceed 100 characters"],
      },
      phoneNumber: {
        type: String,
        trim: true,
        match: [/^[+]?[\d\s\-\(\)]+$/, "Please provide a valid emergency contact phone number"],
      },
      relationship: {
        type: String,
        enum: {
          values: ["spouse", "parent", "sibling", "child", "friend", "other"],
          message: "Relationship must be spouse, parent, sibling, child, friend, or other",
        },
      },
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "parking_admin", "super_admin"],
        message: "Role must be either customer, parking_admin, or super_admin",
      },
      default: "customer",
    },
    vehicles: [
      {
        plateNumber: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        vehicleType: {
          type: String,
          enum: ["car", "motorcycle", "bus", "truck"],
          required: true,
        },
        make: {
          type: String,
          trim: true,
        },
        model: {
          type: String,
          trim: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingLocation",
      },
    ], // Only for parking_admin role
    favoriteLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingLocation",
      },
    ], // User's favorite parking locations
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      currency: {
        type: String,
        enum: ["NPR", "USD", "EUR"],
        default: "NPR",
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    accountCreatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance (unique fields don't need separate index)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  }

  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+password");
};

module.exports = mongoose.model("User", userSchema);
