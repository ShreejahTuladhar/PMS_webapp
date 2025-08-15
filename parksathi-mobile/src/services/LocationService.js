/**
 * Location Service for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * GPS and location-based services
 */

import Geolocation from 'react-native-geolocation-service';
import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.isWatching = false;
  }

  // Request location permissions
  async requestLocationPermission() {
    try {
      let permission;
      let rationale;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        rationale = {
          title: 'Location Permission Required',
          message: 'ParkSathi needs access to your location to find nearby parking spaces.',
          buttonPositive: 'Grant Permission',
          buttonNegative: 'Cancel',
        };
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        rationale = {
          title: 'Location Permission Required',
          message: 'ParkSathi needs access to your location to find nearby parking spaces.',
          buttonPositive: 'Grant Permission',
          buttonNegative: 'Cancel',
        };
      }

      const result = await request(permission, rationale);

      switch (result) {
        case RESULTS.GRANTED:
          console.log('Location permission granted');
          return true;
        case RESULTS.DENIED:
          console.log('Location permission denied');
          return false;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Location Permission Blocked',
            'Location permission is blocked. Please enable it in device settings to use location-based features.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Check current location permission status
  async checkLocationPermission() {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  // Get current location once
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      accuracy: 'high',
      timeout: 15000,
      maximumAge: 60000, // 1 minute
      enableHighAccuracy: true,
      ...options
    };

    try {
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission not granted');
        }
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp
            };
            
            this.currentLocation = location;
            this.saveLastKnownLocation(location);
            resolve(location);
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(this.handleLocationError(error));
          },
          defaultOptions
        );
      });
    } catch (error) {
      console.error('Get current location error:', error);
      throw error;
    }
  }

  // Start watching location changes
  async startWatchingLocation(onLocationChange, options = {}) {
    const defaultOptions = {
      accuracy: 'high',
      timeout: 20000,
      maximumAge: 60000,
      enableHighAccuracy: true,
      distanceFilter: 10, // minimum distance (in meters) to trigger update
      ...options
    };

    try {
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission not granted');
        }
      }

      if (this.watchId) {
        this.stopWatchingLocation();
      }

      this.watchId = Geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          
          this.currentLocation = location;
          this.saveLastKnownLocation(location);
          
          if (onLocationChange) {
            onLocationChange(location);
          }
        },
        (error) => {
          console.error('Watch location error:', error);
          if (onLocationChange) {
            onLocationChange(null, this.handleLocationError(error));
          }
        },
        defaultOptions
      );

      this.isWatching = true;
      return this.watchId;
    } catch (error) {
      console.error('Start watching location error:', error);
      throw error;
    }
  }

  // Stop watching location changes
  stopWatchingLocation() {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Get formatted distance string
  getFormattedDistance(distance) {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  // Check if user is within a specific radius of a location
  isWithinRadius(userLat, userLon, targetLat, targetLon, radiusInMeters) {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= radiusInMeters;
  }

  // Get last known location from storage
  async getLastKnownLocation() {
    try {
      const locationData = await AsyncStorage.getItem('last_known_location');
      if (locationData) {
        const location = JSON.parse(locationData);
        // Check if location is not too old (1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (location.timestamp > oneHourAgo) {
          return location;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
  }

  // Save last known location to storage
  async saveLastKnownLocation(location) {
    try {
      await AsyncStorage.setItem('last_known_location', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving last known location:', error);
    }
  }

  // Reverse geocoding (convert coordinates to address)
  async reverseGeocode(latitude, longitude) {
    try {
      // This would integrate with your backend API
      const response = await fetch(
        `https://your-api.com/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  }

  // Forward geocoding (convert address to coordinates)
  async forwardGeocode(address) {
    try {
      // This would integrate with your backend API
      const response = await fetch(
        `https://your-api.com/api/location/geocode?address=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Forward geocoding error:', error);
      throw new Error('Failed to find location');
    }
  }

  // Handle location errors
  handleLocationError(error) {
    let message = 'Location error occurred';
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        message = 'Location permission denied. Please enable location access in settings.';
        break;
      case 2: // POSITION_UNAVAILABLE
        message = 'Location unavailable. Please check your GPS settings.';
        break;
      case 3: // TIMEOUT
        message = 'Location request timed out. Please try again.';
        break;
      default:
        message = `Location error: ${error.message}`;
    }
    
    return new Error(message);
  }

  // Get mock location for development
  getMockLocation() {
    return {
      latitude: 27.7172, // Kathmandu
      longitude: 85.3240,
      accuracy: 5,
      altitude: 1400,
      heading: 0,
      speed: 0,
      timestamp: Date.now()
    };
  }

  // Check if GPS is enabled (Android only)
  async isLocationEnabled() {
    if (Platform.OS === 'android') {
      try {
        const enabled = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return enabled;
      } catch (error) {
        console.error('Error checking GPS status:', error);
        return false;
      }
    }
    return true; // iOS handles this differently
  }

  // Cleanup when service is no longer needed
  cleanup() {
    this.stopWatchingLocation();
    this.currentLocation = null;
  }

  // Get current location or last known location
  async getLocationWithFallback() {
    try {
      return await this.getCurrentLocation();
    } catch (error) {
      console.warn('Failed to get current location, trying last known:', error);
      const lastKnown = await this.getLastKnownLocation();
      if (lastKnown) {
        return lastKnown;
      }
      throw error;
    }
  }
}

export default new LocationService();