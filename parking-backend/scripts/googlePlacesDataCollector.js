/**
 * Legal Google Places API Data Collector for ParkSathi
 * Uses official Google Places API (Requires API Key & Billing)
 */

const axios = require('axios');
const fs = require('fs').promises;
const ParkingLocation = require('../models/ParkingLocation');
require('dotenv').config();

class GooglePlacesDataCollector {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.placesApiBase = 'https://maps.googleapis.com/maps/api/place';
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key not found. Add GOOGLE_PLACES_API_KEY to .env file');
    }
    
    // Kathmandu Valley search areas
    this.searchAreas = [
      { name: 'Kathmandu Central', lat: 27.7172, lng: 85.3240, radius: 5000 },
      { name: 'Patan', lat: 27.6648, lng: 85.3188, radius: 3000 },
      { name: 'Bhaktapur', lat: 27.6710, lng: 85.4298, radius: 3000 },
      { name: 'Tribhuvan Airport', lat: 27.6966, lng: 85.3591, radius: 2000 }
    ];
    
    // Parking-related place types
    this.placeTypes = [
      'parking',
      'hospital',
      'shopping_mall', 
      'tourist_attraction',
      'university',
      'school',
      'government',
      'airport'
    ];
  }

  /**
   * Search for parking-related places using Google Places API
   */
  async searchParkingPlaces(area, placeType) {
    if (!this.apiKey) {
      throw new Error('Google Places API key is required');
    }

    try {
      console.log(`🔍 Searching for ${placeType} places in ${area.name}...`);
      
      const response = await axios.get(`${this.placesApiBase}/nearbysearch/json`, {
        params: {
          location: `${area.lat},${area.lng}`,
          radius: area.radius,
          type: placeType,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        console.warn(`⚠️ Places API warning: ${response.data.status}`);
        return [];
      }

      const places = response.data.results || [];
      console.log(`📍 Found ${places.length} ${placeType} places in ${area.name}`);
      
      return places.map(place => ({
        ...place,
        searchArea: area.name,
        searchType: placeType
      }));

    } catch (error) {
      console.error(`❌ Error searching ${placeType} in ${area.name}:`, error.message);
      return [];
    }
  }

  /**
   * Get detailed place information
   */
  async getPlaceDetails(placeId) {
    if (!this.apiKey) return null;

    try {
      const response = await axios.get(`${this.placesApiBase}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,formatted_phone_number,opening_hours,website,price_level,rating,user_ratings_total,types,photos',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.warn(`⚠️ Error getting details for place ${placeId}:`, error.message);
      return null;
    }
  }

  /**
   * Convert Google Places data to ParkSathi format
   */
  convertToParksathiFormat(place, details = null) {
    const placeData = details || place;
    
    // Determine location type
    const types = placeData.types || [];
    const locationType = this.determineLocationType(types);
    
    // Generate parking data based on place type and rating
    const parkingData = this.generateParkingDataFromPlace(placeData, locationType);
    
    // Extract coordinates
    const location = placeData.geometry?.location;
    if (!location) {
      return null;
    }

    // Generate name
    const name = this.generateParkingName(placeData.name, locationType);
    
    return {
      name: name,
      address: placeData.formatted_address || placeData.vicinity || 'Address not available',
      coordinates: {
        latitude: location.lat,
        longitude: location.lng
      },
      totalSpaces: parkingData.totalSpaces,
      availableSpaces: Math.floor(parkingData.totalSpaces * (0.4 + Math.random() * 0.6)), // 40-100% availability
      hourlyRate: parkingData.hourlyRate,
      amenities: parkingData.amenities,
      operatingHours: this.parseOperatingHours(placeData.opening_hours),
      isActive: true,
      currentStatus: 'open',
      contactNumber: placeData.formatted_phone_number || this.generateContactNumber(),
      description: `Parking facility at ${placeData.name}`,
      images: this.extractPhotos(placeData.photos),
      rating: placeData.rating || 4.0 + Math.random() * 1.0, // 4.0-5.0 rating
      // Google Places metadata
      googlePlaceId: placeData.place_id,
      googleTypes: types,
      googleRating: placeData.rating,
      googleReviews: placeData.user_ratings_total,
      website: placeData.website,
      priceLevel: placeData.price_level,
      dataSource: 'Google Places API',
      lastUpdated: new Date(),
      verified: true // Google data is generally reliable
    };
  }

  /**
   * Determine location type from Google place types
   */
  determineLocationType(types) {
    const typeMapping = {
      'hospital': 'Hospital',
      'shopping_mall': 'Shopping Mall',
      'tourist_attraction': 'Tourist Attraction',
      'university': 'University',
      'school': 'School',
      'government': 'Government Office',
      'airport': 'Airport',
      'parking': 'Parking Facility',
      'establishment': 'Commercial',
      'point_of_interest': 'Point of Interest'
    };

    for (const type of types) {
      if (typeMapping[type]) {
        return typeMapping[type];
      }
    }

    return 'General';
  }

  /**
   * Generate realistic parking data based on Google place information
   */
  generateParkingDataFromPlace(place, locationType) {
    // Base data on place rating and type
    const rating = place.rating || 4.0;
    const reviewCount = place.user_ratings_total || 0;
    const priceLevel = place.price_level || 2;
    
    // Higher rated places typically have better parking facilities
    const qualityMultiplier = (rating / 5.0);
    
    const typeConfigs = {
      'Hospital': {
        baseSpaces: 100,
        baseRate: 20,
        amenities: ['security', 'lighting', 'cctv', 'disabled_access', '24_hour']
      },
      'Shopping Mall': {
        baseSpaces: 200,
        baseRate: 15,
        amenities: ['security', 'lighting', 'cctv', 'covered_parking', 'ev_charging']
      },
      'Tourist Attraction': {
        baseSpaces: 80,
        baseRate: 25,
        amenities: ['security', 'lighting', 'cctv', 'restroom']
      },
      'University': {
        baseSpaces: 150,
        baseRate: 12,
        amenities: ['security', 'lighting', 'bike_parking']
      },
      'School': {
        baseSpaces: 60,
        baseRate: 10,
        amenities: ['security', 'lighting']
      },
      'Government Office': {
        baseSpaces: 80,
        baseRate: 15,
        amenities: ['security', 'lighting', 'cctv', 'disabled_access']
      },
      'Airport': {
        baseSpaces: 500,
        baseRate: 30,
        amenities: ['security', 'lighting', 'cctv', 'covered_parking', '24_hour']
      },
      'Parking Facility': {
        baseSpaces: 100,
        baseRate: 18,
        amenities: ['security', 'lighting', 'cctv']
      },
      'General': {
        baseSpaces: 50,
        baseRate: 15,
        amenities: ['lighting']
      }
    };

    const config = typeConfigs[locationType] || typeConfigs['General'];
    
    return {
      totalSpaces: Math.floor(config.baseSpaces * (0.5 + qualityMultiplier * 0.5)),
      hourlyRate: Math.floor(config.baseRate * (1 + (priceLevel - 2) * 0.3)),
      amenities: config.amenities.slice(0, 3 + Math.floor(qualityMultiplier * 3))
    };
  }

  /**
   * Generate parking facility name
   */
  generateParkingName(placeName, locationType) {
    if (locationType === 'Parking Facility') {
      return placeName;
    }
    
    return `${placeName} Parking`;
  }

  /**
   * Parse Google Places opening hours
   */
  parseOperatingHours(openingHours) {
    if (!openingHours || !openingHours.periods) {
      return { start: '08:00', end: '20:00' }; // Default hours
    }

    try {
      // Find today's hours (simplified)
      const todayPeriod = openingHours.periods[0];
      if (todayPeriod) {
        const open = todayPeriod.open;
        const close = todayPeriod.close;
        
        return {
          start: this.formatTime(open?.time || '0800'),
          end: this.formatTime(close?.time || '2000')
        };
      }
    } catch (error) {
      console.warn('Error parsing operating hours:', error);
    }

    return { start: '08:00', end: '20:00' };
  }

  /**
   * Format time from Google format (e.g., "1400") to "14:00"
   */
  formatTime(timeStr) {
    if (!timeStr || timeStr.length !== 4) return '08:00';
    
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    
    return `${hours}:${minutes}`;
  }

  /**
   * Extract photo references (for future use)
   */
  extractPhotos(photos) {
    if (!photos || !Array.isArray(photos)) {
      return ['/images/default-parking.jpg'];
    }

    // Return photo references (would need separate API call to get actual images)
    return photos.slice(0, 3).map(photo => photo.photo_reference);
  }

  /**
   * Generate realistic contact number
   */
  generateContactNumber() {
    const prefixes = ['01-', '985-', '986-', '984-'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}${number.toString().substring(0, 7)}`;
  }

  /**
   * Main collection process using Google Places API
   */
  async collectFromGooglePlaces() {
    if (!this.apiKey) {
      throw new Error('Google Places API key is required. Add GOOGLE_PLACES_API_KEY to your .env file');
    }

    console.log('🌏 Collecting parking data from Google Places API...');
    console.log('💰 Note: This uses paid Google Places API calls');
    
    const allLocations = [];
    let totalApiCalls = 0;
    
    // Search each area for each place type
    for (const area of this.searchAreas) {
      for (const placeType of this.placeTypes) {
        try {
          const places = await this.searchParkingPlaces(area, placeType);
          totalApiCalls++;
          
          // Add delay to respect rate limits
          await this.delay(100);
          
          // Process each place
          for (const place of places) {
            try {
              // Get detailed information (optional, uses additional API call)
              let details = null;
              if (place.place_id) {
                details = await this.getPlaceDetails(place.place_id);
                totalApiCalls++;
                await this.delay(100);
              }
              
              // Convert to ParkSathi format
              const parkingLocation = this.convertToParksathiFormat(place, details);
              
              if (parkingLocation) {
                // Check for duplicates
                const isDuplicate = allLocations.some(existing => 
                  existing.googlePlaceId === parkingLocation.googlePlaceId ||
                  (Math.abs(existing.coordinates.latitude - parkingLocation.coordinates.latitude) < 0.0001 &&
                   Math.abs(existing.coordinates.longitude - parkingLocation.coordinates.longitude) < 0.0001)
                );
                
                if (!isDuplicate) {
                  allLocations.push(parkingLocation);
                }
              }
              
            } catch (error) {
              console.warn(`⚠️ Error processing place: ${error.message}`);
            }
          }
          
        } catch (error) {
          console.error(`❌ Error searching ${placeType} in ${area.name}:`, error.message);
        }
      }
    }

    console.log(`✅ Google Places collection completed:`);
    console.log(`   • Total API calls: ${totalApiCalls}`);
    console.log(`   • Locations found: ${allLocations.length}`);
    console.log(`   • Estimated cost: $${(totalApiCalls * 0.017).toFixed(2)} USD`);
    
    return allLocations;
  }

  /**
   * Delay helper for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Save to database (same as OSM collector)
   */
  async saveToDatabase(locations) {
    console.log(`💾 Saving ${locations.length} Google Places locations to database...`);
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const locationData of locations) {
      try {
        const existing = await ParkingLocation.findOne({
          $or: [
            { googlePlaceId: locationData.googlePlaceId },
            {
              'coordinates.latitude': { $gte: locationData.coordinates.latitude - 0.0001, $lte: locationData.coordinates.latitude + 0.0001 },
              'coordinates.longitude': { $gte: locationData.coordinates.longitude - 0.0001, $lte: locationData.coordinates.longitude + 0.0001 }
            }
          ]
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        const newLocation = new ParkingLocation(locationData);
        await newLocation.save();
        savedCount++;

      } catch (error) {
        console.error(`❌ Error saving ${locationData.name}:`, error.message);
      }
    }

    console.log(`📊 Google Places data saved: ${savedCount} saved, ${skippedCount} skipped`);
    return { savedCount, skippedCount };
  }

  /**
   * Export data to file
   */
  async exportToFile(locations, filename = 'google_places_parking_data.json') {
    const exportData = {
      metadata: {
        collectedAt: new Date().toISOString(),
        source: 'Google Places API',
        totalLocations: locations.length,
        searchAreas: this.searchAreas.map(area => area.name),
        dataCollector: 'ParkSathi Google Places Collector v1.0'
      },
      locations: locations
    };

    await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
    console.log(`📄 Google Places data exported to ${filename}`);
  }
}

// Export class
module.exports = GooglePlacesDataCollector;

// Main execution function
async function main() {
  try {
    console.log('🌏 ParkSathi Google Places Data Collection');
    console.log('=========================================');
    
    const collector = new GooglePlacesDataCollector();
    const locations = await collector.collectFromGooglePlaces();
    
    if (locations.length > 0) {
      await collector.exportToFile(locations);
      const dbResult = await collector.saveToDatabase(locations);
      
      console.log('🎉 Google Places data collection completed!');
      console.log(`📊 Final Stats:`);
      console.log(`   • Locations Found: ${locations.length}`);
      console.log(`   • Database Saved: ${dbResult.savedCount}`);
      console.log(`   • Duplicates Skipped: ${dbResult.skippedCount}`);
    }
    
  } catch (error) {
    console.error('💥 Google Places collection failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}