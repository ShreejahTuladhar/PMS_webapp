import { apiHelpers } from './api';

class LocationService {
  async getAllParkingSpots(params = {}) {
    try {
      const result = await apiHelpers.get('/locations', { params });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.data,
          pagination: result.data.pagination,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch parking spots',
      };
    }
  }

  async getParkingSpotById(spotId) {
    try {
      const result = await apiHelpers.get(`/locations/${spotId}`);
      
      if (result.success) {
        return {
          success: true,
          parkingSpot: result.data.location,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch parking spot',
      };
    }
  }

  async searchParkingSpots(location, radius = 0.5, filters = {}) {
    try {
      // Validate input parameters before making API call
      if (!location || typeof location !== 'object') {
        return {
          success: false,
          error: 'Invalid location parameter: must be an object with lat and lng properties',
        };
      }
      
      if (!location.lat || !location.lng || 
          isNaN(location.lat) || isNaN(location.lng) ||
          location.lat < -90 || location.lat > 90 ||
          location.lng < -180 || location.lng > 180) {
        return {
          success: false,
          error: 'Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180',
        };
      }
      
      if (radius <= 0 || radius > 50) {
        return {
          success: false,
          error: 'Invalid radius: must be between 0 and 50 km',
        };
      }
      
      // Backend expects different parameter names and maxDistance in meters
      const params = {
        latitude: location.lat,
        longitude: location.lng,
        maxDistance: radius * 1000, // Convert km to meters
        available: filters.isActive || true, // Backend uses 'available' instead of 'isActive'
        limit: filters.limit || 50,
        page: filters.page || 1,
        ...filters,
      };

      // Remove frontend-specific parameters that backend doesn't recognize
      delete params.isActive;
      delete params.sortBy; // Backend automatically sorts by distance when using lat/lng

      console.log('🔍 Search Parameters being sent to backend:', params);
      const result = await apiHelpers.get('/locations', { params });
      console.log('📡 Backend Response:', result);
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.data || result.data.locations || result.data,
          searchLocation: location,
          radius,
          pagination: result.data.pagination,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to search parking spots',
      };
    }
  }

  async getNearbyParkingSpots(lat, lng, radius = 0.5) {
    try {
      // Use the same corrected approach as searchParkingSpots
      const result = await apiHelpers.get('/locations', {
        params: { 
          latitude: lat, 
          longitude: lng, 
          maxDistance: radius * 1000, // Convert km to meters
          available: true
        },
      });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.data || result.data.locations || result.data,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch nearby parking spots',
      };
    }
  }

  async searchParkingSpotsByText(searchText, radius = 0.5, filters = {}) {
    try {
      // Validate input parameters
      if (!searchText || typeof searchText !== 'string' || !searchText.trim()) {
        return {
          success: false,
          error: 'Invalid search text: must be a non-empty string',
        };
      }
      
      if (radius <= 0 || radius > 50) {
        return {
          success: false,
          error: 'Invalid radius: must be between 0 and 50 km',
        };
      }
      
      // Backend expects maxDistance in meters and search parameter
      const params = {
        search: searchText.trim(),
        maxDistance: radius * 1000, // Convert km to meters
        available: filters.isActive || true,
        limit: filters.limit || 50,
        page: filters.page || 1,
        ...filters,
      };

      // Remove frontend-specific parameters that backend doesn't recognize
      delete params.isActive;
      delete params.sortBy; // Backend handles sorting for text searches

      console.log('🔍 Text Search Parameters being sent to backend:', params);
      const result = await apiHelpers.get('/locations', { params });
      console.log('📡 Backend Response:', result);
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.data || result.data.locations || result.data,
          searchInfo: result.data.searchInfo, // Backend provides search metadata
          searchText,
          radius,
          pagination: result.data.pagination,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to search parking spots by text',
      };
    }
  }

  async getPopularSpots(params = {}) {
    try {
      console.info('Using dedicated /locations/popular endpoint');
      
      const result = await apiHelpers.get('/locations/popular', { 
        params: {
          limit: params.limit || 10,
          ...params
        }
      });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.data || result.data,
        };
      } else {
        // Fallback to main locations endpoint if popular endpoint fails
        console.warn('Popular endpoint failed, falling back to main endpoint');
        const fallbackResult = await apiHelpers.get('/locations', { 
          params: {
            limit: params.limit || 10,
            available: true,
            ...params
          }
        });
        
        if (fallbackResult.success) {
          let locations = fallbackResult.data.data || fallbackResult.data.locations || fallbackResult.data;
          
          // Sort by a combination of factors to simulate "popularity"
          locations = locations.sort((a, b) => {
            const aPopularity = (a.totalSpaces || 0) + (a.stats?.totalBookings || 0);
            const bPopularity = (b.totalSpaces || 0) + (b.stats?.totalBookings || 0);
            return bPopularity - aPopularity;
          });
          
          return {
            success: true,
            parkingSpots: locations,
          };
        }
        
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch popular spots',
      };
    }
  }

  async getLocationNamesFromAddresses(params = {}) {
    try {
      console.log('🏗️ Extracting location names from parking spot addresses...');
      
      // Get all parking locations to extract names from addresses
      const result = await apiHelpers.get('/locations', { 
        params: {
          limit: 200, // Get more locations to extract comprehensive location names
          ...params
        }
      });
      
      if (result.success) {
        const locations = result.data.data || result.data.locations || result.data;
        console.log(`📍 Retrieved ${locations.length} parking locations for name extraction`);
        
        // Extract location names from addresses (everything before the first comma)
        const locationMap = new Map(); // Use Map to store unique names with coordinates
        
        locations.forEach(spot => {
          if (spot.address) {
            // Extract name before the first comma
            const locationName = spot.address.split(',')[0].trim();
            
            if (locationName && locationName.length > 2) {
              // If we haven't seen this location name yet, or this spot has better data
              if (!locationMap.has(locationName) || 
                  (spot.coordinates && (!locationMap.get(locationName).coordinates))) {
                
                locationMap.set(locationName, {
                  name: locationName,
                  coordinates: {
                    lat: spot.coordinates?.latitude || spot.coordinates?.lat || 0,
                    lng: spot.coordinates?.longitude || spot.coordinates?.lng || 0
                  },
                  fullAddress: spot.address,
                  spotId: spot.id,
                  spotCount: (locationMap.get(locationName)?.spotCount || 0) + 1
                });
                
                console.log(`  ➤ Extracted location: "${locationName}" at (${spot.coordinates?.latitude || spot.coordinates?.lat}, ${spot.coordinates?.longitude || spot.coordinates?.lng})`);
              } else {
                // Just increment the spot count
                const existing = locationMap.get(locationName);
                existing.spotCount = (existing.spotCount || 0) + 1;
                locationMap.set(locationName, existing);
              }
            }
          }
        });
        
        const extractedLocations = Array.from(locationMap.values())
          .sort((a, b) => b.spotCount - a.spotCount); // Sort by number of spots (popularity)
        
        console.log(`🎯 Extracted ${extractedLocations.length} unique location names:`, extractedLocations);
        
        return {
          success: true,
          locations: extractedLocations,
          totalSpots: locations.length
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to extract location names from addresses',
      };
    }
  }

  async getPopularSearchLocations(params = {}) {
    // Try to get location names from actual parking spot addresses first
    console.info('🔄 Attempting to get location names from parking spot addresses...');
    const addressBasedResult = await this.getLocationNamesFromAddresses(params);
    
    if (addressBasedResult.success && addressBasedResult.locations.length > 0) {
      console.info('✅ Using location names extracted from parking spot addresses');
      // Return just the names for popular locations
      const locationNames = addressBasedResult.locations
        .slice(0, params.limit || 8)
        .map(loc => loc.name);
      
      return {
        success: true,
        locations: locationNames,
        source: 'extracted_from_addresses'
      };
    }
    
    // Fallback to static data if extraction fails
    console.info('🔄 Address extraction failed, using static fallback');
    return {
      success: false,
      error: 'API_NOT_AVAILABLE',
    };
  }

  async getCoordinatesForLocationName(locationName) {
    try {
      console.log(`🗺️ Getting coordinates for location: "${locationName}"`);
      
      // First try to get coordinates from extracted location data
      const extractedResult = await this.getLocationNamesFromAddresses({ limit: 100 });
      
      if (extractedResult.success && extractedResult.locations) {
        const matchingLocation = extractedResult.locations.find(loc => 
          loc.name.toLowerCase() === locationName.toLowerCase()
        );
        
        if (matchingLocation && matchingLocation.coordinates) {
          console.log(`✅ Found coordinates from extracted data: ${matchingLocation.coordinates.lat}, ${matchingLocation.coordinates.lng}`);
          return {
            success: true,
            coordinates: matchingLocation.coordinates,
            source: 'extracted_data'
          };
        }
      }
      
      // Fallback to static kathmanduAreas if needed
      console.log(`🔄 No extracted coordinates found for "${locationName}", using fallback`);
      return {
        success: false,
        error: 'Location not found in database'
      };
    } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get coordinates for location'
    };
  }
}
  
  // TODO: When backend implements this endpoint, remove the early return above and uncomment below
  /*
  try {
    const result = await apiHelpers.get('/locations/popular-search-locations', { 
      params: {
        limit: params.limit || 8,
        period: params.period || '30d',
        ...params
      }
    });
    
    if (result.success) {
      return {
        success: true,
        locations: result.data.locations || result.data,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch popular search locations',
    };
  }
  */

  async getSpotAvailability(spotId, date) {
    try {
      const result = await apiHelpers.get(`/locations/${spotId}/availability`, {
        params: { date },
      });
      
      if (result.success) {
        return {
          success: true,
          availability: result.data.availability,
          timeSlots: result.data.timeSlots,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to check availability',
      };
    }
  }

  async getSpotReviews(spotId, params = {}) {
    try {
      const result = await apiHelpers.get(`/locations/${spotId}/reviews`, { params });
      
      if (result.success) {
        return {
          success: true,
          reviews: result.data.reviews,
          pagination: result.data.pagination,
          averageRating: result.data.averageRating,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch reviews',
      };
    }
  }

  async addSpotReview(spotId, reviewData) {
    try {
      const result = await apiHelpers.post(`/locations/${spotId}/reviews`, reviewData);
      
      if (result.success) {
        return {
          success: true,
          review: result.data.review,
          message: result.data.message || 'Review added successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to add review',
      };
    }
  }

  async updateSpotReview(spotId, reviewId, reviewData) {
    try {
      const result = await apiHelpers.put(`/locations/${spotId}/reviews/${reviewId}`, reviewData);
      
      if (result.success) {
        return {
          success: true,
          review: result.data.review,
          message: result.data.message || 'Review updated successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update review',
      };
    }
  }

  async deleteSpotReview(spotId, reviewId) {
    try {
      const result = await apiHelpers.delete(`/locations/${spotId}/reviews/${reviewId}`);
      
      if (result.success) {
        return {
          success: true,
          message: result.data.message || 'Review deleted successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete review',
      };
    }
  }

  async reportSpot(spotId, reportData) {
    try {
      const result = await apiHelpers.post(`/locations/${spotId}/report`, reportData);
      
      if (result.success) {
        return {
          success: true,
          report: result.data.report,
          message: result.data.message || 'Report submitted successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to submit report',
      };
    }
  }

  async getSpotStatistics(spotId, period = '30d') {
    try {
      const result = await apiHelpers.get(`/locations/${spotId}/statistics`, {
        params: { period },
      });
      
      if (result.success) {
        return {
          success: true,
          statistics: result.data.statistics,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch statistics',
      };
    }
  }

  async favoriteSpot(spotId) {
    try {
      const result = await apiHelpers.post(`/locations/${spotId}/favorite`);
      
      if (result.success) {
        return {
          success: true,
          isFavorite: result.data.isFavorite,
          message: result.data.message || 'Spot added to favorites',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to favorite spot',
      };
    }
  }

  async unfavoriteSpot(spotId) {
    try {
      const result = await apiHelpers.delete(`/locations/${spotId}/favorite`);
      
      if (result.success) {
        return {
          success: true,
          isFavorite: result.data.isFavorite,
          message: result.data.message || 'Spot removed from favorites',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to unfavorite spot',
      };
    }
  }

  async getFavoriteSpots() {
    try {
      const result = await apiHelpers.get('/locations/favorites');
      
      if (result.success) {
        return {
          success: true,
          favorites: result.data.favorites,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch favorite spots',
      };
    }
  }
}

export default new LocationService();