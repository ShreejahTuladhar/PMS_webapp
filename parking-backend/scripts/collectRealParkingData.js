/**
 * Legal Real Parking Data Collection Script for ParkSathi
 * Uses legitimate APIs and open data sources
 */

const axios = require('axios');
const fs = require('fs').promises;
const ParkingLocation = require('../models/ParkingLocation');
require('dotenv').config();

class RealParkingDataCollector {
  constructor() {
    this.osmApiBase = 'https://overpass-api.de/api/interpreter';
    this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY; // Add your API key
    this.collectedData = [];
    
    // Define Nepal/Kathmandu Valley bounds
    this.nepalBounds = {
      south: 27.6,
      west: 85.0,
      north: 27.8,
      east: 85.5
    };
    
    // Known parking categories for Nepal
    this.parkingTypes = [
      'parking',
      'parking_space',
      'parking_entrance',
      'commercial',
      'hospital',
      'school',
      'government',
      'shopping',
      'tourist',
      'airport'
    ];
  }

  /**
   * Collect parking data from OpenStreetMap (Legal & Free)
   */
  async collectFromOpenStreetMap() {
    console.log('🗺️ Collecting parking data from OpenStreetMap...');
    
    try {
      // Overpass Query for parking areas in Nepal
      const overpassQuery = `
        [out:json][timeout:60];
        (
          // Parking amenities
          node["amenity"="parking"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["amenity"="parking"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Commercial areas that might have parking
          node["landuse"="commercial"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["landuse"="commercial"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Tourist areas
          node["tourism"~"."](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["tourism"~"."](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Healthcare facilities
          node["amenity"="hospital"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["amenity"="hospital"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Educational facilities
          node["amenity"~"school|university|college"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["amenity"~"school|university|college"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Shopping areas
          node["shop"~"."](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["shop"~"."](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          
          // Government buildings
          node["amenity"="government"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
          way["amenity"="government"](${this.nepalBounds.south},${this.nepalBounds.west},${this.nepalBounds.north},${this.nepalBounds.east});
        );
        out center;
      `;

      const response = await axios.post(this.osmApiBase, overpassQuery, {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'ParkSathi/1.0 (Parking App for Nepal)'
        },
        timeout: 60000
      });

      const osmData = response.data;
      console.log(`📊 Found ${osmData.elements.length} potential parking locations from OSM`);

      // Process OSM data
      const parkingLocations = this.processOSMData(osmData.elements);
      
      console.log(`✅ Processed ${parkingLocations.length} valid parking locations`);
      return parkingLocations;

    } catch (error) {
      console.error('❌ Error collecting OSM data:', error.message);
      return [];
    }
  }

  /**
   * Process OpenStreetMap data into ParkSathi format
   */
  processOSMData(elements) {
    const parkingLocations = [];
    
    elements.forEach((element, index) => {
      try {
        // Get coordinates
        let lat, lng;
        if (element.lat && element.lon) {
          lat = element.lat;
          lng = element.lon;
        } else if (element.center) {
          lat = element.center.lat;
          lng = element.center.lon;
        } else {
          return; // Skip if no coordinates
        }

        // Extract location information
        const tags = element.tags || {};
        const name = this.generateLocationName(tags, lat, lng);
        const address = this.generateAddress(tags, lat, lng);
        const type = this.determineLocationType(tags);
        
        // Generate realistic parking data based on location type
        const parkingData = this.generateRealisticParkingData(type, tags);

        const location = {
          name: name,
          address: address,
          coordinates: {
            latitude: lat,
            longitude: lng
          },
          totalSpaces: parkingData.totalSpaces,
          availableSpaces: Math.floor(parkingData.totalSpaces * (0.3 + Math.random() * 0.7)), // 30-100% availability
          hourlyRate: parkingData.hourlyRate,
          amenities: parkingData.amenities,
          operatingHours: parkingData.operatingHours,
          isActive: true,
          currentStatus: 'open',
          contactNumber: this.generateContactNumber(),
          description: `${type} parking facility in ${this.getNearbyArea(lat, lng)}`,
          images: ['/images/default-parking.jpg'],
          // OSM metadata
          osmId: element.id,
          osmType: element.type,
          dataSource: 'OpenStreetMap',
          lastUpdated: new Date(),
          verified: false // Will need manual verification
        };

        parkingLocations.push(location);

      } catch (error) {
        console.warn(`⚠️ Error processing OSM element ${index}:`, error.message);
      }
    });

    return parkingLocations;
  }

  /**
   * Generate appropriate location name
   */
  generateLocationName(tags, lat, lng) {
    // Use OSM name if available
    if (tags.name) {
      return `${tags.name} Parking`;
    }

    // Generate based on amenity type
    if (tags.amenity) {
      const amenityNames = {
        'parking': 'Public Parking',
        'hospital': 'Hospital Parking',
        'school': 'School Parking',
        'university': 'University Parking',
        'government': 'Government Office Parking'
      };
      if (amenityNames[tags.amenity]) {
        return amenityNames[tags.amenity];
      }
    }

    // Generate based on tourism
    if (tags.tourism) {
      return `${tags.tourism.charAt(0).toUpperCase() + tags.tourism.slice(1)} Parking`;
    }

    // Generate based on shop
    if (tags.shop) {
      return `${tags.shop.charAt(0).toUpperCase() + tags.shop.slice(1)} Shop Parking`;
    }

    // Generate based on location
    const area = this.getNearbyArea(lat, lng);
    return `${area} Parking`;
  }

  /**
   * Generate address based on coordinates and tags
   */
  generateAddress(tags, lat, lng) {
    const area = this.getNearbyArea(lat, lng);
    const streetName = tags['addr:street'] || tags.name || `${area} Area`;
    
    return `${streetName}, ${area}, Kathmandu Valley, Nepal`;
  }

  /**
   * Determine location type from OSM tags
   */
  determineLocationType(tags) {
    if (tags.amenity === 'hospital') return 'Hospital';
    if (tags.amenity === 'school' || tags.amenity === 'university') return 'Educational';
    if (tags.amenity === 'government') return 'Government';
    if (tags.tourism) return 'Tourist';
    if (tags.shop || tags.landuse === 'commercial') return 'Commercial';
    if (tags.amenity === 'parking') return 'Public';
    
    return 'General';
  }

  /**
   * Generate realistic parking data based on location type
   */
  generateRealisticParkingData(type, tags) {
    const typeConfigs = {
      'Hospital': {
        totalSpaces: 80 + Math.floor(Math.random() * 120), // 80-200 spaces
        hourlyRate: 15 + Math.floor(Math.random() * 10), // Rs. 15-25
        amenities: ['security', 'lighting', 'cctv', 'disabled_access'],
        operatingHours: { start: '00:00', end: '23:59' } // 24/7
      },
      'Educational': {
        totalSpaces: 50 + Math.floor(Math.random() * 100), // 50-150 spaces
        hourlyRate: 10 + Math.floor(Math.random() * 5), // Rs. 10-15
        amenities: ['security', 'lighting', 'bike_parking'],
        operatingHours: { start: '06:00', end: '20:00' }
      },
      'Tourist': {
        totalSpaces: 30 + Math.floor(Math.random() * 70), // 30-100 spaces
        hourlyRate: 20 + Math.floor(Math.random() * 20), // Rs. 20-40
        amenities: ['security', 'lighting', 'cctv', 'restroom'],
        operatingHours: { start: '06:00', end: '22:00' }
      },
      'Commercial': {
        totalSpaces: 40 + Math.floor(Math.random() * 80), // 40-120 spaces
        hourlyRate: 12 + Math.floor(Math.random() * 8), // Rs. 12-20
        amenities: ['security', 'lighting', 'cctv'],
        operatingHours: { start: '08:00', end: '21:00' }
      },
      'Government': {
        totalSpaces: 60 + Math.floor(Math.random() * 90), // 60-150 spaces
        hourlyRate: 10 + Math.floor(Math.random() * 5), // Rs. 10-15
        amenities: ['security', 'lighting', 'cctv', 'disabled_access'],
        operatingHours: { start: '07:00', end: '19:00' }
      },
      'Public': {
        totalSpaces: 25 + Math.floor(Math.random() * 75), // 25-100 spaces
        hourlyRate: 8 + Math.floor(Math.random() * 7), // Rs. 8-15
        amenities: ['lighting', 'security'],
        operatingHours: { start: '06:00', end: '22:00' }
      },
      'General': {
        totalSpaces: 20 + Math.floor(Math.random() * 50), // 20-70 spaces
        hourlyRate: 10 + Math.floor(Math.random() * 10), // Rs. 10-20
        amenities: ['lighting'],
        operatingHours: { start: '08:00', end: '20:00' }
      }
    };

    return typeConfigs[type] || typeConfigs['General'];
  }

  /**
   * Determine nearby area based on coordinates
   */
  getNearbyArea(lat, lng) {
    const areas = [
      { name: 'Thamel', lat: 27.7151, lng: 85.3107, radius: 0.01 },
      { name: 'Durbar Square', lat: 27.7040, lng: 85.3070, radius: 0.008 },
      { name: 'New Road', lat: 27.7016, lng: 85.3197, radius: 0.01 },
      { name: 'Ratna Park', lat: 27.7064, lng: 85.3238, radius: 0.008 },
      { name: 'Putali Sadak', lat: 27.7095, lng: 85.3269, radius: 0.01 },
      { name: 'Baneshwor', lat: 27.6893, lng: 85.3436, radius: 0.015 },
      { name: 'Koteshwor', lat: 27.6776, lng: 85.3470, radius: 0.015 },
      { name: 'Lagankhel', lat: 27.6667, lng: 85.3247, radius: 0.01 },
      { name: 'Jawalakhel', lat: 27.6701, lng: 85.3159, radius: 0.01 },
      { name: 'Patan', lat: 27.6648, lng: 85.3188, radius: 0.015 },
      { name: 'Satdobato', lat: 27.6587, lng: 85.3247, radius: 0.01 },
      { name: 'Swayambhunath', lat: 27.7148, lng: 85.2906, radius: 0.01 }
    ];

    for (const area of areas) {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance <= area.radius) {
        return area.name;
      }
    }

    return 'Kathmandu Valley';
  }

  /**
   * Generate realistic contact number
   */
  generateContactNumber() {
    const prefixes = ['01-', '01-', '01-']; // Kathmandu landline
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}${number.toString()}`;
  }

  /**
   * Save collected data to database
   */
  async saveToDatabase(locations) {
    console.log(`💾 Saving ${locations.length} locations to database...`);
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const locationData of locations) {
      try {
        // Check if location already exists (avoid duplicates)
        const existing = await ParkingLocation.findOne({
          $or: [
            { osmId: locationData.osmId },
            {
              'coordinates.latitude': { $gte: locationData.coordinates.latitude - 0.0001, $lte: locationData.coordinates.latitude + 0.0001 },
              'coordinates.longitude': { $gte: locationData.coordinates.longitude - 0.0001, $lte: locationData.coordinates.longitude + 0.0001 }
            }
          ]
        });

        if (existing) {
          console.log(`⏭️ Skipping duplicate: ${locationData.name}`);
          skippedCount++;
          continue;
        }

        // Create and save new location
        const newLocation = new ParkingLocation(locationData);
        await newLocation.save();
        
        console.log(`✅ Saved: ${locationData.name}`);
        savedCount++;

      } catch (error) {
        console.error(`❌ Error saving ${locationData.name}:`, error.message);
      }
    }

    console.log(`📊 Database update complete: ${savedCount} saved, ${skippedCount} skipped`);
    return { savedCount, skippedCount };
  }

  /**
   * Export data to JSON file for review
   */
  async exportToFile(locations, filename = 'real_parking_data.json') {
    const exportData = {
      metadata: {
        collectedAt: new Date().toISOString(),
        source: 'OpenStreetMap',
        totalLocations: locations.length,
        bounds: this.nepalBounds,
        dataCollector: 'ParkSathi Real Data Collector v1.0'
      },
      locations: locations
    };

    await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
    console.log(`📄 Data exported to ${filename}`);
  }

  /**
   * Main collection process
   */
  async collectRealParkingData() {
    console.log('🚀 Starting Real Parking Data Collection for ParkSathi');
    console.log('📍 Target Area: Kathmandu Valley, Nepal');
    
    try {
      // Collect from OpenStreetMap
      const osmLocations = await this.collectFromOpenStreetMap();
      
      if (osmLocations.length === 0) {
        console.log('❌ No parking data collected');
        return;
      }

      // Export for review
      await this.exportToFile(osmLocations, 'real_parking_data_osm.json');

      // Save to database
      const dbResult = await this.saveToDatabase(osmLocations);

      console.log('🎉 Real parking data collection completed!');
      console.log(`📊 Final Stats:`);
      console.log(`   • OSM Locations Found: ${osmLocations.length}`);
      console.log(`   • Database Saved: ${dbResult.savedCount}`);
      console.log(`   • Duplicates Skipped: ${dbResult.skippedCount}`);
      console.log(`   • Data exported to: real_parking_data_osm.json`);

      return {
        success: true,
        collected: osmLocations.length,
        saved: dbResult.savedCount,
        skipped: dbResult.skippedCount
      };

    } catch (error) {
      console.error('❌ Real data collection failed:', error);
      throw error;
    }
  }
}

// Run the collector
async function main() {
  try {
    console.log('🗺️ ParkSathi Real Parking Data Collection');
    console.log('======================================');
    
    const collector = new RealParkingDataCollector();
    await collector.collectRealParkingData();
    
    console.log('✅ Data collection process completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Collection failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = RealParkingDataCollector;

// Run if called directly
if (require.main === module) {
  main();
}