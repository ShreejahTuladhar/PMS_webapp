/**
 * Database Initialization Script
 * Sets up optimal database indexes and configurations
 * Author: Claude & Shreeraj Tuladhar
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure they're registered
require('../models/User');
require('../models/Booking');
require('../models/ParkingLocation');

// Import services
const databaseIndexService = require('../services/databaseIndexService');
const advancedDatabaseService = require('../services/advancedDatabaseService');

class DatabaseInitializer {
  
  async initialize() {
    try {
      console.log('🚀 Starting ParkSathi database initialization...\n');
      
      // Connect to database
      await this.connectDatabase();
      
      // Create optimal indexes
      await this.setupIndexes();
      
      // Verify database health
      await this.verifyDatabaseHealth();
      
      // Show completion summary
      await this.showInitializationSummary();
      
      console.log('\n✅ Database initialization completed successfully!');
      process.exit(0);
      
    } catch (error) {
      console.error('\n❌ Database initialization failed:', error.message);
      process.exit(1);
    }
  }

  async connectDatabase() {
    try {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ Connected to database: ${mongoose.connection.name}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async setupIndexes() {
    try {
      console.log('📊 Setting up database indexes...');
      await databaseIndexService.createOptimalIndexes();
      console.log('✅ Database indexes created successfully\n');
    } catch (error) {
      throw new Error(`Index creation failed: ${error.message}`);
    }
  }

  async verifyDatabaseHealth() {
    try {
      console.log('🏥 Verifying database health...');
      const health = await advancedDatabaseService.getDatabaseHealth();
      
      console.log('📊 Database Health Summary:');
      console.log(`   Total Size: ${health.database.totalSize} MB`);
      console.log(`   Storage Size: ${health.database.storageSize} MB`);
      console.log(`   Total Objects: ${health.database.objects}`);
      console.log(`   Connection Status: ${health.connectionStatus}`);
      
      // Show collection stats
      console.log('\n📚 Collection Statistics:');
      Object.entries(health.collections).forEach(([collection, stats]) => {
        if (!stats.error) {
          console.log(`   ${collection}: ${stats.count} documents, ${stats.indexes} indexes, ${stats.size} MB`);
        }
      });
      
      console.log('✅ Database health verification completed\n');
    } catch (error) {
      console.warn('⚠️  Health check failed:', error.message);
    }
  }

  async showInitializationSummary() {
    try {
      console.log('📋 Initialization Summary:');
      
      const indexStats = await databaseIndexService.getIndexStats();
      
      Object.entries(indexStats).forEach(([collection, stats]) => {
        if (!stats.error) {
          console.log(`\n📊 ${collection.toUpperCase()}:`);
          console.log(`   Documents: ${stats.count}`);
          console.log(`   Indexes: ${stats.indexCount}`);
          console.log(`   Index Size: ${stats.totalIndexSize} MB`);
          console.log(`   Avg Doc Size: ${stats.avgObjSize} bytes`);
        }
      });
      
    } catch (error) {
      console.warn('⚠️  Could not generate summary:', error.message);
    }
  }
}

// Run initialization if called directly
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  initializer.initialize();
}

module.exports = DatabaseInitializer;