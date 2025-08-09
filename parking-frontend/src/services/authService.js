import { apiHelpers } from './api';

class AuthService {
  async login(credentials) {
    try {
      const result = await apiHelpers.post('/auth/login', credentials);
      
      if (result.success) {
        return {
          success: true,
          user: result.data.user,
          token: result.data.token,
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
        error: error.message || 'Login failed',
      };
    }
  }

  async register(userData) {
    try {
      const result = await apiHelpers.post('/auth/register', userData);
      
      if (result.success) {
        return {
          success: true,
          user: result.data.user,
          token: result.data.token,
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
        error: error.message || 'Registration failed',
      };
    }
  }

  async getProfile(token) {
    try {
      const result = await apiHelpers.get('/auth/me');
      
      if (result.success) {
        return {
          success: true,
          user: result.data.user,
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
        error: error.message || 'Failed to fetch profile',
      };
    }
  }

  async logout(token) {
    try {
      const result = await apiHelpers.post('/auth/logout');
      
      if (result.success) {
        return {
          success: true,
          message: result.data.message || 'Logged out successfully',
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
        error: error.message || 'Logout failed',
      };
    }
  }

  async refreshToken() {
    try {
      const result = await apiHelpers.post('/auth/refresh');
      
      if (result.success) {
        return {
          success: true,
          token: result.data.token,
          user: result.data.user,
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
        error: error.message || 'Token refresh failed',
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const result = await apiHelpers.put('/auth/profile', profileData);
      
      if (result.success) {
        return {
          success: true,
          user: result.data.user,
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
        error: error.message || 'Profile update failed',
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const result = await apiHelpers.post('/auth/change-password', passwordData);
      
      if (result.success) {
        return {
          success: true,
          message: result.data.message || 'Password changed successfully',
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
        error: error.message || 'Password change failed',
      };
    }
  }

  async forgotPassword(email) {
    try {
      const result = await apiHelpers.post('/auth/forgot-password', { email });
      
      if (result.success) {
        return {
          success: true,
          message: result.data.message || 'Reset link sent to your email',
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
        error: error.message || 'Failed to send reset link',
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const result = await apiHelpers.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      
      if (result.success) {
        return {
          success: true,
          message: result.data.message || 'Password reset successful',
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
        error: error.message || 'Password reset failed',
      };
    }
  }
}

export default new AuthService();