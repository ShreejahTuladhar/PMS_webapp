const mongoose = require("mongoose");

// Dummy data for MongoDB collections
const dummyData = {
  // Users data
  users: [
    {
      _id: new mongoose.Types.ObjectId(),
      username: "john_doe",
      email: "john.doe@gmail.com",
      password: "$2a$12$LQv3c1yqBw2Jo6TkjHPVMu.Hj3q9b4t6o0N8K2f4s1L5mWuJ9xZ8G", // password: "password123"
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+977-9841234567",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA-1-PA-1234",
          vehicleType: "car",
          make: "Toyota",
          model: "Corolla",
          addedAt: new Date("2024-01-15")
        }
      ],
      isActive: true,
      accountCreatedAt: new Date("2024-01-01"),
      lastLogin: new Date("2024-08-07")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      username: "jane_smith",
      email: "jane.smith@gmail.com",
      password: "$2a$12$LQv3c1yqBw2Jo6TkjHPVMu.Hj3q9b4t6o0N8K2f4s1L5mWuJ9xZ8G",
      firstName: "Jane",
      lastName: "Smith",
      phoneNumber: "+977-9876543210",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA-2-CHA-5678",
          vehicleType: "motorcycle",
          make: "Honda",
          model: "CB Shine",
          addedAt: new Date("2024-02-10")
        }
      ],
      isActive: true,
      accountCreatedAt: new Date("2024-02-01"),
      lastLogin: new Date("2024-08-06")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      username: "admin_ram",
      email: "ram.admin@pms.com",
      password: "$2a$12$LQv3c1yqBw2Jo6TkjHPVMu.Hj3q9b4t6o0N8K2f4s1L5mWuJ9xZ8G",
      firstName: "Ram",
      lastName: "Shrestha",
      phoneNumber: "+977-9812345678",
      role: "parking_admin",
      vehicles: [],
      isActive: true,
      accountCreatedAt: new Date("2023-12-01"),
      lastLogin: new Date("2024-08-08")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      username: "super_admin",
      email: "admin@pms.com",
      password: "$2a$12$LQv3c1yqBw2Jo6TkjHPVMu.Hj3q9b4t6o0N8K2f4s1L5mWuJ9xZ8G",
      firstName: "Super",
      lastName: "Admin",
      phoneNumber: "+977-9801234567",
      role: "super_admin",
      vehicles: [],
      isActive: true,
      accountCreatedAt: new Date("2023-11-01"),
      lastLogin: new Date("2024-08-08")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      username: "mike_jones",
      email: "mike.jones@gmail.com",
      password: "$2a$12$LQv3c1yqBw2Jo6TkjHPVMu.Hj3q9b4t6o0N8K2f4s1L5mWuJ9xZ8G",
      firstName: "Mike",
      lastName: "Jones",
      phoneNumber: "+977-9823456789",
      role: "customer",
      vehicles: [
        {
          plateNumber: "BA-3-KHA-9876",
          vehicleType: "car",
          make: "Hyundai",
          model: "i20",
          addedAt: new Date("2024-03-20")
        }
      ],
      isActive: true,
      accountCreatedAt: new Date("2024-03-01"),
      lastLogin: new Date("2024-08-05")
    }
  ],

  // Parking locations data
  parkingLocations: [
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Ratna Park Parking",
      address: "Ratna Park, Kathmandu, Nepal",
      coordinates: {
        latitude: 27.7021,
        longitude: 85.3157
      },
      totalSpaces: 50,
      availableSpaces: 35,
      hourlyRate: 50,
      operatingHours: {
        start: "06:00",
        end: "22:00"
      },
      contactNumber: "+977-1-4220123",
      description: "Secure parking facility in the heart of Kathmandu",
      spaces: [
        {
          spaceId: "A001",
          type: "regular",
          status: "available",
          level: "Ground",
          section: "A",
          sensors: {
            sensorId: "SEN001",
            isActive: true,
            lastUpdate: new Date()
          }
        },
        {
          spaceId: "A002",
          type: "regular",
          status: "occupied",
          level: "Ground",
          section: "A",
          sensors: {
            sensorId: "SEN002",
            isActive: true,
            lastUpdate: new Date()
          }
        },
        {
          spaceId: "H001",
          type: "handicapped",
          status: "available",
          level: "Ground",
          section: "H",
          sensors: {
            sensorId: "SEN003",
            isActive: true,
            lastUpdate: new Date()
          }
        }
      ],
      rates: [
        {
          rateType: "hourly",
          price: 50,
          duration: 1,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        },
        {
          rateType: "daily",
          price: 400,
          duration: 24,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        }
      ],
      amenities: ["cctv", "security_guard", "covered"],
      isActive: true,
      currentStatus: "open",
      stats: {
        totalBookings: 1250,
        totalRevenue: 125000,
        averageOccupancy: 70,
        lastUpdated: new Date()
      }
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "New Road Shopping Plaza Parking",
      address: "New Road, Kathmandu, Nepal",
      coordinates: {
        latitude: 27.7016,
        longitude: 85.3084
      },
      totalSpaces: 80,
      availableSpaces: 22,
      hourlyRate: 60,
      operatingHours: {
        start: "07:00",
        end: "21:00"
      },
      contactNumber: "+977-1-4248567",
      description: "Multi-level parking facility in New Road shopping district",
      spaces: [
        {
          spaceId: "B001",
          type: "regular",
          status: "available",
          level: "Level 1",
          section: "B",
          sensors: {
            sensorId: "SEN101",
            isActive: true,
            lastUpdate: new Date()
          }
        },
        {
          spaceId: "E001",
          type: "ev-charging",
          status: "available",
          level: "Level 2",
          section: "E",
          sensors: {
            sensorId: "SEN201",
            isActive: true,
            lastUpdate: new Date()
          }
        }
      ],
      rates: [
        {
          rateType: "hourly",
          price: 60,
          duration: 1,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        },
        {
          rateType: "daily",
          price: 500,
          duration: 24,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        }
      ],
      amenities: ["cctv", "security_guard", "ev_charging", "car_wash"],
      isActive: true,
      currentStatus: "open",
      stats: {
        totalBookings: 2100,
        totalRevenue: 210000,
        averageOccupancy: 85,
        lastUpdated: new Date()
      }
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Thamel Tourist Hub Parking",
      address: "Thamel, Kathmandu, Nepal",
      coordinates: {
        latitude: 27.7156,
        longitude: 85.3106
      },
      totalSpaces: 30,
      availableSpaces: 8,
      hourlyRate: 80,
      operatingHours: {
        start: "00:00",
        end: "23:59"
      },
      contactNumber: "+977-1-4410789",
      description: "24/7 parking in the tourist hub of Kathmandu",
      spaces: [
        {
          spaceId: "T001",
          type: "regular",
          status: "occupied",
          level: "Ground",
          section: "T",
          sensors: {
            sensorId: "SEN301",
            isActive: true,
            lastUpdate: new Date()
          }
        }
      ],
      rates: [
        {
          rateType: "hourly",
          price: 80,
          duration: 1,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        }
      ],
      amenities: ["cctv", "security_guard", "valet"],
      isActive: true,
      currentStatus: "open",
      stats: {
        totalBookings: 890,
        totalRevenue: 89000,
        averageOccupancy: 90,
        lastUpdated: new Date()
      }
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Durbar Marg Premium Parking",
      address: "Durbar Marg, Kathmandu, Nepal",
      coordinates: {
        latitude: 27.7064,
        longitude: 85.3157
      },
      totalSpaces: 25,
      availableSpaces: 5,
      hourlyRate: 100,
      operatingHours: {
        start: "08:00",
        end: "20:00"
      },
      contactNumber: "+977-1-4255890",
      description: "Premium parking facility in upscale Durbar Marg",
      spaces: [
        {
          spaceId: "P001",
          type: "regular",
          status: "available",
          level: "Ground",
          section: "P",
          sensors: {
            sensorId: "SEN401",
            isActive: true,
            lastUpdate: new Date()
          }
        }
      ],
      rates: [
        {
          rateType: "hourly",
          price: 100,
          duration: 1,
          effectiveDate: new Date("2024-01-01"),
          isActive: true
        }
      ],
      amenities: ["cctv", "security_guard", "covered", "valet", "car_wash"],
      isActive: true,
      currentStatus: "open",
      stats: {
        totalBookings: 567,
        totalRevenue: 78900,
        averageOccupancy: 80,
        lastUpdated: new Date()
      }
    }
  ],

  // Bookings data
  bookings: [
    {
      _id: new mongoose.Types.ObjectId(),
      userId: null, // Will be set to first user's ID
      locationId: null, // Will be set to first location's ID
      spaceId: "A001",
      vehicleInfo: {
        plateNumber: "BA-1-PA-1234",
        vehicleType: "car",
        make: "Toyota",
        model: "Corolla"
      },
      startTime: new Date("2025-08-10T10:00:00Z"),
      endTime: new Date("2025-08-10T14:00:00Z"),
      actualEntryTime: null,
      actualExitTime: null,
      status: "confirmed",
      totalAmount: 200,
      paymentStatus: "completed",
      paymentMethod: "esewa",
      paymentTransactionId: "ESW12345678",
      qrCode: "QR123456789",
      notes: "Regular booking for shopping",
      extensions: [],
      penalties: []
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: null, // Will be set to second user's ID
      locationId: null, // Will be set to second location's ID
      spaceId: "B001",
      vehicleInfo: {
        plateNumber: "BA-2-CHA-5678",
        vehicleType: "motorcycle",
        make: "Honda",
        model: "CB Shine"
      },
      startTime: new Date("2025-08-11T15:00:00Z"),
      endTime: new Date("2025-08-11T17:00:00Z"),
      status: "confirmed",
      totalAmount: 120,
      paymentStatus: "completed",
      paymentMethod: "paypal",
      paymentTransactionId: "PP987654321",
      qrCode: "QR987654321",
      notes: "Meeting appointment",
      extensions: [],
      penalties: []
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: null, // Will be set to third user's ID
      locationId: null, // Will be set to first location's ID
      spaceId: "A002",
      vehicleInfo: {
        plateNumber: "BA-3-KHA-9876",
        vehicleType: "car",
        make: "Hyundai",
        model: "i20"
      },
      startTime: new Date("2025-08-12T09:00:00Z"),
      endTime: new Date("2025-08-12T12:00:00Z"),
      actualEntryTime: null,
      actualExitTime: null,
      status: "confirmed",
      totalAmount: 150,
      paymentStatus: "completed",
      paymentMethod: "cash",
      notes: "Office meeting",
      extensions: [],
      penalties: []
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: null, // Will be set to first user's ID
      locationId: null, // Will be set to third location's ID
      spaceId: "T001",
      vehicleInfo: {
        plateNumber: "BA-1-PA-1234",
        vehicleType: "car",
        make: "Toyota",
        model: "Corolla"
      },
      startTime: new Date("2025-08-13T18:00:00Z"),
      endTime: new Date("2025-08-13T22:00:00Z"),
      status: "pending",
      totalAmount: 320,
      paymentStatus: "pending",
      paymentMethod: "esewa",
      notes: "Evening dinner reservation",
      extensions: [],
      penalties: []
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: null, // Will be set to second user's ID
      locationId: null, // Will be set to fourth location's ID
      spaceId: "P001",
      vehicleInfo: {
        plateNumber: "BA-2-CHA-5678",
        vehicleType: "motorcycle",
        make: "Honda",
        model: "CB Shine"
      },
      startTime: new Date("2025-08-14T14:00:00Z"),
      endTime: new Date("2025-08-14T16:00:00Z"),
      status: "cancelled",
      totalAmount: 200,
      paymentStatus: "refunded",
      paymentMethod: "paypal",
      paymentTransactionId: "PP456789123",
      notes: "Cancelled due to emergency",
      cancellation: {
        cancelledAt: new Date("2025-08-14T13:30:00Z"),
        cancelledBy: null,
        reason: "Emergency came up",
        refundAmount: 180,
        refundStatus: "processed"
      },
      extensions: [],
      penalties: []
    }
  ]
};

