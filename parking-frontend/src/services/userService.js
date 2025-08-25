import api from './api';

class UserService {
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      return {
        success: true,
        data: response.data,
        user: response.data.data || response.data.user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/change-password', passwordData);
      
      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password'
      };
    }
  }

  async updatePreferences(preferencesData) {
    try {
      const response = await api.put('/users/preferences', preferencesData);
      
      return {
        success: true,
        data: response.data,
        preferences: response.data.preferences
      };
    } catch (error) {
      console.error('Preferences update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences'
      };
    }
  }

  async deleteAccount() {
    try {
      const response = await api.delete('/users/account');
      
      return {
        success: true,
        message: response.data.message || 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete account'
      };
    }
  }

  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      
      return {
        success: true,
        data: response.data,
        user: response.data.user
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }

  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data,
        avatarUrl: response.data.avatarUrl
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload avatar'
      };
    }
  }

  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      
      return {
        success: true,
        totalBookings: response.data.totalBookings || 0,
        totalSpent: response.data.totalSpent || 0,
        savedAmount: response.data.savedAmount || 0,
        averageBookingValue: response.data.averageBookingValue || 0,
        totalHoursParked: response.data.totalHoursParked || 0,
        favoriteLocation: response.data.favoriteLocation || ''
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user statistics'
      };
    }
  }

  async getUserBookings(params = {}) {
    try {
      const response = await api.get('/users/bookings', { params });
      
      return {
        success: true,
        bookings: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Get user bookings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user bookings'
      };
    }
  }

  async getTransactionHistory(params = {}) {
    try {
      const response = await api.get('/users/transactions', { params });
      
      return {
        success: true,
        transactions: response.data.transactions || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Get transaction history error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transaction history'
      };
    }
  }

  async getUserVehicles() {
    try {
      const response = await api.get('/users/vehicles');
      
      return {
        success: true,
        vehicles: response.data.vehicles || []
      };
    } catch (error) {
      console.error('Get user vehicles error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch vehicles'
      };
    }
  }

  async addVehicle(vehicleData) {
    try {
      const response = await api.post('/users/vehicles', vehicleData);
      
      return {
        success: true,
        vehicle: response.data.vehicle,
        message: response.data.message || 'Vehicle added successfully'
      };
    } catch (error) {
      console.error('Add vehicle error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add vehicle'
      };
    }
  }

  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await api.put(`/users/vehicles/${vehicleId}`, vehicleData);
      
      return {
        success: true,
        vehicle: response.data.vehicle,
        message: response.data.message || 'Vehicle updated successfully'
      };
    } catch (error) {
      console.error('Update vehicle error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update vehicle'
      };
    }
  }

  async deleteVehicle(vehicleId) {
    try {
      const response = await api.delete(`/users/vehicles/${vehicleId}`);
      
      return {
        success: true,
        message: response.data.message || 'Vehicle deleted successfully'
      };
    } catch (error) {
      console.error('Delete vehicle error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete vehicle'
      };
    }
  }

  async getFavoriteLocations() {
    try {
      const response = await api.get('/users/favorites');
      
      return {
        success: true,
        favorites: response.data.favorites || []
      };
    } catch (error) {
      console.error('Get favorite locations error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch favorite locations'
      };
    }
  }

  async addFavoriteLocation(locationId) {
    try {
      const response = await api.post('/users/favorites', { locationId });
      
      return {
        success: true,
        message: response.data.message || 'Location added to favorites'
      };
    } catch (error) {
      console.error('Add favorite location error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add favorite location'
      };
    }
  }

  async removeFavoriteLocation(locationId) {
    try {
      const response = await api.delete(`/users/favorites/${locationId}`);
      
      return {
        success: true,
        message: response.data.message || 'Location removed from favorites'
      };
    } catch (error) {
      console.error('Remove favorite location error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove favorite location'
      };
    }
  }

  async exportUserData() {
    try {
      const response = await api.get('/users/export', {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Export user data error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export user data'
      };
    }
  }

  async enableTwoFactor() {
    try {
      const response = await api.post('/users/2fa/enable');
      
      return {
        success: true,
        qrCode: response.data.qrCode,
        secret: response.data.secret,
        backupCodes: response.data.backupCodes
      };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to enable two-factor authentication'
      };
    }
  }

  async verifyTwoFactor(token) {
    try {
      const response = await api.post('/users/2fa/verify', { token });
      
      return {
        success: true,
        message: response.data.message || 'Two-factor authentication enabled successfully'
      };
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify two-factor authentication'
      };
    }
  }

  async disableTwoFactor(password) {
    try {
      const response = await api.post('/users/2fa/disable', { password });
      
      return {
        success: true,
        message: response.data.message || 'Two-factor authentication disabled successfully'
      };
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable two-factor authentication'
      };
    }
  }
}

const userService = new UserService();
export default userService;