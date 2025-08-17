const mongoose = require('mongoose');

const migrateUsers = async () => {
  try {
    // Connect to source database (test)
    const sourceConn = mongoose.createConnection('mongodb://localhost:27017/test');
    await new Promise((resolve, reject) => {
      sourceConn.on('connected', resolve);
      sourceConn.on('error', reject);
      setTimeout(() => reject(new Error('Source connection timeout')), 5000);
    });
    console.log('✅ Connected to source database: test');
    
    // Connect to target database (parking_management)
    const targetConn = mongoose.createConnection('mongodb://localhost:27017/parking_management');
    await new Promise((resolve, reject) => {
      targetConn.on('connected', resolve);
      targetConn.on('error', reject);
      setTimeout(() => reject(new Error('Target connection timeout')), 5000);
    });
    console.log('✅ Connected to target database: parking_management');
    
    // Get all users from source
    const users = await sourceConn.db.collection('users').find({}).toArray();
    console.log(`📥 Found ${users.length} users in source database`);
    
    // Insert users into target database
    if (users.length > 0) {
      await targetConn.db.collection('users').insertMany(users);
      console.log(`📤 Migrated ${users.length} users to parking_management database`);
      
      // Show migrated users
      console.log('\n📋 Migrated users:');
      users.forEach(user => {
        console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      });
    }
    
    // Also migrate bookings if they exist
    const bookings = await sourceConn.db.collection('bookings').find({}).toArray();
    if (bookings.length > 0) {
      await targetConn.db.collection('bookings').insertMany(bookings);
      console.log(`📤 Migrated ${bookings.length} bookings to parking_management database`);
    }
    
    // Check final counts
    const finalUserCount = await targetConn.db.collection('users').countDocuments();
    const finalBookingCount = await targetConn.db.collection('bookings').countDocuments();
    
    console.log('\n📊 Final counts in parking_management:');
    console.log(`  • Users: ${finalUserCount}`);
    console.log(`  • Bookings: ${finalBookingCount}`);
    console.log(`  • Locations: ${await targetConn.db.collection('locations').countDocuments()}`);
    
    console.log('\n🎉 User migration completed successfully!');
    
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();