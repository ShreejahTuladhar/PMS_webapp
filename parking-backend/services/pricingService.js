/**
 * Smart Dynamic Pricing Algorithm for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Intelligent pricing engine based on demand, time, and market conditions
 */

const moment = require('moment');
const ParkingLocation = require('../models/ParkingLocation');
const Booking = require('../models/Booking');
const cacheService = require('./cacheService');

class PricingService {
    constructor() {
        this.basePricingFactors = {
            demandMultiplier: { low: 0.8, medium: 1.0, high: 1.3, surge: 1.8 },
            timeMultiplier: { offPeak: 0.9, regular: 1.0, peak: 1.2, prime: 1.5 },
            dayMultiplier: { weekday: 1.0, weekend: 1.1, holiday: 1.3 },
            durationDiscounts: { hour: 1.0, halfDay: 0.95, fullDay: 0.85, weekly: 0.7 }
        };
        
        this.peakHours = {
            morning: { start: 7, end: 10 },
            evening: { start: 17, end: 20 },
            lunch: { start: 11, end: 14 }
        };
    }

    /**
     * Calculate dynamic price for a parking booking
     */
    async calculatePrice(locationId, startTime, duration, vehicleType = 'car') {
        try {
            const location = await ParkingLocation.findById(locationId);
            if (!location) throw new Error('Location not found');

            // Get current demand and utilization
            const demand = await this.getCurrentDemand(locationId, startTime);
            const utilization = await this.getUtilizationRate(locationId, startTime);
            
            // Base pricing from location
            const baseRate = this.getBaseRate(location, vehicleType);
            
            // Calculate all multipliers
            const demandFactor = this.calculateDemandFactor(demand, utilization);
            const timeFactor = this.calculateTimeFactor(startTime);
            const dayFactor = this.calculateDayFactor(startTime);
            const durationFactor = this.calculateDurationFactor(duration);
            const seasonalFactor = await this.getSeasonalFactor(locationId, startTime);
            const eventFactor = await this.getEventFactor(locationId, startTime);
            
            // Calculate final price
            const adjustedRate = baseRate * demandFactor * timeFactor * dayFactor * seasonalFactor * eventFactor;
            const totalPrice = adjustedRate * (duration / 60) * durationFactor; // duration in minutes
            
            // Apply minimum and maximum constraints
            const finalPrice = this.applyPriceConstraints(totalPrice, baseRate, duration);
            
            const pricing = {
                baseRate,
                adjustedRate: Math.round(adjustedRate * 100) / 100,
                totalPrice: Math.round(finalPrice * 100) / 100,
                duration,
                factors: {
                    demand: demandFactor,
                    time: timeFactor,
                    day: dayFactor,
                    duration: durationFactor,
                    seasonal: seasonalFactor,
                    event: eventFactor
                },
                breakdown: {
                    base: baseRate * (duration / 60),
                    demandAdjustment: (adjustedRate - baseRate) * (duration / 60),
                    durationDiscount: (adjustedRate * (duration / 60)) * (1 - durationFactor)
                },
                demandLevel: this.getDemandLevel(demand, utilization),
                calculatedAt: new Date()
            };

            // Cache pricing for short period
            await cacheService.set(`pricing:${locationId}:${startTime.getTime()}`, pricing, 300);
            
            return pricing;
            
        } catch (error) {
            console.error('Pricing calculation error:', error);
            throw error;
        }
    }

    async getCurrentDemand(locationId, targetTime) {
        const hourStart = new Date(targetTime);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

        // Check active bookings for this hour
        const activeBookings = await Booking.countDocuments({
            parkingLocationId: locationId,
            startTime: { $lte: hourEnd },
            endTime: { $gte: hourStart },
            status: { $in: ['active', 'pending'] }
        });

        // Check recent booking velocity (bookings in last 2 hours)
        const recentBookings = await Booking.countDocuments({
            parkingLocationId: locationId,
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            status: { $in: ['active', 'pending'] }
        });

        return { active: activeBookings, recent: recentBookings };
    }

    async getUtilizationRate(locationId, targetTime) {
        const location = await ParkingLocation.findById(locationId);
        const demand = await this.getCurrentDemand(locationId, targetTime);
        
        return demand.active / location.totalSpaces;
    }

    getBaseRate(location, vehicleType) {
        const rates = location.pricing;
        switch (vehicleType) {
            case 'motorcycle': return rates.hourlyRate * 0.6;
            case 'car': return rates.hourlyRate;
            case 'suv': return rates.hourlyRate * 1.2;
            case 'truck': return rates.hourlyRate * 1.5;
            default: return rates.hourlyRate;
        }
    }

    calculateDemandFactor(demand, utilization) {
        // High utilization triggers surge pricing
        if (utilization >= 0.9) return this.basePricingFactors.demandMultiplier.surge;
        if (utilization >= 0.7) return this.basePricingFactors.demandMultiplier.high;
        if (utilization >= 0.4) return this.basePricingFactors.demandMultiplier.medium;
        return this.basePricingFactors.demandMultiplier.low;
    }

    calculateTimeFactor(dateTime) {
        const hour = dateTime.getHours();
        
        // Prime time (rush hours)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            return this.basePricingFactors.timeMultiplier.prime;
        }
        
        // Peak time (lunch, evening)
        if ((hour >= 11 && hour <= 14) || (hour >= 20 && hour <= 22)) {
            return this.basePricingFactors.timeMultiplier.peak;
        }
        
