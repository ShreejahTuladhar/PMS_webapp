/**
 * Landmark Image Demo Script
 * Demonstrates the landmark images service with sample parking data
 */

import landmarkImagesService from '../services/landmarkImagesService.js';

// Sample parking locations with landmarks
const sampleParkingLocations = [
  {
    id: 1,
    name: "Heritage Premium Parking",
    landmarkName: "Kathmandu Durbar Square",
    category: "heritage",
    district: "Kathmandu",
    marketing: {
      title: "Park at the Heart of Nepal's History",
      subtitle: "Premium parking steps away from the UNESCO World Heritage Site",
      marketingTags: ["Heritage", "Premium", "Central"],
      features: ["24/7 Security", "Tourist Information", "Cultural Guide"]
    }
  },
  {
    id: 2,
    name: "Sacred Spaces Parking",
    landmarkName: "Pashupatinath Temple",
    category: "religious",
    district: "Kathmandu",
    marketing: {
      title: "Sacred Journey Parking",
      subtitle: "Convenient parking for spiritual visitors",
      marketingTags: ["Religious", "Sacred", "Peaceful"],
      features: ["Prayer Area", "Ritual Facilities", "Guide Services"]
    }
  },
  {
    id: 3,
    name: "Wisdom Hub Parking",
    landmarkName: "Boudhanath Stupa",
    category: "religious",
    district: "Kathmandu",
    marketing: {
      title: "Enlightenment Gateway Parking",
      subtitle: "Park near the giant mandala of peace",
      marketingTags: ["Buddhist", "Peaceful", "Meditation"],
      features: ["Meditation Space", "Book Shop", "Tea House"]
    }
  },
  {
    id: 4,
    name: "Royal Heritage Parking",
    landmarkName: "Patan Durbar Square",
    category: "heritage",
    district: "Lalitpur",
    marketing: {
      title: "Royal Legacy Parking",
      subtitle: "Park among the palaces of ancient kings",
      marketingTags: ["Royal", "Art", "Architecture"],
      features: ["Museum Access", "Art Gallery", "Cultural Tours"]
    }
  },
  {
    id: 5,
    name: "Dreams Garden Parking",
    landmarkName: "Garden of Dreams",
    category: "tourist",
    district: "Kathmandu",
    marketing: {
      title: "Paradise Found Parking",
      subtitle: "Gateway to Kathmandu's most beautiful garden",
      marketingTags: ["Garden", "Peaceful", "Romantic"],
      features: ["Garden Access", "Cafe", "Photography Spots"]
    }
  }
];

// Demonstrate the landmark images service
console.log('🖼️ Landmark Images Service Demonstration');
console.log('=====================================\n');

sampleParkingLocations.forEach((location, index) => {
  console.log(`${index + 1}. ${location.name} (${location.landmarkName})`);
  console.log(`   Category: ${location.category}`);
  
  // Get images for this location
  const images = landmarkImagesService.getLocationImages(location);
  console.log('   Images:');
  console.log(`     📷 Banner: ${images.bannerImage}`);
  console.log(`     🖼️ Thumbnail: ${images.thumbnailImage}`);
  console.log(`     🎨 Marketing: ${images.marketingImage}`);
  
  // Check if has custom landmark images
  const hasCustom = landmarkImagesService.hasLandmarkImages(location.landmarkName);
  console.log(`   🎯 Custom Images: ${hasCustom ? '✅ Available' : '❌ Using fallback'}`);
  
  // Get fallback
  const fallback = landmarkImagesService.getLandmarkFallback(location.landmarkName, location.category);
  console.log(`   🔄 Fallback: ${fallback}`);
  console.log('');
});

// Demonstrate fuzzy matching
console.log('🔍 Fuzzy Matching Demonstration');
console.log('==============================');

const testQueries = [
  'durbar',
  'temple',
  'stupa',
  'garden',
  'monkey temple',
  'university',
  'thamel',
  'ratna park'
];

testQueries.forEach(query => {
  const match = landmarkImagesService.fuzzyMatchLandmark(query);
  console.log(`"${query}" → ${match ? '✅ Found match' : '❌ No match'}`);
});

console.log('\n📊 Service Statistics');
console.log('===================');
console.log(`Total landmarks: ${landmarkImagesService.getAllLandmarks().length}`);
console.log(`Categories with defaults: ${Object.keys(landmarkImagesService.categoryDefaults).length}`);

export default {
  sampleParkingLocations,
  demonstrateService: () => {
    return landmarkImagesService.getAllLandmarks().map(landmark => ({
      landmark,
      images: landmarkImagesService.landmarkImages[landmark]
    }));
  }
};