const mongoose = require('mongoose');
require('dotenv').config();

async function viewDemoData() {
  try {
    console.log(' Viewing Demo Data in MongoDB\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    
    const db = mongoose.connection.db;
    
    // Get Users
    console.log('👥 USERS:');
    const users = await db.collection('users').find({}).toArray();
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (@${user.username})`);
      console.log(`     📧 ${user.email} | 🎭 ${user.role}`);
      console.log(`      Vehicles: ${user.vehicles?.length || 0}`);
      if (user.vehicles && user.vehicles.length > 0) {
        user.vehicles.forEach(vehicle => {
          console.log(`        - ${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})`);
        });
      }
      console.log('');
    });
    
    // Get Parking Locations
    console.log('\n PARKING LOCATIONS:');
    const locations = await db.collection('parkinglocations').find({}).toArray();
    locations.forEach((location, index) => {
      console.log(`  ${index + 1}. ${location.name}`);
      console.log(`      ${location.address}`);
      console.log(`     🅿️  ${location.availableSpaces}/${location.totalSpaces} spaces available`);
      console.log(`     💰 Rs.${location.hourlyRate}/hour`);
      console.log(`      ${location.operatingHours.start} - ${location.operatingHours.end}`);
      console.log(`      Amenities: ${location.amenities?.join(', ') || 'None'}`);
      console.log('');
    });
    
    // Get Bookings
    console.log('\n🅿️ BOOKINGS:');
    const bookings = await db.collection('bookings').find({}).toArray();
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. Booking ${booking._id.toString().slice(-6)}`);
      console.log(`      ${booking.vehicleInfo.plateNumber} (${booking.vehicleInfo.make} ${booking.vehicleInfo.model})`);
      console.log(`     📅 ${new Date(booking.startTime).toLocaleDateString()} ${new Date(booking.startTime).toLocaleTimeString()}`);
      console.log(`      ${Math.round((booking.endTime - booking.startTime) / (1000 * 60 * 60))} hours`);
      console.log(`     📊 Status: ${booking.status} | 💰 Rs.${booking.totalAmount}`);
      console.log(`      Payment: ${booking.paymentMethod} (${booking.paymentStatus})`);
      if (booking.notes) {
        console.log(`     📝 ${booking.notes}`);
      }
      console.log('');
    });
    
    console.log(' Demo Data Overview Complete!');
    console.log(`\n📊 Summary: ${users.length} users, ${locations.length} locations, ${bookings.length} bookings`);
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error viewing demo data:', error.message);
    process.exit(1);
  }
}

viewDemoData();