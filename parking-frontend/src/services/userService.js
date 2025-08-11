import api from './api';

class UserService {
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      return {
        success: true,
        data: response.data,
        user: response.data.user
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
}

const userService = new UserService();
export default userService;