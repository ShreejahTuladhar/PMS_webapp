#!/usr/bin/env node

/**
 * Sample Parking Data Generator
 * Creates realistic sample parking data for testing while API access is being configured
 */

import fs from 'fs';
import path from 'path';

class SampleDataGenerator {
  constructor() {
    this.kathmanduLocations = [
      { name: 'Thamel Tourist Hub', lat: 27.7151, lng: 85.3107, type: 'tourist_area' },
      { name: 'New Road Shopping Center', lat: 27.7016, lng: 85.3197, type: 'commercial' },
      { name: 'Ratna Park Area', lat: 27.7064, lng: 85.3238, type: 'public' },
      { name: 'Durbar Square Heritage Site', lat: 27.7040, lng: 85.3070, type: 'heritage' },
      { name: 'Baneshwor Business District', lat: 27.6893, lng: 85.3436, type: 'business' },
      { name: 'Koteshwor Commercial Hub', lat: 27.6776, lng: 85.3470, type: 'commercial' },
      { name: 'Patan Durbar Square', lat: 27.6648, lng: 85.3188, type: 'heritage' },
      { name: 'Jawalakhel Market Area', lat: 27.6701, lng: 85.3159, type: 'market' },
      { name: 'Lagankhel Transport Hub', lat: 27.6667, lng: 85.3247, type: 'transport' },
      { name: 'Bhaktapur Durbar Square', lat: 27.6710, lng: 85.4298, type: 'heritage' },
      { name: 'Pulchowk Engineering Campus', lat: 27.6800, lng: 85.3150, type: 'educational' },
      { name: 'Sanepa Shopping Complex', lat: 27.6830, lng: 85.3100, type: 'commercial' },
      { name: 'Kupondole Heights', lat: 27.6890, lng: 85.3080, type: 'residential' },
      { name: 'Sinamangal Airport Area', lat: 27.6966, lng: 85.3591, type: 'transport' },
      { name: 'Tinkune Junction', lat: 27.6889, lng: 85.3508, type: 'junction' },
      { name: 'Kalimati Vegetable Market', lat: 27.6950, lng: 85.2900, type: 'market' },
      { name: 'Balaju Industrial Area', lat: 27.7300, lng: 85.3000, type: 'industrial' },
      { name: 'Maharajgunj Medical Campus', lat: 27.7400, lng: 85.3300, type: 'medical' },
      { name: 'Putalisadak Government Area', lat: 27.7095, lng: 85.3269, type: 'government' },
      { name: 'Anamnagar Residential', lat: 27.6950, lng: 85.3200, type: 'residential' }
    ];

    this.parkingTypes = [
      'Open Air Parking',
      'Covered Parking',
      'Multi-level Parking',
      'Street Side Parking',
      'Building Parking',
      'Mall Parking',
      'Hotel Parking',
      'Office Parking',
      'Market Parking',
      'Heritage Site Parking'
    ];

    this.amenities = [
      'security', 'cctv', 'covered_parking', 'car_wash', 'ev_charging',
      'restroom', 'lighting', 'disabled_access', 'bicycle_parking',
      'valet_parking', 'online_booking', 'mobile_payment'
    ];
  }

  /**
   * Generate realistic parking location name
   */
  generateParkingName(baseLocation, type) {
    const prefixes = ['ParkSathi', 'Safe Park', 'Easy Park', 'Quick Park', 'City Park'];
    const suffixes = ['Parking', 'Parking Zone', 'Parking Area', 'Car Park'];
    
    const templates = [
      `${baseLocation.name} ${this.random(suffixes)}`,
      `${this.random(prefixes)} ${baseLocation.name}`,
      `${baseLocation.name} ${this.random(this.parkingTypes)}`,
      `${baseLocation.name.split(' ')[0]} ${this.random(suffixes)}`
    ];
    
    return this.random(templates);
  }

  /**
   * Generate realistic address
   */
  generateAddress(baseLocation) {
    const streetNumbers = ['1', '2', '3', '4', '5', '10', '15', '20'];
    const streetTypes = ['Marg', 'Road', 'Street', 'Lane', 'Galli'];
    
    return `${baseLocation.name}, ${this.random(streetNumbers)} ${this.random(streetTypes)}, Kathmandu, Nepal`;
  }

