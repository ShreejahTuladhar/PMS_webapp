const mongoose = require('mongoose');
const ParkingLocation = require('../models/ParkingLocation');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/parking_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedImages = async () => {
  try {
    await connectDB();
    
    // Update all parking locations to have default image
    const imageResult = await ParkingLocation.updateMany(
      { images: { $exists: false } },
      {
        $set: {
          images: ["/images/default-parking.jpg"]
        }
      }
    );
    
    console.log(`✅ Updated ${imageResult.modifiedCount} parking locations with default images`);
    
    // Update all parking locations to have rate structure
    const locations = await ParkingLocation.find({});
    let rateUpdates = 0;
    
    for (const location of locations) {
      if (!location.rate || !location.rate.base) {
        location.rate = {
          base: location.hourlyRate || 100,
          discount: 0
        };
        await location.save();
        rateUpdates++;
      }
    }
    
    console.log(`✅ Updated ${rateUpdates} parking locations with rate structure`);
    
    // Add some sample discounts to a few locations
    const sampleDiscounts = [
      { discount: 10 },
      { discount: 15 },
      { discount: 20 },
      { discount: 25 }
    ];
    
    const sampleLocations = await ParkingLocation.find({}).limit(sampleDiscounts.length);
    
    for (let i = 0; i < sampleLocations.length && i < sampleDiscounts.length; i++) {
      sampleLocations[i].rate = {
        base: sampleLocations[i].hourlyRate || sampleLocations[i].rate?.base || 100,
        discount: sampleDiscounts[i].discount
      };
      await sampleLocations[i].save();
      console.log(`✅ Added ${sampleDiscounts[i].discount}% discount to ${sampleLocations[i].name}`);
    }
    
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedImages();