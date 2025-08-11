#!/usr/bin/env node

/**
 * Enhanced Landmark Parking Data Generator
 * Creates comprehensive parking data for all 62 Kathmandu Valley landmarks
 * Includes marketing features: profile banners, descriptions, and parking cards
 */

import fs from 'fs';
import path from 'path';
import { kathmanduValleyLandmarks } from './kathmandu_valley_landmarks.js';

class ExpandedLandmarkDataGenerator {
  constructor() {
    this.landmarks = this.flattenLandmarks();
    this.marketingImages = this.generateImageMappings();
    this.parkingProfiles = this.createParkingProfiles();
  }

  /**
   * Flatten landmark data from categories into single array
   */
  flattenLandmarks() {
    const flattened = [];
    Object.entries(kathmanduValleyLandmarks).forEach(([category, landmarks]) => {
      landmarks.forEach(landmark => {
        flattened.push({
          ...landmark,
          category: category,
          landmarkType: landmark.type
        });
      });
    });
    return flattened;
  }

  /**
   * Generate marketing image mappings for landmarks
   */
  generateImageMappings() {
    const imageCategories = {
      heritage: [
        'durbar-square-banner.jpg', 'temple-heritage.jpg', 'stupa-panorama.jpg',
        'ancient-architecture.jpg', 'cultural-heritage.jpg'
      ],
      religious: [
        'temple-banner.jpg', 'stupa-spiritual.jpg', 'prayer-flags.jpg',
        'buddhist-monastery.jpg', 'hindu-temple.jpg'
      ],
      educational: [
        'university-campus.jpg', 'college-building.jpg', 'academic-banner.jpg',
        'students-campus.jpg', 'education-hub.jpg'
      ],
      commercial: [
        'shopping-mall.jpg', 'market-street.jpg', 'commercial-center.jpg',
        'retail-plaza.jpg', 'business-district.jpg'
      ],
      tourist: [
        'thamel-night.jpg', 'tourist-district.jpg', 'cultural-street.jpg',
        'backpacker-area.jpg', 'vibrant-bazaar.jpg'
      ],
      transportation: [
        'airport-terminal.jpg', 'bus-station.jpg', 'transport-hub.jpg',
        'modern-terminal.jpg', 'travel-center.jpg'
      ],
      medical: [
        'hospital-exterior.jpg', 'medical-center.jpg', 'healthcare-facility.jpg',
        'modern-hospital.jpg', 'medical-campus.jpg'
      ],
      government: [
        'government-building.jpg', 'official-complex.jpg', 'administrative-center.jpg',
        'ministry-building.jpg', 'public-office.jpg'
      ],
      industrial: [
        'industrial-zone.jpg', 'factory-area.jpg', 'manufacturing-hub.jpg',
        'business-park.jpg', 'industrial-complex.jpg'
      ],
      viewpoints: [
        'mountain-view.jpg', 'hill-station.jpg', 'panoramic-vista.jpg',
        'scenic-overlook.jpg', 'himalayan-view.jpg'
      ],
      neighborhoods: [
        'traditional-street.jpg', 'residential-area.jpg', 'local-community.jpg',
        'neighborhood-square.jpg', 'cultural-district.jpg'
      ]
    };

    return imageCategories;
  }

  /**
   * Map category keys from landmarks to profile keys
   */
  mapCategoryKey(category) {
    const categoryMapping = {
      'heritageSites': 'heritage',
      'religiousSites': 'religious',
      'educational': 'educational',
      'commercial': 'commercial',
      'tourist': 'tourist',
      'transportation': 'transportation',
      'medical': 'medical',
      'government': 'government',
      'industrial': 'industrial',
      'viewpoints': 'viewpoints',
      'neighborhoods': 'neighborhoods'
    };
    return categoryMapping[category] || category;
  }

