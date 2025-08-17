const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      ParkingLocation.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create Users
    const users = await createUsers();
    console.log(`👥 Created ${users.length} users`);

    // Create Parking Locations
    const locations = await createParkingLocations();
    console.log(`🏢 Created ${locations.length} parking locations`);

    // Create Sample Bookings
    const bookings = await createSampleBookings(users, locations);
    console.log(`📅 Created ${bookings.length} bookings`);

    console.log("✅ Database seeding completed successfully!");
    return { users, locations, bookings };
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
};

const createUsers = async () => {
  const userData = [
    // Super Admin
    {
      username: "superadmin",
      email: "superadmin@parkingsystem.com",
      password: await bcrypt.hash("superadmin", 12),
      firstName: "Super",
      lastName: "Admin",
      phoneNumber: "+977-9841234567",
      role: "super_admin",
    },
    // Parking Admins
    {
      username: "kathmandu_admin",
      email: "kathmandu@parkingsystem.com",
      password: await bcrypt.hash("admin123", 12),
      firstName: "Kathmandu",
      lastName: "Admin",
      phoneNumber: "+977-9841234568",
      role: "parking_admin",
    },
    {
      username: "thamel_admin",
      email: "thamel@parkingsystem.com",
      password: await bcrypt.hash("admin123", 12),
      firstName: "Thamel",
      lastName: "Admin",
      phoneNumber: "+977-9841234569",
      role: "parking_admin",
    },
    // Customers
    {
      username: "johndoe",
      email: "john@example.com",
      password: await bcrypt.hash("customer123", 12),
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+977-9841234570",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA1234",
          vehicleType: "car",
          make: "Toyota",
          model: "Corolla",
        },
      ],
    },
    {
      username: "janedoe",
      email: "jane@outlook.com",
      password: await bcrypt.hash("customer123", 12),
      firstName: "Jane",
      lastName: "Doe",
      phoneNumber: "+977-9841234571",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA5678",
          vehicleType: "motorcycle",
          make: "Honda",
          model: "CBR",
        },
      ],
    },
    {
      username: "ramshrestha",
      email: "ram@gmail.com",
      password: await bcrypt.hash("customer123", 12),
      firstName: "Ram",
      lastName: "Shrestha",
      phoneNumber: "+977-9841234572",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA9999",
          vehicleType: "car",
          make: "Hyundai",
          model: "i20",
        },
      ],
    },
  ];

  const users = await User.insertMany(userData);

  // Assign locations to parking admins
  const kathmanduAdmin = users.find((u) => u.username === "kathmandu_admin");
  const thamelAdmin = users.find((u) => u.username === "thamel_admin");

  return users.map((user) => ({
    ...user.toObject(),
    kathmanduAdminId: kathmanduAdmin._id,
    thamelAdminId: thamelAdmin._id,
  }));
};

