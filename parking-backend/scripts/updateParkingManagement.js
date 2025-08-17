const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/parking_management');
    console.log('MongoDB connected for updating...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const updateParkingManagement = async () => {
  try {
    await connectDB();
    
    // Update all documents in 'locations' collection to add new fields
    console.log('Updating locations collection...');
    
    // First, add default images to documents that don't have them
    const imageResult = await mongoose.connection.db.collection('locations').updateMany(
      { images: { $exists: false } },
      { $set: { images: ["/images/default-parking.jpg"] } }
    );
    console.log(`✅ Updated ${imageResult.modifiedCount} locations with default images`);
    
    // Get all locations to update rate structure
    const locations = await mongoose.connection.db.collection('locations').find({}).toArray();
    let rateUpdates = 0;
    
    for (const location of locations) {
      if (!location.rate || !location.rate.base) {
        await mongoose.connection.db.collection('locations').updateOne(
          { _id: location._id },
          {
            $set: {
              rate: {
                base: location.hourlyRate || 100,
                discount: 0
              }
            }
          }
        );
        rateUpdates++;
      }
    }
    
    console.log(`✅ Updated ${rateUpdates} locations with rate structure`);
    
    // Add some sample discounts to first few locations
    const sampleDiscounts = [10, 15, 20, 25, 30];
    const sampleLocations = await mongoose.connection.db.collection('locations').find({}).limit(sampleDiscounts.length).toArray();
    
    for (let i = 0; i < sampleLocations.length && i < sampleDiscounts.length; i++) {
      await mongoose.connection.db.collection('locations').updateOne(
        { _id: sampleLocations[i]._id },
        {
          $set: {
            'rate.discount': sampleDiscounts[i]
          }
        }
      );
      console.log(`✅ Added ${sampleDiscounts[i]}% discount to ${sampleLocations[i].name}`);
    }
    
    // Show final count
    const finalCount = await mongoose.connection.db.collection('locations').countDocuments();
    console.log(`📊 Total locations in database: ${finalCount}`);
    
    // Show sample of updated documents
    const sample = await mongoose.connection.db.collection('locations').findOne(
      {},
      { name: 1, rate: 1, images: 1, hourlyRate: 1, availableSpaces: 1 }
    );
    console.log('📝 Sample updated document:', JSON.stringify(sample, null, 2));
    
    console.log('🎉 Database update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
};

updateParkingManagement();