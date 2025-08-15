/**
 * Landmark Images Service
 * Provides authentic Kathmandu Valley landmark images for marketing components
 */

class LandmarkImagesService {
  constructor() {
    // Classic landmark images mapping
    this.landmarkImages = {
      // Heritage Sites
      'Kathmandu Durbar Square': {
        banner: '/images/landmarks/kathmandu-durbar-square-banner.jpg',
        thumbnail: '/images/landmarks/kathmandu-durbar-square-thumb.jpg',
        marketing: '/images/landmarks/kathmandu-durbar-square-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },
      'Patan Durbar Square': {
        banner: '/images/landmarks/patan-durbar-square-banner.jpg',
        thumbnail: '/images/landmarks/patan-durbar-square-thumb.jpg',
        marketing: '/images/landmarks/patan-durbar-square-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=400&fit=crop'
      },
      'Bhaktapur Durbar Square': {
        banner: '/images/landmarks/bhaktapur-durbar-square-banner.jpg',
        thumbnail: '/images/landmarks/bhaktapur-durbar-square-thumb.jpg',
        marketing: '/images/landmarks/bhaktapur-durbar-square-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1564414171364-eb5a6ac97a07?w=800&h=400&fit=crop'
      },

      // Religious Sites
      'Pashupatinath Temple': {
        banner: '/images/landmarks/pashupatinath-temple-banner.jpg',
        thumbnail: '/images/landmarks/pashupatinath-temple-thumb.jpg',
        marketing: '/images/landmarks/pashupatinath-temple-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
      },
      'Boudhanath Stupa': {
        banner: '/images/landmarks/boudhanath-stupa-banner.jpg',
        thumbnail: '/images/landmarks/boudhanath-stupa-thumb.jpg',
        marketing: '/images/landmarks/boudhanath-stupa-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1574874977852-1cbc1bbef73d?w=800&h=400&fit=crop'
      },
      'Swayambhunath (Monkey Temple)': {
        banner: '/images/landmarks/swayambhunath-banner.jpg',
        thumbnail: '/images/landmarks/swayambhunath-thumb.jpg',
        marketing: '/images/landmarks/swayambhunath-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },

      // Tourist Attractions
      'Garden of Dreams': {
        banner: '/images/landmarks/garden-of-dreams-banner.jpg',
        thumbnail: '/images/landmarks/garden-of-dreams-thumb.jpg',
        marketing: '/images/landmarks/garden-of-dreams-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
      },
      'Thamel': {
        banner: '/images/landmarks/thamel-banner.jpg',
        thumbnail: '/images/landmarks/thamel-thumb.jpg',
        marketing: '/images/landmarks/thamel-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },

      // Educational Institutions
      'Tribhuvan University': {
        banner: '/images/landmarks/tribhuvan-university-banner.jpg',
        thumbnail: '/images/landmarks/tribhuvan-university-thumb.jpg',
        marketing: '/images/landmarks/tribhuvan-university-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=800&h=400&fit=crop'
      },
      'Kathmandu University': {
        banner: '/images/landmarks/kathmandu-university-banner.jpg',
        thumbnail: '/images/landmarks/kathmandu-university-thumb.jpg',
        marketing: '/images/landmarks/kathmandu-university-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=800&h=400&fit=crop'
      },

      // Commercial Areas
      'New Road': {
        banner: '/images/landmarks/new-road-banner.jpg',
        thumbnail: '/images/landmarks/new-road-thumb.jpg',
        marketing: '/images/landmarks/new-road-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
      },
      'Asan Bazaar': {
        banner: '/images/landmarks/asan-bazaar-banner.jpg',
        thumbnail: '/images/landmarks/asan-bazaar-thumb.jpg',
        marketing: '/images/landmarks/asan-bazaar-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
      },

      // Viewpoints
      'Nagarkot': {
        banner: '/images/landmarks/nagarkot-banner.jpg',
        thumbnail: '/images/landmarks/nagarkot-thumb.jpg',
        marketing: '/images/landmarks/nagarkot-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
      },
      'Sarangkot': {
        banner: '/images/landmarks/sarangkot-banner.jpg',
        thumbnail: '/images/landmarks/sarangkot-thumb.jpg',
        marketing: '/images/landmarks/sarangkot-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
      },

      // Transportation Hubs
      'Ratna Park Bus Station': {
        banner: '/images/landmarks/ratna-park-banner.jpg',
        thumbnail: '/images/landmarks/ratna-park-thumb.jpg',
        marketing: '/images/landmarks/ratna-park-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop'
      },
      'Old Bus Park': {
        banner: '/images/landmarks/old-bus-park-banner.jpg',
        thumbnail: '/images/landmarks/old-bus-park-thumb.jpg',
        marketing: '/images/landmarks/old-bus-park-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop'
      },

      // Government Buildings
      'Singha Durbar': {
        banner: '/images/landmarks/singha-durbar-banner.jpg',
        thumbnail: '/images/landmarks/singha-durbar-thumb.jpg',
        marketing: '/images/landmarks/singha-durbar-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1555852634-15e4bf938e96?w=800&h=400&fit=crop'
      },

      // Medical Centers
      'Bir Hospital': {
        banner: '/images/landmarks/bir-hospital-banner.jpg',
        thumbnail: '/images/landmarks/bir-hospital-thumb.jpg',
        marketing: '/images/landmarks/bir-hospital-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop'
      },
      'TU Teaching Hospital': {
        banner: '/images/landmarks/tu-teaching-hospital-banner.jpg',
        thumbnail: '/images/landmarks/tu-teaching-hospital-thumb.jpg',
        marketing: '/images/landmarks/tu-teaching-hospital-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop'
      },

      // Additional Popular Landmarks
      'Hanuman Dhoka': {
        banner: '/images/landmarks/hanuman-dhoka-banner.jpg',
        thumbnail: '/images/landmarks/hanuman-dhoka-thumb.jpg',
        marketing: '/images/landmarks/hanuman-dhoka-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },
      'Basantapur Durbar Square': {
        banner: '/images/landmarks/basantapur-banner.jpg',
        thumbnail: '/images/landmarks/basantapur-thumb.jpg',
        marketing: '/images/landmarks/basantapur-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },
      'Changunarayan Temple': {
        banner: '/images/landmarks/changunarayan-banner.jpg',
        thumbnail: '/images/landmarks/changunarayan-thumb.jpg',
        marketing: '/images/landmarks/changunarayan-marketing.jpg',
        fallback: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
      }
    };

    // Default images for categories
    this.categoryDefaults = {
      heritage: {
        banner: '/images/categories/heritage-banner.jpg',
        thumbnail: '/images/categories/heritage-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop'
      },
      religious: {
        banner: '/images/categories/religious-banner.jpg',
        thumbnail: '/images/categories/religious-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
      },
      educational: {
        banner: '/images/categories/educational-banner.jpg',
        thumbnail: '/images/categories/educational-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=800&h=400&fit=crop'
      },
      commercial: {
        banner: '/images/categories/commercial-banner.jpg',
        thumbnail: '/images/categories/commercial-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
      },
      tourist: {
        banner: '/images/categories/tourist-banner.jpg',
        thumbnail: '/images/categories/tourist-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
      },
      transportation: {
        banner: '/images/categories/transportation-banner.jpg',
        thumbnail: '/images/categories/transportation-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop'
      },
      medical: {
        banner: '/images/categories/medical-banner.jpg',
        thumbnail: '/images/categories/medical-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop'
      },
      government: {
        banner: '/images/categories/government-banner.jpg',
        thumbnail: '/images/categories/government-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1555852634-15e4bf938e96?w=800&h=400&fit=crop'
      },
      viewpoints: {
        banner: '/images/categories/viewpoints-banner.jpg',
        thumbnail: '/images/categories/viewpoints-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
      },
      neighborhoods: {
        banner: '/images/categories/neighborhoods-banner.jpg',
        thumbnail: '/images/categories/neighborhoods-thumb.jpg',
        fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
      }
    };
  }

  /**
   * Get image for a specific landmark and image type
   */
  getLandmarkImage(landmarkName, imageType = 'thumbnail') {
    if (!landmarkName) return null;

    const landmark = this.landmarkImages[landmarkName];
    if (landmark && landmark[imageType]) {
      return landmark[imageType];
    }

    // Try fuzzy matching
    const fuzzyMatch = this.fuzzyMatchLandmark(landmarkName);
    if (fuzzyMatch && fuzzyMatch[imageType]) {
      return fuzzyMatch[imageType];
    }

    return null;
  }

  /**
   * Get fallback image for a landmark
   */
  getLandmarkFallback(landmarkName, category = null) {
    const landmark = this.landmarkImages[landmarkName];
    if (landmark && landmark.fallback) {
      return landmark.fallback;
    }

    // Use category fallback if available
    if (category && this.categoryDefaults[category]) {
      return this.categoryDefaults[category].fallback;
    }

    // Default parking image
    return 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=400&fit=crop';
  }

  /**
   * Get complete image set for a parking location
   */
  getLocationImages(parkingLocation) {
    const { landmarkName, category, name } = parkingLocation;
    
    const landmark = landmarkName || name;
    const images = {
      bannerImage: this.getLandmarkImage(landmark, 'banner') || 
                   (category && this.categoryDefaults[category]?.banner) ||
                   this.getLandmarkFallback(landmark, category),
                   
      thumbnailImage: this.getLandmarkImage(landmark, 'thumbnail') ||
                      (category && this.categoryDefaults[category]?.thumbnail) ||
                      this.getLandmarkFallback(landmark, category),
                      
      marketingImage: this.getLandmarkImage(landmark, 'marketing') ||
                      this.getLandmarkImage(landmark, 'banner') ||
                      (category && this.categoryDefaults[category]?.banner) ||
                      this.getLandmarkFallback(landmark, category)
    };

    return images;
  }

  /**
   * Fuzzy match landmark names
   */
  fuzzyMatchLandmark(searchName) {
    if (!searchName) return null;

    const searchLower = searchName.toLowerCase();
    
    // Direct matches
    for (const [landmarkName, data] of Object.entries(this.landmarkImages)) {
      if (landmarkName.toLowerCase().includes(searchLower) || 
          searchLower.includes(landmarkName.toLowerCase())) {
        return data;
      }
    }

    // Keyword matching
    const keywords = {
      'durbar': 'Kathmandu Durbar Square',
      'patan': 'Patan Durbar Square',
      'bhaktapur': 'Bhaktapur Durbar Square',
      'pashupatinath': 'Pashupatinath Temple',
      'boudhanath': 'Boudhanath Stupa',
      'bouddha': 'Boudhanath Stupa',
      'swayambhu': 'Swayambhunath (Monkey Temple)',
      'monkey temple': 'Swayambhunath (Monkey Temple)',
      'garden': 'Garden of Dreams',
      'dreams': 'Garden of Dreams',
      'thamel': 'Thamel',
      'new road': 'New Road',
      'asan': 'Asan Bazaar',
      'ratna park': 'Ratna Park Bus Station',
      'nagarkot': 'Nagarkot',
      'university': 'Tribhuvan University',
      'hospital': 'Bir Hospital',
      'singha durbar': 'Singha Durbar'
    };

    for (const [keyword, landmarkName] of Object.entries(keywords)) {
      if (searchLower.includes(keyword) || keyword.includes(searchLower)) {
        return this.landmarkImages[landmarkName];
      }
    }

    return null;
  }

  /**
   * Check if landmark has custom images
   */
  hasLandmarkImages(landmarkName) {
    return Boolean(this.landmarkImages[landmarkName] || this.fuzzyMatchLandmark(landmarkName));
  }

  /**
   * Get all available landmarks
   */
  getAllLandmarks() {
    return Object.keys(this.landmarkImages);
  }

  /**
   * Get landmarks by category
   */
  getLandmarksByCategory() {
    // This would require additional categorization data
    // For now, return all landmarks
    return this.getAllLandmarks();
  }

  /**
   * Create image URL with parameters
   */
  createImageUrl(baseUrl, width = 800, height = 400, quality = 80) {
    if (!baseUrl) return null;
    
    // For external URLs (like Unsplash), add parameters
    if (baseUrl.includes('unsplash.com')) {
      return `${baseUrl}&w=${width}&h=${height}&q=${quality}`;
    }
    
    // For local images, return as-is
    return baseUrl;
  }
}

export default new LandmarkImagesService();