const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding for MongoDB Atlas...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (be careful in production!)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await ParkingLocation.deleteMany({});
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@parksathi.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      phoneNumber: '+977-9800000000',
      role: 'super_admin',
    });

    // Create sample customer
    console.log('👤 Creating sample customer...');
    const customer = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+977-9800000001',
      role: 'customer',
      vehicles: [{
        plateNumber: 'BA-1-PA-1234',
        vehicleType: 'car',
        make: 'Toyota',
        model: 'Corolla'
      }]
    });

    // Create sample parking locations
    console.log('🅿️  Creating sample parking locations...');
    
    const locations = [
      {
        name: 'Kathmandu Mall Parking',
        address: 'Sundhara, Kathmandu, Nepal',
        coordinates: {
          latitude: 27.7025,
          longitude: 85.3137
        },
        totalSpaces: 50,
        availableSpaces: 45,
        hourlyRate: 50,
        operatingHours: {
          start: '06:00',
          end: '22:00'
        },
        spaces: Array.from({ length: 50 }, (_, i) => ({
          spaceId: `A${i + 1}`,
          level: i < 25 ? 'Ground' : 'First',
          section: 'A',
          status: i < 45 ? 'available' : 'occupied',
          supportedVehicles: ['car'],
          dimensions: { length: 5, width: 2.5 }
        })),
        amenities: ['cctv', 'security_guard', 'covered'],
        contactInfo: {
          phone: '+977-1-4441234',
          email: 'info@ktmmall.com'
        }
      },
      {
        name: 'Thamel Central Parking',
        address: 'Thamel, Kathmandu, Nepal',
        coordinates: {
          latitude: 27.7152,
          longitude: 85.3124
        },
        totalSpaces: 30,
        availableSpaces: 28,
        hourlyRate: 75,
        operatingHours: {
          start: '05:00',
          end: '23:00'
        },
        spaces: Array.from({ length: 30 }, (_, i) => ({
          spaceId: `B${i + 1}`,
          level: 'Ground',
          section: 'B',
          status: i < 28 ? 'available' : 'occupied',
          supportedVehicles: ['car', 'motorcycle'],
          dimensions: { length: 4.5, width: 2.3 }
        })),
        amenities: ['cctv', 'valet'],
        contactInfo: {
          phone: '+977-1-4445678',
          email: 'parking@thamel.com'
        }
      },
      {
        name: 'Patan Hospital Parking',
        address: 'Lagankhel, Patan, Nepal',
        coordinates: {
          latitude: 27.6766,
          longitude: 85.3232
        },
        totalSpaces: 40,
        availableSpaces: 35,
        hourlyRate: 40,
        operatingHours: {
          start: '00:00',
          end: '23:59'
        },
        spaces: Array.from({ length: 40 }, (_, i) => ({
          spaceId: `C${i + 1}`,
          level: 'Ground',
          section: 'C',
          status: i < 35 ? 'available' : 'occupied',
          supportedVehicles: ['car'],
          dimensions: { length: 5, width: 2.5 }
        })),
        amenities: ['cctv', 'security_guard'],
        contactInfo: {
          phone: '+977-1-5522266',
          email: 'parking@patanhospital.org.np'
        }
      }
    ];

    await ParkingLocation.insertMany(locations);

    console.log('✅ Database seeding completed successfully!');
    console.log(`👤 Created users: ${adminUser.username}, ${customer.username}`);
    console.log(`🅿️  Created ${locations.length} parking locations`);
    console.log('🔐 Admin credentials: admin@parksathi.com / admin123');
    console.log('🔐 Customer credentials: john@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
if (require.main === module) {
  seedData();
}

module.exports = seedData;