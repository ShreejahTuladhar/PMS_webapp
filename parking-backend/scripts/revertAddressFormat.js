const mongoose = require('mongoose');

const revertAddressFormat = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/parking_management');
    console.log('✅ Connected to parking_management database');
    
    // Get reference addresses from test collection
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ Connected to test database for reference');
    
    const testLocations = await mongoose.connection.db.collection('parkinglocations').find({}).toArray();
    console.log(`📥 Found ${testLocations.length} reference locations in test database`);
    
    // Create a mapping of area names to detailed addresses
    const areaToDetailedAddress = {};
    testLocations.forEach(loc => {
      if (loc.address && loc.address.includes(',')) {
        const areaName = loc.address.split(',')[0].trim();
        // Prefer more detailed addresses (ones with postal codes or specific city names)
        if (!areaToDetailedAddress[areaName] || 
            loc.address.match(/\d{5}/) || // has postal code
            loc.address.includes('Lalitpur') || 
            loc.address.includes('Bhaktapur') ||
            loc.address.includes('Pokhara')) {
          areaToDetailedAddress[areaName] = loc.address;
        }
      }
    });
    
    console.log('📋 Area to detailed address mapping:');
    Object.entries(areaToDetailedAddress).forEach(([area, addr]) => {
      console.log(`  ${area} → ${addr}`);
    });
    
    // Now connect back to parking_management and update addresses
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/parking_management');
    console.log('✅ Reconnected to parking_management database');
    
    const locations = await mongoose.connection.db.collection('locations').find({}).toArray();
    console.log(`📥 Found ${locations.length} locations to update`);
    
    let updatedCount = 0;
    
    for (const location of locations) {
      try {
        if (location.address) {
          const currentAreaName = location.address.split(',')[0].trim();
          const detailedAddress = areaToDetailedAddress[currentAreaName];
          
          if (detailedAddress && detailedAddress !== location.address) {
            await mongoose.connection.db.collection('locations').updateOne(
              { _id: location._id },
              { $set: { address: detailedAddress } }
            );
            console.log(`🔄 Updated ${location.name}: ${location.address} → ${detailedAddress}`);
            updatedCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to update ${location.name}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Address format revert completed!`);
    console.log(`📊 Updated ${updatedCount}/${locations.length} locations`);
    
    // Show sample of updated addresses
    console.log('\n📋 Sample updated addresses:');
    const samples = await mongoose.connection.db.collection('locations').find({}).limit(5).toArray();
    samples.forEach(loc => {
      console.log(`  • ${loc.name}: ${loc.address}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Revert failed:', error);
    process.exit(1);
  }
};

revertAddressFormat();