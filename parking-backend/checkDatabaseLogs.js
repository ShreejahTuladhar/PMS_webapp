#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Enable mongoose debug mode to see database queries
mongoose.set('debug', true);

async function checkDatabaseActivity() {
  try {
    console.log('🔍 Connecting to database to check recent activity...');
    console.log(`Database URI: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log(`📡 Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    // Get database stats
    const adminDb = mongoose.connection.db.admin();
    const dbStats = await mongoose.connection.db.stats();
    
    console.log('\n📈 Database Statistics:');
    console.log(`  • Collections: ${dbStats.collections}`);
    console.log(`  • Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  • Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  • Indexes: ${dbStats.indexes}`);
    console.log(`  • Objects: ${dbStats.objects}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Available Collections:');
    collections.forEach(collection => {
      console.log(`  • ${collection.name}`);
    });
    
    // Test a simple query to generate log output
    console.log('\n🔍 Testing database queries (check debug output):');
    
    // Import models
    const ParkingLocation = require('./models/ParkingLocation');
    const User = require('./models/User');
    const Booking = require('./models/Booking');
    
    // Test queries
    console.log('\n1. Counting parking locations...');
    const locationCount = await ParkingLocation.countDocuments();
    console.log(`   Found ${locationCount} parking locations`);
    
    console.log('\n2. Counting users...');
    const userCount = await User.countDocuments();
    console.log(`   Found ${userCount} users`);
    
    console.log('\n3. Counting bookings...');
    const bookingCount = await Booking.countDocuments();
    console.log(`   Found ${bookingCount} bookings`);
    
    // Get recent bookings
    console.log('\n4. Fetching recent bookings...');
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email')
      .populate('locationId', 'name address');
    
    console.log(`   Found ${recentBookings.length} recent bookings:`);
    recentBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.userId?.firstName} ${booking.userId?.lastName} - ${booking.locationId?.name} (${booking.status})`);
    });
    
    // Check connection events
    console.log('\n📊 Connection Events:');
    console.log(`   • Current state: ${mongoose.connection.readyState}`);
    console.log(`   • Host: ${mongoose.connection.host}`);
    console.log(`   • Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabaseActivity();