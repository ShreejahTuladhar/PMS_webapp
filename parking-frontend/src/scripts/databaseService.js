/**
 * Database Service for Parking Data Import
 * Handles connection and insertion of validated parking data into MongoDB cluster
 */

import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

class DatabaseService {
  constructor(config) {
    this.config = {
      connectionString: config.connectionString || process.env.MONGODB_URI,
      databaseName: config.databaseName || process.env.DB_NAME || 'parking_management',
      collectionName: config.collectionName || 'locations',
      batchSize: config.batchSize || 50,
      maxRetries: config.maxRetries || 3
    };
    
    this.client = null;
    this.db = null;
    this.collection = null;
    this.insertionResults = {
      successful: [],
      failed: [],
      duplicates: [],
      summary: {
        totalAttempted: 0,
        successfulInsertions: 0,
        failedInsertions: 0,
        duplicatesSkipped: 0
      }
    };
  }

  /**
   * Connect to MongoDB cluster
   */
  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB cluster...');
      
      if (!this.config.connectionString) {
        throw new Error('MongoDB connection string not provided. Set MONGODB_URI environment variable.');
      }

      this.client = new MongoClient(this.config.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });

      await this.client.connect();
      
      this.db = this.client.db(this.config.databaseName);
      this.collection = this.db.collection(this.config.collectionName);
      
      // Create indexes for better performance
      await this.createIndexes();
      
      console.log('✅ Successfully connected to MongoDB cluster');
      console.log(`📊 Database: ${this.config.databaseName}, Collection: ${this.config.collectionName}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Create database indexes for optimization
   */
  async createIndexes() {
    try {
      console.log('🔍 Creating database indexes...');
      
      const indexes = [
        // Geospatial index for location queries
        { 
          key: { "coordinates": "2dsphere" }, 
          name: "coordinates_2dsphere",
          background: true 
        },
        
        // Text search index for name and address
        { 
          key: { name: "text", address: "text", description: "text" }, 
          name: "search_text_index",
          background: true 
        },
        
        // Compound index for common queries
        { 
          key: { currentStatus: 1, isActive: 1, verificationStatus: 1 }, 
          name: "status_compound_index",
          background: true 
        },
        
        // Source tracking index
        { 
          key: { source: 1, "originalScrapedData.scrapedAt": 1 }, 
          name: "source_tracking_index",
          background: true 
        },
        
        // Unique constraint on coordinates + name to prevent exact duplicates
        { 
          key: { 
            "coordinates.latitude": 1, 
            "coordinates.longitude": 1, 
            "name": 1 
          }, 
          name: "location_unique_index",
          unique: true,
          background: true 
        }
      ];

      for (const index of indexes) {
        try {
          await this.collection.createIndex(index.key, {
            name: index.name,
            unique: index.unique || false,
            background: index.background || false
          });
          console.log(`  ✅ Created index: ${index.name}`);
        } catch (error) {
          if (error.code === 85) { // Index already exists
            console.log(`  ℹ️ Index already exists: ${index.name}`);
          } else {
            console.warn(`  ⚠️ Failed to create index ${index.name}:`, error.message);
          }
        }
      }
      
      console.log('📊 Database indexes setup completed');
    } catch (error) {
      console.warn('⚠️ Index creation failed (non-critical):', error.message);
    }
  }

  /**
   * Check if location already exists (duplicate detection)
   */
  async checkDuplicate(location) {
    try {
      // Check for exact coordinate match (within ~10 meters)
      const coordinateThreshold = 0.0001; // approximately 10 meters
      
      const existingLocation = await this.collection.findOne({
        $and: [
          {
            "coordinates.latitude": {
              $gte: location.coordinates.latitude - coordinateThreshold,
              $lte: location.coordinates.latitude + coordinateThreshold
            }
          },
          {
            "coordinates.longitude": {
              $gte: location.coordinates.longitude - coordinateThreshold,
              $lte: location.coordinates.longitude + coordinateThreshold
            }
          },
          {
            $or: [
              { name: location.name },
              { address: location.address }
            ]
          }
        ]
      });

      return existingLocation;
    } catch (error) {
      console.warn('⚠️ Duplicate check failed:', error.message);
      return null;
    }
  }

  /**
   * Prepare location data for database insertion
   */
  prepareLocationForDB(location) {
    return {
      ...location,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Ensure coordinates are properly formatted for MongoDB geospatial queries
      coordinates: {
        type: "Point",
        coordinates: [location.coordinates.longitude, location.coordinates.latitude] // GeoJSON format [lng, lat]
      },
      
      // Store original lat/lng for backward compatibility
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      
      // Add import metadata
      importMetadata: {
        importedAt: new Date(),
        importSource: 'galli_maps_scraper',
        batchId: this.generateBatchId(),
        version: '1.0'
      }
    };
  }

  /**
   * Insert single parking location
   */
  async insertLocation(location) {
    try {
      // Check for duplicates
      const existingLocation = await this.checkDuplicate(location);
      
      if (existingLocation) {
        console.log(`⏭️ Skipping duplicate: ${location.name}`);
        this.insertionResults.duplicates.push({
          attempted: location,
          existing: existingLocation._id
        });
        return { success: false, reason: 'duplicate', existing: existingLocation._id };
      }

      // Prepare data for insertion
      const dbLocation = this.prepareLocationForDB(location);
      
      // Insert into database
      const result = await this.collection.insertOne(dbLocation);
      
      if (result.insertedId) {
        console.log(`✅ Inserted: ${location.name} (${result.insertedId})`);
        this.insertionResults.successful.push({
          location: location,
          insertedId: result.insertedId
        });
        return { success: true, insertedId: result.insertedId };
      } else {
        throw new Error('Insert operation failed - no ID returned');
      }
      
    } catch (error) {
      console.error(`❌ Failed to insert ${location.name}:`, error.message);
      this.insertionResults.failed.push({
        location: location,
        error: error.message
      });
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Batch insert parking locations
   */
  async batchInsertLocations(locations) {
    console.log(`🔄 Starting batch insertion of ${locations.length} locations...`);
    
    this.insertionResults.summary.totalAttempted = locations.length;
    
    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < locations.length; i += this.config.batchSize) {
      const batch = locations.slice(i, i + this.config.batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(locations.length / this.config.batchSize)} (${batch.length} items)...`);
      
      // Process each item in the batch
      const batchPromises = batch.map(async (location) => {
        let retries = 0;
        while (retries < this.config.maxRetries) {
          try {
            const result = await this.insertLocation(location);
            if (result.success) {
              this.insertionResults.summary.successfulInsertions++;
            } else if (result.reason === 'duplicate') {
              this.insertionResults.summary.duplicatesSkipped++;
            } else {
              this.insertionResults.summary.failedInsertions++;
            }
            return result;
          } catch (error) {
            retries++;
            if (retries >= this.config.maxRetries) {
              console.error(`❌ Max retries exceeded for ${location.name}`);
              this.insertionResults.summary.failedInsertions++;
              return { success: false, reason: 'max_retries_exceeded', error: error.message };
            }
            
            console.warn(`⚠️ Retry ${retries}/${this.config.maxRetries} for ${location.name}`);
            await this.delay(1000 * retries); // Exponential backoff
          }
        }
      });
      
      // Wait for batch to complete
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      await this.delay(500);
    }
    
    console.log('✅ Batch insertion completed');
    this.logInsertionSummary();
    
    return this.insertionResults;
  }

  /**
   * Update existing location with new data
   */
  async updateLocation(existingId, newData) {
    try {
      const updateData = {
        ...newData,
        updatedAt: new Date(),
        lastScrapedUpdate: {
          updatedAt: new Date(),
          source: 'galli_maps_scraper',
          previousData: await this.collection.findOne({ _id: existingId })
        }
      };
      
      const result = await this.collection.updateOne(
        { _id: existingId },
        { $set: updateData }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`🔄 Updated existing location: ${existingId}`);
        return { success: true, modifiedCount: result.modifiedCount };
      } else {
        console.log(`ℹ️ No changes needed for: ${existingId}`);
        return { success: true, modifiedCount: 0 };
      }
      
    } catch (error) {
      console.error(`❌ Failed to update location ${existingId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      const stats = await this.db.command({ collStats: this.config.collectionName });
      const count = await this.collection.countDocuments();
      
      return {
        totalDocuments: count,
        storageSize: stats.storageSize,
        avgObjSize: stats.avgObjSize,
        indexes: stats.nindexes,
        totalIndexSize: stats.totalIndexSize
      };
    } catch (error) {
      console.warn('⚠️ Could not retrieve collection stats:', error.message);
      return null;
    }
  }

  /**
   * Generate unique batch ID for tracking
   */
  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add delay for rate limiting
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log insertion summary
   */
  logInsertionSummary() {
    const { summary } = this.insertionResults;
    
    console.log('\n📊 INSERTION SUMMARY:');
    console.log('═══════════════════════');
    console.log(`Total Attempted: ${summary.totalAttempted}`);
    console.log(`✅ Successful: ${summary.successfulInsertions}`);
    console.log(`⏭️ Duplicates Skipped: ${summary.duplicatesSkipped}`);
    console.log(`❌ Failed: ${summary.failedInsertions}`);
    console.log(`Success Rate: ${(summary.successfulInsertions / summary.totalAttempted * 100).toFixed(1)}%`);
    console.log('═══════════════════════\n');
  }

  /**
   * Save insertion results to file
   */
  async saveInsertionResults() {
    try {
      const resultsDir = path.join(process.cwd(), 'insertion_results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsPath = path.join(resultsDir, `insertion_results_${timestamp}.json`);
      
      fs.writeFileSync(resultsPath, JSON.stringify({
        results: this.insertionResults,
        config: {
          databaseName: this.config.databaseName,
          collectionName: this.config.collectionName,
          batchSize: this.config.batchSize
        },
        completedAt: new Date().toISOString()
      }, null, 2));
      
      console.log(`💾 Insertion results saved to: ${resultsPath}`);
      return resultsPath;
      
    } catch (error) {
      console.error('Error saving insertion results:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        console.log('🔌 Disconnected from MongoDB cluster');
      }
    } catch (error) {
      console.error('Error disconnecting from database:', error.message);
    }
  }

  /**
   * Main import function
   */
  async importParkingData(validatedData) {
    try {
      console.log('🚀 Starting database import process...');
      
      // Connect to database
      await this.connect();
      
      // Get pre-import stats
      const preImportStats = await this.getCollectionStats();
      console.log('📊 Pre-import collection stats:', preImportStats);
      
      // Import data
      const results = await this.batchInsertLocations(validatedData);
      
      // Get post-import stats
      const postImportStats = await this.getCollectionStats();
      console.log('📊 Post-import collection stats:', postImportStats);
      
      // Save results
      await this.saveInsertionResults();
      
      console.log('✅ Database import process completed successfully');
      
      return results;
      
    } catch (error) {
      console.error('❌ Database import process failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

export default DatabaseService;