        // Off-peak (late night, early morning)
        if (hour >= 23 || hour <= 6) {
            return this.basePricingFactors.timeMultiplier.offPeak;
        }
        
        return this.basePricingFactors.timeMultiplier.regular;
    }

    calculateDayFactor(dateTime) {
        const dayOfWeek = dateTime.getDay();
        
        // Weekend premium
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return this.basePricingFactors.dayMultiplier.weekend;
        }
        
        // Check for holidays (simplified - you'd integrate with a holiday API)
        if (this.isHoliday(dateTime)) {
            return this.basePricingFactors.dayMultiplier.holiday;
        }
        
        return this.basePricingFactors.dayMultiplier.weekday;
    }

    calculateDurationFactor(durationMinutes) {
        const hours = durationMinutes / 60;
        
        if (hours >= 168) return this.basePricingFactors.durationDiscounts.weekly; // 1 week
        if (hours >= 24) return this.basePricingFactors.durationDiscounts.fullDay;
        if (hours >= 12) return this.basePricingFactors.durationDiscounts.halfDay;
        
        return this.basePricingFactors.durationDiscounts.hour;
    }

    async getSeasonalFactor(locationId, dateTime) {
        // Seasonal adjustments based on location type and date
        const month = dateTime.getMonth() + 1;
        
        // Tourist areas might have seasonal variations
        const location = await ParkingLocation.findById(locationId);
        if (location.amenities.includes('tourist_area')) {
            if (month >= 10 && month <= 2) return 1.2; // Festival season
            if (month >= 6 && month <= 8) return 0.9;  // Monsoon discount
        }
        
        return 1.0; // Default no seasonal adjustment
    }

    async getEventFactor(locationId, dateTime) {
        // Check for nearby events that might affect demand
        // This would integrate with event APIs or local event database
        
        // For now, simplified logic based on location amenities
        const location = await ParkingLocation.findById(locationId);
        const hour = dateTime.getHours();
        
        if (location.amenities.includes('stadium') && 
            (hour >= 18 && hour <= 22)) {
            return 1.4; // Event pricing
        }
        
        if (location.amenities.includes('mall') && 
            dateTime.getDay() === 0 && hour >= 12 && hour <= 20) {
            return 1.2; // Weekend mall rush
        }
        
        return 1.0;
    }

    applyPriceConstraints(calculatedPrice, baseRate, duration) {
        const hours = duration / 60;
        const baseTotal = baseRate * hours;
        
        // Minimum: 80% of base rate
        const minPrice = baseTotal * 0.8;
        
        // Maximum: 250% of base rate (surge protection)
        const maxPrice = baseTotal * 2.5;
        
        return Math.max(minPrice, Math.min(maxPrice, calculatedPrice));
    }

    getDemandLevel(demand, utilization) {
        if (utilization >= 0.9) return 'surge';
        if (utilization >= 0.7) return 'high';
        if (utilization >= 0.4) return 'medium';
        return 'low';
    }

    isHoliday(date) {
        // Simplified holiday check - integrate with proper holiday API
        const festivals = [
            '2025-04-13', // Nepali New Year
            '2025-10-15', // Dashain
            '2025-11-05', // Tihar
            '2025-12-25', // Christmas
            '2025-01-01'  // New Year
        ];
        
        const dateString = moment(date).format('YYYY-MM-DD');
        return festivals.includes(dateString);
    }

    /**
     * Get pricing history for analytics
     */
    async getPricingHistory(locationId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const bookings = await Booking.find({
            parkingLocationId: locationId,
            createdAt: { $gte: startDate },
            status: { $in: ['completed', 'active'] }
        }).sort({ createdAt: 1 });
        
        return bookings.map(booking => ({
            date: booking.createdAt,
            baseRate: booking.pricing.baseRate || 0,
            finalRate: booking.pricing.totalAmount / (booking.duration / 60),
            duration: booking.duration,
            demandLevel: booking.pricing.demandLevel || 'unknown'
        }));
    }

    /**
     * Optimize pricing for maximum revenue
     */
    async optimizePricing(locationId, targetUtilization = 0.75) {
        const location = await ParkingLocation.findById(locationId);
        const currentUtilization = await this.getUtilizationRate(locationId, new Date());
        
        let recommendations = [];
        
        if (currentUtilization < targetUtilization - 0.1) {
            recommendations.push({
                type: 'decrease',
                suggestion: 'Lower rates by 10-15% to increase demand',
                expectedImpact: 'Increase utilization by 15-20%'
            });
        } else if (currentUtilization > targetUtilization + 0.1) {
            recommendations.push({
                type: 'increase',
                suggestion: 'Increase rates by 10-20% during peak hours',
                expectedImpact: 'Optimize revenue while maintaining utilization'
            });
        }
        
        return {
            currentUtilization,
            targetUtilization,
            recommendations,
            lastUpdated: new Date()
        };
    }

    /**
     * Bulk pricing for multiple time slots
     */
    async getBulkPricing(locationId, timeSlots, duration = 60) {
        const pricing = [];
        
        for (const slot of timeSlots) {
            try {
                const price = await this.calculatePrice(locationId, new Date(slot), duration);
                pricing.push({
                    timeSlot: slot,
                    pricing: price
                });
            } catch (error) {
                pricing.push({
                    timeSlot: slot,
                    error: error.message
                });
            }
        }
        
        return pricing;
    }
}

module.exports = new PricingService();