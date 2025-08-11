#!/usr/bin/env node

/**
 * Import Landmark Data to Database
 * Imports the expanded landmark parking dataset with marketing features
 */

import DatabaseService from './databaseService.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class LandmarkDataImporter {
  constructor() {
    this.dbService = null;
  }

  /**
   * Find the latest expanded landmark data file
   */
  findLatestDataFile() {
    const dataDir = path.join(process.cwd(), 'scraped_data');
    
    if (!fs.existsSync(dataDir)) {
      throw new Error('No scraped_data directory found. Generate data first.');
    }

    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('expanded_landmark_parking_data_'))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error('No expanded landmark data files found. Generate data first.');
    }

    return path.join(dataDir, files[0]);
  }

  /**
   * Load and validate data file
   */
  loadDataFile(filepath) {
    console.log(`📖 Loading data from: ${filepath}`);
    
    const rawData = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`✅ Loaded data: ${data.summary.totalParkingLocations} locations, ${data.summary.totalLandmarks} landmarks`);
    
    return data;
  }

  /**
   * Import landmark parking data
   */
  async importLandmarkData() {
    let importResults = {
      success: false,
      imported: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log('🏛️ Starting landmark parking data import...\n');

      // Find and load data
      const dataFile = this.findLatestDataFile();
      const landmarkData = this.loadDataFile(dataFile);

      // Connect to database
      console.log('🔌 Connecting to database...');
      this.dbService = new DatabaseService({
        mongoUri: process.env.MONGODB_URI,
        dbName: process.env.DB_NAME || 'parking_management',
        collectionName: 'locations'
      });

      await this.dbService.connect();

      // Clear existing landmark data if needed
      console.log('🗑️  Clearing existing landmark data...');
      const deleteResult = await this.dbService.collection.deleteMany({ 
        source: 'landmark_expansion' 
      });
      console.log(`   Removed ${deleteResult.deletedCount} existing landmark records`);

      // Import new landmark data
      console.log(`📥 Importing ${landmarkData.parkingLocations.length} landmark parking locations...\n`);
      
      const importResult = await this.dbService.importParkingData(landmarkData.parkingLocations);

      // Generate import report
      importResults = {
        success: true,
        imported: importResult.insertedCount || 0,
        failed: importResult.failedCount || 0,
        total: landmarkData.parkingLocations.length,
        landmarks: landmarkData.summary.totalLandmarks,
        categories: landmarkData.summary.categoriesExpanded,
        errors: importResult.errors || []
      };

      console.log('\n📊 LANDMARK DATA IMPORT SUMMARY:');
      console.log('═══════════════════════════════════════');
      console.log(`✅ Successfully Imported: ${importResults.imported}`);
      console.log(`❌ Failed Imports: ${importResults.failed}`);
      console.log(`📍 Total Landmarks: ${importResults.landmarks}`);
      console.log(`🏷️  Categories: ${importResults.categories}`);
      console.log(`📈 Success Rate: ${((importResults.imported / importResults.total) * 100).toFixed(1)}%`);
      console.log('═══════════════════════════════════════');

      // Verify import with sample queries
      await this.verifyImport();

      return importResults;

    } catch (error) {
      console.error('❌ Failed to import landmark data:', error.message);
      importResults.errors.push(error.message);
      throw error;
    } finally {
      if (this.dbService) {
        await this.dbService.disconnect();
      }
    }
  }

  /**
   * Verify import with sample queries
   */
  async verifyImport() {
    console.log('\n🔍 Verifying import with sample queries...');

    // Test 1: Count by category
    const categoryCounts = await this.dbService.collection.aggregate([
      { $match: { source: 'landmark_expansion' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\n📊 Locations by Category:');
    categoryCounts.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} locations`);
    });

    // Test 2: Sample heritage locations
    const heritageLocations = await this.dbService.collection
      .find({ 
        source: 'landmark_expansion', 
        category: 'heritageSites' 
      })
      .limit(3)
      .toArray();

    console.log('\n🏛️  Sample Heritage Locations:');
    heritageLocations.forEach(loc => {
      console.log(`   • ${loc.name} (₹${loc.hourlyRate}/hr)`);
    });

    // Test 3: Marketing-enabled locations
    const marketingLocations = await this.dbService.collection.countDocuments({
      source: 'landmark_expansion',
      'marketing.marketingEnabled': true
    });

    console.log(`\n🎯 Marketing-enabled locations: ${marketingLocations}`);

    // Test 4: Premium locations
    const premiumLocations = await this.dbService.collection.countDocuments({
      source: 'landmark_expansion',
      'dataQuality.level': 'premium'
    });

    console.log(`👑 Premium listings: ${premiumLocations}`);

    console.log('\n✅ Import verification completed successfully!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new LandmarkDataImporter();
  importer.importLandmarkData().catch(console.error);
}

export default LandmarkDataImporter;