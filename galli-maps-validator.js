/**
 * 🗺️ Advanced Parking Locations Validator using Galli Maps API
 * 
 * This script validates parking location coordinates and addresses 
 * against Galli Maps API to ensure data quality and accuracy.
 * 
 * Features:
 * - Coordinate validation against Galli Maps
 * - Address verification
 * - Distance and location accuracy checks
 * - Batch processing with rate limiting
 * - Comprehensive reporting
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'parking-frontend/src/scripts/.env') });

// Configuration
const GALLI_MAPS_TOKEN = process.env.GALLI_MAPS_TOKEN || 'aeda757c-f04b-43cf-b220-538b0ed42f07';
const GALLI_MAPS_BASE_URL = 'https://api.gallimap.com';
const BATCH_SIZE = 5; // Small batches to respect API limits
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between requests
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches

console.log('🚀 Starting Advanced Parking Locations Validation with Galli Maps API');
console.log(`🔑 Using API Token: ${GALLI_MAPS_TOKEN.substring(0, 8)}...`);

// Load the parking locations data
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
  processed: 0,
  valid: 0,
  invalid: 0,
  apiErrors: 0,
  validatedLocations: [],
  invalidLocations: [],
  apiErrorLocations: [],
  statistics: {
    coordinateAccuracy: 0,
    addressMatchRate: 0,
    averageDistanceFromCenter: 0
  }
};

/**
 * Make API request to Galli Maps
 */
async function makeGalliMapsRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const queryString = new URLSearchParams({
      token: GALLI_MAPS_TOKEN,
      ...params
    }).toString();
    
    const url = `${GALLI_MAPS_BASE_URL}${endpoint}?${queryString}`;
    console.log(`   🌐 API Call: ${endpoint} with params:`, params);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve(parsedData);
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${parsedData.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}. Response: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`HTTP request failed: ${error.message}`));
    });
  });
}

/**
 * Validate coordinates using reverse geocoding
 */