// Function to set up references between collections
function setupReferences() {
  // Set user references in bookings
  if (dummyData.users.length >= 3 && dummyData.bookings.length >= 5) {
    dummyData.bookings[0].userId = dummyData.users[0]._id; // John Doe
    dummyData.bookings[1].userId = dummyData.users[1]._id; // Jane Smith
    dummyData.bookings[2].userId = dummyData.users[4]._id; // Mike Jones
    dummyData.bookings[3].userId = dummyData.users[0]._id; // John Doe
    dummyData.bookings[4].userId = dummyData.users[1]._id; // Jane Smith
  }

  // Set location references in bookings
  if (dummyData.parkingLocations.length >= 4 && dummyData.bookings.length >= 5) {
    dummyData.bookings[0].locationId = dummyData.parkingLocations[0]._id; // Ratna Park
    dummyData.bookings[1].locationId = dummyData.parkingLocations[1]._id; // New Road
    dummyData.bookings[2].locationId = dummyData.parkingLocations[0]._id; // Ratna Park
    dummyData.bookings[3].locationId = dummyData.parkingLocations[2]._id; // Thamel
    dummyData.bookings[4].locationId = dummyData.parkingLocations[3]._id; // Durbar Marg
  }

  // Set cancellation references
  if (dummyData.bookings[4] && dummyData.users[1]) {
    dummyData.bookings[4].cancellation.cancelledBy = dummyData.users[1]._id;
  }
}

