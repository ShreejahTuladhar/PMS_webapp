/**
 * Database Index Service
 * Manages database indexing strategy for optimal performance
 * Author: Shreejah Tuladhar
 */

const mongoose = require('mongoose');

// Import models to ensure they're registered
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingLocation = require('../models/ParkingLocation');

class DatabaseIndexService {
  
  /**
   * Create all necessary indexes for optimal performance
   */
  async createOptimalIndexes() {
    try {
      console.log('🚀 Starting database index optimization...');
      
      await this.createUserIndexes();
      await this.createBookingIndexes();
      await this.createLocationIndexes();
      await this.createViolationIndexes();
      
      console.log('✅ Database indexes created successfully');
      return { success: true, message: 'All indexes created successfully' };
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Create optimized indexes for User collection
   */
  async createUserIndexes() {
    const User = mongoose.model('User');
    
    const indexes = [
      // Authentication and lookup indexes
      { email: 1 }, // Already unique via schema
      { username: 1 }, // Already unique via schema
      
      // Role-based queries
      { role: 1 },
      { isActive: 1 },
      
      // Compound indexes for admin queries
      { role: 1, isActive: 1 },
      { role: 1, lastLogin: -1 },
      
      // Search optimization
      { firstName: 'text', lastName: 'text', email: 'text' },
      
      // Analytics queries
      { createdAt: -1 }, // User registration trends
      { lastLogin: -1 }, // Active user analysis
      
      // Location-based admin assignment
      { assignedLocations: 1 }, // Sparse index for parking admins
    ];

    for (const index of indexes) {
      try {
        await User.collection.createIndex(index, { 
          background: true,
          sparse: index.assignedLocations ? true : false 
        });
        console.log(`📊 User index created:`, index);
      } catch (error) {
        if (error.code !== 85) { // Index already exists
          console.error(`Error creating User index ${JSON.stringify(index)}:`, error.message);
        }
      }
    }
  }

  /**
   * Create optimized indexes for Booking collection
   */
  async createBookingIndexes() {
    const Booking = mongoose.model('Booking');
    
    const indexes = [
      // Core lookup indexes (some already exist)
      { userId: 1, createdAt: -1 },
      { locationId: 1, startTime: 1 },
      { status: 1 },
      { paymentStatus: 1 },
      
      // Analytics and reporting indexes
      { createdAt: -1 }, // Revenue analytics by date
      { startTime: 1, endTime: 1 }, // Occupancy queries
      
      // Compound indexes for complex queries
      { locationId: 1, status: 1, startTime: 1 },
      { userId: 1, status: 1 },
      { paymentStatus: 1, createdAt: -1 },
      { status: 1, startTime: 1, endTime: 1 },
      
      // Revenue analytics optimization
      { paymentStatus: 1, totalAmount: 1, createdAt: -1 },
      { locationId: 1, paymentStatus: 1, totalAmount: 1 },
      
      // Real-time occupancy tracking
      { locationId: 1, startTime: 1, endTime: 1, status: 1 },
      
      // Customer behavior analytics
      { userId: 1, totalAmount: 1, createdAt: -1 },
      
      // Forecasting and patterns
      { startTime: 1 }, // Hour/day pattern analysis
      { endTime: 1 },
      
      // QR code lookup (sparse)
      { qrCode: 1 },
      
      // Vehicle-based queries
      { 'vehicleInfo.plateNumber': 1 },
      
      // Penalty and violation tracking
      { 'penalties.issuedAt': -1 },
      { 'penalties.isPaid': 1 },
    ];

    for (const index of indexes) {
      try {
        const options = { 
          background: true,
          sparse: index.qrCode ? true : false 
        };
        
        await Booking.collection.createIndex(index, options);
        console.log(`📊 Booking index created:`, index);
      } catch (error) {
        if (error.code !== 85) { // Index already exists
          console.error(`Error creating Booking index ${JSON.stringify(index)}:`, error.message);
        }
      }
    }
  }

  /**
   * Create optimized indexes for ParkingLocation collection
   */
  async createLocationIndexes() {
    const ParkingLocation = mongoose.model('ParkingLocation');
    
    const indexes = [
      // Geospatial index for location-based queries
      { 'coordinates': '2dsphere' },
      
      // Basic lookup indexes
      { name: 1 },
      { isActive: 1 },
      { ownerId: 1 },
      
      // Analytics indexes
      { totalSpaces: 1 },
      { hourlyRate: 1 },
      { createdAt: -1 },
      
      // Search optimization
      { name: 'text', address: 'text', city: 'text' },
      
      // Compound indexes
      { isActive: 1, totalSpaces: -1 },
      { city: 1, isActive: 1 },
      { ownerId: 1, isActive: 1 },
      
      // Operating hours optimization
      { 'operatingHours.isOpen24Hours': 1 },
      
      // Pricing analysis
      { hourlyRate: 1, totalSpaces: -1 },
      { city: 1, hourlyRate: 1 },
    ];

    for (const index of indexes) {
      try {
        await ParkingLocation.collection.createIndex(index, { background: true });
        console.log(`📊 ParkingLocation index created:`, index);
      } catch (error) {
        if (error.code !== 85) { // Index already exists
          console.error(`Error creating ParkingLocation index ${JSON.stringify(index)}:`, error.message);
        }
      }
    }
  }

  /**
   * Create optimized indexes for Violation collection
   */
  async createViolationIndexes() {
    try {
      const Violation = mongoose.model('Violation');
      
      const indexes = [
        // Core lookup indexes
        { userId: 1, createdAt: -1 },
        { locationId: 1, createdAt: -1 },
        { bookingId: 1 },
        
        // Status and resolution tracking
        { status: 1 },
        { isResolved: 1 },
        
        // Analytics indexes
        { violationType: 1 },
        { createdAt: -1 },
        { fineAmount: 1 },
        
        // Compound indexes
        { status: 1, createdAt: -1 },
        { isResolved: 1, createdAt: -1 },
        { violationType: 1, fineAmount: 1 },
        { userId: 1, isResolved: 1 },
        { locationId: 1, violationType: 1 },
        
        // Payment tracking
        { isPaid: 1, fineAmount: 1 },
        
        // Vehicle-based violations
        { 'vehicleInfo.plateNumber': 1 },
      ];

      for (const index of indexes) {
        try {
          await Violation.collection.createIndex(index, { background: true });
          console.log(`📊 Violation index created:`, index);
        } catch (error) {
          if (error.code !== 85) { // Index already exists
            console.error(`Error creating Violation index ${JSON.stringify(index)}:`, error.message);
          }
        }
      }
    } catch (error) {
      // Violation model might not exist yet, skip silently
      console.log('⚠️  Violation model not found, skipping violation indexes');
    }
  }

  /**
   * Get current index statistics for all collections
   */
  async getIndexStats() {
    try {
      // Get actual collection names from the database
      const db = mongoose.connection.db;
      const collectionNames = await db.listCollections().toArray();
      const collections = collectionNames.map(col => col.name).filter(name => !name.startsWith('system.'));
      const stats = {};

      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const indexes = await collection.indexes();
          const collStats = await collection.stats();
          
          stats[collectionName] = {
            indexCount: indexes.length,
            indexes: indexes.map(idx => ({
              name: idx.name,
              key: idx.key,
              unique: idx.unique || false,
              sparse: idx.sparse || false,
              background: idx.background || false
            })),
            totalIndexSize: Math.round(collStats.totalIndexSize / 1024 / 1024 * 100) / 100, // MB
            avgObjSize: Math.round(collStats.avgObjSize),
            count: collStats.count
          };
        } catch (error) {
          stats[collectionName] = { error: error.message };
        }
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get index stats: ${error.message}`);
    }
  }

  /**
   * Drop all non-essential indexes (for maintenance)
   */
  async dropCustomIndexes() {
    try {
      console.log('🗑️  Dropping custom indexes...');
      
      const collections = ['users', 'bookings', 'parkinglocations', 'violations'];
      
      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const indexes = await collection.indexes();
          
          for (const index of indexes) {
            // Don't drop _id_ index or unique indexes from schema
            if (index.name !== '_id_' && !index.unique) {
              try {
                await collection.dropIndex(index.name);
                console.log(`🗑️  Dropped index ${index.name} from ${collectionName}`);
              } catch (error) {
                console.log(`⚠️  Could not drop index ${index.name}: ${error.message}`);
              }
            }
          }
        } catch (error) {
          console.log(`⚠️  Collection ${collectionName} not found, skipping`);
        }
      }
      
      console.log('✅ Custom indexes dropped successfully');
      return { success: true, message: 'Custom indexes dropped successfully' };
      
    } catch (error) {
      console.error('❌ Error dropping indexes:', error);
      throw error;
    }
  }

  /**
   * Analyze slow queries and suggest optimizations
   */
  async analyzeSlowQueries() {
    try {
      // Enable profiling if not already enabled
      await mongoose.connection.db.command({ profile: 2, slowms: 100 });
      
      // Get slow operations from the profiler collection
      const profilerData = await mongoose.connection.db
        .collection('system.profile')
        .find({})
        .sort({ ts: -1 })
        .limit(100)
        .toArray();

      const slowQueries = profilerData
        .filter(op => op.millis > 100)
        .map(op => ({
          duration: op.millis,
          namespace: op.ns,
          command: op.command,
          timestamp: op.ts,
          planSummary: op.planSummary
        }));

      return {
        totalSlowQueries: slowQueries.length,
        slowQueries: slowQueries.slice(0, 20), // Return top 20
        recommendations: this.generateIndexRecommendations(slowQueries)
      };
      
    } catch (error) {
      throw new Error(`Failed to analyze slow queries: ${error.message}`);
    }
  }

  /**
   * Generate index recommendations based on slow queries
   */
  generateIndexRecommendations(slowQueries) {
    const recommendations = [];
    
    // Analyze query patterns and suggest indexes
    const queryPatterns = {};
    
    slowQueries.forEach(query => {
      const collection = query.namespace?.split('.')[1];
      if (!queryPatterns[collection]) {
        queryPatterns[collection] = [];
      }
      queryPatterns[collection].push(query);
    });

    Object.entries(queryPatterns).forEach(([collection, queries]) => {
      if (queries.length > 5) { // If collection has many slow queries
        recommendations.push({
          collection,
          issue: `${queries.length} slow queries detected`,
          suggestion: 'Consider adding compound indexes for frequently queried fields',
          avgDuration: Math.round(queries.reduce((sum, q) => sum + q.duration, 0) / queries.length)
        });
      }
    });

    return recommendations;
  }
}

module.exports = new DatabaseIndexService();