  /**
   * Generate realistic pricing based on location type
   */
  generatePricing(locationType) {
    const basePrices = {
      tourist_area: { min: 25, max: 50 },
      commercial: { min: 20, max: 40 },
      business: { min: 15, max: 35 },
      heritage: { min: 30, max: 60 },
      market: { min: 10, max: 25 },
      transport: { min: 15, max: 30 },
      educational: { min: 10, max: 20 },
      residential: { min: 8, max: 18 },
      medical: { min: 20, max: 35 },
      government: { min: 15, max: 25 },
      industrial: { min: 12, max: 22 },
      public: { min: 10, max: 25 },
      junction: { min: 15, max: 30 }
    };

    const prices = basePrices[locationType] || { min: 15, max: 30 };
    const hourlyRate = this.randomBetween(prices.min, prices.max);
    
    return {
      hourlyRate: hourlyRate,
      dailyRate: Math.floor(hourlyRate * 8),
      monthlyRate: Math.floor(hourlyRate * 200)
    };
  }

  /**
   * Generate capacity based on location type
   */
  generateCapacity(locationType) {
    const capacities = {
      tourist_area: { min: 50, max: 200 },
      commercial: { min: 30, max: 150 },
      business: { min: 40, max: 120 },
      heritage: { min: 20, max: 80 },
      market: { min: 25, max: 100 },
      transport: { min: 100, max: 300 },
      educational: { min: 80, max: 250 },
      residential: { min: 10, max: 50 },
      medical: { min: 60, max: 150 },
      government: { min: 30, max: 100 },
      industrial: { min: 40, max: 120 },
      public: { min: 25, max: 80 },
      junction: { min: 30, max: 100 }
    };

    const range = capacities[locationType] || { min: 20, max: 80 };
    const totalSpaces = this.randomBetween(range.min, range.max);
    const occupancyRate = Math.random() * 0.4 + 0.1; // 10-50% occupancy
    const availableSpaces = Math.floor(totalSpaces * (1 - occupancyRate));
    
    return {
      totalSpaces,
      availableSpaces,
      occupancyPercentage: Math.round(occupancyRate * 100)
    };
  }

  /**
   * Generate random amenities
   */
  generateAmenities(locationType) {
    const amenityProbabilities = {
      tourist_area: ['security', 'cctv', 'restroom', 'lighting'],
      commercial: ['security', 'cctv', 'covered_parking', 'mobile_payment'],
      business: ['security', 'cctv', 'valet_parking', 'ev_charging'],
      heritage: ['security', 'lighting', 'disabled_access'],
      market: ['security', 'lighting'],
      transport: ['security', 'cctv', 'restroom', 'lighting'],
      educational: ['bicycle_parking', 'security', 'lighting'],
      residential: ['security', 'lighting'],
      medical: ['disabled_access', 'security', 'covered_parking', 'ev_charging'],
      government: ['security', 'cctv', 'disabled_access'],
      industrial: ['security', 'cctv'],
      public: ['security', 'lighting'],
      junction: ['security', 'lighting', 'restroom']
    };

    const baseAmenities = amenityProbabilities[locationType] || ['security', 'lighting'];
    const selectedAmenities = [...baseAmenities];
    
    // Add random additional amenities
    const additionalAmenities = this.amenities.filter(a => !selectedAmenities.includes(a));
    const numAdditional = this.randomBetween(0, 3);
    
    for (let i = 0; i < numAdditional; i++) {
      if (Math.random() > 0.5 && additionalAmenities.length > 0) {
        const randomAmenity = this.random(additionalAmenities);
        selectedAmenities.push(randomAmenity);
        additionalAmenities.splice(additionalAmenities.indexOf(randomAmenity), 1);
      }
    }
    
    return selectedAmenities;
  }

  /**
   * Generate operating hours based on location type
   */
  generateOperatingHours(locationType) {
    const hourRanges = {
      tourist_area: { start: '06:00', end: '22:00' },
      commercial: { start: '07:00', end: '21:00' },
      business: { start: '06:30', end: '20:00' },
      heritage: { start: '08:00', end: '18:00' },
      market: { start: '05:00', end: '20:00' },
      transport: { start: '05:00', end: '23:00' },
      educational: { start: '07:00', end: '18:00' },
      residential: { start: '00:00', end: '23:59', is24Hours: true },
      medical: { start: '00:00', end: '23:59', is24Hours: true },
      government: { start: '08:00', end: '17:00' },
      industrial: { start: '06:00', end: '19:00' },
      public: { start: '06:00', end: '22:00' },
      junction: { start: '05:00', end: '23:00' }
    };

    return hourRanges[locationType] || { start: '07:00', end: '20:00' };
  }

  /**
   * Generate phone number in Nepali format
   */
  generatePhoneNumber() {
    const prefixes = ['98', '97', '96'];
    const prefix = this.random(prefixes);
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `+977${prefix}${number.toString().substring(0, 8)}`;
  }