async function validateCoordinates(lat, lng) {
  try {
    const response = await makeGalliMapsRequest('/reverse', {
      lat: lat.toString(),
      lng: lng.toString(),
      format: 'json'
    });
    
    return {
      success: true,
      data: response,
      address: response.display_name || response.address || 'Unknown',
      accuracy: response.accuracy || 'medium'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Geocode an address to validate against coordinates
 */
async function geocodeAddress(address) {
  try {
    const response = await makeGalliMapsRequest('/search', {
      q: address,
      format: 'json',
      limit: '1'
    });
    
    if (response && response.length > 0) {
      const result = response[0];
      return {
        success: true,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        accuracy: result.importance || 0.5,
        displayName: result.display_name
      };
    }
    
    return {
      success: false,
      error: 'No geocoding results found'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
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
 * Validate a single parking location
 */
async function validateLocation(location, index) {
  console.log(`\n🔍 [${index + 1}/${parkingData.length}] Validating: ${location.name}`);
  console.log(`   📍 Coordinates: ${location.coordinates.coordinates[1]}, ${location.coordinates.coordinates[0]}`);
  console.log(`   📧 Address: ${location.address}`);
  
  const lat = location.coordinates.coordinates[1]; // GeoJSON: [lng, lat]
  const lng = location.coordinates.coordinates[0];
  
  const validation = {
    locationId: location._id,
    name: location.name,
    originalCoordinates: { lat, lng },
    originalAddress: location.address,
    tests: {}
  };
  
  try {
    // Test 1: Basic coordinate validation
    if (lat < 26.3 || lat > 30.5 || lng < 80.0 || lng > 88.3) {
      validation.tests.coordinateRange = {
        passed: false,
        reason: 'Coordinates outside Nepal boundaries'
      };
      validation.overall = 'invalid';
      validationResults.invalid++;
      validationResults.invalidLocations.push(validation);
      console.log(`   ❌ INVALID: Coordinates outside Nepal`);
      return;
    } else {
      validation.tests.coordinateRange = { passed: true };
    }
    
    // Test 2: Reverse geocoding validation
    console.log(`   🔄 Reverse geocoding...`);
    const reverseGeoResult = await validateCoordinates(lat, lng);
    
    if (reverseGeoResult.success) {
      validation.tests.reverseGeocoding = {
        passed: true,
        galliMapsAddress: reverseGeoResult.address,
        accuracy: reverseGeoResult.accuracy
      };
      console.log(`   ✅ Reverse geocoding successful: ${reverseGeoResult.address}`);
    } else {
      validation.tests.reverseGeocoding = {
        passed: false,
        error: reverseGeoResult.error
      };
      console.log(`   ⚠️ Reverse geocoding failed: ${reverseGeoResult.error}`);
    }
    
    // Add delay between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Forward geocoding validation
    console.log(`   🔄 Forward geocoding address...`);
    const forwardGeoResult = await geocodeAddress(location.address);
    
    if (forwardGeoResult.success) {
      const distance = calculateDistance(
        lat, lng,
        forwardGeoResult.coordinates.lat,
        forwardGeoResult.coordinates.lng
      );
      
      validation.tests.forwardGeocoding = {
        passed: true,
        galliMapsCoordinates: forwardGeoResult.coordinates,
        distanceFromOriginal: distance,
        accuracy: forwardGeoResult.accuracy,
        displayName: forwardGeoResult.displayName
      };
      
      // Distance threshold for accuracy (500m)
      if (distance < 0.5) {
        validation.tests.coordinateAccuracy = { passed: true, distance };
        console.log(`   ✅ Coordinate accuracy good: ${(distance * 1000).toFixed(0)}m difference`);
      } else {
        validation.tests.coordinateAccuracy = { passed: false, distance };
        console.log(`   ⚠️ Coordinate accuracy poor: ${distance.toFixed(2)}km difference`);
      }
    } else {
      validation.tests.forwardGeocoding = {
        passed: false,
        error: forwardGeoResult.error
      };
      validation.tests.coordinateAccuracy = { passed: false, reason: 'Could not geocode address' };
      console.log(`   ⚠️ Forward geocoding failed: ${forwardGeoResult.error}`);
    }
    
    // Determine overall validation result
    const criticalTests = ['coordinateRange', 'reverseGeocoding'];
    const passedCritical = criticalTests.every(test => validation.tests[test]?.passed);
    const passedAccuracy = validation.tests.coordinateAccuracy?.passed;
    
    if (passedCritical && passedAccuracy) {
      validation.overall = 'valid';
      validationResults.valid++;
      validationResults.validatedLocations.push(validation);
      console.log(`   ✅ OVERALL: VALID - All tests passed`);
    } else if (passedCritical) {
      validation.overall = 'valid_with_warnings';
      validationResults.valid++;
      validationResults.validatedLocations.push(validation);
      console.log(`   ⚠️ OVERALL: VALID WITH WARNINGS - Critical tests passed`);
    } else {
      validation.overall = 'invalid';
      validationResults.invalid++;
      validationResults.invalidLocations.push(validation);
      console.log(`   ❌ OVERALL: INVALID - Critical tests failed`);
    }
    
  } catch (error) {
    console.error(`   💥 ERROR: ${error.message}`);
    validation.overall = 'error';
    validation.error = error.message;
    validationResults.apiErrors++;
    validationResults.apiErrorLocations.push(validation);
  }
  
  validationResults.processed++;
}

/**
 * Generate comprehensive validation report
 */
function generateReport() {
  // Calculate statistics
  const validLocations = validationResults.validatedLocations;
  const totalDistance = validLocations.reduce((sum, loc) => {
    return sum + (loc.tests.coordinateAccuracy?.distance || 0);
  }, 0);
  
  const accurateLocations = validLocations.filter(loc => loc.tests.coordinateAccuracy?.passed).length;
  const addressMatchCount = validLocations.filter(loc => loc.tests.forwardGeocoding?.passed).length;
  
  validationResults.statistics = {
    coordinateAccuracy: validLocations.length > 0 ? 
      ((accurateLocations / validLocations.length) * 100).toFixed(1) + '%' : '0%',
    addressMatchRate: validationResults.processed > 0 ? 
      ((addressMatchCount / validationResults.processed) * 100).toFixed(1) + '%' : '0%',
    averageDistanceFromCenter: validLocations.length > 0 ? 
      (totalDistance / validLocations.length).toFixed(3) + ' km' : '0 km'
  };
  
  const report = {
    metadata: {
      validatedAt: new Date().toISOString(),
      apiUsed: 'Galli Maps API',
      totalLocations: validationResults.total,
      processedLocations: validationResults.processed
    },
    summary: {
      valid: validationResults.valid,
      invalid: validationResults.invalid,
      apiErrors: validationResults.apiErrors,
      successRate: validationResults.processed > 0 ? 
        ((validationResults.valid / validationResults.processed) * 100).toFixed(1) + '%' : '0%',
      validationRate: ((validationResults.processed / validationResults.total) * 100).toFixed(1) + '%'
    },
    statistics: validationResults.statistics,
    detailedResults: {
      validLocations: validationResults.validatedLocations,
      invalidLocations: validationResults.invalidLocations,
      errorLocations: validationResults.apiErrorLocations
    },
    recommendations: generateRecommendations()
  };
  
  return report;
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations() {
  const recommendations = [];
  
  if (validationResults.invalid > 0) {
    recommendations.push({
      priority: 'high',
      category: 'data_quality',
      message: `${validationResults.invalid} locations have invalid coordinates that need to be corrected.`
    });
  }
  
  if (validationResults.apiErrors > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'validation',
      message: `${validationResults.apiErrors} locations could not be validated due to API errors. Consider re-running validation.`
    });
  }
  
  const inaccurateCount = validationResults.validatedLocations.filter(
    loc => !loc.tests.coordinateAccuracy?.passed
  ).length;
  
  if (inaccurateCount > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'accuracy',
      message: `${inaccurateCount} locations have coordinate accuracy issues (>500m from address). Review and update coordinates.`
    });
  }
  
  return recommendations;
}

/**
 * Main validation process
 */
async function main() {
  console.log('\n🔄 Starting Galli Maps API validation process...\n');
  
  const startTime = Date.now();
  
  // Process in small batches to respect API rate limits
  for (let i = 0; i < parkingData.length; i += BATCH_SIZE) {
    const batch = parkingData.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(parkingData.length / BATCH_SIZE);
    
    console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} locations)`);
    console.log('─'.repeat(60));
    
    // Process each location in the batch
    for (let j = 0; j < batch.length; j++) {
      await validateLocation(batch[j], i + j);
      
      // Add delay between requests within batch
      if (j < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }
    
    // Progress update
    const progressPercentage = ((validationResults.processed / parkingData.length) * 100).toFixed(1);
    console.log(`\n📊 Progress: ${validationResults.processed}/${parkingData.length} (${progressPercentage}%)`);
    console.log(`   ✅ Valid: ${validationResults.valid}`);
    console.log(`   ❌ Invalid: ${validationResults.invalid}`);
    console.log(`   💥 Errors: ${validationResults.apiErrors}`);
    
    // Add delay between batches
    if (i + BATCH_SIZE < parkingData.length) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // Generate comprehensive report
  const report = generateReport();
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
  
  console.log('\n🎉 VALIDATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`⏱️  Total time: ${duration} minutes`);
  console.log(`📊 Processed: ${report.metadata.processedLocations}/${report.metadata.totalLocations}`);
  console.log(`✅ Valid: ${report.summary.valid} (${report.summary.successRate})`);
  console.log(`❌ Invalid: ${report.summary.invalid}`);
  console.log(`💥 API Errors: ${report.summary.apiErrors}`);
  console.log(`📍 Coordinate Accuracy: ${report.statistics.coordinateAccuracy}`);
  console.log(`📧 Address Match Rate: ${report.statistics.addressMatchRate}`);
  console.log('='.repeat(60));
  
  // Save reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `/Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/galli-maps-validation-report-${timestamp}.json`;
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  // Save validated locations for import
  if (validationResults.validatedLocations.length > 0) {
    const validatedPath = `/Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/validated-locations-${timestamp}.json`;
    const validatedData = validationResults.validatedLocations.map(loc => ({
      originalData: parkingData.find(p => p._id === loc.locationId),
      validation: loc
    }));
    
    fs.writeFileSync(validatedPath, JSON.stringify(validatedData, null, 2));
    console.log(`✅ Validated locations saved: ${validatedPath}`);
  }
  
  // Display recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(40));
    report.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${priority} ${rec.message}`);
    });
  }
  
  console.log('\n🏁 Galli Maps validation completed successfully!');
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Validation interrupted by user');
  console.log(`📊 Partial results: ${validationResults.processed}/${validationResults.total} processed`);
  process.exit(0);
});

// Run the validation
main().catch(error => {
  console.error('\n💥 Validation process failed:', error);
  console.error(error.stack);
  process.exit(1);
});