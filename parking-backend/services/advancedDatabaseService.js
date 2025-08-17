/**
 * Advanced Database Service Layer
 * Provides optimized queries and analytics for ParkSathi
 * Author: Claude & Shreeraj Tuladhar
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingLocation = require('../models/ParkingLocation');
const Violation = require('../models/Violation');

class AdvancedDatabaseService {
  
  // ===== REVENUE ANALYTICS =====
  
  /**
   * Get comprehensive revenue analytics
   * @param {Object} options - Query options (dateRange, locationId, etc.)
   * @returns {Object} Revenue analytics data
   */
  async getRevenueAnalytics(options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date(),
      locationId = null,
      groupBy = 'day' // day, week, month, hour
    } = options;

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    };

    if (locationId) {
      matchStage.locationId = new mongoose.Types.ObjectId(locationId);
    }

    // Define grouping format based on period
    const getDateFormat = (groupBy) => {
      switch (groupBy) {
        case 'hour': return { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        case 'week': return {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        case 'month': return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        default: return { // day
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
      }
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: getDateFormat(groupBy),
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
          averageBookingValue: { $avg: '$totalAmount' },
          uniqueCustomers: { $addToSet: '$userId' },
          paymentMethods: { $push: '$paymentMethod' }
        }
      },
      {
        $addFields: {
          uniqueCustomerCount: { $size: '$uniqueCustomers' },
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: { $ifNull: ['$_id.month', 1] },
              day: { $ifNull: ['$_id.day', 1] },
              hour: { $ifNull: ['$_id.hour', 0] }
            }
          }
        }
      },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          date: 1,
          totalRevenue: 1,
          bookingCount: 1,
          averageBookingValue: { $round: ['$averageBookingValue', 2] },
          uniqueCustomerCount: 1,
          paymentMethodBreakdown: {
            $reduce: {
              input: '$paymentMethods',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { $arrayToObject: [[{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]] }
                ]
              }
            }
          }
        }
      }
    ];

    const analytics = await Booking.aggregate(pipeline);

    // Calculate summary statistics
    const summary = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          averageRevenue: { $avg: '$totalAmount' },
          maxRevenue: { $max: '$totalAmount' },
          minRevenue: { $min: '$totalAmount' }
        }
      }
    ]);

    return {
      analytics,
      summary: summary[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        averageRevenue: 0,
        maxRevenue: 0,
        minRevenue: 0
      },
      period: { startDate, endDate, groupBy }
    };
  }

  // ===== OCCUPANCY ANALYTICS =====

  /**
   * Get real-time occupancy analytics
   * @param {Object} options - Query options
   * @returns {Object} Occupancy analytics
   */
  async getOccupancyAnalytics(options = {}) {
    const { locationId = null } = options;
    const now = new Date();

    const matchStage = locationId 
      ? { _id: new mongoose.Types.ObjectId(locationId) }
      : {};

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'bookings',
          let: { locationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$locationId', '$$locationId'] },
                    { $lte: ['$startTime', now] },
                    { $gte: ['$endTime', now] },
                    { $eq: ['$status', 'confirmed'] }
                  ]
                }
              }
            }
          ],
          as: 'activeBookings'
        }
      },
      {
        $addFields: {
          currentOccupancy: { $size: '$activeBookings' },
          occupancyPercentage: {
            $multiply: [
              { $divide: [{ $size: '$activeBookings' }, '$totalSpaces'] },
              100
            ]
          },
          availableSpaces: { $subtract: ['$totalSpaces', { $size: '$activeBookings' }] }
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          totalSpaces: 1,
          currentOccupancy: 1,
          availableSpaces: 1,
          occupancyPercentage: { $round: ['$occupancyPercentage', 1] },
          coordinates: 1,
          hourlyRate: 1,
          isActive: 1
        }
      }
    ];

    const locations = await ParkingLocation.aggregate(pipeline);

    // Calculate overall occupancy statistics
    const overallStats = locations.reduce((acc, location) => {
      acc.totalSpaces += location.totalSpaces;
      acc.totalOccupied += location.currentOccupancy;
      acc.totalAvailable += location.availableSpaces;
      return acc;
    }, { totalSpaces: 0, totalOccupied: 0, totalAvailable: 0 });

    overallStats.overallOccupancyPercentage = overallStats.totalSpaces > 0 
      ? Math.round((overallStats.totalOccupied / overallStats.totalSpaces) * 100 * 10) / 10
      : 0;

    return {
      locations,
      overallStats,
      timestamp: now
    };
  }

  // ===== CUSTOMER ANALYTICS =====

  /**
   * Get customer behavior analytics
   * @param {Object} options - Query options
   * @returns {Object} Customer analytics
   */
  async getCustomerAnalytics(options = {}) {
    const {
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      endDate = new Date(),
      limit = 100
    } = options;

    // Customer segmentation pipeline
    const customerSegmentation = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'userId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: '$$booking.totalAmount'
              }
            }
          },
          avgBookingValue: {
            $cond: {
              if: { $gt: [{ $size: '$bookings' }, 0] },
              then: {
                $divide: [
                  { $sum: { $map: { input: '$bookings', as: 'booking', in: '$$booking.totalAmount' } } },
                  { $size: '$bookings' }
                ]
              },
              else: 0
            }
          },
          lastBookingDate: { $max: '$bookings.createdAt' },
          favoriteLocation: {
            $cond: {
              if: { $gt: [{ $size: '$bookings' }, 0] },
              then: { $arrayElemAt: ['$bookings.locationId', 0] },
              else: null
            }
          }
        }
      },
      {
        $addFields: {
          customerSegment: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalBookings', 10] }, then: 'VIP' },
                { case: { $gte: ['$totalBookings', 5] }, then: 'Regular' },
                { case: { $gte: ['$totalBookings', 1] }, then: 'Occasional' }
              ],
              default: 'New'
            }
          },
          daysSinceLastBooking: {
            $cond: {
              if: '$lastBookingDate',
              then: {
                $divide: [
                  { $subtract: [new Date(), '$lastBookingDate'] },
                  86400000 // milliseconds in a day
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          totalBookings: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          avgBookingValue: { $round: ['$avgBookingValue', 2] },
          customerSegment: 1,
          lastBookingDate: 1,
          daysSinceLastBooking: { $round: ['$daysSinceLastBooking', 0] },
          favoriteLocation: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);

    // Customer segment summary
    const segmentSummary = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'userId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          customerSegment: {
            $switch: {
              branches: [
                { case: { $gte: [{ $size: '$bookings' }, 10] }, then: 'VIP' },
                { case: { $gte: [{ $size: '$bookings' }, 5] }, then: 'Regular' },
                { case: { $gte: [{ $size: '$bookings' }, 1] }, then: 'Occasional' }
              ],
              default: 'New'
            }
          }
        }
      },
      {
        $group: {
          _id: '$customerSegment',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$bookings',
                  as: 'booking',
                  in: '$$booking.totalAmount'
                }
              }
            }
          }
        }
      }
    ]);

    return {
      customerSegmentation,
      segmentSummary,
      totalCustomers: customerSegmentation.length
    };
  }

  // ===== PREDICTIVE ANALYTICS =====

  /**
   * Get demand forecasting based on historical patterns
   * @param {Object} options - Forecasting options
   * @returns {Object} Demand forecast
   */
  async getDemandForecast(options = {}) {
    const {
      locationId = null,
      forecastDays = 7,
      historicalDays = 30
    } = options;

    const startDate = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (locationId) {
      matchStage.locationId = new mongoose.Types.ObjectId(locationId);
    }

    // Historical hourly patterns
    const hourlyPatterns = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            hour: { $hour: '$startTime' },
            dayOfWeek: { $dayOfWeek: '$startTime' }
          },
          bookingCount: { $sum: 1 },
          averageRevenue: { $avg: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          avgBookingsPerHour: { $avg: '$bookingCount' },
          avgRevenuePerHour: { $avg: '$averageRevenue' },
          weekdayPattern: {
            $push: {
              dayOfWeek: '$_id.dayOfWeek',
              bookingCount: '$bookingCount'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate forecast for next N days
    const forecast = [];
    const now = new Date();
    
    for (let day = 1; day <= forecastDays; day++) {
      const forecastDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const dayOfWeek = forecastDate.getDay() + 1; // MongoDB dayOfWeek is 1-7
      
      const dayForecast = {
        date: forecastDate.toISOString().split('T')[0],
        dayOfWeek,
        hourlyForecast: hourlyPatterns.map(hour => {
          // Find historical pattern for this hour and day of week
          const dayPattern = hour.weekdayPattern.find(p => p.dayOfWeek === dayOfWeek);
          const expectedBookings = dayPattern ? dayPattern.bookingCount : hour.avgBookingsPerHour;
          
          return {
            hour: hour._id,
            expectedBookings: Math.round(expectedBookings * 10) / 10,
            expectedRevenue: Math.round(hour.avgRevenuePerHour * expectedBookings * 100) / 100,
            confidence: dayPattern ? 0.8 : 0.5 // Higher confidence if we have specific day data
          };
        }),
        totalExpectedBookings: 0,
        totalExpectedRevenue: 0
      };

      // Calculate daily totals
      dayForecast.totalExpectedBookings = dayForecast.hourlyForecast.reduce(
        (sum, hour) => sum + hour.expectedBookings, 0
      );
      dayForecast.totalExpectedRevenue = dayForecast.hourlyForecast.reduce(
        (sum, hour) => sum + hour.expectedRevenue, 0
      );

      forecast.push(dayForecast);
    }

    return {
      forecast,
      historicalPeriod: { startDate, endDate, days: historicalDays },
      forecastPeriod: { days: forecastDays },
      metadata: {
        basedOnBookings: await Booking.countDocuments(matchStage),
        confidence: 'Medium', // Based on 30 days of data
        lastUpdated: new Date()
      }
    };
  }

  // ===== DATABASE HEALTH & PERFORMANCE =====

  /**
   * Get database performance metrics
   * @returns {Object} Performance metrics
   */
  async getDatabaseHealth() {
    const collections = ['users', 'bookings', 'locations', 'violations'];
    const stats = {};

    for (const collection of collections) {
      try {
        const collectionStats = await mongoose.connection.db.collection(collection).stats();
        stats[collection] = {
          count: collectionStats.count,
          size: Math.round(collectionStats.size / 1024 / 1024 * 100) / 100, // MB
          avgObjSize: Math.round(collectionStats.avgObjSize),
          indexes: collectionStats.nindexes,
          indexSize: Math.round(collectionStats.totalIndexSize / 1024 / 1024 * 100) / 100 // MB
        };
      } catch (error) {
        stats[collection] = { error: error.message };
      }
    }

    const dbStats = await mongoose.connection.db.stats();
    
    return {
      collections: stats,
      database: {
        totalSize: Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100, // MB
        storageSize: Math.round(dbStats.storageSize / 1024 / 1024 * 100) / 100, // MB
        indexes: dbStats.indexes,
        objects: dbStats.objects,
        avgObjSize: Math.round(dbStats.avgObjSize),
        fileSize: Math.round((dbStats.fileSize || 0) / 1024 / 1024 * 100) / 100 // MB
      },
      connectionStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      timestamp: new Date()
    };
  }
}

module.exports = new AdvancedDatabaseService();