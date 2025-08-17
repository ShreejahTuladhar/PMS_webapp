#!/usr/bin/env node

/**
 * Update Database with Latest Sample Data
 * Updates the database with corrected Satdobato coordinates
 */

import DatabaseService from './databaseService.js';
import SampleDataGenerator from './generateSampleData.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateSampleData() {
  let dbService;
  
  try {
    console.log('🔄 Updating database with corrected sample data...\n');
    
    // Generate fresh sample data
    console.log('📊 Generating new sample data with correct coordinates...');
    const generator = new SampleDataGenerator();
    const sampleData = generator.generateSampleData();
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    dbService = new DatabaseService({
      mongoUri: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME || 'parking_management',
      collectionName: 'locations'
    });
    
    await dbService.connect();
    
    // Clear existing sample data and insert new data  
    console.log('🗑️  Clearing existing sample data...');
    const deleteResult = await dbService.collection.deleteMany({ source: 'sample_data' });
    console.log(`   Removed ${deleteResult.deletedCount} existing sample records`);
    
    console.log('📥 Inserting updated sample data...');
    const importResult = await dbService.importParkingData(sampleData.parkingLocations);
    
    console.log('\n✅ Database update completed!');
    console.log(`📊 Statistics:`);
    console.log(`   Total locations: ${sampleData.parkingLocations.length}`);
    console.log(`   Successfully imported: ${importResult.insertedCount}`);
    console.log(`   Failed imports: ${importResult.failedCount}`);
    console.log(`   Success rate: ${((importResult.insertedCount / sampleData.parkingLocations.length) * 100).toFixed(1)}%`);
    
    // Verify Satdobato is in database with correct coordinates
    console.log('\n🔍 Verifying Satdobato coordinates...');
    const satdobatoSpots = await dbService.collection.find({ 
      $text: { $search: "Satdobato" } 
    }).toArray();
    if (satdobatoSpots.length > 0) {
      const spot = satdobatoSpots[0];
      console.log(`   Found: ${spot.name}`);
      console.log(`   Coordinates: ${spot.coordinates.latitude}, ${spot.coordinates.longitude}`);
      console.log(`   ✅ Satdobato coordinates updated successfully!`);
    } else {
      console.log('   ⚠️  No Satdobato locations found in database');
    }
    
    return {
      success: true,
      totalLocations: sampleData.parkingLocations.length,
      importedCount: importResult.insertedCount,
      failedCount: importResult.failedCount
    };
    
  } catch (error) {
    console.error('❌ Failed to update sample data:', error.message);
    throw error;
  } finally {
    if (dbService) {
      await dbService.disconnect();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateSampleData().catch(console.error);
}

export default updateSampleData;