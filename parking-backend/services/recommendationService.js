/**
 * AI-Powered Parking Recommendation Engine for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Machine Learning based intelligent parking suggestions
 */

const ParkingLocation = require('../models/ParkingLocation');
const Booking = require('../models/Booking');
const User = require('../models/User');
const cacheService = require('./cacheService');

class RecommendationService {
    constructor() {
        this.userPreferenceWeights = {
            price: 0.3,
            distance: 0.25,
            availability: 0.2,
            rating: 0.15,
            amenities: 0.1
        };
        
        this.maxDistance = 5000; // 5km radius
        this.minRating = 3.0;
    }

    /**
     * Get personalized parking recommendations
     */
    async getRecommendations(userId, searchCriteria) {
        try {
            const { location, radius = 2000, maxPrice, duration = 60, preferences = {} } = searchCriteria;
            
            // Get user profile and history
            const userProfile = await this.getUserProfile(userId);
            
            // Find available parking locations
            const availableLocations = await this.findAvailableLocations(
                location, radius, maxPrice, duration
            );
            
            if (availableLocations.length === 0) {
                return { recommendations: [], message: 'No available parking found in the area' };
            }
            
            // Score and rank locations
            const scoredLocations = await this.scoreLocations(
                availableLocations, userProfile, searchCriteria
            );
            
            // Apply machine learning recommendations
            const mlRecommendations = await this.applyMLRecommendations(
                scoredLocations, userProfile, searchCriteria
            );
            
            // Add dynamic factors
            const finalRecommendations = await this.addDynamicFactors(mlRecommendations);
            
            return {
                recommendations: finalRecommendations.slice(0, 10), // Top 10
                userProfile: userProfile.preferences,
                searchMeta: {
                    totalFound: availableLocations.length,
                    radius,
                    timestamp: new Date()
                }
            };
            
        } catch (error) {
            console.error('Recommendation error:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        // Check cache first
        const cached = await cacheService.get(`user_profile:${userId}`);
        if (cached) return cached;
        
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        
        // Get user's booking history
        const bookingHistory = await Booking.find({
            userId,
            status: { $in: ['completed', 'active'] }
        }).populate('parkingLocationId').limit(50).sort({ createdAt: -1 });
        
        const profile = this.analyzeUserBehavior(user, bookingHistory);
        
        // Cache for 1 hour
        await cacheService.set(`user_profile:${userId}`, profile, 3600);
        
        return profile;
    }

    analyzeUserBehavior(user, bookingHistory) {
        const preferences = {
            avgSpendingPerHour: 0,
            preferredTimeSlots: [],
            preferredAmenities: [],
            locationPreferences: {
                mall: 0,
                office: 0,
                residential: 0,
                tourist: 0
            },
            pricesensitivity: 'medium', // low, medium, high
            distancePreference: 'balanced', // close, balanced, far_if_cheap
            bookingPatterns: {
                advanceBooking: false,
                lastMinute: false,
                regular: false
            }
        };

        if (bookingHistory.length === 0) {
            return { preferences, confidence: 0 };
        }

        // Analyze spending patterns
        const totalSpent = bookingHistory.reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);
        const totalHours = bookingHistory.reduce((sum, booking) => sum + (booking.duration || 0), 0) / 60;
        preferences.avgSpendingPerHour = totalHours > 0 ? totalSpent / totalHours : 0;

        // Price sensitivity analysis
        const prices = bookingHistory.map(b => b.pricing?.totalAmount || 0).filter(p => p > 0);
        if (prices.length > 0) {
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const maxPrice = Math.max(...prices);
            
            if (maxPrice / avgPrice > 1.5) {
                preferences.pricesensitivity = 'low';
            } else if (maxPrice / avgPrice < 1.2) {
                preferences.pricesensitivity = 'high';
            }
        }

        // Time slot preferences
        const timeSlots = bookingHistory.map(booking => {
            const hour = new Date(booking.startTime).getHours();
            return Math.floor(hour / 4); // 0: 0-3, 1: 4-7, etc.
        });
        
        const timeSlotCounts = timeSlots.reduce((acc, slot) => {
            acc[slot] = (acc[slot] || 0) + 1;
            return acc;
        }, {});
        
        preferences.preferredTimeSlots = Object.entries(timeSlotCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([slot]) => parseInt(slot));

        // Amenity preferences
        const allAmenities = bookingHistory
            .map(booking => booking.parkingLocationId?.amenities || [])
            .flat();
            
        const amenityCounts = allAmenities.reduce((acc, amenity) => {
            acc[amenity] = (acc[amenity] || 0) + 1;
            return acc;
        }, {});
        
        preferences.preferredAmenities = Object.entries(amenityCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([amenity]) => amenity);

        // Booking patterns
        const bookingTimes = bookingHistory.map(booking => {
            const bookingTime = new Date(booking.createdAt);
            const startTime = new Date(booking.startTime);
            return (startTime - bookingTime) / (1000 * 60 * 60); // hours in advance
        });

        const avgAdvanceTime = bookingTimes.reduce((a, b) => a + b, 0) / bookingTimes.length;
        
        if (avgAdvanceTime > 24) {
            preferences.bookingPatterns.advanceBooking = true;
        } else if (avgAdvanceTime < 2) {
            preferences.bookingPatterns.lastMinute = true;
        } else {
            preferences.bookingPatterns.regular = true;
        }

        const confidence = Math.min(0.95, bookingHistory.length * 0.05 + 0.1);
        
        return { preferences, confidence, historyCount: bookingHistory.length };
    }

    async findAvailableLocations(center, radius, maxPrice, duration) {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        // Find locations within radius
        const locations = await ParkingLocation.find({
            status: 'active',
            coordinates: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [center.lng, center.lat] },
                    $maxDistance: radius
                }
            }
        });

        const availableLocations = [];
        
        for (const location of locations) {
            // Check availability
            const activeBookings = await Booking.countDocuments({
                parkingLocationId: location._id,
                startTime: { $lte: endTime },
                endTime: { $gte: startTime },
                status: { $in: ['active', 'pending'] }
            });
            
            const availableSpaces = location.totalSpaces - activeBookings;
            
            if (availableSpaces > 0) {
                // Calculate distance
                const distance = this.calculateDistance(center, location.coordinates);
                
                // Estimate price
                const estimatedPrice = location.pricing.hourlyRate * (duration / 60);
                
                if (!maxPrice || estimatedPrice <= maxPrice) {
                    availableLocations.push({
                        ...location.toObject(),
                        availableSpaces,
                        distance,
                        estimatedPrice,
                        utilizationRate: activeBookings / location.totalSpaces
                    });
                }
            }
        }
        
        return availableLocations;
    }

    async scoreLocations(locations, userProfile, searchCriteria) {
        const scoredLocations = [];
        
        for (const location of locations) {
            const scores = {
                price: this.scorePriceCompatibility(location, userProfile, searchCriteria),
                distance: this.scoreDistancePreference(location, userProfile, searchCriteria),
                availability: this.scoreAvailability(location),
                rating: this.scoreRating(location),
                amenities: this.scoreAmenities(location, userProfile),
                historical: await this.scoreHistoricalPreference(location, userProfile)
            };
            
            // Calculate weighted total score
            const totalScore = 
                scores.price * this.userPreferenceWeights.price +
                scores.distance * this.userPreferenceWeights.distance +
                scores.availability * this.userPreferenceWeights.availability +
                scores.rating * this.userPreferenceWeights.rating +
                scores.amenities * this.userPreferenceWeights.amenities +
                scores.historical * 0.1;
            
            scoredLocations.push({
                ...location,
                scores,
                totalScore,
                recommendationReason: this.generateReason(scores, userProfile)
            });
        }
        
        return scoredLocations.sort((a, b) => b.totalScore - a.totalScore);
    }

    scorePriceCompatibility(location, userProfile, criteria) {
        const { preferences } = userProfile;
        const price = location.estimatedPrice;
        const avgUserSpending = preferences.avgSpendingPerHour * (criteria.duration / 60);
        
        if (preferences.pricesensitivity === 'high') {
            // High price sensitivity - prefer cheaper options
            return Math.max(0, 1 - (price / (avgUserSpending * 0.8)));
        } else if (preferences.pricesensitivity === 'low') {
            // Low price sensitivity - value-focused
            return price <= avgUserSpending * 1.5 ? 0.8 : 0.4;
        } else {
            // Medium sensitivity - balanced approach
            const ratio = price / avgUserSpending;
            if (ratio <= 0.8) return 1.0;
            if (ratio <= 1.2) return 0.8;
            return Math.max(0, 1.5 - ratio);
        }
    }

    scoreDistancePreference(location, userProfile, criteria) {
        const distance = location.distance;
        const maxDistance = criteria.radius || this.maxDistance;
        
        // Base distance score (closer is better)
        const baseScore = Math.max(0, 1 - (distance / maxDistance));
        
        const { preferences } = userProfile;
        if (preferences.distancePreference === 'close') {
            return baseScore * 1.2; // Boost close locations
        } else if (preferences.distancePreference === 'far_if_cheap') {
            // Balance distance with price savings
            const priceSaving = 1 - (location.estimatedPrice / (preferences.avgSpendingPerHour || 100));
            return baseScore * (0.8 + priceSaving * 0.4);
        }
        
        return baseScore;
    }

    scoreAvailability(location) {
        const utilizationRate = location.utilizationRate;
        
        // Prefer locations with good availability but not completely empty
        if (utilizationRate < 0.2) return 0.7; // Too empty might indicate issues
        if (utilizationRate < 0.6) return 1.0; // Good availability
        if (utilizationRate < 0.8) return 0.8; // Moderate availability
        return 0.5; // Limited availability
    }

    scoreRating(location) {
        if (!location.rating || location.rating < this.minRating) return 0.3;
        return Math.min(1.0, (location.rating - this.minRating) / (5.0 - this.minRating));
    }

    scoreAmenities(location, userProfile) {
        const { preferences } = userProfile;
        const locationAmenities = location.amenities || [];
        const userPreferredAmenities = preferences.preferredAmenities || [];
        
        if (userPreferredAmenities.length === 0) return 0.5;
        
        const matches = locationAmenities.filter(amenity => 
            userPreferredAmenities.includes(amenity)
        ).length;
        
        return Math.min(1.0, matches / userPreferredAmenities.length);
    }

    async scoreHistoricalPreference(location, userProfile) {
        if (userProfile.historyCount === 0) return 0.5;
        
        // Check if user has booked this location before
        const hasBookedBefore = await Booking.findOne({
            userId: userProfile.preferences.userId,
            parkingLocationId: location._id,
            status: { $in: ['completed', 'active'] }
        });
        
        if (hasBookedBefore) return 1.0;
        
        // Check similar locations
        const similarBookings = await Booking.find({
            userId: userProfile.preferences.userId,
            status: { $in: ['completed', 'active'] }
        }).populate('parkingLocationId');
        
        const similarityScore = this.calculateLocationSimilarity(location, similarBookings);
        return similarityScore;
    }

    async applyMLRecommendations(locations, userProfile, criteria) {
        // Simple collaborative filtering
        const enhancedLocations = [];
        
        for (const location of locations) {
            // Find similar users who booked this location
            const similarUsers = await this.findSimilarUsers(userProfile, location._id);
            
            let collaborativeScore = 0;
            if (similarUsers.length > 0) {
                const avgRating = similarUsers.reduce((sum, user) => sum + (user.rating || 4), 0) / similarUsers.length;
                collaborativeScore = (avgRating / 5) * 0.3; // 30% weight for collaborative filtering
            }
            
            // Content-based filtering
            const contentScore = this.calculateContentSimilarity(location, userProfile) * 0.2;
            
            // Time-based recommendations
            const timeScore = this.calculateTimeBasedScore(location, userProfile, criteria) * 0.1;
            
            const mlScore = collaborativeScore + contentScore + timeScore;
            
            enhancedLocations.push({
                ...location,
                mlScore,
                totalScore: location.totalScore + mlScore
            });
        }
        
        return enhancedLocations.sort((a, b) => b.totalScore - a.totalScore);
    }

    async addDynamicFactors(locations) {
        const currentHour = new Date().getHours();
        
        return locations.map(location => {
            let dynamicBoost = 0;
            
            // Real-time availability boost
            if (location.availableSpaces > location.totalSpaces * 0.5) {
                dynamicBoost += 0.1;
            }
            
            // Time-sensitive boost
            if (currentHour >= 17 && currentHour <= 19 && location.amenities.includes('office_area')) {
                dynamicBoost += 0.15; // Evening office area boost
            }
            
            // Weather factor (simplified)
            const isWeekend = new Date().getDay() % 6 === 0;
            if (isWeekend && location.amenities.includes('mall')) {
                dynamicBoost += 0.1; // Weekend mall boost
            }
            
            return {
                ...location,
                dynamicBoost,
                finalScore: location.totalScore + dynamicBoost,
                confidence: Math.min(0.95, location.totalScore)
            };
        }).sort((a, b) => b.finalScore - a.finalScore);
    }

    generateReason(scores, userProfile) {
        const reasons = [];
        
        if (scores.price > 0.8) reasons.push('Great price match');
        if (scores.distance > 0.8) reasons.push('Close to your location');
        if (scores.availability > 0.8) reasons.push('Good availability');
        if (scores.rating > 0.8) reasons.push('Highly rated');
        if (scores.amenities > 0.7) reasons.push('Has your preferred amenities');
        if (scores.historical > 0.8) reasons.push('Based on your history');
        
        return reasons.length > 0 ? reasons.join(' • ') : 'Recommended for you';
    }

    // Utility methods
    calculateDistance(point1, point2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI/180;
        const φ2 = point2.lat * Math.PI/180;
        const Δφ = (point2.lat-point1.lat) * Math.PI/180;
        const Δλ = (point2.lng-point1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    calculateLocationSimilarity(location, userBookings) {
        // Simple similarity based on amenities and location type
        const locationAmenities = location.amenities || [];
        const userAmenities = userBookings
            .map(booking => booking.parkingLocationId?.amenities || [])
            .flat();
        
        const commonAmenities = locationAmenities.filter(amenity => 
            userAmenities.includes(amenity)
        ).length;
        
        return Math.min(1.0, commonAmenities / Math.max(1, locationAmenities.length));
    }

    async findSimilarUsers(userProfile, locationId) {
        // Find users with similar booking patterns who used this location
        const locationBookings = await Booking.find({
            parkingLocationId: locationId,
            status: { $in: ['completed', 'active'] }
        }).populate('userId');
        
        // For simplicity, return users who booked similar price ranges
        const avgSpending = userProfile.preferences.avgSpendingPerHour;
        
        return locationBookings
            .filter(booking => {
                const bookingRate = booking.pricing?.totalAmount / (booking.duration / 60) || 0;
                return Math.abs(bookingRate - avgSpending) <= avgSpending * 0.3;
            })
            .map(booking => ({ userId: booking.userId, rating: 4 })); // Simplified rating
    }

    calculateContentSimilarity(location, userProfile) {
        const { preferences } = userProfile;
        let similarity = 0;
        
        // Price similarity
        const priceRatio = Math.abs(location.estimatedPrice - preferences.avgSpendingPerHour) / 
                          preferences.avgSpendingPerHour;
        similarity += Math.max(0, 1 - priceRatio) * 0.4;
        
        // Amenity similarity
        const amenityMatch = this.scoreAmenities(location, userProfile);
        similarity += amenityMatch * 0.6;
        
        return similarity;
    }

    calculateTimeBasedScore(location, userProfile, criteria) {
        const currentHour = Math.floor(new Date().getHours() / 4);
        const { preferences } = userProfile;
        
        if (preferences.preferredTimeSlots.includes(currentHour)) {
            return 1.0;
        }
        
        return 0.5;
    }
}

module.exports = new RecommendationService();