  /**
   * Create detailed parking profiles for landmarks
   */
  createParkingProfiles() {
    return {
      heritage: {
        description: 'Premium parking near Nepal\'s most treasured heritage sites. Secure, convenient access to UNESCO World Heritage locations.',
        features: ['Heritage site access', 'Tourist guide availability', 'Cultural significance', 'Photography spots'],
        targetAudience: 'tourists, heritage enthusiasts, photographers',
        marketingTags: ['Heritage', 'UNESCO', 'Cultural', 'Historic', 'Must-Visit']
      },
      religious: {
        description: 'Respectful parking facilities near sacred temples and spiritual centers. Clean, peaceful environment for devotees.',
        features: ['Sacred site proximity', 'Respectful environment', 'Spiritual atmosphere', 'Devotee facilities'],
        targetAudience: 'devotees, spiritual seekers, pilgrims',
        marketingTags: ['Spiritual', 'Sacred', 'Temple', 'Peaceful', 'Divine']
      },
      educational: {
        description: 'Student-friendly parking near top educational institutions. Affordable rates for academic community.',
        features: ['Student discounts', 'Academic calendar rates', 'Safe environment', 'Study-friendly'],
        targetAudience: 'students, faculty, academic visitors',
        marketingTags: ['Student-Friendly', 'Academic', 'Educational', 'Safe', 'Affordable']
      },
      commercial: {
        description: 'Convenient parking for shopping and business districts. Easy access to malls, markets, and commercial centers.',
        features: ['Shopping convenience', 'Business meetings', 'Commercial access', 'Retail proximity'],
        targetAudience: 'shoppers, business professionals, retail customers',
        marketingTags: ['Shopping', 'Business', 'Convenient', 'Commercial', 'Retail']
      },
      tourist: {
        description: 'Backpacker and tourist-friendly parking in vibrant cultural districts. Experience authentic Kathmandu.',
        features: ['Cultural immersion', 'Tourist information', 'Local experience', 'Backpacker rates'],
        targetAudience: 'tourists, backpackers, cultural explorers',
        marketingTags: ['Tourist', 'Cultural', 'Authentic', 'Backpacker', 'Experience']
      },
      transportation: {
        description: 'Strategic parking near major transport hubs. Perfect for travelers and commuters.',
        features: ['Transit connectivity', 'Traveler convenience', 'Luggage security', '24/7 access'],
        targetAudience: 'travelers, commuters, transit users',
        marketingTags: ['Transit', 'Travel', 'Convenient', 'Connected', 'Accessible']
      },
      medical: {
        description: 'Compassionate parking near healthcare facilities. Support for patients, visitors, and medical staff.',
        features: ['Patient support', 'Visitor convenience', 'Medical staff rates', 'Emergency access'],
        targetAudience: 'patients, medical visitors, healthcare workers',
        marketingTags: ['Healthcare', 'Patient-Care', 'Medical', 'Supportive', 'Accessible']
      },
      government: {
        description: 'Professional parking for government and administrative buildings. Secure, dignified service.',
        features: ['Official business', 'Security protocols', 'Professional environment', 'Government rates'],
        targetAudience: 'government officials, citizens, business visitors',
        marketingTags: ['Official', 'Professional', 'Secure', 'Government', 'Administrative']
      },
      industrial: {
        description: 'Heavy-duty parking for industrial zones and business parks. Commercial vehicle support.',
        features: ['Commercial vehicles', 'Industrial access', 'Heavy-duty support', 'Business facilities'],
        targetAudience: 'industrial workers, business visitors, commercial drivers',
        marketingTags: ['Industrial', 'Commercial', 'Heavy-Duty', 'Business', 'Professional']
      },
      viewpoints: {
        description: 'Scenic parking near breathtaking viewpoints and hill stations. Perfect for nature lovers.',
        features: ['Scenic beauty', 'Nature access', 'Photography spots', 'Adventure parking'],
        targetAudience: 'nature lovers, photographers, adventure seekers',
        marketingTags: ['Scenic', 'Nature', 'Adventure', 'Photography', 'Beautiful']
      },
      neighborhoods: {
        description: 'Local community parking in traditional neighborhoods. Authentic residential area experience.',
        features: ['Local community', 'Residential access', 'Cultural authenticity', 'Neighborhood feel'],
        targetAudience: 'residents, local visitors, cultural explorers',
        marketingTags: ['Local', 'Community', 'Authentic', 'Residential', 'Traditional']
      }
    };
  }

