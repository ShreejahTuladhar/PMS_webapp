#!/usr/bin/env node

/**
 * Comprehensive Kathmandu Valley Landmarks Database
 * Organized by category with coordinates for potential parking system integration
 */

export const kathmanduValleyLandmarks = {
  
  // UNESCO World Heritage Sites
  heritageSites: [
    { name: 'Kathmandu Durbar Square', lat: 27.7040, lng: 85.3070, district: 'Kathmandu', type: 'palace_complex' },
    { name: 'Patan Durbar Square', lat: 27.6648, lng: 85.3188, district: 'Lalitpur', type: 'palace_complex' },
    { name: 'Bhaktapur Durbar Square', lat: 27.6710, lng: 85.4298, district: 'Bhaktapur', type: 'palace_complex' },
    { name: 'Swayambhunath Stupa (Monkey Temple)', lat: 27.7148, lng: 85.2906, district: 'Kathmandu', type: 'buddhist_stupa' },
    { name: 'Boudhanath Stupa', lat: 27.7215, lng: 85.3617, district: 'Kathmandu', type: 'buddhist_stupa' },
    { name: 'Pashupatinath Temple', lat: 27.7103, lng: 85.3486, district: 'Kathmandu', type: 'hindu_temple' },
    { name: 'Changu Narayan Temple', lat: 27.7155, lng: 85.4339, district: 'Bhaktapur', type: 'hindu_temple' }
  ],

  // Religious Sites
  religiousSites: [
    { name: 'Dakshinkali Temple', lat: 27.6014, lng: 85.2969, district: 'Kathmandu', type: 'hindu_temple' },
    { name: 'Guhyeshwari Temple', lat: 27.7103, lng: 85.3486, district: 'Kathmandu', type: 'hindu_temple' },
    { name: 'Budhanilkantha Temple', lat: 27.7626, lng: 85.3695, district: 'Kathmandu', type: 'hindu_temple' },
    { name: 'Kirtipur Chilancho Stupa', lat: 27.6787, lng: 85.2849, district: 'Kathmandu', type: 'buddhist_stupa' },
    { name: 'Bajrayogini Temple', lat: 27.6890, lng: 85.4456, district: 'Kathmandu', type: 'hindu_temple' },
    { name: 'Doleshwar Mahadev', lat: 27.6445, lng: 85.5234, district: 'Bhaktapur', type: 'hindu_temple' }
  ],

  // Educational Institutions
  educational: [
    { name: 'Tribhuvan University (Kirtipur Campus)', lat: 27.6787, lng: 85.2849, district: 'Kathmandu', type: 'university' },
    { name: 'Pulchowk Engineering Campus', lat: 27.6800, lng: 85.3150, district: 'Lalitpur', type: 'engineering_college' },
    { name: 'Institute of Medicine (Maharajgunj)', lat: 27.7400, lng: 85.3300, district: 'Kathmandu', type: 'medical_college' },
    { name: 'Kathmandu University (Dhulikhel)', lat: 27.6175, lng: 85.5440, district: 'Kavre', type: 'university' },
    { name: 'Nepal Engineering College', lat: 27.6787, lng: 85.4456, district: 'Bhaktapur', type: 'engineering_college' },
    { name: 'St. Xavier\'s College', lat: 27.6915, lng: 85.3138, district: 'Kathmandu', type: 'college' }
  ],

  // Commercial Centers & Shopping
  commercial: [
    { name: 'New Road (Juddha Sadak)', lat: 27.7016, lng: 85.3197, district: 'Kathmandu', type: 'shopping_street' },
    { name: 'Asan Bazaar', lat: 27.7068, lng: 85.3097, district: 'Kathmandu', type: 'traditional_market' },
    { name: 'Indra Chowk', lat: 27.7058, lng: 85.3108, district: 'Kathmandu', type: 'traditional_market' },
    { name: 'Civil Mall', lat: 27.6882, lng: 85.3442, district: 'Kathmandu', type: 'shopping_mall' },
    { name: 'City Centre Mall', lat: 27.6915, lng: 85.3200, district: 'Kathmandu', type: 'shopping_mall' },
    { name: 'KL Tower', lat: 27.6915, lng: 85.3138, district: 'Kathmandu', type: 'business_center' },
    { name: 'Labim Mall', lat: 27.6648, lng: 85.3188, district: 'Lalitpur', type: 'shopping_mall' }
  ],

  // Transportation Hubs
  transportation: [
    { name: 'Tribhuvan International Airport', lat: 27.6966, lng: 85.3591, district: 'Kathmandu', type: 'airport' },
    { name: 'Ratna Park Bus Station', lat: 27.7064, lng: 85.3238, district: 'Kathmandu', type: 'bus_station' },
    { name: 'Gongabu Bus Park', lat: 27.7300, lng: 85.3200, district: 'Kathmandu', type: 'long_distance_bus' },
    { name: 'Old Bus Park (Purano Bus Park)', lat: 27.7050, lng: 85.3150, district: 'Kathmandu', type: 'local_bus' },
    { name: 'Lagankhel Bus Station', lat: 27.6667, lng: 85.3247, district: 'Lalitpur', type: 'bus_station' },
    { name: 'Koteshwor Ring Road Junction', lat: 27.6776, lng: 85.3470, district: 'Kathmandu', type: 'major_junction' }
  ],

  // Tourist Areas & Entertainment
  tourist: [
    { name: 'Thamel', lat: 27.7151, lng: 85.3107, district: 'Kathmandu', type: 'tourist_district' },
    { name: 'Freak Street (Jhochhen)', lat: 27.7025, lng: 85.3097, district: 'Kathmandu', type: 'tourist_area' },
    { name: 'Garden of Dreams', lat: 27.7115, lng: 85.3158, district: 'Kathmandu', type: 'garden_park' },
    { name: 'Ratna Park', lat: 27.7064, lng: 85.3238, district: 'Kathmandu', type: 'public_park' },
    { name: 'Narayanhiti Palace Museum', lat: 27.7115, lng: 85.3200, district: 'Kathmandu', type: 'museum' },
    { name: 'National Museum', lat: 27.6950, lng: 85.2950, district: 'Kathmandu', type: 'museum' }
  ],

  // Hills & Viewpoints
  viewpoints: [
    { name: 'Nagarkot Hill Station', lat: 27.7172, lng: 85.5220, district: 'Bhaktapur', type: 'hill_station' },
    { name: 'Sarangkot', lat: 28.2380, lng: 83.9560, district: 'Kaski', type: 'viewpoint' },
    { name: 'Champadevi Hill', lat: 27.6456, lng: 85.2789, district: 'Kathmandu', type: 'hiking_spot' },
    { name: 'Shivapuri Peak', lat: 27.8333, lng: 85.3833, district: 'Kathmandu', type: 'national_park' },
    { name: 'Chandragiri Hills', lat: 27.6789, lng: 85.2123, district: 'Kathmandu', type: 'cable_car_destination' }
  ],

  // Government & Administrative
  government: [
    { name: 'Singha Durbar', lat: 27.6995, lng: 85.3197, district: 'Kathmandu', type: 'government_complex' },
    { name: 'Supreme Court', lat: 27.7064, lng: 85.3300, district: 'Kathmandu', type: 'judiciary' },
    { name: 'Nepal Rastra Bank', lat: 27.7064, lng: 85.3180, district: 'Kathmandu', type: 'central_bank' },
    { name: 'Ministry of Foreign Affairs', lat: 27.7095, lng: 85.3269, district: 'Kathmandu', type: 'ministry' },
    { name: 'Election Commission', lat: 27.7095, lng: 85.3269, district: 'Kathmandu', type: 'constitutional_body' }
  ],

  // Medical Centers
  medical: [
    { name: 'Bir Hospital', lat: 27.7034, lng: 85.3150, district: 'Kathmandu', type: 'government_hospital' },
    { name: 'Tribhuvan University Teaching Hospital', lat: 27.7400, lng: 85.3300, district: 'Kathmandu', type: 'teaching_hospital' },
    { name: 'Norvic International Hospital', lat: 27.7064, lng: 85.3400, district: 'Kathmandu', type: 'private_hospital' },
    { name: 'Patan Hospital', lat: 27.6648, lng: 85.3188, district: 'Lalitpur', type: 'hospital' },
    { name: 'Nepal Medical College', lat: 27.6787, lng: 85.4456, district: 'Kathmandu', type: 'medical_college' }
  ],

  // Traditional Neighborhoods
  neighborhoods: [
    { name: 'Asan', lat: 27.7068, lng: 85.3097, district: 'Kathmandu', type: 'traditional_neighborhood' },
    { name: 'Indra Chowk', lat: 27.7058, lng: 85.3108, district: 'Kathmandu', type: 'traditional_square' },
    { name: 'Bangemudha', lat: 27.6915, lng: 85.3138, district: 'Kathmandu', type: 'residential_area' },
    { name: 'Kupondole', lat: 27.6890, lng: 85.3080, district: 'Lalitpur', type: 'residential_area' },
    { name: 'Sanepa', lat: 27.6830, lng: 85.3100, district: 'Lalitpur', type: 'residential_area' },
    { name: 'Jawalakhel', lat: 27.6701, lng: 85.3159, district: 'Lalitpur', type: 'commercial_residential' }
  ],

  // Industrial Areas
  industrial: [
    { name: 'Balaju Industrial District', lat: 27.7300, lng: 85.3000, district: 'Kathmandu', type: 'industrial_zone' },
    { name: 'Hetauda Industrial Area', lat: 27.4280, lng: 85.0440, district: 'Makwanpur', type: 'industrial_zone' },
    { name: 'Patan Industrial Estate', lat: 27.6648, lng: 85.3300, district: 'Lalitpur', type: 'industrial_zone' }
  ]
};

