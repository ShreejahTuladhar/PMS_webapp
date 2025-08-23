const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parksathi');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Valid amenity values according to the schema
const validAmenities = [
  "cctv",
  "security_guard", 
  "security", // legacy support
  "lighting", // legacy support
  "covered",
  "covered_parking", // support for covered_parking
  "ev_charging",
  "car_wash",
  "valet",
  "valet_parking", // legacy support
  "disabled_access",
  "bike_parking", 
  "restroom", // support for restroom facilities
  "online_booking", // support for online booking
  "smart_parking", // support for smart parking
  "24_hour", // support for 24 hour access
  "attendant", // support for parking attendant
];

// Clean amenities data
const cleanAmenitiesData = async () => {
  try {
    const ParkingLocation = mongoose.model('ParkingLocation');
    
    console.log('🔍 Finding locations with invalid amenities...');
    
    const locations = await ParkingLocation.find({});
    let updatedCount = 0;
    let totalInvalidAmenities = 0;
    
    for (const location of locations) {
      const originalAmenities = [...(location.amenities || [])];
      const cleanedAmenities = [];
      
      for (const amenity of originalAmenities) {
        if (validAmenities.includes(amenity)) {
          cleanedAmenities.push(amenity);
        } else {
          console.log(`❌ Invalid amenity "${amenity}" found in location: ${location.name}`);
          totalInvalidAmenities++;
          
          // Try to map common invalid values to valid ones
          const mappedAmenity = mapInvalidAmenity(amenity);
          if (mappedAmenity && !cleanedAmenities.includes(mappedAmenity)) {
            cleanedAmenities.push(mappedAmenity);
            console.log(`🔄 Mapped "${amenity}" to "${mappedAmenity}"`);
          }
        }
      }
      
      // Remove duplicates
      const uniqueAmenities = [...new Set(cleanedAmenities)];
      
      if (JSON.stringify(originalAmenities) !== JSON.stringify(uniqueAmenities)) {
        location.amenities = uniqueAmenities;
        await location.save({ validateBeforeSave: false }); // Skip validation to allow update
        updatedCount++;
        console.log(`✅ Updated amenities for: ${location.name}`);
        console.log(`   Before: [${originalAmenities.join(', ')}]`);
        console.log(`   After:  [${uniqueAmenities.join(', ')}]`);
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Total locations: ${locations.length}`);
    console.log(`   Invalid amenities found: ${totalInvalidAmenities}`);
    console.log(`   Locations updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error cleaning amenities data:', error);
  }
};

// Map invalid amenities to valid ones
const mapInvalidAmenity = (invalid) => {
  const mappings = {
    'barrier_free': 'disabled_access',
    'lighting_good': 'lighting',
    'security_cameras': 'cctv',
    'guard': 'security_guard',
    'sheltered': 'covered',
    'covered_area': 'covered',
    'electric_charging': 'ev_charging',
    'handicap': 'disabled_access',
    'handicapped': 'disabled_access',
    'wheelchair': 'disabled_access',
    'toilet': 'restroom',
    'restrooms': 'restroom',
    'bathroom': 'restroom',
    'toilets': 'restroom',
    '24hr': '24_hour',
    '24hrs': '24_hour',
    'all_day': '24_hour',
  };
  
  const lowercaseInvalid = invalid.toLowerCase().trim();
  
  // Direct mapping
  if (mappings[lowercaseInvalid]) {
    return mappings[lowercaseInvalid];
  }
  
  // Partial matches
  if (lowercaseInvalid.includes('security')) return 'security_guard';
  if (lowercaseInvalid.includes('cover')) return 'covered';
  if (lowercaseInvalid.includes('cctv') || lowercaseInvalid.includes('camera')) return 'cctv';
  if (lowercaseInvalid.includes('light')) return 'lighting';
  if (lowercaseInvalid.includes('disabled') || lowercaseInvalid.includes('handicap')) return 'disabled_access';
  if (lowercaseInvalid.includes('electric') || lowercaseInvalid.includes('charging')) return 'ev_charging';
  if (lowercaseInvalid.includes('wash')) return 'car_wash';
  if (lowercaseInvalid.includes('valet')) return 'valet';
  if (lowercaseInvalid.includes('bike')) return 'bike_parking';
  if (lowercaseInvalid.includes('toilet') || lowercaseInvalid.includes('restroom')) return 'restroom';
  if (lowercaseInvalid.includes('24') || lowercaseInvalid.includes('hour')) return '24_hour';
  
  return null;
};

// Main execution
const main = async () => {
  console.log('🧹 Starting amenities data cleanup...\n');
  
  await connectDB();
  
  // Import the model after connection
  require('../models/ParkingLocation');
  
  await cleanAmenitiesData();
  
  console.log('\n✅ Cleanup completed!');
  mongoose.disconnect();
};

main().catch(error => {
  console.error('❌ Script failed:', error);
  mongoose.disconnect();
  process.exit(1);
});