  /**
   * Generate marketing banner data for a landmark
   */
  generateMarketingBanner(landmark) {
    const mappedCategory = this.mapCategoryKey(landmark.category);
    const profile = this.parkingProfiles[mappedCategory];
    const images = this.marketingImages[mappedCategory] || this.marketingImages.tourist;
    
    return {
      title: `Premium Parking at ${landmark.name}`,
      subtitle: profile.description,
      bannerImage: `/images/banners/${this.random(images)}`,
      thumbnailImage: `/images/thumbnails/${landmark.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      marketingTags: profile.marketingTags,
      features: profile.features,
      targetAudience: profile.targetAudience,
      category: landmark.category,
      district: landmark.district,
      landmarkType: landmark.landmarkType
    };
  }

  /**
   * Generate realistic parking pricing based on landmark importance and type
   */
  generateLandmarkPricing(landmark) {
    const basePrices = {
      heritage: { min: 30, max: 60, premium: 80 },
      religious: { min: 15, max: 35, premium: 50 },
      educational: { min: 10, max: 25, premium: 35 },
      commercial: { min: 25, max: 45, premium: 65 },
      tourist: { min: 35, max: 55, premium: 75 },
      transportation: { min: 20, max: 40, premium: 60 },
      medical: { min: 20, max: 35, premium: 50 },
      government: { min: 25, max: 40, premium: 55 },
      industrial: { min: 15, max: 30, premium: 40 },
      viewpoints: { min: 40, max: 70, premium: 90 },
      neighborhoods: { min: 12, max: 28, premium: 38 }
    };

    const mappedCategory = this.mapCategoryKey(landmark.category);
    const prices = basePrices[mappedCategory] || { min: 20, max: 40, premium: 60 };
    const hourlyRate = this.randomBetween(prices.min, prices.max);
    
    return {
      hourlyRate: hourlyRate,
      dailyRate: Math.floor(hourlyRate * 8.5),
      weeklyRate: Math.floor(hourlyRate * 50),
      monthlyRate: Math.floor(hourlyRate * 180),
      premiumRate: prices.premium,
      studentDiscount: landmark.category === 'educational' ? 0.25 : 0,
      touristPackage: ['heritage', 'tourist', 'religious'].includes(mappedCategory) ? hourlyRate * 6 : null
    };
  }

  /**
   * Generate capacity based on landmark importance and type
   */
  generateLandmarkCapacity(landmark) {
    const capacities = {
      heritage: { min: 80, max: 300, vip: 20 },
      religious: { min: 60, max: 200, vip: 15 },
      educational: { min: 100, max: 400, vip: 25 },
      commercial: { min: 150, max: 500, vip: 30 },
      tourist: { min: 70, max: 250, vip: 20 },
      transportation: { min: 200, max: 800, vip: 40 },
      medical: { min: 120, max: 300, vip: 25 },
      government: { min: 80, max: 200, vip: 15 },
      industrial: { min: 100, max: 350, vip: 20 },
      viewpoints: { min: 50, max: 150, vip: 10 },
      neighborhoods: { min: 30, max: 100, vip: 8 }
    };

    const mappedCategory = this.mapCategoryKey(landmark.category);
    const range = capacities[mappedCategory] || { min: 50, max: 150, vip: 10 };
    const totalSpaces = this.randomBetween(range.min, range.max);
    const vipSpaces = range.vip;
    const regularSpaces = totalSpaces - vipSpaces;
    const occupancyRate = Math.random() * 0.4 + 0.2; // 20-60% occupancy
    const availableSpaces = Math.floor(totalSpaces * (1 - occupancyRate));
    
    return {
      totalSpaces,
      regularSpaces,
      vipSpaces,
      availableSpaces,
      occupancyPercentage: Math.round(occupancyRate * 100),
      peakHours: this.generatePeakHours(mappedCategory)
    };
  }

  /**
   * Generate peak hours based on landmark type
   */
  generatePeakHours(category) {
    const peakTimes = {
      heritage: ['09:00-12:00', '14:00-17:00'],
      religious: ['06:00-09:00', '17:00-19:00'],
      educational: ['08:00-10:00', '16:00-18:00'],
      commercial: ['11:00-14:00', '18:00-21:00'],
      tourist: ['19:00-23:00'],
      transportation: ['06:00-09:00', '17:00-20:00'],
      medical: ['08:00-12:00', '14:00-17:00'],
      government: ['09:00-12:00', '13:00-16:00'],
      industrial: ['07:00-09:00', '17:00-19:00'],
      viewpoints: ['05:00-08:00', '16:00-18:00'],
      neighborhoods: ['18:00-21:00']
    };
    
    return peakTimes[category] || ['09:00-17:00'];
  }

  /**
   * Generate enhanced amenities based on landmark type
   */
  generateLandmarkAmenities(landmark) {
    const categoryAmenities = {
      heritage: ['security', 'cctv', 'tourist_info', 'guide_booking', 'souvenir_shop', 'restroom', 'photography_spots'],
      religious: ['security', 'shoe_storage', 'prayer_area', 'donation_box', 'incense_area', 'meditation_space'],
      educational: ['bicycle_parking', 'student_discount', 'study_areas', 'wifi', 'cafeteria_access', 'library_proximity'],
      commercial: ['shopping_cart_area', 'package_storage', 'retail_discounts', 'valet_service', 'food_court_access'],
      tourist: ['backpack_storage', 'travel_info', 'currency_exchange', 'tour_booking', 'local_guides', 'wifi'],
      transportation: ['luggage_storage', '24_hour_access', 'taxi_booking', 'travel_insurance', 'porter_service'],
      medical: ['wheelchair_access', 'emergency_parking', 'patient_transport', 'pharmacy_nearby', 'ambulance_access'],
      government: ['official_vehicle_parking', 'visitor_registration', 'document_storage', 'meeting_rooms'],
      industrial: ['truck_parking', 'cargo_loading', 'heavy_vehicle_support', 'fuel_station', 'maintenance'],
      viewpoints: ['scenic_spots', 'hiking_gear_rental', 'photography_equipment', 'weather_updates', 'trail_maps'],
      neighborhoods: ['residential_parking', 'local_guide', 'community_events', 'local_market_access']
    };

    const baseAmenities = ['security', 'cctv', 'lighting', 'mobile_payment'];
    const mappedCategory = this.mapCategoryKey(landmark.category);
    const specialAmenities = categoryAmenities[mappedCategory] || [];
    
    return [...baseAmenities, ...this.randomSelect(specialAmenities, 3, 6)];
  }

  /**
   * Generate a complete parking spot for a landmark
   */
  generateLandmarkParkingSpot(landmark) {
    const mappedCategory = this.mapCategoryKey(landmark.category);
    const pricing = this.generateLandmarkPricing(landmark);
    const capacity = this.generateLandmarkCapacity(landmark);
    const amenities = this.generateLandmarkAmenities(landmark);
    const marketing = this.generateMarketingBanner(landmark);
    
    return {
      id: `landmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `ParkSathi ${landmark.name} Premium Parking`,
      landmarkName: landmark.name,
      shortName: `${landmark.name} Parking`,
      
      // Location data
      address: this.generateLandmarkAddress(landmark),
      description: `Premium parking facility at ${landmark.name}. ${marketing.subtitle}`,
      coordinates: {
        latitude: parseFloat(landmark.lat.toFixed(6)),
        longitude: parseFloat(landmark.lng.toFixed(6))
      },
      
      // Landmark metadata
      landmarkType: landmark.landmarkType,
      district: landmark.district,
      category: landmark.category,
      
      // Capacity and pricing
      ...capacity,
      ...pricing,
      
      // Operating details
      operatingHours: this.generateOperatingHours(mappedCategory),
      isCurrentlyOpen: this.isCurrentlyOpen(this.generateOperatingHours(mappedCategory)),
      currentStatus: 'active',
      isActive: true,
      
      // Features
      amenities: amenities,
      contactNumber: this.generatePhoneNumber(),
      
      // Vehicle support
      vehicleTypes: {
        car: true,
        motorcycle: true,
        bicycle: ['educational', 'neighborhoods'].includes(mappedCategory),
        bus: ['heritage', 'tourist', 'transportation'].includes(mappedCategory),
        truck: mappedCategory === 'industrial'
      },
      
      // Marketing data
      marketing: marketing,
      
      // System metadata
      source: 'landmark_expansion',
      dataQuality: {
        score: this.randomBetween(88, 98),
        level: 'premium',
        needsVerification: false,
        landmarkVerified: true
      },
      verificationStatus: 'landmark_verified',
      
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Expansion metadata
      expansionData: {
        source: 'landmark_database_expansion',
        landmarkId: `${landmark.category}_${landmark.name.replace(/\s+/g, '_').toLowerCase()}`,
        expansionVersion: '2.0',
        marketingEnabled: true,
        premiumListing: true
      }
    };
  }