/**
 * Get landmarks by category
 */
export function getLandmarksByCategory(category) {
  return kathmanduValleyLandmarks[category] || [];
}

/**
 * Get all landmarks as flat array
 */
export function getAllLandmarks() {
  return Object.values(kathmanduValleyLandmarks).flat();
}

/**
 * Get landmarks by district
 */
export function getLandmarksByDistrict(district) {
  return getAllLandmarks().filter(landmark => 
    landmark.district.toLowerCase() === district.toLowerCase()
  );
}

/**
 * Search landmarks by name
 */
export function searchLandmarks(query) {
  const allLandmarks = getAllLandmarks();
  return allLandmarks.filter(landmark => 
    landmark.name.toLowerCase().includes(query.toLowerCase())
  );
}

// Statistics
export const landmarkStats = {
  totalLandmarks: getAllLandmarks().length,
  categoriesCount: Object.keys(kathmanduValleyLandmarks).length,
  byDistrict: {
    kathmandu: getLandmarksByDistrict('Kathmandu').length,
    lalitpur: getLandmarksByDistrict('Lalitpur').length,
    bhaktapur: getLandmarksByDistrict('Bhaktapur').length
  }
};

// Example usage and logging
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🏛️ KATHMANDU VALLEY LANDMARKS DATABASE\n');
  
  Object.entries(kathmanduValleyLandmarks).forEach(([category, landmarks]) => {
    console.log(`📍 ${category.toUpperCase()} (${landmarks.length} locations):`);
    landmarks.forEach((landmark, i) => {
      console.log(`   ${i+1}. ${landmark.name} [${landmark.lat}, ${landmark.lng}]`);
    });
    console.log('');
  });
  
  console.log('📊 STATISTICS:');
  console.log(`   Total Landmarks: ${landmarkStats.totalLandmarks}`);
  console.log(`   Categories: ${landmarkStats.categoriesCount}`);
  console.log(`   Districts: Kathmandu (${landmarkStats.byDistrict.kathmandu}), Lalitpur (${landmarkStats.byDistrict.lalitpur}), Bhaktapur (${landmarkStats.byDistrict.bhaktapur})`);
}