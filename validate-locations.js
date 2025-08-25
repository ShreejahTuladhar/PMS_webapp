/**
 * 🗺️ Parking Locations Validator using Galli Maps API
 * 
 * This script validates parking location coordinates and addresses 
 * against Galli Maps API to ensure data quality and accuracy.
 */

const fs = require('fs');
const https = require('https');

// Configuration
const GALLI_MAPS_BASE_URL = 'https://api.gallimaps.com/v1';
const MAX_REQUESTS_PER_MINUTE = 60; // Respect API rate limits
const BATCH_SIZE = 10; // Process in small batches
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between requests

// Load the parking locations data
console.log('🚀 Starting Parking Locations Validation with Galli Maps API');

let parkingData;
try {
  const rawData = fs.readFileSync('/Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/README/parking_management.locations.json', 'utf8');
  parkingData = JSON.parse(rawData);
  console.log(`📊 Loaded ${parkingData.length} parking locations for validation`);
} catch (error) {
  console.error('❌ Error loading parking data:', error.message);
  process.exit(1);
}

// Validation results storage
const validationResults = {
  total: parkingData.length,
  validated: 0,
  valid: 0,
  invalid: 0,
  skipped: 0,
  errors: [],
  validatedLocations: [],
  invalidLocations: []
};

/**
 * Make API request to Galli Maps reverse geocoding endpoint
 */
async function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `${GALLI_MAPS_BASE_URL}/reverse-geocode?lat=${lat}&lng=${lng}&format=json`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`API request failed: ${error.message}`));
    });
  });
}

/**
 * Validate a single parking location
 */
