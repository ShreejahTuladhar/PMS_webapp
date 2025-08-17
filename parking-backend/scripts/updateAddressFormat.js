const mongoose = require('mongoose');

const updateAddressFormat = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/parking_management');
    console.log('✅ Connected to parking_management database');
    
    // Get all locations
    const locations = await mongoose.connection.db.collection('locations').find({}).toArray();
    console.log(`📥 Found ${locations.length} locations to update`);
    
    let updatedCount = 0;
    
    for (const location of locations) {
      try {
        // Extract area name from current address
        let areaName = '';
        const currentAddress = location.address;
        
        // Try to extract area name from the beginning of the address
        if (currentAddress) {
          // Split by comma and take the first part
          const parts = currentAddress.split(',');
          let firstPart = parts[0].trim();
          
          // Extract meaningful area name from the first part
          // Remove common words and patterns
          firstPart = firstPart
            .replace(/Heritage Site/gi, '')
            .replace(/Market Area/gi, '')
            .replace(/Car Park/gi, '')
            .replace(/Parking/gi, '')
            .replace(/Multi-level/gi, '')
            .replace(/Building/gi, '')
            .replace(/Hotel/gi, '')
            .replace(/\d+\s*(Galli|Lane|Marg|Road)/gi, '')
            .trim();
          
          // Handle specific cases
          if (firstPart.includes('Durbar Square')) {
            areaName = firstPart.includes('Patan') ? 'Patan' : 'Durbar Square';
          } else if (firstPart.includes('Jawalakhel')) {
            areaName = 'Jawalakhel';
          } else if (firstPart.includes('Thamel')) {
            areaName = 'Thamel';
          } else if (firstPart.includes('Ratna Park')) {
            areaName = 'Ratnapark';
          } else if (firstPart.includes('New Road')) {
            areaName = 'New Road';
          } else if (firstPart.includes('Baneshwor')) {
            areaName = 'Baneshwor';
          } else if (firstPart.includes('Koteshwor')) {
            areaName = 'Koteshwor';
          } else if (firstPart.includes('Lagankhel')) {
            areaName = 'Lagankhel';
          } else if (firstPart.includes('Boudhanath')) {
            areaName = 'Boudhanath';
          } else if (firstPart.includes('Gokarna')) {
            areaName = 'Gokarna';
          } else if (firstPart.includes('Thimi')) {
            areaName = 'Thimi';
          } else if (firstPart.includes('Bhaktapur')) {
            areaName = 'Bhaktapur';
          } else if (firstPart.includes('Patan')) {
            areaName = 'Patan';
          } else if (firstPart.includes('Kirtipur')) {
            areaName = 'Kirtipur';
          } else if (firstPart.includes('Madhyapur')) {
            areaName = 'Madhyapur';
          } else if (firstPart.includes('Tokha')) {
            areaName = 'Tokha';
          } else if (firstPart.includes('Anamnagar')) {
            areaName = 'Anamnagar';
          } else if (firstPart.includes('Maitidevi')) {
            areaName = 'Maitidevi';
          } else if (firstPart.includes('Maitighar')) {
            areaName = 'Maitighar';
          } else if (firstPart.includes('Tripureshwor')) {
            areaName = 'Tripureshwor';
          } else if (firstPart.includes('Baluwatar')) {
            areaName = 'Baluwatar';
          } else if (firstPart.includes('Lazimpat')) {
            areaName = 'Lazimpat';
          } else if (firstPart.includes('Maharajgunj')) {
            areaName = 'Maharajgunj';
          } else if (firstPart.includes('Budhanilkantha')) {
            areaName = 'Budhanilkantha';
          } else if (firstPart.includes('Kausaltar')) {
            areaName = 'Kausaltar';
          } else if (firstPart.includes('Gongabu')) {
            areaName = 'Gongabu';
          } else if (firstPart.includes('Gaushala')) {
            areaName = 'Gaushala';
          } else if (firstPart.includes('Banepa')) {
            areaName = 'Banepa';
          } else {
            // Use the cleaned first part as area name
            areaName = firstPart || 'Kathmandu';
          }
        }
        
        // Format new address: "Area Name, Kathmandu Valley, Nepal"
        const newAddress = `${areaName}, Kathmandu Valley, Nepal`;
        
        // Update the document
        await mongoose.connection.db.collection('locations').updateOne(
          { _id: location._id },
          { $set: { address: newAddress } }
        );
        
        updatedCount++;
        if (updatedCount % 20 === 0) {
          console.log(`📊 Progress: ${updatedCount}/${locations.length} locations updated`);
        }
        
      } catch (error) {
        console.log(`❌ Failed to update ${location.name}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Address format update completed!`);
    console.log(`📊 Updated ${updatedCount}/${locations.length} locations`);
    
    // Show sample of updated addresses
    console.log('\n📋 Sample updated addresses:');
    const samples = await mongoose.connection.db.collection('locations').find({}).limit(5).toArray();
    samples.forEach(loc => {
      console.log(`  • ${loc.name}: ${loc.address}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateAddressFormat();