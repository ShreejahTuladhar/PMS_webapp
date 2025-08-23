/**
 * Navigation and Routing Service for ParkSathi
 * Provides comprehensive navigation functionality with multiple routing providers
 */

class NavigationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.isTracking = false;
    this.route = null;
    this.destination = null;
    this.instructions = [];
    
    // Nepal-specific routing providers
    this.providers = {
      osrm: 'https://router.project-osrm.org/route/v1/driving/',
      graphhopper: 'https://graphhopper.com/api/1/route',
      openrouteservice: 'https://api.openrouteservice.org/v2/directions/driving-car'
    };
  }

  /**
   * Get user's current location with high accuracy
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          this.currentPosition = location;
          console.log('📍 Navigation: Current location updated:', location);
          resolve(location);
        },
        (error) => {
          console.error('❌ Navigation: Location error:', error);
          let message = 'Unable to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timeout.';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Accept 1-minute old location
        }
      );
    });
  }

  /**
   * Start tracking user location for navigation
   */
  startLocationTracking(onLocationUpdate, onError) {
    if (this.isTracking) {
      console.log('📍 Navigation: Location tracking already active');
      return;
    }

    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported'));
      return;
    }

    console.log('🎯 Navigation: Starting location tracking');
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: Date.now()
        };

        this.currentPosition = location;
        console.log('📱 Navigation: Location update:', location);
        
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }

        // Check if we need to recalculate route based on deviation
        if (this.route && this.destination) {
          this.checkRouteDeviation(location);
        }
      },
      (error) => {
        console.error('❌ Navigation: Tracking error:', error);
        if (onError) {
          onError(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000 // Accept 5-second old location for tracking
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
      this.isTracking = false;
      console.log('🛑 Navigation: Location tracking stopped');
    }
  }

  /**
   * Calculate route using OSRM (Open Source Routing Machine)
   */
  async calculateRouteOSRM(start, end, options = {}) {
    try {
      // Validate coordinates
      if (!this.validateCoordinates(start)) {
        throw new Error('Invalid start coordinates');
      }
      if (!this.validateCoordinates(end)) {
        throw new Error('Invalid end coordinates');
      }

      const { alternatives = false, steps = true } = options;
      
      const url = `${this.providers.osrm}${start.lng},${start.lat};${end.lng},${end.lat}` +
                  `?alternatives=${alternatives}&steps=${steps}&geometries=geojson&overview=full`;

      console.log('🗺️ Navigation: Calculating route with OSRM:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error(`OSRM routing failed: ${data.message || 'Unknown error'}`);
      }

      const route = data.routes[0];
      const routeData = {
        provider: 'osrm',
        geometry: route.geometry,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        instructions: this.parseOSRMSteps(route.legs[0].steps),
        bounds: this.calculateBounds(route.geometry.coordinates)
      };

      console.log('✅ Navigation: Route calculated successfully:', routeData);
      return routeData;
    } catch (error) {
      console.error('❌ Navigation: OSRM routing failed:', error);
      throw error;
    }
  }

  /**
   * Parse OSRM step instructions into user-friendly format
   */
  parseOSRMSteps(steps) {
    return steps.map((step, index) => {
      const maneuver = step.maneuver;
      const instruction = this.getInstructionText(maneuver, step.name);
      
      return {
        index: index + 1,
        instruction: instruction,
        distance: step.distance,
        duration: step.duration,
        location: {
          lat: maneuver.location[1],
          lng: maneuver.location[0]
        },
        type: maneuver.type,
        modifier: maneuver.modifier,
        roadName: step.name || 'Unnamed Road',
        icon: this.getManeuverIcon(maneuver.type, maneuver.modifier)
      };
    });
  }

  /**
   * Get human-readable instruction text
   */
  getInstructionText(maneuver, roadName) {
    const { type, modifier } = maneuver;
    const road = roadName || 'the road';

    const instructions = {
      'depart': `Head ${modifier} on ${road}`,
      'turn': `Turn ${modifier} onto ${road}`,
      'continue': `Continue on ${road}`,
      'merge': `Merge ${modifier} onto ${road}`,
      'ramp': `Take the ${modifier} ramp onto ${road}`,
      'roundabout': `Take the ${modifier} exit at the roundabout onto ${road}`,
      'arrive': `You have arrived at your destination`
    };

    return instructions[type] || `Continue on ${road}`;
  }

  /**
   * Get icon for maneuver type
   */
  getManeuverIcon(type, modifier) {
    const icons = {
      'depart': '🚀',
      'turn': modifier === 'left' ? '⬅️' : '➡️',
      'continue': '⬆️',
      'merge': '🔄',
      'ramp': '🛣️',
      'roundabout': '🔄',
      'arrive': '🎯'
    };

    return icons[type] || '➡️';
  }

  /**
   * Calculate bounding box for route geometry
   */
  calculateBounds(coordinates) {
    if (!coordinates || coordinates.length === 0) return null;

    let minLat = coordinates[0][1], maxLat = coordinates[0][1];
    let minLng = coordinates[0][0], maxLng = coordinates[0][0];

    coordinates.forEach(([lng, lat]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    return {
      southWest: [minLat, minLng],
      northEast: [maxLat, maxLng]
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check if user has deviated from route
   */
  checkRouteDeviation(currentLocation) {
    if (!this.route || !this.route.geometry) return false;

    const threshold = 50; // 50 meters deviation threshold
    const coordinates = this.route.geometry.coordinates;
    
    let minDistance = Infinity;
    
    // Find closest point on route
    coordinates.forEach(([lng, lat]) => {
      const distance = this.calculateDistance(
        currentLocation.lat, currentLocation.lng,
        lat, lng
      );
      if (distance < minDistance) {
        minDistance = distance;
      }
    });

    if (minDistance > threshold) {
      console.log('🔄 Navigation: Route deviation detected, recalculating...');
      this.recalculateRoute(currentLocation);
      return true;
    }

    return false;
  }

  /**
   * Recalculate route from current position
   */
  async recalculateRoute(currentLocation) {
    if (!this.destination) return;

    try {
      // Validate coordinates before recalculating
      if (!this.validateCoordinates(currentLocation)) {
        console.error('❌ Navigation: Invalid current location for route recalculation');
        return;
      }
      if (!this.validateCoordinates(this.destination)) {
        console.error('❌ Navigation: Invalid destination for route recalculation');
        return;
      }

      const normalizedDestination = this.normalizeCoordinates(this.destination);
      const newRoute = await this.calculateRouteOSRM(currentLocation, normalizedDestination);
      this.route = newRoute;
      this.instructions = newRoute.instructions;
      
      // Emit route update event
      if (this.onRouteUpdate) {
        this.onRouteUpdate(newRoute);
      }
      
      console.log('✅ Navigation: Route recalculated');
    } catch (error) {
      console.error('❌ Navigation: Route recalculation failed:', error);
    }
  }

  /**
   * Extract numeric coordinates from various object structures
   */
  extractCoordinates(coords) {
    if (!coords) return null;
    
    let lat, lng;
    
    // Direct properties
    lat = coords.lat || coords.latitude;
    lng = coords.lng || coords.longitude;
    
    // Nested in coordinates object
    if (!lat || !lng) {
      lat = coords.coordinates?.lat || coords.coordinates?.latitude;
      lng = coords.coordinates?.lng || coords.coordinates?.longitude;
    }
    
    // GeoJSON format
    if (!lat || !lng) {
      lat = coords.geometry?.coordinates?.[1];
      lng = coords.geometry?.coordinates?.[0];
    }
    
    // Other nested formats
    if (!lat || !lng) {
      lat = coords.position?.lat || coords.center?.lat || coords.location?.lat;
      lng = coords.position?.lng || coords.center?.lng || coords.location?.lng;
    }
    
    // Handle object-type coordinates (complex database structures)
    if (typeof lat === 'object' && lat !== null) {
      lat = lat.coordinates?.lat || lat.lat || lat[1] || lat.value;
    }
    if (typeof lng === 'object' && lng !== null) {
      lng = lng.coordinates?.lng || lng.lng || lng[0] || lng.value;
    }
    
    // Convert strings to numbers
    if (typeof lat === 'string') lat = parseFloat(lat);
    if (typeof lng === 'string') lng = parseFloat(lng);
    
    return { lat, lng };
  }
  
  /**
   * Validate coordinates object
   */
  validateCoordinates(coords) {
    if (!coords) {
      console.error('❌ Navigation: Coordinates object is null or undefined');
      return false;
    }
    
    const extracted = this.extractCoordinates(coords);
    if (!extracted) {
      console.error('❌ Navigation: Could not extract coordinates from:', {
        input: coords,
        availableProperties: Object.keys(coords)
      });
      return false;
    }
    
    const { lat, lng } = extracted;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('❌ Navigation: Invalid coordinate types after extraction:', {
        lat: { value: lat, type: typeof lat },
        lng: { value: lng, type: typeof lng },
        originalInput: coords
      });
      return false;
    }
    
    return this.validateCoordinateValues(lat, lng, coords);
  }
  
  /**
   * Validate coordinate values
   */
  validateCoordinateValues(lat, lng, originalCoords) {
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Navigation: Coordinates are NaN:', { lat, lng, originalCoords });
      return false;
    }
    
    if (lat < -90 || lat > 90) {
      console.error('❌ Navigation: Latitude out of range:', lat);
      return false;
    }
    
    if (lng < -180 || lng > 180) {
      console.error('❌ Navigation: Longitude out of range:', lng);
      return false;
    }
    
    return true;
  }

  /**
   * Normalize coordinates to ensure consistent lat/lng properties
   */
  normalizeCoordinates(coords) {
    const extracted = this.extractCoordinates(coords);
    
    if (!extracted || typeof extracted.lat !== 'number' || typeof extracted.lng !== 'number') {
      console.error('❌ Navigation: Failed to normalize coordinates:', {
        input: coords,
        extracted: extracted
      });
      throw new Error('Invalid coordinates provided - could not extract valid lat/lng');
    }
    
    const { lat, lng } = extracted;
    
    // Final validation
    if (!this.validateCoordinateValues(lat, lng, coords)) {
      throw new Error('Extracted coordinates are out of valid range');
    }
    
    return { lat, lng };
  }

  /**
   * Start navigation to destination
   */
  async startNavigation(destination, options = {}) {
    try {
      console.log('🧭 Navigation: Starting navigation to:', destination);
      
      // Validate and normalize destination coordinates
      if (!this.validateCoordinates(destination)) {
        throw new Error('Invalid destination coordinates');
      }
      const normalizedDestination = this.normalizeCoordinates(destination);
      
      // Get current location if not available
      if (!this.currentPosition) {
        await this.getCurrentLocation();
      }

      // Validate current position
      if (!this.validateCoordinates(this.currentPosition)) {
        throw new Error('Invalid current location coordinates');
      }

      // Calculate initial route
      const route = await this.calculateRouteOSRM(this.currentPosition, normalizedDestination, options);
      
      this.destination = normalizedDestination;
      this.route = route;
      this.instructions = route.instructions;

      // Start location tracking
      this.startLocationTracking();

      console.log('✅ Navigation: Navigation started successfully');
      return {
        success: true,
        route: route,
        instructions: route.instructions,
        estimatedTime: Math.ceil(route.duration / 60), // minutes
        distance: (route.distance / 1000).toFixed(1) // km
      };

    } catch (error) {
      console.error('❌ Navigation: Failed to start navigation:', error);
      throw error;
    }
  }

  /**
   * Stop navigation
   */
  stopNavigation() {
    this.stopLocationTracking();
    this.route = null;
    this.destination = null;
    this.instructions = [];
    
    console.log('🛑 Navigation: Navigation stopped');
  }

  /**
   * Get next instruction based on current location
   */
  getNextInstruction(currentLocation) {
    if (!this.instructions || this.instructions.length === 0) return null;

    // Find closest instruction
    let closestInstruction = null;
    let minDistance = Infinity;

    this.instructions.forEach(instruction => {
      const distance = this.calculateDistance(
        currentLocation.lat, currentLocation.lng,
        instruction.location.lat, instruction.location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestInstruction = instruction;
      }
    });

    return closestInstruction;
  }

  /**
   * Open external navigation apps
   */
  openExternalNavigation(destination, app = 'auto') {
    console.log('🧭 Navigation: Attempting to open external navigation with destination:', destination);
    
    if (!this.validateCoordinates(destination)) {
      console.error('❌ Navigation: Invalid destination coordinates for external navigation');
      throw new Error('Invalid destination coordinates');
    }

    const normalizedDestination = this.normalizeCoordinates(destination);
    const { lat, lng } = normalizedDestination;
    
    console.log('🧭 Navigation: Normalized coordinates for external navigation:', { lat, lng });
    
    const urls = {
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      apple: `http://maps.apple.com/?daddr=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      baato: `https://baato.io/directions?destination=${lat},${lng}`, // Nepal-specific
      auto: this.detectBestNavigationApp(lat, lng)
    };

    const url = urls[app] || urls.auto;
    window.open(url, '_blank');
    
    console.log('🔗 Navigation: Opened external navigation:', app, url);
  }

  /**
   * Detect best navigation app based on platform
   */
  detectBestNavigationApp(lat, lng) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return `http://maps.apple.com/?daddr=${lat},${lng}`;
    } else if (isAndroid) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// Create singleton instance
const navigationService = new NavigationService();
export default navigationService;