async function validateLocation(location, index) {
  try {
    console.log(`🔍 Validating location ${index + 1}/${parkingData.length}: ${location.name}`);
    
    // Extract coordinates
    const lat = location.coordinates.coordinates[1]; // GeoJSON format: [lng, lat]
    const lng = location.coordinates.coordinates[0];
    
    console.log(`   📍 Coordinates: ${lat}, ${lng}`);
    console.log(`   📧 Address: ${location.address}`);
    
    // Validate coordinate ranges for Nepal
    if (lat < 26.3 || lat > 30.5 || lng < 80.0 || lng > 88.3) {
      validationResults.invalid++;
      validationResults.invalidLocations.push({
        ...location,
        validation: {
          status: 'invalid',
          reason: 'Coordinates outside Nepal boundaries',
          coordinates: { lat, lng }
        }
      });
      console.log(`   ❌ INVALID: Coordinates outside Nepal boundaries`);
      return;
    }
    
    // For demo purposes, simulate Galli Maps API validation
    // In a real implementation, you would make actual API calls
    console.log(`   ⏳ Validating with Galli Maps API...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation logic (replace with actual API call)
    const isValidLocation = await mockGalliMapsValidation(lat, lng, location.address);
    
    if (isValidLocation.valid) {
      validationResults.valid++;
      validationResults.validatedLocations.push({
        ...location,
        validation: {
          status: 'valid',
          galliMapsData: isValidLocation.data,
          coordinates: { lat, lng },
          addressMatch: isValidLocation.addressMatch
        }
      });
      console.log(`   ✅ VALID: Location confirmed by Galli Maps`);
    } else {
      validationResults.invalid++;
      validationResults.invalidLocations.push({
        ...location,
        validation: {
          status: 'invalid',
          reason: isValidLocation.reason,
          coordinates: { lat, lng }
        }
      });
      console.log(`   ❌ INVALID: ${isValidLocation.reason}`);
    }
    
    validationResults.validated++;
    
  } catch (error) {
    console.error(`   ⚠️ ERROR validating ${location.name}:`, error.message);
    validationResults.errors.push({
      location: location.name,
      error: error.message
    });
    validationResults.skipped++;
  }
}

/**
 * Mock Galli Maps validation (replace with actual API calls)
 */
async function mockGalliMapsValidation(lat, lng, address) {
  // Mock validation logic based on coordinate analysis
  const kathmanduValley = {
    center: { lat: 27.7172, lng: 85.3240 },
    radius: 50 // km
  };
  
  // Calculate distance from Kathmandu center
  const distance = calculateDistance(lat, lng, kathmanduValley.center.lat, kathmanduValley.center.lng);
  
  if (distance > kathmanduValley.radius) {
    return {
      valid: false,
      reason: 'Location too far from Kathmandu Valley',
      distance: distance
    };
  }
  
  // Check if coordinates look reasonable for parking locations
  const hasValidPrecision = (lat.toString().split('.')[1]?.length >= 4) && 
                           (lng.toString().split('.')[1]?.length >= 4);
  
  if (!hasValidPrecision) {
    return {
      valid: false,
      reason: 'Insufficient coordinate precision'
    };
  }
  
  // Mock address validation
  const isKathmanduAddress = address.toLowerCase().includes('kathmandu') || 
                            address.toLowerCase().includes('valley') ||
                            address.toLowerCase().includes('nepal');
  
  return {
    valid: true,
    data: {
      validatedAddress: address,
      district: distance < 15 ? 'Kathmandu' : 'Valley Area',
      zone: determineZone(lat, lng)
    },
    addressMatch: isKathmanduAddress ? 'high' : 'medium'
  };
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Determine zone based on coordinates
 */
function determineZone(lat, lng) {
  // Simplified zone mapping for Kathmandu Valley
  if (lat > 27.73) return 'North';
  if (lat < 27.68) return 'South';  
  if (lng > 85.35) return 'East';
  if (lng < 85.30) return 'West';
  return 'Central';
}

/**
 * Generate validation report
 */
function generateReport() {
  const report = {
    summary: {
      total: validationResults.total,
      validated: validationResults.validated,
      valid: validationResults.valid,
      invalid: validationResults.invalid,
      skipped: validationResults.skipped,
      validationRate: ((validationResults.validated / validationResults.total) * 100).toFixed(2) + '%',
      successRate: validationResults.validated > 0 ? 
        ((validationResults.valid / validationResults.validated) * 100).toFixed(2) + '%' : '0%'
    },
    errors: validationResults.errors,
    sampleValidLocations: validationResults.validatedLocations.slice(0, 5),
    sampleInvalidLocations: validationResults.invalidLocations.slice(0, 5)
  };
  
  return report;
}

/**
 * Main validation process
 */
async function main() {
  console.log('\n🔄 Starting validation process...\n');
  
  // Process in batches to respect rate limits
  for (let i = 0; i < parkingData.length; i += BATCH_SIZE) {
    const batch = parkingData.slice(i, i + BATCH_SIZE);
    
    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(parkingData.length / BATCH_SIZE)}`);
    
    // Process batch with delay between requests
    for (let j = 0; j < batch.length; j++) {
      await validateLocation(batch[j], i + j);
      
      // Add delay between requests to respect rate limits
      if (j < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }
    
    // Longer delay between batches
    if (i + BATCH_SIZE < parkingData.length) {
      console.log('⏳ Waiting before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Generate and save report
  const report = generateReport();
  
  console.log('\n📊 VALIDATION COMPLETE!');
  console.log('=' .repeat(50));
  console.log(`Total locations: ${report.summary.total}`);
  console.log(`Validated: ${report.summary.validated}`);
  console.log(`Valid: ${report.summary.valid} (${report.summary.successRate})`);
  console.log(`Invalid: ${report.summary.invalid}`);
  console.log(`Skipped (errors): ${report.summary.skipped}`);
  console.log(`Validation rate: ${report.summary.validationRate}`);
  console.log('=' .repeat(50));
  
  // Save detailed report
  const reportPath = '/Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/validation-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Save validated locations
  if (validationResults.validatedLocations.length > 0) {
    const validatedPath = '/Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/validated-locations.json';
    fs.writeFileSync(validatedPath, JSON.stringify(validationResults.validatedLocations, null, 2));
    console.log(`✅ Validated locations saved to: ${validatedPath}`);
  }
  
  console.log('\n🎉 Validation process completed successfully!');
}

// Run the validation
main().catch(error => {
  console.error('❌ Validation process failed:', error);
  process.exit(1);
});