const createParkingLocations = async () => {
  const locationData = [
    // Kathmandu City Center
    {
      name: "City Center Mall Parking",
      address: "New Road, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7021,
        longitude: 85.316,
      },
      totalSpaces: 120,
      availableSpaces: 95,
      hourlyRate: 50,
      operatingHours: {
        start: "06:00",
        end: "22:00",
      },
      contactNumber: "+977-1-4123456",
      description:
        "Secure covered parking in the heart of Kathmandu with CCTV surveillance and 24/7 security.",
      amenities: ["cctv", "security_guard", "covered"],
      currentStatus: "open",
    },
    // Thamel Tourist Area - Main Locations
    {
      name: "Thamel Central Parking",
      address: "Thamel Marg, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7152,
        longitude: 85.3124,
      },
      totalSpaces: 80,
      availableSpaces: 60,
      hourlyRate: 75,
      operatingHours: {
        start: "05:00",
        end: "23:00",
      },
      contactNumber: "+977-1-4123457",
      description:
        "Prime location parking in Thamel with easy access to restaurants, hotels, and shops.",
      amenities: ["cctv", "security_guard", "bike_parking"],
      currentStatus: "open",
    },
    {
      name: "Thamel Sanchayakosh Gate Parking",
      address: "Sanchayakosh Gate, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7140,
        longitude: 85.3115,
      },
      totalSpaces: 45,
      availableSpaces: 32,
      hourlyRate: 60,
      operatingHours: {
        start: "06:00",
        end: "22:00",
      },
      contactNumber: "+977-1-4123460",
      description:
        "Designated temporary parking area near Sanchayakosh Gate with easy access to Thamel's main attractions.",
      amenities: ["cctv", "security_guard"],
      currentStatus: "open",
    },
    {
      name: "Garden of Dreams Parking",
      address: "Kaiser Mahal, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7158,
        longitude: 85.3140,
      },
      totalSpaces: 35,
      availableSpaces: 18,
      hourlyRate: 80,
      operatingHours: {
        start: "06:00",
        end: "20:00",
      },
      contactNumber: "+977-1-4123461",
      description:
        "Premium parking near Garden of Dreams with covered spaces and valet service.",
      amenities: ["cctv", "security_guard", "covered", "valet"],
      currentStatus: "open",
    },
    {
      name: "Chaksibari Marg Parking",
      address: "Chaksibari Marg, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7145,
        longitude: 85.3130,
      },
      totalSpaces: 25,
      availableSpaces: 15,
      hourlyRate: 70,
      operatingHours: {
        start: "07:00",
        end: "21:00",
      },
      contactNumber: "+977-1-4123462",
      description:
        "Small parking facility on Chaksibari Marg with bike parking available.",
      amenities: ["bike_parking", "security_guard"],
      currentStatus: "open",
    },
    {
      name: "Mandala Street Parking",
      address: "Mandala Street, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7148,
        longitude: 85.3128,
      },
      totalSpaces: 30,
      availableSpaces: 20,
      hourlyRate: 65,
      operatingHours: {
        start: "00:00",
        end: "23:59",
      },
      contactNumber: "+977-1-4123463",
      description:
        "24-hour underground parking facility on Mandala Street with EV charging stations.",
      amenities: ["cctv", "security_guard", "ev_charging", "covered"],
      currentStatus: "open",
    },
    {
      name: "Hotel Yak & Yeti Parking",
      address: "Durbar Marg, Near Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7135,
        longitude: 85.3168,
      },
      totalSpaces: 60,
      availableSpaces: 42,
      hourlyRate: 90,
      operatingHours: {
        start: "00:00",
        end: "23:59",
      },
      contactNumber: "+977-1-4123464",
      description:
        "Luxury hotel parking with premium amenities including car wash and valet service.",
      amenities: ["cctv", "security_guard", "covered", "valet", "car_wash"],
      currentStatus: "open",
    },
    {
      name: "Thamel Eco Resort Parking",
      address: "Paknajol, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7162,
        longitude: 85.3105,
      },
      totalSpaces: 40,
      availableSpaces: 28,
      hourlyRate: 55,
      operatingHours: {
        start: "06:00",
        end: "22:00",
      },
      contactNumber: "+977-1-4123465",
      description:
        "Eco-friendly parking facility with solar-powered EV charging stations.",
      amenities: ["ev_charging", "bike_parking", "security_guard"],
      currentStatus: "open",
    },
    {
      name: "Bhagwan Bahal Parking",
      address: "Bhagwan Bahal, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7138,
        longitude: 85.3118,
      },
      totalSpaces: 35,
      availableSpaces: 22,
      hourlyRate: 50,
      operatingHours: {
        start: "05:30",
        end: "22:30",
      },
      contactNumber: "+977-1-4123466",
      description:
        "Budget-friendly parking option in the heart of Thamel with basic security.",
      amenities: ["security_guard", "bike_parking"],
      currentStatus: "open",
    },
    {
      name: "Jyatha Thamel Parking",
      address: "Jyatha, Thamel, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7155,
        longitude: 85.3112,
      },
      totalSpaces: 50,
      availableSpaces: 35,
      hourlyRate: 68,
      operatingHours: {
        start: "06:00",
        end: "23:00",
      },
      contactNumber: "+977-1-4123467",
      description:
        "Multi-level parking facility in Jyatha area with CCTV monitoring and covered spaces.",
      amenities: ["cctv", "security_guard", "covered", "bike_parking"],
      currentStatus: "open",
    },
    // Durbar Square
    {
      name: "Durbar Square Heritage Parking",
      address: "Basantapur Durbar Square, Kathmandu 44600, Nepal",
      coordinates: {
        latitude: 27.7044,
        longitude: 85.3077,
      },
      totalSpaces: 50,
      availableSpaces: 30,
      hourlyRate: 100,
      operatingHours: {
        start: "07:00",
        end: "19:00",
      },
      contactNumber: "+977-1-4123458",
      description:
        "Heritage site parking with premium rates due to tourist location.",
      amenities: ["cctv", "security_guard"],
      currentStatus: "open",
    },
    // Patan
    {
      name: "Patan Museum Parking",
      address: "Patan Durbar Square, Lalitpur 44700, Nepal",
      coordinates: {
        latitude: 27.6732,
        longitude: 85.326,
      },
      totalSpaces: 40,
      availableSpaces: 25,
      hourlyRate: 60,
      operatingHours: {
        start: "08:00",
        end: "18:00",
      },
      contactNumber: "+977-1-4123459",
      description:
        "Museum and heritage site parking with cultural significance.",
      amenities: ["cctv"],
      currentStatus: "open",
    },
  ];

  // Generate spaces for each location
  const locations = locationData.map((location) => {
    const spaces = [];
    const totalSpaces = location.totalSpaces;

    for (let i = 1; i <= totalSpaces; i++) {
      const level = Math.ceil(i / 20);
      const section = String.fromCharCode(65 + Math.floor((i - 1) / 20)); // A, B, C, etc.

      let spaceType = "regular";
      if (i <= 5) spaceType = "handicapped";
      else if (i <= 15) spaceType = "ev-charging";
      else if (i <= 20) spaceType = "reserved";

      const isOccupied = i > location.availableSpaces;

      spaces.push({
        spaceId: `${section}${String(i).padStart(3, "0")}`,
        type: spaceType,
        status: isOccupied ? "occupied" : "available",
        level: level.toString(),
        section: section,
        sensors: {
          sensorId: `SENSOR_${section}${i}`,
          isActive: Math.random() > 0.3, // 70% active sensors
          lastUpdate: new Date(),
        },
      });
    }

    return {
      ...location,
      spaces,
      rates: [
        {
          rateType: "hourly",
          price: location.hourlyRate,
          duration: 1,
          effectiveDate: new Date(),
          isActive: true,
        },
        {
          rateType: "daily",
          price: location.hourlyRate * 8,
          duration: 24,
          effectiveDate: new Date(),
          isActive: true,
        },
      ],
    };
  });

  return await ParkingLocation.insertMany(locations);
};