  /**
   * Generate additional parking spots around a base location
   */
  generateNearbySpots(baseLocation, count = 3) {
    const spots = [];
    
    for (let i = 0; i < count; i++) {
      // Add small random offset (within ~500 meters)
      const latOffset = (Math.random() - 0.5) * 0.008; // ~500m
      const lngOffset = (Math.random() - 0.5) * 0.008;
      
      const spot = this.generateParkingSpot({
        ...baseLocation,
        lat: baseLocation.lat + latOffset,
        lng: baseLocation.lng + lngOffset
      });
      
      spots.push(spot);
    }
    
    return spots;
  }

  /**
   * Generate a single parking spot
   */
  generateParkingSpot(baseLocation) {
    const pricing = this.generatePricing(baseLocation.type);
    const capacity = this.generateCapacity(baseLocation.type);
    const amenities = this.generateAmenities(baseLocation.type);
    const operatingHours = this.generateOperatingHours(baseLocation.type);
    
    return {
      id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateParkingName(baseLocation, baseLocation.type),
      address: this.generateAddress(baseLocation),
      description: `Premium parking facility in ${baseLocation.name} area with modern amenities and secure environment.`,
      
      coordinates: {
        latitude: parseFloat(baseLocation.lat.toFixed(6)),
        longitude: parseFloat(baseLocation.lng.toFixed(6))
      },
      
      ...capacity,
      ...pricing,
      
      operatingHours: {
        ...operatingHours,
        is24Hours: operatingHours.is24Hours || false
      },
      
      isCurrentlyOpen: this.isCurrentlyOpen(operatingHours),
      currentStatus: 'active',
      isActive: true,
      
      amenities: amenities,
      contactNumber: this.generatePhoneNumber(),
      
      vehicleTypes: {
        car: true,
        motorcycle: true,
        bicycle: amenities.includes('bicycle_parking'),
        truck: baseLocation.type === 'industrial' || baseLocation.type === 'transport'
      },
      
      source: 'sample_data',
      dataQuality: {
        score: this.randomBetween(85, 98),
        level: 'high',
        needsVerification: false
      },
      verificationStatus: 'verified',
      
      createdAt: new Date(),
      updatedAt: new Date(),
      
      originalScrapedData: {
        source: 'sample_generator',
        searchKeyword: 'sample_data',
        searchCenter: baseLocation.name,
        confidence: 0.95,
        scrapedAt: new Date().toISOString(),
        needsVerification: false
      }
    };
  }

  /**
   * Check if currently open based on hours
   */
  isCurrentlyOpen(operatingHours) {
    if (operatingHours.is24Hours) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(operatingHours.start.split(':')[0]);
    const endHour = parseInt(operatingHours.end.split(':')[0]);
    
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Utility functions
   */
  random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate complete sample dataset
   */
  generateSampleData() {
    console.log('🎲 Generating sample parking data...');
    
    const allSpots = [];
    
    // Generate 1-4 parking spots per major location
    for (const location of this.kathmanduLocations) {
      const numSpots = this.randomBetween(1, 4);
      
      // Main spot at the location
      const mainSpot = this.generateParkingSpot(location);
      allSpots.push(mainSpot);
      
      // Additional nearby spots
      if (numSpots > 1) {
        const nearbySpots = this.generateNearbySpots(location, numSpots - 1);
        allSpots.push(...nearbySpots);
      }
      
      console.log(`📍 Generated ${numSpots} parking spots for ${location.name}`);
    }
    
    // Create the same format as our scraper would produce
    const sampleData = {
      parkingLocations: allSpots,
      amenityData: [], // Not needed for sample data
      summary: {
        totalParkingLocations: allSpots.length,
        totalAmenityData: 0,
        scrapedAt: new Date().toISOString(),
        errors: []
      }
    };
    
    console.log(`✅ Generated ${allSpots.length} sample parking locations`);
    
    return sampleData;
  }

  /**
   * Save sample data to file
   */
  async saveSampleData() {
    try {
      const sampleData = this.generateSampleData();
      
      const dataDir = path.join(process.cwd(), 'scraped_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `sample_parking_data_${timestamp}.json`;
      const filepath = path.join(dataDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(sampleData, null, 2));
      
      console.log(`💾 Sample data saved to: ${filepath}`);
      console.log(`📊 Summary: ${sampleData.summary.totalParkingLocations} locations generated`);
      
      return { filepath, data: sampleData };
      
    } catch (error) {
      console.error('❌ Failed to generate sample data:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SampleDataGenerator();
  generator.saveSampleData().catch(console.error);
}

export default SampleDataGenerator;