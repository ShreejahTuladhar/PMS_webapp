#!/usr/bin/env node

const fs = require('fs');

// Load and validate parking data
console.log('🚀 Simple Parking Location Validator');

try {
  const data = fs.readFileSync('./README/parking_management.locations.json', 'utf8');
  const locations = JSON.parse(data);
  
  console.log(`📍 Loaded ${locations.length} parking locations`);
  
  let valid = 0, invalid = 0, missing = 0, corrected = 0;
  const corrections = [];
  
  locations.forEach((location, index) => {
    if (!location.coordinates || !location.coordinates.coordinates) {
      console.log(`❌ ${index + 1}. ${location.name}: Missing coordinates`);
      missing++;
      return;
    }
    
    let [lng, lat] = location.coordinates.coordinates;
    let wasSwapped = false;
    
    // Auto-correct swapped coordinates for Nepal
    if (lat > 80 && lat < 90 && lng > 26 && lng < 30) {
      [lat, lng] = [lng, lat];
      wasSwapped = true;
      corrected++;
    }
    
    // Validate Nepal bounds
    if (lat >= 26.3 && lat <= 30.4 && lng >= 80.0 && lng <= 88.2) {
      valid++;
      if (wasSwapped) {
        corrections.push({
          name: location.name,
          original: location.coordinates.coordinates,
          corrected: [lng, lat]
        });
        console.log(`✅ ${index + 1}. ${location.name}: Valid (auto-corrected coordinates)`);
      } else {
        console.log(`✅ ${index + 1}. ${location.name}: Valid`);
      }
    } else {
      invalid++;
      console.log(`❌ ${index + 1}. ${location.name}: Invalid coordinates (${lat}, ${lng})`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Total: ${locations.length}`);
  console.log(`   Valid: ${valid} (${(valid/locations.length*100).toFixed(1)}%)`);
  console.log(`   Invalid: ${invalid}`);
  console.log(`   Missing: ${missing}`);
  console.log(`   Auto-corrected: ${corrected}`);
  
  if (corrections.length > 0) {
    console.log('\n🔧 Coordinate Corrections:');
    corrections.forEach(c => {
      console.log(`   ${c.name}: [${c.original.join(',')}] → [${c.corrected.join(',')}]`);
    });
    
    fs.writeFileSync('./coordinate-corrections.json', JSON.stringify(corrections, null, 2));
    console.log(`\n💾 Corrections saved to coordinate-corrections.json`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
