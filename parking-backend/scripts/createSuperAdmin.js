const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["customer", "parking_admin", "super_admin"], 
    default: "customer" 
  },
  isActive: { type: Boolean, default: true },
  vehicles: [{ 
    plateNumber: String, 
    vehicleType: String, 
    make: String, 
    model: String,
    addedAt: { type: Date, default: Date.now }
  }],
  assignedLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingLocation" }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

async function createSuperAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Super admin details for Shreeraj
    const superAdminData = {
      username: "shreeraj",
      email: "shreeraj@parksathi.com",
      password: "Shreeraj2025!",
      firstName: "Shreeraj",
      lastName: "Tuladhar", 
      phoneNumber: "+977-9800000001",
      role: "super_admin",
      isActive: true,
      vehicles: [],
      assignedLocations: []
    };

    // Check if Shreeraj's account exists
    const existingShreeraj = await User.findOne({ 
      $or: [
        { email: superAdminData.email },
        { username: superAdminData.username }
      ]
    });

    // Check if any super admin exists
    const existingAdmin = await User.findOne({ role: "super_admin" });

    if (existingShreeraj) {
      console.log("Shreeraj's account already exists, updating to super_admin role...");
      existingShreeraj.role = "super_admin";
      existingShreeraj.isActive = true;
      await existingShreeraj.save();
      console.log("✅ Shreeraj's account updated to super_admin role!");
      console.log(`Email: ${existingShreeraj.email}`);
      console.log(`Username: ${existingShreeraj.username}`);
    } else if (existingAdmin) {
      console.log("Other super admin exists, creating Shreeraj as additional super admin...");
      console.log(`Existing admin: ${existingAdmin.email} (${existingAdmin.username})`);
      
      // Create Shreeraj as additional super admin
      const newSuperAdmin = new User(superAdminData);
      await newSuperAdmin.save();
      
      console.log("✅ Shreeraj super admin created successfully!");
      console.log("Login credentials for Shreeraj:");
      console.log(`Email: ${superAdminData.email}`);
      console.log(`Username: ${superAdminData.username}`);
      console.log(`Password: ${superAdminData.password}`);
      console.log(`Role: ${superAdminData.role}`);
    } else {
      // Create new super admin
      const newSuperAdmin = new User(superAdminData);
      await newSuperAdmin.save();
      
      console.log("✅ Shreeraj super admin created successfully!");
      console.log("Login credentials:");
      console.log(`Email: ${superAdminData.email}`);
      console.log(`Username: ${superAdminData.username}`);
      console.log(`Password: ${superAdminData.password}`);
      console.log(`Role: ${superAdminData.role}`);
    }

    console.log("\n🚀 You can now access the super admin dashboard at:");
    console.log("http://localhost:3000/super-admin");
    
  } catch (error) {
    console.error("Error creating super admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the script
createSuperAdmin();