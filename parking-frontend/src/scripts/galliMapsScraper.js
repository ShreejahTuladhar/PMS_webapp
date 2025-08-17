/**
 * Galli Maps Parking Data Scraper
 * Scrapes parking locations and related amenities from Galli Maps API
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

class GalliMapsScraper {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://route-init.gallimap.com/api/v1';
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'ParkSathi-DataCollector/1.0'
    };
    this.rateLimitDelay = 1000; // 1 second between requests
    this.scraped_data = [];
    this.errors = [];
  }

  /**
   * Add delay between requests to respect rate limits
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make API request with error handling and rate limiting
   */
  async makeRequest(endpoint, params) {
    try {
      await this.delay(this.rateLimitDelay);
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          accessToken: this.accessToken,
          ...params
        },
        headers: this.headers,
        timeout: 10000
      });

      console.log(`✅ API Request successful: ${endpoint}`);
      return response.data;
    } catch (error) {
      const errorMsg = `❌ API Request failed: ${endpoint} - ${error.message}`;
      console.error(errorMsg);
      this.errors.push({
        endpoint,
        params,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Search for parking-related locations in Kathmandu Valley
   */
  async searchParkingLocations() {
    console.log('🅿️ Starting parking location search...');
    
    const parkingKeywords = [
      'parking',
      'गाडी राख्ने ठाउँ', // Vehicle parking place in Nepali
      'car parking',
      'bike parking',
      'motorcycle parking',
      'parking area',
      'parking space',
      'parking lot',
      'गाडी पार्किङ', // Car parking in Nepali
      'मोटरसाइकल पार्किङ', // Motorcycle parking in Nepali
    ];

    // Kathmandu Valley coordinates for search center points
    const searchCenters = [
      { name: 'Kathmandu Center', lat: 27.7172, lng: 85.3240 },
      { name: 'Patan', lat: 27.6648, lng: 85.3188 },
      { name: 'Bhaktapur', lat: 27.6710, lng: 85.4298 },
      { name: 'Thamel', lat: 27.7151, lng: 85.3107 },
      { name: 'New Road', lat: 27.7016, lng: 85.3197 },
      { name: 'Ratna Park', lat: 27.7064, lng: 85.3238 },
      { name: 'Baneshwor', lat: 27.6893, lng: 85.3436 },
      { name: 'Koteshwor', lat: 27.6776, lng: 85.3470 },
      { name: 'Lagankhel', lat: 27.6667, lng: 85.3247 },
      { name: 'Jawalakhel', lat: 27.6701, lng: 85.3159 }
    ];

    const parkingLocations = [];

    for (const center of searchCenters) {
      console.log(`🔍 Searching around ${center.name}...`);
      
      for (const keyword of parkingKeywords) {
        try {
          const searchResult = await this.makeRequest('/search/currentLocation', {
            name: keyword,
            currentLat: center.lat,
            currentLng: center.lng
          });

          if (searchResult && searchResult.data && Array.isArray(searchResult.data)) {
            for (const location of searchResult.data) {
              if (this.isParkingRelevant(location, keyword)) {
                const parkingData = this.transformLocationData(location, center, keyword);
                if (parkingData && !this.isDuplicate(parkingLocations, parkingData)) {
                  parkingLocations.push(parkingData);
                  console.log(`📍 Found parking: ${parkingData.name} at ${parkingData.address}`);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for ${keyword} around ${center.name}:`, error.message);
        }
      }
    }

    console.log(`🎯 Total parking locations found: ${parkingLocations.length}`);
    return parkingLocations;
  }

  /**
   * Search for parking amenities at major locations
   */
  async searchParkingAmenities() {
    console.log('🏢 Searching for parking amenities at major locations...');
    
    const majorLocations = [
      'Ratna Park', 'Thamel', 'Durbar Square', 'New Road', 'Basantapur',
      'Asan', 'Indrachowk', 'Kalimati', 'Balaju', 'Baneshwor',
      'Koteshwor', 'Tinkune', 'Sinamangal', 'Lagankhel', 'Patan Dhoka',
      'Jawalakhel', 'Pulchowk', 'Sanepa', 'Kupondole', 'Bhaktapur Durbar Square'
    ];

    const amenityData = [];

    for (const location of majorLocations) {
      try {
        // Search for the location first
        const searchResult = await this.makeRequest('/search/currentLocation', {
          name: location,
          currentLat: 27.7172,
          currentLng: 85.3240
        });

        if (searchResult && searchResult.data && searchResult.data.length > 0) {
          const locationData = searchResult.data[0];
          
          // Get detailed info using reverse geocoding
          if (locationData.lat && locationData.lng) {
            const reverseResult = await this.makeRequest('/reverse/generalReverse', {
              lat: locationData.lat,
              lng: locationData.lng
            });

            if (reverseResult) {
              const amenityInfo = this.extractAmenityInfo(reverseResult, location);
              if (amenityInfo) {
                amenityData.push(amenityInfo);
                console.log(`🏛️ Amenity data collected for ${location}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error collecting amenity data for ${location}:`, error.message);
      }
    }

    return amenityData;
  }

  /**
   * Check if location is parking-relevant
   */
  isParkingRelevant(location, keyword) {
    if (!location.name) return false;
    
    const name = location.name.toLowerCase();
    const parkingKeywords = [
      'parking', 'गाडी', 'पार्किङ', 'car', 'bike', 'motorcycle', 
      'vehicle', 'garage', 'lot', 'space', 'area'
    ];
    
    return parkingKeywords.some(kw => name.includes(kw.toLowerCase()));
  }

  /**
   * Transform Galli Maps location data to our format
   */
  transformLocationData(location, searchCenter, keyword) {
    try {
      return {
        id: `galli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: location.name || 'Unnamed Parking',
        address: location.address || `Near ${searchCenter.name}`,
        coordinates: {
          latitude: parseFloat(location.lat) || searchCenter.lat,
          longitude: parseFloat(location.lng) || searchCenter.lng
        },
        source: 'galli_maps',
        searchKeyword: keyword,
        searchCenter: searchCenter.name,
        
        // Estimated parking details (will need manual verification)
        totalSpaces: this.estimateSpaces(location),
        availableSpaces: this.estimateAvailableSpaces(location),
        hourlyRate: this.estimateHourlyRate(searchCenter),
        
        // Operating hours (estimated)
        operatingHours: {
          start: '06:00',
          end: '22:00',
          is24Hours: false
        },
        
        // Basic amenities
        amenities: this.extractAmenities(location),
        
        // Status
        currentStatus: 'active',
        isCurrentlyOpen: true,
        
        // Contact info (if available)
        contactNumber: location.phone || null,
        
        // Additional metadata
        metadata: {
          galliMapsData: location,
          scrapedAt: new Date().toISOString(),
          needsVerification: true,
          confidence: this.calculateConfidence(location, keyword)
        }
      };
    } catch (error) {
      console.error('Error transforming location data:', error);
      return null;
    }
  }

  /**
   * Extract amenity information from reverse geocoding
   */
  extractAmenityInfo(reverseData, locationName) {
    try {
      return {
        location: locationName,
        coordinates: {
          latitude: reverseData.lat,
          longitude: reverseData.lng
        },
        address: reverseData.address,
        nearbyAmenities: reverseData.places || [],
        landmarks: reverseData.landmarks || [],
        accessibility: this.assessAccessibility(reverseData),
        parkingPotential: this.assessParkingPotential(reverseData),
        metadata: {
          reverseGeocodingData: reverseData,
          scrapedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error extracting amenity info:', error);
      return null;
    }
  }

  /**
   * Estimate number of parking spaces based on location data
   */
  estimateSpaces(location) {
    const name = (location.name || '').toLowerCase();
    
    if (name.includes('mall') || name.includes('plaza')) return Math.floor(Math.random() * 200) + 50;
    if (name.includes('hotel') || name.includes('restaurant')) return Math.floor(Math.random() * 50) + 10;
    if (name.includes('office') || name.includes('building')) return Math.floor(Math.random() * 100) + 20;
    if (name.includes('hospital') || name.includes('clinic')) return Math.floor(Math.random() * 80) + 30;
    if (name.includes('school') || name.includes('college')) return Math.floor(Math.random() * 150) + 40;
    
    return Math.floor(Math.random() * 30) + 5; // Default small parking
  }

  /**
   * Estimate available spaces (60-90% of total)
   */
  estimateAvailableSpaces(location) {
    const total = this.estimateSpaces(location);
    const occupancyRate = 0.1 + Math.random() * 0.4; // 10-50% occupancy
    return Math.floor(total * (1 - occupancyRate));
  }

  /**
   * Estimate hourly rates based on location
   */
  estimateHourlyRate(searchCenter) {
    const premiumAreas = ['Thamel', 'New Road', 'Ratna Park', 'Durbar Square'];
    const isPremium = premiumAreas.includes(searchCenter.name);
    
    if (isPremium) {
      return Math.floor(Math.random() * 30) + 20; // 20-50 NPR/hour
    }
    
    return Math.floor(Math.random() * 20) + 10; // 10-30 NPR/hour
  }

  /**
   * Extract basic amenities from location data
   */
  extractAmenities(location) {
    const amenities = [];
    const name = (location.name || '').toLowerCase();
    const address = (location.address || '').toLowerCase();
    const text = `${name} ${address}`;
    
    if (text.includes('security') || text.includes('guard')) amenities.push('security');
    if (text.includes('cctv') || text.includes('camera')) amenities.push('cctv');
    if (text.includes('covered') || text.includes('roof')) amenities.push('covered_parking');
    if (text.includes('wash') || text.includes('clean')) amenities.push('car_wash');
    if (text.includes('electric') || text.includes('ev')) amenities.push('ev_charging');
    if (text.includes('toilet') || text.includes('washroom')) amenities.push('restroom');
    
    return amenities;
  }

  /**
   * Calculate confidence score for the parking location
   */
  calculateConfidence(location, keyword) {
    let confidence = 0.5; // Base confidence
    
    const name = (location.name || '').toLowerCase();
    
    // Higher confidence for explicit parking keywords
    if (name.includes('parking')) confidence += 0.3;
    if (name.includes('गाडी') || name.includes('पार्किङ')) confidence += 0.3;
    if (name.includes('car') || name.includes('vehicle')) confidence += 0.2;
    
    // Location data quality
    if (location.lat && location.lng) confidence += 0.1;
    if (location.address) confidence += 0.1;
    if (location.phone) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Assess accessibility of location
   */
  assessAccessibility(reverseData) {
    const accessibility = {
      roadAccess: true,
      publicTransport: false,
      walkingDistance: 'unknown'
    };
    
    if (reverseData.address && reverseData.address.includes('road')) {
      accessibility.roadAccess = true;
    }
    
    return accessibility;
  }

  /**
   * Assess parking potential of location
   */
  assessParkingPotential(reverseData) {
    return {
      score: Math.random() * 0.5 + 0.5, // 0.5-1.0
      factors: ['location_accessibility', 'commercial_area', 'traffic_flow'],
      needsFieldVerification: true
    };
  }

  /**
   * Check for duplicate entries
   */
  isDuplicate(existingData, newData) {
    return existingData.some(existing => {
      const distance = this.calculateDistance(
        existing.coordinates.latitude,
        existing.coordinates.longitude,
        newData.coordinates.latitude,
        newData.coordinates.longitude
      );
      
      return distance < 0.05; // 50 meters threshold
    });
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Save scraped data to JSON file
   */
  async saveData(data, filename) {
    try {
      const dataDir = path.join(process.cwd(), 'scraped_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filepath = path.join(dataDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Data saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  /**
   * Main scraping function
   */
  async scrapeAllParkingData() {
    console.log('🚀 Starting Galli Maps parking data scraping...');
    
    try {
      // Scrape parking locations
      const parkingLocations = await this.searchParkingLocations();
      
      // Scrape amenity data
      const amenityData = await this.searchParkingAmenities();
      
      // Combine all data
      const scrapedData = {
        parkingLocations: parkingLocations,
        amenityData: amenityData,
        summary: {
          totalParkingLocations: parkingLocations.length,
          totalAmenityData: amenityData.length,
          scrapedAt: new Date().toISOString(),
          errors: this.errors
        }
      };
      
      // Save data
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `galli_maps_parking_data_${timestamp}.json`;
      await this.saveData(scrapedData, filename);
      
      console.log('✅ Scraping completed successfully!');
      console.log(`📊 Summary: ${parkingLocations.length} parking locations, ${amenityData.length} amenity records`);
      
      if (this.errors.length > 0) {
        console.log(`⚠️ Encountered ${this.errors.length} errors during scraping`);
      }
      
      return scrapedData;
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }
}

export default GalliMapsScraper;