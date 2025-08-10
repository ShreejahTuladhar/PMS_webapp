require('dotenv').config();
const mongoose = require('mongoose');
const { dummyData } = require('./data/dummyData');

// Import models
const User = require('./models/User');
const ParkingLocation = require('./models/ParkingLocation');
const Booking = require('./models/Booking');

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms_database';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await ParkingLocation.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function insertDummyData() {
  try {
    console.log('📝 Inserting dummy data...');

    // Insert users first
    console.log('👥 Inserting users...');
    const insertedUsers = await User.insertMany(dummyData.users);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Insert parking locations
    console.log('🏢 Inserting parking locations...');
    const insertedLocations = await ParkingLocation.insertMany(dummyData.parkingLocations);
    console.log(`✅ Inserted ${insertedLocations.length} parking locations`);

    // Update booking references with actual IDs
    const updatedBookings = dummyData.bookings.map((booking, index) => {
      const bookingCopy = { ...booking };
      
      // Set user references
      switch (index) {
        case 0:
        case 3:
          bookingCopy.userId = insertedUsers[0]._id; // John Doe
          break;
        case 1:
        case 4:
          bookingCopy.userId = insertedUsers[1]._id; // Jane Smith
          break;
        case 2:
          bookingCopy.userId = insertedUsers[4]._id; // Mike Jones
          break;
      }

      // Set location references
      switch (index) {
        case 0:
        case 2:
          bookingCopy.locationId = insertedLocations[0]._id; // Ratna Park
          break;
        case 1:
          bookingCopy.locationId = insertedLocations[1]._id; // New Road
          break;
        case 3:
          bookingCopy.locationId = insertedLocations[2]._id; // Thamel
          break;
        case 4:
          bookingCopy.locationId = insertedLocations[3]._id; // Durbar Marg
          if (bookingCopy.cancellation) {
            bookingCopy.cancellation.cancelledBy = insertedUsers[1]._id;
          }
          break;
      }

      return bookingCopy;
    });

    // Insert bookings
    console.log('📅 Inserting bookings...');
    const insertedBookings = await Booking.insertMany(updatedBookings);
    console.log(`✅ Inserted ${insertedBookings.length} bookings`);

    return {
      users: insertedUsers.length,
      locations: insertedLocations.length,
      bookings: insertedBookings.length
    };
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error.message);
    throw error;
  }
}

async function verifyData() {
  try {
    console.log('🔍 Verifying inserted data...');
    
    const userCount = await User.countDocuments();
    const locationCount = await ParkingLocation.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    console.log('\n📊 Data Summary:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏢 Parking Locations: ${locationCount}`);
    console.log(`📅 Bookings: ${bookingCount}`);

    // Show sample users
    console.log('\n👤 Sample Users:');
    const sampleUsers = await User.find().select('username email role firstName lastName').limit(3);
    sampleUsers.forEach(user => {
      console.log(`   • ${user.firstName} ${user.lastName} (@${user.username}) - ${user.role}`);
    });

    // Show sample locations
    console.log('\n🏢 Sample Locations:');
    const sampleLocations = await ParkingLocation.find().select('name address totalSpaces availableSpaces hourlyRate').limit(3);
    sampleLocations.forEach(location => {
      console.log(`   • ${location.name} - ${location.availableSpaces}/${location.totalSpaces} spaces - Rs.${location.hourlyRate}/hr`);
    });

    // Show sample bookings
    console.log('\n📅 Sample Bookings:');
    const sampleBookings = await Booking.find()
      .populate('userId', 'firstName lastName')
      .populate('locationId', 'name')
      .select('status totalAmount vehicleInfo startTime')
      .limit(3);
    
    sampleBookings.forEach(booking => {
      const userName = booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : 'Unknown User';
      const locationName = booking.locationId ? booking.locationId.name : 'Unknown Location';
      console.log(`   • ${userName} - ${locationName} - ${booking.status} - Rs.${booking.totalAmount}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
    return false;
  }
}

async function setupDemo() {
  console.log('🚀 Setting up PMS Demo Database...\n');
  
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      process.exit(1);
    }

    // Clear existing data
    await clearDatabase();

    // Insert dummy data
    const results = await insertDummyData();

    // Verify data
    await verifyData();

    console.log('\n✅ Demo setup completed successfully!');
    console.log('\n🎯 Demo Credentials:');
    console.log('   Customer: john_doe / password123');
    console.log('   Customer: jane_smith / password123');
    console.log('   Admin: admin_ram / password123');
    console.log('   Super Admin: super_admin / password123');
    
    console.log('\n🗺️ Demo Locations:');
    console.log('   • Ratna Park Parking (Rs.50/hr)');
    console.log('   • New Road Shopping Plaza (Rs.60/hr)');
    console.log('   • Thamel Tourist Hub (Rs.80/hr)');
    console.log('   • Durbar Marg Premium (Rs.100/hr)');

  } catch (error) {
    console.error('\n❌ Demo setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the demo setup
if (require.main === module) {
  setupDemo();
}

module.exports = { setupDemo, connectToDatabase, insertDummyData, verifyData };