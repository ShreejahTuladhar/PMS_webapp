const express = require("express");
const User = require("../models/User");
const router = express.Router();

// TEMPORARY ROUTE - Remove in production!
// @desc    Create initial super admin
// @route   POST /api/setup/create-super-admin
// @access  Public (REMOVE THIS IN PRODUCTION!)
router.post("/create-super-admin", async (req, res) => {
  try {
    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });
    
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists",
        data: {
          email: existingSuperAdmin.email,
          username: existingSuperAdmin.username
        }
      });
    }

    // Get data from request body
    const {
      username = "superadmin",
      email = "admin@parksathi.com",
      password = "SuperAdmin123!",
      firstName = "Super",
      lastName = "Administrator",
      phoneNumber = "+977-9800000000"
    } = req.body;

    // Create super admin user
    const superAdmin = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      firstName,
      lastName,
      phoneNumber,
      role: "super_admin",
      isActive: true,
      vehicles: [],
      assignedLocations: []
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super admin created successfully!",
      data: {
        id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role,
        dashboardUrl: "http://localhost:3000/super-admin"
      }
    });

  } catch (error) {
    console.error("Create super admin error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating super admin",
      error: error.message
    });
  }
});

// @desc    Promote existing user to super admin
// @route   PUT /api/setup/promote-to-super-admin/:userId
// @access  Public (REMOVE THIS IN PRODUCTION!)
router.put("/promote-to-super-admin/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });
    
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists",
        data: {
          email: existingSuperAdmin.email,
          username: existingSuperAdmin.username
        }
      });
    }

    // Find and update user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.role = "super_admin";
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: "User promoted to super admin successfully!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        dashboardUrl: "http://localhost:3000/super-admin"
      }
    });

  } catch (error) {
    console.error("Promote to super admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error promoting user to super admin",
      error: error.message
    });
  }
});

module.exports = router;