/**
 * Advanced Analytics Service for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Intelligent data analytics and business intelligence engine
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingLocation = require('../models/ParkingLocation');
const User = require('../models/User');

class AnalyticsService {
    constructor() {
        this.metrics = new Map();
        this.realTimeData = new Map();
    }

    // Revenue Analytics
    async getRevenueAnalytics(period = 'month', locationId = null) {
        const now = new Date();
        const startDate = this.getStartDate(period, now);
        
        const matchQuery = {
            createdAt: { $gte: startDate, $lte: now },
            status: { $in: ['completed', 'active'] }
        };
        
        if (locationId) {
            matchQuery.parkingLocationId = new mongoose.Types.ObjectId(locationId);
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: period === 'day' ? '%Y-%m-%d-%H' : 
                                   period === 'week' ? '%Y-%U' : '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    totalRevenue: { $sum: '$pricing.totalAmount' },
                    bookingCount: { $sum: 1 },
                    avgBookingValue: { $avg: '$pricing.totalAmount' },
                    totalDuration: { $sum: '$duration' }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Booking.aggregate(pipeline);
        
        return {
            period,
            data: results,
            summary: {
                totalRevenue: results.reduce((sum, item) => sum + item.totalRevenue, 0),
                totalBookings: results.reduce((sum, item) => sum + item.bookingCount, 0),
                avgBookingValue: results.length > 0 ? 
                    results.reduce((sum, item) => sum + item.avgBookingValue, 0) / results.length : 0
            }
        };
    }

    // Utilization Analytics
    async getUtilizationAnalytics(locationId = null, period = 'week') {
        const now = new Date();
        const startDate = this.getStartDate(period, now);
        
        const matchQuery = {
            createdAt: { $gte: startDate, $lte: now }
        };
        
        if (locationId) {
            matchQuery.parkingLocationId = new mongoose.Types.ObjectId(locationId);
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'parkinglocations',
                    localField: 'parkingLocationId',
                    foreignField: '_id',
                    as: 'location'
                }
            },
            { $unwind: '$location' },
            {
                $group: {
                    _id: '$parkingLocationId',
                    locationName: { $first: '$location.name' },
                    totalSpaces: { $first: '$location.totalSpaces' },
                    totalBookings: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    avgDuration: { $avg: '$duration' }
                }
            },
            {
                $addFields: {
                    utilizationRate: {
                        $multiply: [
                            { $divide: ['$totalDuration', { $multiply: ['$totalSpaces', 24 * 60 * 7] }] },
                            100
                        ]
                    }
                }
            },
            { $sort: { utilizationRate: -1 } }
        ];

        return await Booking.aggregate(pipeline);
    }

    // Peak Hours Analysis
    async getPeakHoursAnalysis(locationId = null, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const matchQuery = {
            createdAt: { $gte: startDate },
            status: { $in: ['completed', 'active'] }
        };
        
        if (locationId) {
            matchQuery.parkingLocationId = new mongoose.Types.ObjectId(locationId);
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$startTime' },
                        dayOfWeek: { $dayOfWeek: '$startTime' }
                    },
                    bookingCount: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                    totalRevenue: { $sum: '$pricing.totalAmount' }
                }
            },
            {
                $group: {
                    _id: '$_id.hour',
                    avgBookingsPerHour: { $avg: '$bookingCount' },
                    totalBookings: { $sum: '$bookingCount' },
                    avgDuration: { $avg: '$avgDuration' },
                    avgRevenue: { $avg: '$totalRevenue' }
                }
            },
            { $sort: { _id: 1 } }
        ];

        return await Booking.aggregate(pipeline);
    }

    // User Behavior Analytics
    async getUserBehaviorAnalytics(period = 'month') {
        const now = new Date();
        const startDate = this.getStartDate(period, now);

        const userMetrics = await User.aggregate([
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
                    recentBookings: {
                        $filter: {
                            input: '$bookings',
                            cond: { $gte: ['$$this.createdAt', startDate] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: {
                            $cond: [{ $gt: [{ $size: '$recentBookings' }, 0] }, 1, 0]
                        }
                    },
                    newUsers: {
                        $sum: {
                            $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0]
                        }
                    },
                    avgBookingsPerUser: { $avg: { $size: '$recentBookings' } }
                }
            }
        ]);

        return userMetrics[0] || {};
    }

    // Predictive Analytics
    async getPredictiveInsights(locationId) {
        const location = await ParkingLocation.findById(locationId);
        if (!location) throw new Error('Location not found');

        // Get historical data for the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const historicalData = await Booking.find({
            parkingLocationId: locationId,
            createdAt: { $gte: threeMonthsAgo },
            status: { $in: ['completed', 'active'] }
        }).sort({ createdAt: 1 });

        // Simple trend analysis
        const weeklyBookings = this.groupBookingsByWeek(historicalData);
        const trend = this.calculateTrend(weeklyBookings);
        
        // Demand forecasting based on patterns
        const demandForecast = this.forecastDemand(weeklyBookings, location.totalSpaces);
        
        return {
            locationId,
            locationName: location.name,
            trend: {
                direction: trend.direction,
                strength: trend.strength,
                confidence: trend.confidence
            },
            forecast: demandForecast,
            recommendations: this.generateRecommendations(trend, demandForecast, location)
        };
    }

    // Real-time Dashboard Metrics
    async getRealTimeDashboard() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const [
            activeBookings,
            todayRevenue,
            yesterdayRevenue,
            totalUsers,
            activeLocations
        ] = await Promise.all([
            Booking.countDocuments({ status: 'active' }),
            this.getDayRevenue(today),
            this.getDayRevenue(yesterday),
            User.countDocuments({ isActive: true }),
            ParkingLocation.countDocuments({ status: 'active' })
        ]);

        const revenueGrowth = yesterdayRevenue > 0 ? 
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;

        return {
            activeBookings,
            todayRevenue,
            revenueGrowth,
            totalUsers,
            activeLocations,
            timestamp: now
        };
    }

    // Helper Methods
    getStartDate(period, now) {
        const date = new Date(now);
        switch (period) {
            case 'day':
                date.setHours(0, 0, 0, 0);
                break;
            case 'week':
                date.setDate(date.getDate() - 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'year':
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                date.setMonth(date.getMonth() - 1);
        }
        return date;
    }

    async getDayRevenue(date) {
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        const result = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: date, $lt: nextDay },
                    status: { $in: ['completed', 'active'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);
        return result[0]?.total || 0;
    }

    groupBookingsByWeek(bookings) {
        const weeks = new Map();
        bookings.forEach(booking => {
            const week = this.getWeekKey(booking.createdAt);
            weeks.set(week, (weeks.get(week) || 0) + 1);
        });
        return Array.from(weeks.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    calculateTrend(weeklyData) {
        if (weeklyData.length < 3) {
            return { direction: 'stable', strength: 0, confidence: 0 };
        }

        const values = weeklyData.map(([, count]) => count);
        const n = values.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const direction = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
        const strength = Math.abs(slope);
        const confidence = Math.min(0.95, 0.5 + (n - 3) * 0.1);

        return { direction, strength, confidence };
    }

    forecastDemand(weeklyData, totalSpaces) {
        const recentWeeks = weeklyData.slice(-4);
        const avgDemand = recentWeeks.reduce((sum, [, count]) => sum + count, 0) / recentWeeks.length;
        
        return {
            expectedBookings: Math.round(avgDemand),
            utilizationForecast: Math.round((avgDemand / (totalSpaces * 7)) * 100),
            confidence: recentWeeks.length >= 4 ? 0.8 : 0.6
        };
    }

    generateRecommendations(trend, forecast, location) {
        const recommendations = [];

        if (trend.direction === 'increasing' && forecast.utilizationForecast > 80) {
            recommendations.push({
                type: 'capacity',
                priority: 'high',
                message: 'Consider dynamic pricing or expanding capacity due to high demand'
            });
        }

        if (trend.direction === 'decreasing' && forecast.utilizationForecast < 30) {
            recommendations.push({
                type: 'marketing',
                priority: 'medium',
                message: 'Consider promotional offers to increase utilization'
            });
        }

        if (forecast.utilizationForecast > 90) {
            recommendations.push({
                type: 'pricing',
                priority: 'high',
                message: 'Implement surge pricing during peak demand periods'
            });
        }

        return recommendations;
    }
}

module.exports = new AnalyticsService();