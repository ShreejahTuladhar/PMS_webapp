const mongoose = require('mongoose');
const ParkingLocation = require('../models/ParkingLocation');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Source databases to consolidate from
const databases = [
  'parking_management', 
  'parking_system', 
  'parking_management_db',
  'parksathi_db'
];

// Target database
const TARGET_DB = 'parksathi_main';

const consolidateDatabase = async () => {
  try {
    console.log('🔄 Starting database consolidation...');
    
    // Connect to target database
    await mongoose.connect(`mongodb://localhost:27017/${TARGET_DB}`);
    console.log(`✅ Connected to target database: ${TARGET_DB}`);
    
    let totalLocations = 0;
    let totalUsers = 0;
    let totalBookings = 0;
    
    // Process each source database
    for (const dbName of databases) {
      console.log(`\n📦 Processing database: ${dbName}`);
      
      // Connect to source database
      const sourceConn = await mongoose.createConnection(`mongodb://localhost:27017/${dbName}`);
      
      try {
        // Wait for connection
        await new Promise((resolve, reject) => {
          sourceConn.on('connected', resolve);
          sourceConn.on('error', reject);
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
        
        // Get collections info
        const collections = await sourceConn.db.listCollections().toArray();
        console.log(`  Collections found: ${collections.map(c => c.name).join(', ')}`);
        
        // Migrate parking locations
        if (collections.find(c => c.name === 'parkinglocations')) {
          const sourceLocations = sourceConn.model('ParkingLocation', ParkingLocation.schema);
          const locations = await sourceLocations.find({});
          
          console.log(`  📍 Found ${locations.length} parking locations`);
          
          for (const location of locations) {
            try {
              // Add missing fields for newer schema
              const locationData = {
                ...location.toObject(),
                _id: undefined, // Let MongoDB generate new ID to avoid conflicts
              };
              
              // Ensure new fields exist
              if (!locationData.images) {
                locationData.images = ['/images/default-parking.jpg'];
              }
              
              if (!locationData.rate) {
                locationData.rate = {
                  base: locationData.hourlyRate || 100,
                  discount: 0
                };
              }
              
              // Check if location already exists (by name and coordinates)
              const existing = await ParkingLocation.findOne({
                name: locationData.name,
                'coordinates.latitude': locationData.coordinates.latitude,
                'coordinates.longitude': locationData.coordinates.longitude
              });
              
              if (!existing) {
                const newLocation = new ParkingLocation(locationData);
                await newLocation.save();
                totalLocations++;
                console.log(`    ✅ Migrated: ${location.name}`);
              } else {
                console.log(`    ⏭️  Skipped duplicate: ${location.name}`);
              }
            } catch (error) {
              console.log(`    ❌ Failed to migrate ${location.name}: ${error.message}`);
            }
          }
        }
        
        // Migrate users
        if (collections.find(c => c.name === 'users')) {
          const sourceUsers = sourceConn.model('User', User.schema);
          const users = await sourceUsers.find({});
          
          console.log(`  👥 Found ${users.length} users`);
          
          for (const user of users) {
            try {
              const existing = await User.findOne({ email: user.email });
              if (!existing) {
                const userData = { ...user.toObject(), _id: undefined };
                const newUser = new User(userData);
                await newUser.save();
                totalUsers++;
                console.log(`    ✅ Migrated user: ${user.email}`);
              } else {
                console.log(`    ⏭️  Skipped duplicate user: ${user.email}`);
              }
            } catch (error) {
              console.log(`    ❌ Failed to migrate user ${user.email}: ${error.message}`);
            }
          }
        }
        
        // Migrate bookings
        if (collections.find(c => c.name === 'bookings')) {
          const sourceBookings = sourceConn.model('Booking', Booking.schema);
          const bookings = await sourceBookings.find({});
          
          console.log(`  📅 Found ${bookings.length} bookings`);
          
          for (const booking of bookings) {
            try {
              // Check if booking already exists
              const existing = await Booking.findById(booking._id);
              if (!existing) {
                const bookingData = { ...booking.toObject() };
                const newBooking = new Booking(bookingData);
                await newBooking.save();
                totalBookings++;
                console.log(`    ✅ Migrated booking: ${booking._id}`);
              } else {
                console.log(`    ⏭️  Skipped duplicate booking: ${booking._id}`);
              }
            } catch (error) {
              console.log(`    ❌ Failed to migrate booking ${booking._id}: ${error.message}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`  ❌ Error processing ${dbName}: ${error.message}`);
      } finally {
        await sourceConn.close();
      }
    }
    
    console.log('\n🎉 Database consolidation completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Locations migrated: ${totalLocations}`);
    console.log(`  • Users migrated: ${totalUsers}`);
    console.log(`  • Bookings migrated: ${totalBookings}`);
    console.log(`  • Target database: ${TARGET_DB}`);
    
    // Update sample locations with discounts
    console.log('\n🎯 Adding sample discounts to locations...');
    const sampleDiscounts = [10, 15, 20, 25, 30];
    const locations = await ParkingLocation.find({}).limit(sampleDiscounts.length);
    
    for (let i = 0; i < locations.length && i < sampleDiscounts.length; i++) {
      locations[i].rate.discount = sampleDiscounts[i];
      await locations[i].save();
      console.log(`  ✅ Added ${sampleDiscounts[i]}% discount to ${locations[i].name}`);
    }
    
    console.log('\n✨ All done! Update your .env MONGODB_URI to:');
    console.log(`   MONGODB_URI=mongodb://localhost:27017/${TARGET_DB}`);
    
  } catch (error) {
    console.error('❌ Consolidation failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

consolidateDatabase();