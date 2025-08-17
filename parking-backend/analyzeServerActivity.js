#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Enable detailed mongoose logging
mongoose.set('debug', function(collectionName, method, query, doc) {
  console.log(`🔍 [${new Date().toISOString()}] ${collectionName}.${method}`, 
    JSON.stringify(query, null, 2));
});

async function analyzeServerActivity() {
  try {
    console.log('📊 PARKSATHI DATABASE ACTIVITY LOG');
    console.log('=====================================');
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    console.log(`🔗 Database URI: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection established');
    
    // Database connection health
    console.log('\n📡 CONNECTION STATUS:');
    console.log(`   • Ready State: ${mongoose.connection.readyState === 1 ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
    console.log(`   • Database: ${mongoose.connection.name}`);
    console.log(`   • Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Import models
    const ParkingLocation = require('./models/ParkingLocation');
    const User = require('./models/User');
    const Booking = require('./models/Booking');
    
    console.log('\n🗃️  RECENT DATABASE QUERIES:');
    console.log('----------------------------');
    
    // Simulate the queries that happen during API calls
    console.log('\n1️⃣  USER AUTHENTICATION QUERY:');
    const demoUser = await User.findOne({ email: 'demo@test.com' }).select('+password');
    console.log(`   Result: ${demoUser ? '✅ User found' : '❌ User not found'}`);
    
    console.log('\n2️⃣  LOCATION SEARCH QUERY:');
    const locations = await ParkingLocation.find({ isActive: true })
      .limit(5)
      .select('name address coordinates isCurrentlyOpen availableSpaces');
    console.log(`   Result: ✅ Found ${locations.length} active locations`);
    
    console.log('\n3️⃣  BOOKING CREATION QUERY:');
    const recentBooking = await Booking.findOne()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('locationId', 'name address');
    console.log(`   Latest booking: ${recentBooking?.userId?.firstName} at ${recentBooking?.locationId?.name}`);
    console.log(`   Status: ${recentBooking?.status} | Payment: ${recentBooking?.paymentStatus}`);
    
    console.log('\n4️⃣  AVAILABILITY UPDATE QUERY:');
    const location = await ParkingLocation.findById('689a2030e1350fa9fdc0be32');
    if (location) {
      console.log(`   Location: ${location.name}`);
      console.log(`   Available Spaces: ${location.availableSpaces}/${location.totalSpaces}`);
      console.log(`   Currently Open: ${location.isCurrentlyOpen()}`);
    }
    
    // Check recent activity patterns
    console.log('\n📈 ACTIVITY SUMMARY:');
    console.log('-------------------');
    
    const stats = await Promise.all([
      User.countDocuments(),
      ParkingLocation.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ paymentStatus: 'completed' })
    ]);
    
    console.log(`   👥 Total Users: ${stats[0]}`);
    console.log(`   🅿️  Total Locations: ${stats[1]}`);
    console.log(`   📅 Total Bookings: ${stats[2]}`);
    console.log(`   🆕 Bookings (24h): ${stats[3]}`);
    console.log(`   ✅ Confirmed Bookings: ${stats[4]}`);
    console.log(`   💰 Completed Payments: ${stats[5]}`);
    
    // Check database indexes
    console.log('\n🔍 INDEX STATUS:');
    console.log('---------------');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await mongoose.connection.db.collection(collection.name).indexes();
      console.log(`   ${collection.name}: ${indexes.length} indexes`);
    }
    
    console.log('\n🕐 PERFORMANCE METRICS:');
    console.log('----------------------');
    const dbStats = await mongoose.connection.db.stats();
    console.log(`   Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Object Size: ${dbStats.avgObjSize} bytes`);
    console.log(`   Total Objects: ${dbStats.objects}`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Analysis complete - Database connection closed');
  }
}

console.log('Starting ParkSathi database activity analysis...\n');
analyzeServerActivity();