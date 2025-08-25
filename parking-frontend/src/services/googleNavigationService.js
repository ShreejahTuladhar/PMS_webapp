/**
 * Google Maps Navigation Service for ParkSathi
 * Primary navigation system using Google Maps Platform APIs
 */

class GoogleNavigationService {
  constructor() {
    this.currentLocation = null;
    this.isLocationTracking = false;
    this.watchId = null;
    this.locationCallbacks = new Set();
  }

  /**
   * Initialize location tracking on page load
   */
  async initializeLocation() {
    try {
      console.log('🌍 GoogleNav: Initializing user location...');
      
      // Request location permission and get current position
      const location = await this.getCurrentLocation();
      this.currentLocation = location;
      
      console.log('✅ GoogleNav: Location initialized:', location);
      
      // Start continuous tracking
      this.startLocationTracking();
      
      return location;
    } catch (error) {
      console.error('❌ GoogleNav: Location initialization failed:', error);
      throw new Error(`Location access failed: ${error.message}`);
    }
  }

  /**
   * Get user's current location with high accuracy
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Show loading state
      console.log('📍 GoogleNav: Getting current location...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            source: 'gps'
          };
          
          console.log('✅ GoogleNav: Location acquired:', location);
          resolve(location);
        },
        (error) => {
          console.error('❌ GoogleNav: Location error:', error);
          let message = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location permissions and refresh the page.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              message = 'Location request timeout. Please try again.';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // Accept 1-minute old location
        }
      );
    });
  }

  /**
   * Start continuous location tracking
   */
  startLocationTracking() {
    if (this.isLocationTracking) {
      console.log('📱 GoogleNav: Location tracking already active');
      return;
    }

    if (!navigator.geolocation) {
      console.error('❌ GoogleNav: Geolocation not supported');
      return;
    }

    console.log('🎯 GoogleNav: Starting location tracking...');
    this.isLocationTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: Date.now(),
          source: 'tracking'
        };

        this.currentLocation = location;
        console.log('📱 GoogleNav: Location updated:', location);