const createSampleBookings = async (users, locations) => {
  const customers = users.filter((u) => u.role === "customer");
  const bookings = [];

  // Create some sample bookings
  for (let i = 0; i < 10; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const availableSpace = location.spaces.find(
      (s) => s.status === "available"
    );

    if (!availableSpace) continue;

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + Math.floor(Math.random() * 24));

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 4));

    const durationHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const totalAmount = durationHours * location.hourlyRate;

    bookings.push({
      userId: customer._id,
      locationId: location._id,
      spaceId: availableSpace.spaceId,
      vehicleInfo: customer.vehicles[0] || {
        plateNumber: "TEMP" + Math.floor(Math.random() * 1000),
        vehicleType: "car",
      },
      startTime,
      endTime,
      status: ["confirmed", "active", "completed"][
        Math.floor(Math.random() * 3)
      ],
      totalAmount,
      paymentStatus: Math.random() > 0.2 ? "completed" : "pending",
      paymentMethod: ["paypal", "esewa"][Math.floor(Math.random() * 2)],
      paymentTransactionId: `TXN_${Date.now()}_${i}`,
    });
  }

  return await Booking.insertMany(bookings);
};

// Test route to trigger seeding
const seedRoute = async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        users: result.users.length,
        locations: result.locations.length,
        bookings: result.bookings.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database seeding failed",
      error: error.message,
    });
  }
};

module.exports = { seedDatabase, seedRoute };
