/**
 * API Service for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Centralized API communication service
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Base configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle common responses
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshAuthToken(refreshToken);
              if (response.success) {
                await AsyncStorage.setItem('auth_token', response.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // Redirect to login if token refresh fails
          await this.handleAuthFailure();
        }

        // Handle network errors
        if (!error.response) {
          Alert.alert(
            'Network Error',
            'Please check your internet connection and try again.'
          );
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async handleAuthFailure() {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      // Navigation reset would be handled by the app's auth context
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Generic request methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.api.post(endpoint, data);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.api.put(endpoint, data);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // File upload method
  async upload(endpoint, formData) {
    try {
      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    let message = 'An unexpected error occurred';
    let status = 0;

    if (error.response) {
      status = error.response.status;
      message = error.response.data?.message || error.response.data?.error || message;
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message;
    }

    return {
      success: false,
      error: message,
      status,
      data: null
    };
  }

  // Auth endpoints
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.handleAuthFailure();
    }
  }

  async refreshAuthToken(refreshToken) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async forgotPassword(email) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, password) {
    return this.post('/auth/reset-password', { token, password });
  }

  // User endpoints
  async getCurrentUser() {
    return this.get('/users/me');
  }

  async updateProfile(userData) {
    return this.put('/users/profile', userData);
  }

  async uploadProfileImage(imageUri) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    return this.upload('/users/profile-image', formData);
  }

  // Parking endpoints
  async searchParkings(params) {
    return this.get('/parking/search', params);
  }

  async getNearbyParkings(params) {
    return this.get('/parking/nearby', params);
  }

  async getParkingDetails(parkingId) {
    return this.get(`/parking/${parkingId}`);
  }

  async checkAvailability(parkingId, params) {
    return this.get(`/parking/${parkingId}/availability`, params);
  }

  // Booking endpoints
  async createBooking(bookingData) {
    return this.post('/bookings', bookingData);
  }

  async getBookings(params = {}) {
    return this.get('/bookings', params);
  }

  async getBookingDetails(bookingId) {
    return this.get(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId) {
    return this.put(`/bookings/${bookingId}/cancel`);
  }

  async extendBooking(bookingId, extension) {
    return this.put(`/bookings/${bookingId}/extend`, extension);
  }

  async getActiveBooking() {
    return this.get('/bookings/active');
  }

  // Payment endpoints
  async processPayment(paymentData) {
    return this.post('/payments/process', paymentData);
  }

  async getPaymentMethods() {
    return this.get('/payments/methods');
  }

  async addPaymentMethod(methodData) {
    return this.post('/payments/methods', methodData);
  }

  async removePaymentMethod(methodId) {
    return this.delete(`/payments/methods/${methodId}`);
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    return this.get('/notifications', params);
  }

  async markNotificationRead(notificationId) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  async updateNotificationSettings(settings) {
    return this.put('/notifications/settings', settings);
  }

  // Analytics endpoints
  async trackEvent(eventData) {
    return this.post('/analytics/events', eventData);
  }

  async getSearchTrends() {
    return this.get('/analytics/search-trends');
  }

  // Location-based services
  async reverseGeocode(latitude, longitude) {
    return this.get('/location/reverse-geocode', { latitude, longitude });
  }

  async getLocationSuggestions(query) {
    return this.get('/location/suggestions', { q: query });
  }

  // Support endpoints
  async submitFeedback(feedback) {
    return this.post('/support/feedback', feedback);
  }

  async reportIssue(issue) {
    return this.post('/support/issues', issue);
  }

  async getFAQs() {
    return this.get('/support/faqs');
  }

  // Utility methods
  isOnline() {
    return navigator.onLine;
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  // Cache management
  async clearCache() {
    try {
      // Clear any cached data
      await AsyncStorage.removeItem('api_cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new ApiService();