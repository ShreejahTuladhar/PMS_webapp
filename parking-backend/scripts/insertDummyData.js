const mongoose = require('mongoose');
const { dummyData, insertScripts } = require('../data/dummyData.js');
require('dotenv').config();

const insertDummyData = async () => {
  try {
    console.log(' Starting dummy data insertion...');
    console.log(` Connecting to: ${process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@')}`);
    
    // Connect to MongoDB
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ Connected to MongoDB');
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // Insert all dummy data
    const success = await insertScripts.insertAll(db);
    
    if (success) {
      console.log('\n DUMMY DATA INSERTION COMPLETED!');
      console.log('\n📊 Summary:');
      console.log('👥 Users: 5 (including admin accounts)');
      console.log(' Locations: 4 (Ratna Park, New Road, Thamel, Durbar Marg)');
      console.log('🅿️ Bookings: 5 (various statuses for demo)');
      
      console.log('\n🔐 Demo Accounts:');
      console.log('Customer: john_doe / password123');
      console.log('Customer: jane_smith / password123');
      console.log('Customer: mike_jones / password123');
      console.log('Parking Admin: admin_ram / password123');
      console.log('Super Admin: super_admin / password123');
      
      console.log('\n Your demo environment is ready!');
      
      // Show collection counts to verify
      const userCount = await db.collection('users').countDocuments();
      const locationCount = await db.collection('parkinglocations').countDocuments();
      const bookingCount = await db.collection('bookings').countDocuments();
      
      console.log('\n📈 Verification:');
      console.log(`Users in DB: ${userCount}`);
      console.log(`Locations in DB: ${locationCount}`);
      console.log(`Bookings in DB: ${bookingCount}`);
      
    } else {
      console.log('❌ Dummy data insertion failed');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during dummy data insertion:');
    console.error(error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('  Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('  Check your MongoDB connection string');
    }
    
    process.exit(1);
  }
};

// Run the insertion
insertDummyData();