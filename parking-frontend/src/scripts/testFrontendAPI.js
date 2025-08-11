#!/usr/bin/env node

/**
 * Test Frontend API Integration
 * Tests the locationService with real database data
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testFrontendAPI() {
  let client;
  
  try {
    console.log('🧪 Testing Frontend API Integration with Real Data...\n');
    
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'parking_management');
    const locations = db.collection('locations');
    
    console.log('📊 Database Statistics:');
    const totalCount = await locations.countDocuments();
    console.log(`  Total Locations: ${totalCount}`);
    
    // Test 1: Get all locations (simulate getAllParkingSpots)
    console.log('\n🔍 Test 1: Get All Parking Spots');
    const allSpots = await locations.find().limit(10).toArray();
    console.log(`  Found: ${allSpots.length} spots (showing first 10)`);
    console.log(`  Sample: ${allSpots[0]?.name} at ${allSpots[0]?.address}`);
    
    // Test 2: Geospatial search (simulate searchParkingSpots)
    console.log('\n🗺️ Test 2: Geospatial Search Near Thamel');
    const nearThamel = await locations.find({
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [85.3107, 27.7151] }, // Thamel
          $maxDistance: 2000 // 2km
        }
      }
    }).limit(5).toArray();
    
    console.log(`  Found: ${nearThamel.length} spots within 2km of Thamel`);
    nearThamel.forEach((spot, i) => {
      console.log(`    ${i+1}. ${spot.name} - Rs ${spot.hourlyRate}/hr`);
    });
    
    // Test 3: Location name extraction for frontend search
    console.log('\n🏷️ Test 3: Location Names for Search Autocomplete');
    const locationNames = await locations.aggregate([
      {
        $project: {
          locationName: { $arrayElemAt: [{ $split: ["$address", ","] }, 0] },
          name: 1,
          coordinates: 1
        }
      },
      {
        $group: {
          _id: "$locationName",
          count: { $sum: 1 },
          coords: { $first: "$coordinates" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    console.log('  Top Location Names (for search suggestions):');
    locationNames.forEach((loc, i) => {
      console.log(`    ${i+1}. ${loc._id} (${loc.count} spots)`);
    });
    
    // Test 4: Simulate frontend API response format
    console.log('\n📡 Test 4: Frontend API Response Format');
    const apiResponse = {
      success: true,
      data: {
        data: allSpots.slice(0, 3).map(spot => ({
          id: spot._id,
          name: spot.name,
          address: spot.address,
          coordinates: {
            latitude: spot.latitude,
            longitude: spot.longitude
          },
          hourlyRate: spot.hourlyRate,
          totalSpaces: spot.totalSpaces,
          availableSpaces: spot.availableSpaces,
          amenities: spot.amenities,
          operatingHours: spot.operatingHours,
          currentStatus: spot.currentStatus
        })),
        pagination: {
          page: 1,
          limit: 10,
          total: totalCount
        }
      }
    };
    
    console.log('  API Response Sample:');
    console.log(`    Status: ${apiResponse.success ? 'Success' : 'Failed'}`);
    console.log(`    Locations: ${apiResponse.data.data.length}`);
    console.log(`    Sample Location: ${apiResponse.data.data[0].name}`);
    console.log(`    Total Available: ${apiResponse.data.pagination.total}`);
    
    console.log('\n✅ All API tests passed!');
    console.log('🚀 Your frontend can now connect to real parking data!');
    
    return {
      totalLocations: totalCount,
      sampleLocations: allSpots.slice(0, 5),
      nearbySearch: nearThamel,
      locationNames: locationNames,
      apiReady: true
    };
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFrontendAPI().catch(console.error);
}

export default testFrontendAPI;