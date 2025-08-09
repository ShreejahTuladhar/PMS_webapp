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

  async searchParkingSpots(location, radius = 5, filters = {}) {
    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
        radius,
        ...filters,
      };

      const result = await apiHelpers.get('/locations/search', { params });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.locations,
          searchLocation: location,
          radius,
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

  async getNearbyParkingSpots(lat, lng, radius = 5) {
    try {
      const result = await apiHelpers.get('/locations/nearby', {
        params: { lat, lng, radius },
      });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.locations,
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

  async getPopularSpots(params = {}) {
    try {
      const result = await apiHelpers.get('/locations/popular', { params });
      
      if (result.success) {
        return {
          success: true,
          parkingSpots: result.data.locations,
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
        error: error.message || 'Failed to fetch popular spots',
      };
    }
  }

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