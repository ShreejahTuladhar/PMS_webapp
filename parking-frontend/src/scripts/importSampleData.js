#!/usr/bin/env node

/**
 * Import Sample Data to Database
 * Imports validated sample data directly to MongoDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function importSampleData() {
  try {
    console.log('🗄️ Starting sample data import to MongoDB...\n');
    
    // Find the latest transformed sample data file
    const validatedDataDir = path.join(process.cwd(), 'validated_data');
    const files = fs.readdirSync(validatedDataDir)
      .filter(file => file.startsWith('transformed_parking_data_') && file.endsWith('.json'))
      .sort()
      .reverse(); // Get newest first
    
    if (files.length === 0) {
      throw new Error('No transformed data files found. Run testSampleDataImport.js first.');
    }
    
    const latestFile = files[0];
    const filePath = path.join(validatedDataDir, latestFile);
    
    console.log(`📂 Loading data from: ${latestFile}`);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const transformedData = fileContent.data;
    
    console.log(`📊 Found ${transformedData.length} parking locations to import`);
    
    // Initialize database service
    const dbService = new DatabaseService({
      connectionString: process.env.MONGODB_URI,
      databaseName: process.env.DB_NAME || 'parking_management',
      collectionName: 'locations'
    });
    
    // Import data
    const results = await dbService.importParkingData(transformedData);
    
    console.log('\n🎉 Sample data import completed!');
    console.log(`📈 Summary: ${results.summary.successfulInsertions} imported, ${results.summary.duplicatesSkipped} duplicates skipped`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Sample data import failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importSampleData().catch(console.error);
}

export default importSampleData;