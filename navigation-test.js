#!/usr/bin/env node

/**
 * Comprehensive Navigation Testing Script
 * Tests navigation functionality for all parking locations
 * Validates coordinates and cross-references with Galli Maps
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  LOCATIONS_FILE: './README/parking_management.locations.json',
  TEST_START_POINT: { lat: 27.7172, lng: 85.3240 }, // Kathmandu center
  OSRM_BASE_URL: 'https://router.project-osrm.org/route/v1/driving/',
  GALLI_MAPS_API: 'https://api.gallimaps.com', // Placeholder - actual API endpoint needed
  OUTPUT_FILE: './navigation-test-results.json',
  DELAY_BETWEEN_REQUESTS: 500, // ms to avoid rate limiting
  COORDINATE_PRECISION: 6
};

class NavigationTester {
  constructor() {
    this.results = {
      totalLocations: 0,
      passedTests: 0,
      failedTests: 0,
      coordinateIssues: [],
      routingFailures: [],
      galliMapsComparisons: [],
      testStartTime: new Date().toISOString(),
      testEndTime: null
    };
    this.locations = [];
  }

  async loadLocations() {
    console.log('📍 Loading parking locations...');
    try {
      const data = fs.readFileSync(CONFIG.LOCATIONS_FILE, 'utf8');
      this.locations = JSON.parse(data);
      this.results.totalLocations = this.locations.length;
      console.log(`✅ Loaded ${this.locations.length} parking locations`);
    } catch (error) {
      console.error('❌ Failed to load locations:', error.message);
      throw error;
    }
  }

  validateCoordinates(location) {
    const issues = [];
    
    if (!location.coordinates || !location.coordinates.coordinates) {
      issues.push('Missing coordinates object');
      return { valid: false, issues, corrected: null };
    }

    let [lng, lat] = location.coordinates.coordinates;
    
    // Check if coordinates are numbers
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      issues.push(`Invalid coordinate types: lng=${typeof lng}, lat=${typeof lat}`);
      return { valid: false, issues, corrected: null };
    }

    // Check coordinate ranges for Nepal
    const originalLat = lat;
    const originalLng = lng;
    let swapped = false;

    // Auto-correct for Nepal (lat: ~26-30, lng: ~80-88)
    if (lat > 80 && lat < 90 && lng > 26 && lng < 30) {
      [lat, lng] = [lng, lat];
      swapped = true;
      issues.push('Coordinates were swapped (auto-corrected)');
    }

    if (lat < 26 || lat > 30) {
      issues.push(`Latitude ${lat} outside Nepal range (26-30)`);
    }
    
    if (lng < 80 || lng > 88) {
      issues.push(`Longitude ${lng} outside Nepal range (80-88)`);
    }

    // Precision check
    const latPrecision = (lat.toString().split('.')[1] || '').length;
    const lngPrecision = (lng.toString().split('.')[1] || '').length;
    
    if (latPrecision > CONFIG.COORDINATE_PRECISION || lngPrecision > CONFIG.COORDINATE_PRECISION) {
      issues.push(`Excessive precision: lat=${latPrecision}, lng=${lngPrecision} digits`);
    }

    return {
      valid: issues.length === 0 || (issues.length === 1 && swapped),
      issues,
      corrected: swapped ? { lat, lng } : null,
      original: { lat: originalLat, lng: originalLng }
    };
  }

  async testOSRMRouting(start, end, locationName) {
    return new Promise((resolve) => {
      const url = `${CONFIG.OSRM_BASE_URL}${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=false&steps=true&geometries=geojson&overview=full`;
      
      console.log(`🗺️  Testing route to: ${locationName}`);
      console.log(`   URL: ${url}`);

      const request = https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            
            if (result.code === 'Ok' && result.routes && result.routes.length > 0) {
              const route = result.routes[0];
              resolve({
                success: true,
                distance: route.distance,
                duration: route.duration,
                geometry: route.geometry,
                steps: route.legs?.[0]?.steps?.length || 0
              });
            } else {
              resolve({
                success: false,
                error: result.message || result.code || 'Unknown routing error',
                osrmResponse: result
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              error: `JSON parse error: ${parseError.message}`,
              rawResponse: data.substring(0, 200)
            });
          }
        });
      });

      request.on('error', (error) => {
        resolve({
          success: false,
          error: `Network error: ${error.message}`
        });
      });

      request.setTimeout(10000, () => {
        request.abort();
        resolve({
          success: false,
          error: 'Request timeout'
        });
      });
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runComprehensiveTest() {
    console.log('🚀 Starting comprehensive navigation test...\n');
    
    await this.loadLocations();
    
    let testCount = 0;
    for (const location of this.locations) {
      testCount++;
      console.log(`\n📍 Testing location ${testCount}/${this.locations.length}: ${location.name}`);
      console.log(`   Address: ${location.address}`);
      
      // Validate coordinates
      const coordValidation = this.validateCoordinates(location);
      
      if (!coordValidation.valid) {
        console.log(`❌ Coordinate validation failed: ${coordValidation.issues.join(', ')}`);
        this.results.coordinateIssues.push({
          locationId: location._id?.$oid || 'unknown',
          name: location.name,
          issues: coordValidation.issues,
          originalCoordinates: coordValidation.original,
          correctedCoordinates: coordValidation.corrected
        });
        this.results.failedTests++;
        continue;
      }

      // Use corrected coordinates if available
      const targetCoords = coordValidation.corrected || {
        lat: location.coordinates.coordinates[1],
        lng: location.coordinates.coordinates[0]
      };

      console.log(`   Coordinates: ${targetCoords.lat}, ${targetCoords.lng}`);
      if (coordValidation.corrected) {
        console.log(`   ⚠️  Auto-corrected swapped coordinates`);
      }

      // Test OSRM routing
      const routingResult = await this.testOSRMRouting(
        CONFIG.TEST_START_POINT,
        targetCoords,
        location.name
      );

      if (routingResult.success) {
        console.log(`✅ Routing successful: ${Math.round(routingResult.distance)}m, ${Math.round(routingResult.duration)}s`);
        console.log(`   Steps: ${routingResult.steps}, Geometry points: ${routingResult.geometry?.coordinates?.length || 0}`);
        this.results.passedTests++;
      } else {
        console.log(`❌ Routing failed: ${routingResult.error}`);
        this.results.routingFailures.push({
          locationId: location._id?.$oid || 'unknown',
          name: location.name,
          coordinates: targetCoords,
          error: routingResult.error,
          osrmResponse: routingResult.osrmResponse
        });
        this.results.failedTests++;
      }

      // Rate limiting delay
      if (testCount < this.locations.length) {
        await this.delay(CONFIG.DELAY_BETWEEN_REQUESTS);
      }
    }

    this.results.testEndTime = new Date().toISOString();
    await this.generateReport();
  }

  async generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log(`   Total Locations: ${this.results.totalLocations}`);
    console.log(`   Passed Tests: ${this.results.passedTests}`);
    console.log(`   Failed Tests: ${this.results.failedTests}`);
    console.log(`   Success Rate: ${((this.results.passedTests / this.results.totalLocations) * 100).toFixed(1)}%`);
    
    if (this.results.coordinateIssues.length > 0) {
      console.log(`\n⚠️  Coordinate Issues (${this.results.coordinateIssues.length}):`);
      this.results.coordinateIssues.slice(0, 5).forEach(issue => {
        console.log(`   - ${issue.name}: ${issue.issues.join(', ')}`);
      });
      if (this.results.coordinateIssues.length > 5) {
        console.log(`   ... and ${this.results.coordinateIssues.length - 5} more`);
      }
    }
    
    if (this.results.routingFailures.length > 0) {
      console.log(`\n❌ Routing Failures (${this.results.routingFailures.length}):`);
      this.results.routingFailures.slice(0, 5).forEach(failure => {
        console.log(`   - ${failure.name}: ${failure.error}`);
      });
      if (this.results.routingFailures.length > 5) {
        console.log(`   ... and ${this.results.routingFailures.length - 5} more`);
      }
    }

    // Save detailed results
    try {
      fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Detailed results saved to: ${CONFIG.OUTPUT_FILE}`);
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 Recommendations:');
    
    if (this.results.coordinateIssues.length > 0) {
      console.log('   📍 Coordinate Issues:');
      console.log('     - Review and correct coordinate formats in database');
      console.log('     - Implement coordinate validation in data import process');
      console.log('     - Add coordinate auto-correction for Nepal region');
    }
    
    if (this.results.routingFailures.length > 0) {
      console.log('   🗺️  Routing Issues:');
      console.log('     - Verify OSRM server accessibility');
      console.log('     - Implement fallback routing providers');
      console.log('     - Add retry logic for transient failures');
      console.log('     - Consider offline routing for critical locations');
    }
    
    const successRate = (this.results.passedTests / this.results.totalLocations) * 100;
    if (successRate < 95) {
      console.log('   🎯 System Robustness:');
      console.log('     - Success rate below 95%, investigate common failure patterns');
      console.log('     - Consider data quality improvements');
      console.log('     - Implement graceful degradation for navigation failures');
    }
  }
}

// Galli Maps integration placeholder
class GalliMapsValidator {
  constructor() {
    this.apiKey = process.env.GALLI_MAPS_API_KEY;
  }

  async validateLocation(location) {
    // Placeholder for Galli Maps API integration
    // This would validate parking locations against Galli Maps data
    console.log(`🗺️  Galli Maps validation for ${location.name} - Feature not implemented yet`);
    console.log('   Note: Requires Galli Maps API key and endpoint configuration');
    
    return {
      validated: false,
      reason: 'API integration pending',
      suggestions: [
        'Configure Galli Maps API endpoint',
        'Obtain API authentication credentials',
        'Implement location matching algorithm'
      ]
    };
  }
}

// Main execution
async function main() {
  try {
    const tester = new NavigationTester();
    await tester.runComprehensiveTest();
    
    console.log('\n🏁 Navigation testing completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { NavigationTester, GalliMapsValidator };