  /**
   * Generate realistic address for landmark
   */
  generateLandmarkAddress(landmark) {
    const streetNumbers = ['1', '2', '5', '10', '15', '25'];
    const streetTypes = ['Marg', 'Road', 'Street', 'Lane'];
    return `Near ${landmark.name}, ${this.random(streetNumbers)} ${this.random(streetTypes)}, ${landmark.district}, Nepal`;
  }

  /**
   * Generate operating hours based on landmark category
   */
  generateOperatingHours(category) {
    const hours = {
      heritage: { start: '06:00', end: '18:00' },
      religious: { start: '05:00', end: '20:00' },
      educational: { start: '07:00', end: '19:00' },
      commercial: { start: '08:00', end: '22:00' },
      tourist: { start: '00:00', end: '23:59', is24Hours: true },
      transportation: { start: '00:00', end: '23:59', is24Hours: true },
      medical: { start: '00:00', end: '23:59', is24Hours: true },
      government: { start: '08:00', end: '17:00' },
      industrial: { start: '06:00', end: '20:00' },
      viewpoints: { start: '05:00', end: '19:00' },
      neighborhoods: { start: '00:00', end: '23:59', is24Hours: true }
    };
    
    return hours[category] || { start: '08:00', end: '20:00' };
  }

  /**
   * Check if currently open
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
   * Generate phone number
   */
  generatePhoneNumber() {
    const prefixes = ['98', '97', '96'];
    const prefix = this.random(prefixes);
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `+977${prefix}${number.toString().substring(0, 8)}`;
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

  randomSelect(array, min, max) {
    const count = this.randomBetween(min, Math.min(max, array.length));
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generate complete expanded dataset
   */
  generateExpandedDataset() {
    console.log('🏛️ Generating expanded landmark parking dataset...');
    
    const allParkingSpots = [];
    
    // Generate 1-3 parking spots per landmark
    for (const landmark of this.landmarks) {
      const numSpots = this.randomBetween(1, 3);
      
      // Main premium spot
      const mainSpot = this.generateLandmarkParkingSpot(landmark);
      allParkingSpots.push(mainSpot);
      
      // Additional spots if needed
      for (let i = 1; i < numSpots; i++) {
        const additionalSpot = this.generateLandmarkParkingSpot({
          ...landmark,
          lat: landmark.lat + (Math.random() - 0.5) * 0.005, // Small offset
          lng: landmark.lng + (Math.random() - 0.5) * 0.005
        });
        additionalSpot.name = `ParkSathi ${landmark.name} Zone ${i + 1}`;
        additionalSpot.shortName = `${landmark.name} Zone ${i + 1}`;
        allParkingSpots.push(additionalSpot);
      }
      
      console.log(`🅿️ Generated ${numSpots} parking spots for ${landmark.name} (${landmark.category})`);
    }
    
    // Create dataset structure
    const expandedDataset = {
      parkingLocations: allParkingSpots,
      landmarkData: this.landmarks,
      marketingProfiles: this.parkingProfiles,
      imageCategories: this.marketingImages,
      summary: {
        totalParkingLocations: allParkingSpots.length,
        totalLandmarks: this.landmarks.length,
        categoriesExpanded: Object.keys(kathmanduValleyLandmarks).length,
        marketingEnabled: true,
        premiumListings: allParkingSpots.length,
        generatedAt: new Date().toISOString(),
        version: '2.0',
        expansionType: 'landmark_integration'
      }
    };
    
    console.log(`✅ Generated ${allParkingSpots.length} premium parking locations for ${this.landmarks.length} landmarks`);
    
    return expandedDataset;
  }

  /**
   * Save expanded dataset to file
   */
  async saveExpandedDataset() {
    try {
      const expandedDataset = this.generateExpandedDataset();
      
      const dataDir = path.join(process.cwd(), 'scraped_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `expanded_landmark_parking_data_${timestamp}.json`;
      const filepath = path.join(dataDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(expandedDataset, null, 2));
      
      console.log(`💾 Expanded dataset saved to: ${filepath}`);
      console.log(`📊 Summary: ${expandedDataset.summary.totalParkingLocations} premium locations, ${expandedDataset.summary.totalLandmarks} landmarks`);
      
      return { filepath, data: expandedDataset };
      
    } catch (error) {
      console.error('❌ Failed to generate expanded dataset:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ExpandedLandmarkDataGenerator();
  generator.saveExpandedDataset().catch(console.error);
}

export default ExpandedLandmarkDataGenerator;