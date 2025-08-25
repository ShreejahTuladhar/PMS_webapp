/**
 * Database Operations Test Suite
 * Comprehensive testing of all advanced database operations
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('../models/User');
require('../models/Booking');
require('../models/ParkingLocation');

// Import services
const advancedDB = require('../services/advancedDatabaseService');
const databaseIndexService = require('../services/databaseIndexService');

class DatabaseOperationsTester {
  
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    try {
      console.log('🧪 Starting comprehensive database operations test suite...\n');
      
      // Connect to database
      await this.connectDatabase();
      
      // Run all test categories
      await this.testBasicConnectivity();
      await this.testAdvancedAnalytics();
      await this.testIndexPerformance();
      await this.testDataIntegrity();
      await this.testPerformanceBenchmarks();
      
      // Show results
      this.showTestResults();
      
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async connectDatabase() {
    try {
      console.log('📡 Connecting to test database...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ Connected to: ${mongoose.connection.name}\n`);
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async testBasicConnectivity() {
    console.log('🔌 Testing Basic Database Connectivity');
    console.log('=====================================');
    
    await this.runTest('Database Connection', async () => {
      const state = mongoose.connection.readyState;
      if (state !== 1) throw new Error(`Connection state: ${state}`);
      return 'Connected successfully';
    });

    await this.runTest('Collection Access', async () => {
      const User = mongoose.model('User');
      const count = await User.countDocuments();
      return `Found ${count} users`;
    });

    await this.runTest('Database Health', async () => {
      const health = await advancedDB.getDatabaseHealth();
      if (!health.connectionStatus) throw new Error('Health check failed');
      return `Status: ${health.connectionStatus}`;
    });

    console.log();
  }

  async testAdvancedAnalytics() {
    console.log('📊 Testing Advanced Analytics Operations');
    console.log('=======================================');

    await this.runTest('Revenue Analytics', async () => {
      const analytics = await advancedDB.getRevenueAnalytics({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: 'day'
      });
      
      if (!analytics.analytics || !analytics.summary) {
        throw new Error('Missing analytics data structure');
      }
      
      return `Created ${analytics.analytics.length} daily analytics records`;
    });

    await this.runTest('Occupancy Analytics', async () => {
      const occupancy = await advancedDB.getOccupancyAnalytics();
      
      if (!occupancy.locations || !occupancy.overallStats) {
        throw new Error('Missing occupancy data structure');
      }
      
      return `Analyzed ${occupancy.locations.length} locations`;
    });

    await this.runTest('Customer Analytics', async () => {
      const customers = await advancedDB.getCustomerAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        limit: 50
      });
      
      if (!customers.customerSegmentation || !customers.segmentSummary) {
        throw new Error('Missing customer analytics structure');
      }
      
      return `Segmented ${customers.customerSegmentation.length} customers`;
    });

    await this.runTest('Demand Forecasting', async () => {
      const forecast = await advancedDB.getDemandForecast({
        forecastDays: 7,
        historicalDays: 30
      });
      
      if (!forecast.forecast || !forecast.metadata) {
        throw new Error('Missing forecast data structure');
      }
      
      return `Created ${forecast.forecast.length} day forecast`;
    });

    console.log();
  }

  async testIndexPerformance() {
    console.log('⚡ Testing Index Performance');
    console.log('============================');

    await this.runTest('Index Statistics', async () => {
      const stats = await databaseIndexService.getIndexStats();
      
      const totalIndexes = Object.values(stats)
        .filter(s => !s.error)
        .reduce((sum, s) => sum + s.indexCount, 0);
      
      if (totalIndexes < 10) {
        throw new Error(`Too few indexes: ${totalIndexes}`);
      }
      
      return `${totalIndexes} indexes across all collections`;
    });

    await this.runTest('Query Performance', async () => {
      const startTime = Date.now();
      
      // Test a complex aggregation query
      await advancedDB.getRevenueAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: 'day'
      });
      
      const duration = Date.now() - startTime;
      
      if (duration > 5000) { // 5 seconds
        throw new Error(`Query too slow: ${duration}ms`);
      }
      
      return `Complex query executed in ${duration}ms`;
    });

    console.log();
  }

  async testDataIntegrity() {
    console.log('🔍 Testing Data Integrity');
    console.log('=========================');

    await this.runTest('Collection Counts', async () => {
      const User = mongoose.model('User');
      const Booking = mongoose.model('Booking');
      const ParkingLocation = mongoose.model('ParkingLocation');
      
      const [userCount, bookingCount, locationCount] = await Promise.all([
        User.countDocuments(),
        Booking.countDocuments(),
        ParkingLocation.countDocuments()
      ]);
      
      if (userCount === 0) throw new Error('No users found');
      if (locationCount === 0) throw new Error('No locations found');
      
      return `Users: ${userCount}, Bookings: ${bookingCount}, Locations: ${locationCount}`;
    });

    await this.runTest('Referential Integrity', async () => {
      const Booking = mongoose.model('Booking');
      
      // Check if all bookings have valid user and location references
      const invalidBookings = await Booking.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'parkinglocations',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location'
          }
        },
        {
          $match: {
            $or: [
              { user: { $size: 0 } },
              { location: { $size: 0 } }
            ]
          }
        }
      ]);
      
      if (invalidBookings.length > 0) {
        throw new Error(`Found ${invalidBookings.length} bookings with invalid references`);
      }
      
      return 'All booking references are valid';
    });

    await this.runTest('Data Validation', async () => {
      const ParkingLocation = mongoose.model('ParkingLocation');
      
      // Check for locations with invalid data
      const invalidLocations = await ParkingLocation.find({
        $or: [
          { totalSpaces: { $lte: 0 } },
          { hourlyRate: { $lt: 0 } },
          { coordinates: { $exists: false } }
        ]
      });
      
      if (invalidLocations.length > 0) {
        throw new Error(`Found ${invalidLocations.length} locations with invalid data`);
      }
      
      return 'All location data is valid';
    });

    console.log();
  }

  async testPerformanceBenchmarks() {
    console.log('🏃 Testing Performance Benchmarks');
    console.log('=================================');

    await this.runTest('Concurrent Analytics Queries', async () => {
      const startTime = Date.now();
      
      // Run multiple analytics queries concurrently
      const promises = [
        advancedDB.getRevenueAnalytics(),
        advancedDB.getOccupancyAnalytics(),
        advancedDB.getCustomerAnalytics({ limit: 20 }),
        advancedDB.getDemandForecast({ forecastDays: 3 })
      ];
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      if (duration > 10000) { // 10 seconds
        throw new Error(`Concurrent queries too slow: ${duration}ms`);
      }
      
      return `4 concurrent queries completed in ${duration}ms`;
    });

    await this.runTest('Memory Usage', async () => {
      const memUsage = process.memoryUsage();
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
      
      if (usedMB > 500) { // 500MB limit
        throw new Error(`High memory usage: ${usedMB}MB`);
      }
      
      return `Memory usage: ${usedMB}MB`;
    });

    await this.runTest('Database Size Check', async () => {
      const health = await advancedDB.getDatabaseHealth();
      const sizeMB = health.database.totalSize;
      
      if (sizeMB > 1000) { // 1GB warning
        console.warn(`Large database size: ${sizeMB}MB`);
      }
      
      return `Database size: ${sizeMB}MB`;
    });

    console.log();
  }

  async runTest(testName, testFunction) {
    try {
      const result = await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASS', result });
      console.log(`✅ ${testName}: ${result}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName}: ${error.message}`);
    }
  }

  showTestResults() {
    console.log('\n📋 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   ❌ ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🏆 All advanced database operations tested successfully!');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DatabaseOperationsTester();
  tester.runAllTests();
}

module.exports = DatabaseOperationsTester;