// Setup references
setupReferences();

// MongoDB insert scripts
const insertScripts = {
  // Script to insert all data
  insertAll: async function(db) {
    try {
      console.log('Inserting dummy data...');
      
      // Clear existing data
      await db.collection('users').deleteMany({});
      await db.collection('parkinglocations').deleteMany({});
      await db.collection('bookings').deleteMany({});
      
      // Insert users
      const userResult = await db.collection('users').insertMany(dummyData.users);
      console.log(`Inserted ${userResult.insertedCount} users`);
      
      // Insert parking locations
      const locationResult = await db.collection('parkinglocations').insertMany(dummyData.parkingLocations);
      console.log(`Inserted ${locationResult.insertedCount} parking locations`);
      
      // Insert bookings
      const bookingResult = await db.collection('bookings').insertMany(dummyData.bookings);
      console.log(`Inserted ${bookingResult.insertedCount} bookings`);
      
      console.log('All dummy data inserted successfully!');
      return true;
    } catch (error) {
      console.error('Error inserting dummy data:', error);
      return false;
    }
  },

  // Individual collection insert functions
  insertUsers: async function(db) {
    await db.collection('users').deleteMany({});
    return await db.collection('users').insertMany(dummyData.users);
  },

  insertLocations: async function(db) {
    await db.collection('parkinglocations').deleteMany({});
    return await db.collection('parkinglocations').insertMany(dummyData.parkingLocations);
  },

  insertBookings: async function(db) {
    await db.collection('bookings').deleteMany({});
    return await db.collection('bookings').insertMany(dummyData.bookings);
  }
};

// Usage examples for MongoDB shell or Node.js scripts:
const usageExamples = {
  // MongoDB Shell commands
  mongoShell: `
    // Use your database
    use pms_database;
    
    // Insert users
    db.users.insertMany(${JSON.stringify(dummyData.users, null, 2)});
    
    // Insert parking locations
    db.parkinglocations.insertMany(${JSON.stringify(dummyData.parkingLocations, null, 2)});
    
    // Insert bookings
    db.bookings.insertMany(${JSON.stringify(dummyData.bookings, null, 2)});
    
    // Verify data
    db.users.countDocuments();
    db.parkinglocations.countDocuments();
    db.bookings.countDocuments();
  `,
  
  // Node.js script example
  nodeScript: `
    const { MongoClient } = require('mongodb');
    const dummyData = require('./dummyData.js');
    
    async function insertDummyData() {
      const client = new MongoClient('mongodb://localhost:27017');
      await client.connect();
      const db = client.db('pms_database');
      
      await dummyData.insertScripts.insertAll(db);
      
      await client.close();
    }
    
    insertDummyData();
  `
};

module.exports = {
  dummyData,
  insertScripts,
  usageExamples
};