        // Notify all callbacks
        this.locationCallbacks.forEach(callback => {
          try {
            callback(location);
          } catch (error) {
            console.error('❌ GoogleNav: Location callback error:', error);
          }
        });
      },
      (error) => {
        console.error('❌ GoogleNav: Tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000 // Accept 10-second old location for tracking
      }
    );
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isLocationTracking = false;
      console.log('🛑 GoogleNav: Location tracking stopped');
    }
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback) {
    this.locationCallbacks.add(callback);
    
    // Immediately call with current location if available
    if (this.currentLocation) {
      callback(this.currentLocation);
    }
  }

  /**
   * Unsubscribe from location updates
   */
  offLocationUpdate(callback) {
    this.locationCallbacks.delete(callback);
  }

  /**
   * Open Google Maps Navigation (Primary Navigation Method)
   */
  navigateWithGoogleMaps(destination, userLocation = null) {
    try {
      console.log('🗺️ GoogleNav: Opening Google Maps navigation to:', destination);
      
      const startLocation = userLocation || this.currentLocation;
      
      // Validate coordinates
      const coords = this.extractCoordinates(destination);
      if (!coords.valid) {
        throw new Error(`Invalid destination coordinates: ${coords.error}`);
      }

      // Build Google Maps URL
      let googleMapsUrl;
      
      if (startLocation) {
        // With start location (directions)
        googleMapsUrl = `https://www.google.com/maps/dir/${startLocation.lat},${startLocation.lng}/${coords.lat},${coords.lng}/@${coords.lat},${coords.lng},15z`;
      } else {
        // Direct navigation to destination
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
      }

      // Add destination name if available
      if (destination.name) {
        googleMapsUrl += `&query=${encodeURIComponent(destination.name)}`;
      }

      console.log('🔗 GoogleNav: Opening URL:', googleMapsUrl);
      
      // Open in new tab/window
      window.open(googleMapsUrl, '_blank');
      
      return {
        success: true,
        provider: 'google_maps',
        url: googleMapsUrl,
        method: 'external'
      };

    } catch (error) {
      console.error('❌ GoogleNav: Google Maps navigation failed:', error);
      throw error;
    }
  }

  /**
   * Open Google Maps app on mobile devices
   */
  openGoogleMapsApp(destination, userLocation = null) {
    try {
      const coords = this.extractCoordinates(destination);
      if (!coords.valid) {
        throw new Error(`Invalid destination coordinates: ${coords.error}`);
      }

      const startLocation = userLocation || this.currentLocation;
      
      // Detect mobile platform
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let appUrl;
      
      if (isIOS) {
        // iOS Google Maps app URL
        if (startLocation) {
          appUrl = `comgooglemaps://?saddr=${startLocation.lat},${startLocation.lng}&daddr=${coords.lat},${coords.lng}&directionsmode=driving`;
        } else {
          appUrl = `comgooglemaps://?q=${coords.lat},${coords.lng}`;
        }
      } else if (isAndroid) {
        // Android Google Maps app intent
        if (startLocation) {
          appUrl = `google.navigation:q=${coords.lat},${coords.lng}&mode=d`;
        } else {
          appUrl = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${coords.lng}`;
        }
      } else {
        // Fallback to web version
        return this.navigateWithGoogleMaps(destination, userLocation);
      }

      console.log('📱 GoogleNav: Opening app with URL:', appUrl);
      
      // Try to open app, fallback to web if fails
      const startTime = Date.now();
      window.location.href = appUrl;
      
      // Fallback to web after 2 seconds if app doesn't open
      setTimeout(() => {
        if (Date.now() - startTime > 2000) {
          console.log('📱 GoogleNav: App didn\'t open, falling back to web');
          this.navigateWithGoogleMaps(destination, userLocation);
        }
      }, 2000);
      
      return {
        success: true,
        provider: 'google_maps_app',
        url: appUrl,
        method: 'app'
      };

    } catch (error) {
      console.error('❌ GoogleNav: Google Maps app navigation failed:', error);
      // Fallback to web version
      return this.navigateWithGoogleMaps(destination, userLocation);
    }
  }

  /**
   * Smart navigation - chooses best method based on device
   */
  navigate(destination, options = {}) {
    const { preferApp = true, userLocation = null } = options;
    
    try {
      console.log('🧭 GoogleNav: Starting smart navigation to:', destination);
      
      // Use current location if not provided
      const startLocation = userLocation || this.currentLocation;
      
      if (!startLocation) {
        console.warn('⚠️ GoogleNav: No start location available, using destination only');
      }

      // Check if we should prefer app over web
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (preferApp && isMobile) {
        return this.openGoogleMapsApp(destination, startLocation);
      } else {
        return this.navigateWithGoogleMaps(destination, startLocation);
      }
      
    } catch (error) {
      console.error('❌ GoogleNav: Smart navigation failed:', error);
      throw error;
    }
  }

  /**
   * Extract and validate coordinates from various formats
   */
  extractCoordinates(destination) {
    if (!destination) {
      return { valid: false, error: 'No destination provided' };
    }

    let lat, lng;

    // Direct lat/lng properties
    if (typeof destination.lat === 'number' && typeof destination.lng === 'number') {
      lat = destination.lat;
      lng = destination.lng;
    }
    // Coordinates object
    else if (destination.coordinates) {
      if (typeof destination.coordinates.lat === 'number' && typeof destination.coordinates.lng === 'number') {
        lat = destination.coordinates.lat;
        lng = destination.coordinates.lng;
      }
      // Array format [lat, lng]
      else if (Array.isArray(destination.coordinates) && destination.coordinates.length >= 2) {
        lat = destination.coordinates[0];
        lng = destination.coordinates[1];
      }
    }
    // Array format [lat, lng]
    else if (Array.isArray(destination) && destination.length >= 2) {
      lat = destination[0];
      lng = destination[1];
    }

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return { valid: false, error: 'Invalid coordinate format' };
    }

    if (lat < -90 || lat > 90) {
      return { valid: false, error: 'Latitude out of range (-90 to 90)' };
    }

    if (lng < -180 || lng > 180) {
      return { valid: false, error: 'Longitude out of range (-180 to 180)' };
    }

    return { valid: true, lat, lng };
  }

  /**
   * Get current location for external use
   */
  getCurrentLocationSync() {
    return this.currentLocation;
  }

  /**
   * Check if location services are available
   */
  isLocationAvailable() {
    return navigator.geolocation && this.currentLocation !== null;
  }

  /**
   * Format location for display
   */
  formatLocation(location) {
    if (!location) return 'Location unavailable';
    
    return {
      coordinates: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      accuracy: `±${Math.round(location.accuracy || 0)}m`,
      lastUpdated: new Date(location.timestamp).toLocaleTimeString()
    };
  }
}

// Create singleton instance
const googleNavigationService = new GoogleNavigationService();
export default googleNavigationService;

/**
 * Google Navigation Service Features:
 * - Automatic location initialization on page load
 * - Continuous location tracking
 * - Smart navigation (app vs web based on device)
 * - Google Maps integration as primary navigation
 * - Robust error handling and fallbacks
 * - Location permission management
 * - Real-time location updates
 */