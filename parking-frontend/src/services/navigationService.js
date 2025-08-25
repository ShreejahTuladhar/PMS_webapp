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
    
    // Multiple routing providers for reliability
    this.providers = {
      // OSRM demo server (may have CORS issues)
      osrm_demo: 'https://router.project-osrm.org/route/v1/driving/',
      // Alternative OSRM servers
      osrm_alt1: 'http://router.project-osrm.org/route/v1/driving/', // HTTP fallback
      // Mock routing for development/testing
      mock: 'mock'
    };
    
    this.currentProvider = 'osrm_demo';
    this.fallbackProviders = ['osrm_alt1', 'mock'];
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
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000 // Accept 5-minute old location
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
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000 // Accept 5-minute old location for tracking
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
   * Calculate route with automatic fallback to multiple providers
   */
  async calculateRoute(start, end, options = {}) {
    let lastError;
    
    // Try primary provider first
    try {
      return await this.calculateRouteOSRM(start, end, options);
    } catch (error) {
      console.warn('🔄 Primary routing failed, trying fallbacks:', error.message);
      lastError = error;
    }
    
    // Try fallback providers
    for (const provider of this.fallbackProviders) {
      try {
        console.log(`🔄 Trying fallback provider: ${provider}`);
        
        if (provider === 'mock') {
          return this.calculateMockRoute(start, end, options);
        } else {
          this.currentProvider = provider;
          return await this.calculateRouteOSRM(start, end, options);
        }
      } catch (error) {
        console.warn(`🔄 Provider ${provider} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If all providers fail, throw the last error
    throw lastError || new Error('All routing providers failed');
  }

  /**
   * Mock route calculation for development/fallback
   */
  calculateMockRoute(start, end, options = {}) {
    console.log('🎭 Using mock routing as fallback');
    
    const normalizedStart = this.normalizeCoordinates(start);
    const normalizedEnd = this.normalizeCoordinates(end);
    
    // Calculate straight line distance
    const distance = this.calculateDistance(
      normalizedStart.lat, normalizedStart.lng,
      normalizedEnd.lat, normalizedEnd.lng
    ) * 1000; // Convert to meters
    
    // Estimate duration (assuming 30 km/h average speed in city)
    const duration = (distance / 1000) * 3.6 * 60; // seconds
    
    // Create simple route geometry (straight line with waypoints)
    const coordinates = [
      [normalizedStart.lng, normalizedStart.lat],
      // Add a middle waypoint for more realistic route
      [
        (normalizedStart.lng + normalizedEnd.lng) / 2,
        (normalizedStart.lat + normalizedEnd.lat) / 2
      ],
      [normalizedEnd.lng, normalizedEnd.lat]
    ];
    
    return {
      provider: 'mock',
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      },
      distance: distance,
      duration: duration,
      instructions: this.generateMockInstructions(normalizedStart, normalizedEnd, distance),
      bounds: this.calculateBounds(coordinates)
    };
  }

  /**
   * Generate mock turn-by-turn instructions
   */
  generateMockInstructions(start, end, totalDistance) {
    const bearing = this.calculateBearing(start.lat, start.lng, end.lat, end.lng);
    const direction = this.bearingToDirection(bearing);
    
    return [
      {
        index: 1,
        instruction: `Head ${direction} toward your destination`,
        distance: totalDistance * 0.8,
        duration: (totalDistance * 0.8 / 1000) * 3.6 * 60,
        location: { lat: start.lat, lng: start.lng },
        type: 'depart',
        modifier: direction,
        roadName: 'Local Road',
        icon: '🚀',
        formattedDistance: this.formatDistance(totalDistance * 0.8),
        formattedDuration: this.formatDuration((totalDistance * 0.8 / 1000) * 3.6 * 60),
        isDestination: false,
        voiceInstruction: `Head ${direction}`
      },
      {
        index: 2,
        instruction: 'You have arrived at your destination',
        distance: totalDistance * 0.2,
        duration: (totalDistance * 0.2 / 1000) * 3.6 * 60,
        location: { lat: end.lat, lng: end.lng },
        type: 'arrive',
        modifier: 'straight',
        roadName: 'Destination',
        icon: '🎯',
        formattedDistance: this.formatDistance(totalDistance * 0.2),
        formattedDuration: this.formatDuration((totalDistance * 0.2 / 1000) * 3.6 * 60),
        isDestination: true,
        voiceInstruction: 'You have arrived'
      }
    ];
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Convert bearing to direction
   */
  bearingToDirection(bearing) {
    const directions = [
      { name: 'north', min: 337.5, max: 360 },
      { name: 'north', min: 0, max: 22.5 },
      { name: 'northeast', min: 22.5, max: 67.5 },
      { name: 'east', min: 67.5, max: 112.5 },
      { name: 'southeast', min: 112.5, max: 157.5 },
      { name: 'south', min: 157.5, max: 202.5 },
      { name: 'southwest', min: 202.5, max: 247.5 },
      { name: 'west', min: 247.5, max: 292.5 },
      { name: 'northwest', min: 292.5, max: 337.5 }
    ];

    return directions.find(dir => bearing >= dir.min && bearing <= dir.max)?.name || 'straight';
  }

  /**
   * Calculate route using OSRM (Open Source Routing Machine) with error handling
   */
  async calculateRouteOSRM(start, end, options = {}) {
    try {
      // Validate and normalize coordinates
      if (!this.validateCoordinates(start)) {
        throw new Error('Invalid start coordinates');
      }
      if (!this.validateCoordinates(end)) {
        throw new Error('Invalid end coordinates');
      }

      const normalizedStart = this.normalizeCoordinates(start);
      const normalizedEnd = this.normalizeCoordinates(end);

      console.log('🔍 Raw start input:', start);
      console.log('🔍 Raw end input:', end);
      console.log('🔍 Normalized start:', normalizedStart);
      console.log('🔍 Normalized end:', normalizedEnd);

      // Round coordinates to 6 decimal places for precision
      const startLng = parseFloat(normalizedStart.lng.toFixed(6));
      const startLat = parseFloat(normalizedStart.lat.toFixed(6));
      const endLng = parseFloat(normalizedEnd.lng.toFixed(6));
      const endLat = parseFloat(normalizedEnd.lat.toFixed(6));

      const { alternatives = false, steps = true } = options;
      
      const baseUrl = this.providers[this.currentProvider] || this.providers.osrm_demo;
      const url = `${baseUrl}${startLng},${startLat};${endLng},${endLat}` +
                  `?alternatives=${alternatives}&steps=${steps}&geometries=geojson&overview=full`;

      console.log(`🗺️ Navigation: Calculating route with ${this.currentProvider}:`, url);
      console.log('🎯 Start coordinates:', { lng: startLng, lat: startLat });
      console.log('🎯 End coordinates:', { lng: endLng, lat: endLat });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        console.error(`❌ OSRM HTTP Error (${this.currentProvider}):`, response.status, response.statusText);
        throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`🗺️ OSRM Response (${this.currentProvider}):`, data);

      if (data.code !== 'Ok') {
        console.error(`❌ OSRM Error Details (${this.currentProvider}):`, {
          code: data.code,
          message: data.message,
          hint: data.hint || 'No additional hint available'
        });
        throw new Error(`OSRM routing failed: ${data.message || data.code || 'Unknown error'}`);
      }

      const route = data.routes[0];
      const routeData = {
        provider: this.currentProvider,
        geometry: route.geometry,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        instructions: this.parseOSRMSteps(route.legs[0].steps),
        bounds: this.calculateBounds(route.geometry.coordinates)
      };

      console.log(`✅ Navigation: Route calculated successfully with ${this.currentProvider}:`, routeData);
      return routeData;
    } catch (error) {
      console.error(`❌ Navigation: ${this.currentProvider} routing failed:`, error);
      throw error;
    }
  }

  /**
   * Parse OSRM step instructions into user-friendly format with enhanced details
   */
  parseOSRMSteps(steps) {
    return steps.map((step, index) => {
      const maneuver = step.maneuver;
      const instruction = this.getInstructionText(maneuver, step.name);
      const isLastStep = index === steps.length - 1;
      
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
        icon: this.getManeuverIcon(maneuver.type, maneuver.modifier),
        formattedDistance: this.formatDistance(step.distance),
        formattedDuration: this.formatDuration(step.duration),
        isDestination: isLastStep && maneuver.type === 'arrive',
        bearingBefore: maneuver.bearing_before,
        bearingAfter: maneuver.bearing_after,
        // Enhanced instruction for voice guidance
        voiceInstruction: this.generateVoiceInstruction(maneuver, step.name, step.distance)
      };
    });
  }

  /**
   * Generate voice-optimized instruction
   */
  generateVoiceInstruction(maneuver, roadName, distance) {
    const { type, modifier } = maneuver;
    const road = roadName && roadName !== 'Unnamed Road' ? roadName : 'the road';
    
    // Voice instructions are shorter and clearer
    const voiceInstructions = {
      'depart': `Head ${this.formatDirection(modifier)}`,
      'turn': `${this.formatTurnInstruction(modifier)}`,
      'continue': `Continue straight`,
      'merge': `Merge ${this.formatDirection(modifier)}`,
      'ramp': `Take the ramp ${this.formatDirection(modifier)}`,
      'roundabout': `Enter roundabout, take ${this.formatRoundaboutExit(modifier)} exit`,
      'arrive': `You have arrived`,
      'fork': `Keep ${this.formatDirection(modifier)}`,
      'end of road': `Turn ${this.formatDirection(modifier)}`
    };

    let voiceInstruction = voiceInstructions[type] || 'Continue';
    
    // Add road name for important maneuvers
    if (['turn', 'merge', 'ramp'].includes(type) && roadName && roadName !== 'Unnamed Road') {
      voiceInstruction += ` onto ${roadName}`;
    }
    
    return voiceInstruction;
  }

  /**
   * Get human-readable instruction text with enhanced descriptions
   */
  getInstructionText(maneuver, roadName) {
    const { type, modifier } = maneuver;
    const road = roadName && roadName !== 'Unnamed Road' ? roadName : 'the road';

    const instructions = {
      'depart': `Start by heading ${this.formatDirection(modifier)} on ${road}`,
      'turn': `${this.formatTurnInstruction(modifier)} onto ${road}`,
      'continue': `Continue straight on ${road}`,
      'merge': `Merge ${this.formatDirection(modifier)} onto ${road}`,
      'ramp': `Take the ${this.formatDirection(modifier)} ramp onto ${road}`,
      'roundabout': `Enter the roundabout and take the ${this.formatRoundaboutExit(modifier)} exit onto ${road}`,
      'rotary': `Enter the rotary and take the ${this.formatRoundaboutExit(modifier)} exit onto ${road}`,
      'roundabout turn': `At the roundabout, take the ${this.formatRoundaboutExit(modifier)} exit onto ${road}`,
      'notification': `Continue on ${road}`,
      'new name': `Continue on ${road}`,
      'arrive': `You have arrived at your destination`,
      'fork': `Keep ${this.formatDirection(modifier)} at the fork onto ${road}`,
      'end of road': `At the end of the road, turn ${this.formatDirection(modifier)} onto ${road}`,
      'use lane': `Use the ${this.formatDirection(modifier)} lane to continue on ${road}`,
      'on ramp': `Take the on-ramp to merge onto ${road}`,
      'off ramp': `Take the off-ramp to ${road}`,
      'ferry': `Take the ferry to ${road}`
    };

    return instructions[type] || `Continue on ${road}`;
  }

  /**
   * Format direction modifier for better readability
   */
  formatDirection(modifier) {
    const directions = {
      'straight': 'straight',
      'slight right': 'slightly right',
      'right': 'right', 
      'sharp right': 'sharp right',
      'uturn': 'around (U-turn)',
      'sharp left': 'sharp left',
      'left': 'left',
      'slight left': 'slightly left'
    };
    
    return directions[modifier] || modifier || 'straight';
  }

  /**
   * Format turn instruction with proper language
   */
  formatTurnInstruction(modifier) {
    const turns = {
      'straight': 'Continue straight',
      'slight right': 'Turn slightly right',
      'right': 'Turn right',
      'sharp right': 'Make a sharp right turn',
      'uturn': 'Make a U-turn',
      'sharp left': 'Make a sharp left turn', 
      'left': 'Turn left',
      'slight left': 'Turn slightly left'
    };
    
    return turns[modifier] || `Turn ${modifier}` || 'Continue';
  }

  /**
   * Format roundabout exit instruction
   */
  formatRoundaboutExit(modifier) {
    const exits = {
      '1': 'first',
      '2': 'second', 
      '3': 'third',
      '4': 'fourth',
      '5': 'fifth',
      '6': 'sixth',
      'straight': 'second',
      'right': 'third',
      'left': 'first'
    };
    
    return exits[modifier] || 'next';
  }

  /**
   * Get icon for maneuver type with enhanced visual indicators
   */
  getManeuverIcon(type, modifier) {
    const icons = {
      'depart': '🚀',
      'turn': this.getTurnIcon(modifier),
      'continue': '⬆️',
      'merge': '🔀',
      'ramp': '🛣️',
      'roundabout': '⟳',
      'rotary': '⟳',
      'roundabout turn': '⟳',
      'arrive': '🎯',
      'fork': '🤔',
      'end of road': '🛑',
      'use lane': '🛣️',
      'on ramp': '↗️',
      'off ramp': '↙️',
      'ferry': '⛴️',
      'notification': 'ℹ️',
      'new name': '📝'
    };

    return icons[type] || this.getTurnIcon(modifier);
  }

  /**
   * Get specific turn icon based on modifier
   */
  getTurnIcon(modifier) {
    const turnIcons = {
      'straight': '⬆️',
      'slight right': '↗️',
      'right': '➡️',
      'sharp right': '↪',
      'uturn': '↩️',
      'sharp left': '↩',
      'left': '⬅️',
      'slight left': '↖️'
    };
    
    return turnIcons[modifier] || '➡️';
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
      const newRoute = await this.calculateRoute(currentLocation, normalizedDestination);
      this.route = newRoute;
      this.instructions = newRoute.instructions;
      
      // Emit route update event
      if (this.onRouteUpdate) {
        this.onRouteUpdate(newRoute);
      }
      
      console.log(`✅ Navigation: Route recalculated with provider: ${newRoute.provider}`);
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
    
    // Array format: [longitude, latitude]
    if (Array.isArray(coords.coordinates) && coords.coordinates.length >= 2) {
      lng = coords.coordinates[0];
      lat = coords.coordinates[1];
    }
    
    // Handle object-type coordinates (complex database structures)
    if (typeof lat === 'object' && lat !== null) {
      console.log('🔍 Navigation: Handling object lat:', lat);
      lat = lat.coordinates?.lat || lat.lat || lat[1] || lat.value || (Array.isArray(lat) ? lat[0] : null);
    }
    if (typeof lng === 'object' && lng !== null) {
      console.log('🔍 Navigation: Handling object lng:', lng);
      lng = lng.coordinates?.lng || lng.lng || lng[0] || lng.value || (Array.isArray(lng) ? lng[1] : null);
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
    
    let { lat, lng } = extracted;
    
    // Auto-correct coordinates for Nepal (lat: ~27-28, lng: ~85-86)
    // If lat is in lng range and lng is in lat range, they're probably swapped
    if (lat > 80 && lat < 90 && lng > 20 && lng < 30) {
      console.warn('⚠️ Navigation: Coordinates appear to be swapped for Nepal region, auto-correcting');
      [lat, lng] = [lng, lat]; // Swap them
    }
    
    // Final validation
    if (!this.validateCoordinateValues(lat, lng, coords)) {
      throw new Error(`Extracted coordinates are out of valid range: lat=${lat}, lng=${lng}`);
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

      // Calculate initial route with automatic fallback
      const route = await this.calculateRoute(this.currentPosition, normalizedDestination, options);
      
      this.destination = normalizedDestination;
      this.route = route;
      this.instructions = route.instructions;

      // Start location tracking
      this.startLocationTracking();

      console.log('✅ Navigation: Navigation started successfully with provider:', route.provider);
      return {
        success: true,
        route: route,
        instructions: route.instructions,
        estimatedTime: Math.ceil(route.duration / 60), // minutes
        distance: (route.distance / 1000).toFixed(1), // km
        provider: route.provider
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
   * Get next instruction based on current location with enhanced logic
   */
  getNextInstruction(currentLocation) {
    if (!this.instructions || this.instructions.length === 0) return null;

    // Find the next upcoming instruction
    let nextInstruction = null;
    let minDistance = Infinity;
    const proximityThreshold = 0.1; // 100 meters

    this.instructions.forEach((instruction, index) => {
      const distance = this.calculateDistance(
        currentLocation.lat, currentLocation.lng,
        instruction.location.lat, instruction.location.lng
      );

      // Only consider instructions that are ahead and within reasonable distance
      if (distance < minDistance && distance > 0.01) { // More than 10 meters away
        minDistance = distance;
        nextInstruction = {
          ...instruction,
          distanceToInstruction: distance,
          isUpcoming: distance < proximityThreshold,
          instructionIndex: index + 1,
          totalInstructions: this.instructions.length
        };
      }
    });

    // If we're very close to an instruction (within 50m), provide enhanced detail
    if (nextInstruction && nextInstruction.distanceToInstruction < 0.05) {
      nextInstruction.urgency = 'immediate';
      nextInstruction.announcement = `In ${this.formatDistance(nextInstruction.distanceToInstruction * 1000)}, ${nextInstruction.instruction}`;
    } else if (nextInstruction && nextInstruction.distanceToInstruction < 0.2) {
      nextInstruction.urgency = 'soon';
      nextInstruction.announcement = `In ${this.formatDistance(nextInstruction.distanceToInstruction * 1000)}, ${nextInstruction.instruction}`;
    } else if (nextInstruction) {
      nextInstruction.urgency = 'normal';
      nextInstruction.announcement = nextInstruction.instruction;
    }

    return nextInstruction;
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
   * Format duration for display with enhanced precision
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes < 1) {
      return '<1m';
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Format distance for display with enhanced precision
   */
  formatDistance(meters) {
    if (meters < 50) {
      return `${Math.round(meters / 10) * 10}m`; // Round to nearest 10m for close distances
    } else if (meters < 1000) {
      return `${Math.round(meters / 50) * 50}m`; // Round to nearest 50m for medium distances
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`; // Show one decimal for short distances
    } else {
      return `${Math.round(meters / 1000)}km`; // Round to whole km for long distances
    }
  }
}

// Create singleton instance
const navigationService = new NavigationService();
export default navigationService;

/**
 * Enhanced Navigation Service Features:
 * - OSRM-based route calculation with real road data
 * - Turn-by-turn directions with precise instructions
 * - Voice-optimized announcements
 * - Distance and time formatting
 * - Route deviation detection and recalculation
 * - Multi-language support ready
 * - Comprehensive maneuver types support
 */