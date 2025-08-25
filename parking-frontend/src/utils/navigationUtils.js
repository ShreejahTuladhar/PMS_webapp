/**
 * 🗺️ Navigation Utilities for External Maps Integration
 * 
 * Provides robust coordinate extraction and validation for 
 * Google Maps and Waze navigation integration.
 */

/**
 * Extract and validate coordinates from various data formats
 */
export function extractCoordinates(locationData) {
  if (!locationData) {
    console.error('❌ No location data provided');
    return { lat: null, lng: null, error: 'No location data provided' };
  }

  // console.log('🔍 Extracting coordinates from:', locationData);

  let lat = null;
  let lng = null;

  try {
    // Method 1: Direct lat/lng properties
    if (typeof locationData.lat === 'number' && typeof locationData.lng === 'number') {
      console.log('✅ Method 1: Direct lat/lng properties');
      lat = locationData.lat;
      lng = locationData.lng;
    }
    // Method 2: Direct latitude/longitude properties
    else if (typeof locationData.latitude === 'number' && typeof locationData.longitude === 'number') {
      console.log('✅ Method 2: Direct latitude/longitude properties');
      lat = locationData.latitude;
      lng = locationData.longitude;
    }
    // Method 3: Coordinates object with lat/lng
    else if (locationData.coordinates) {
      const coords = locationData.coordinates;
      console.log('🔍 Method 3: Coordinates object found:', { coords, isArray: Array.isArray(coords) });
      
      // GeoJSON format: coordinates.coordinates: [lng, lat]
      if (Array.isArray(coords.coordinates) && coords.coordinates.length >= 2) {
        console.log('✅ Method 3a: GeoJSON nested coordinates');
        lng = coords.coordinates[0]; // longitude first in GeoJSON
        lat = coords.coordinates[1];  // latitude second
      }
      // Direct coordinates array: [lat, lng] (our app's format)
      else if (Array.isArray(coords) && coords.length >= 2) {
        // console.log('✅ Method 3b: Direct coordinates array [lat, lng]');
        lat = coords[0];  // latitude first in our format
        lng = coords[1];  // longitude second
      }
      // Coordinates object with direct properties
      else if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        console.log('✅ Method 3c: Coordinates object lat/lng');
        lat = coords.lat;
        lng = coords.lng;
      }
      else if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
        console.log('✅ Method 3d: Coordinates object latitude/longitude');
        lat = coords.latitude;
        lng = coords.longitude;
      }
      else {
        console.log('⚠️ Method 3: No matching coordinate format found');
      }
    }
    // Method 5: Direct GeoJSON array format in root
    else if (Array.isArray(locationData) && locationData.length >= 2) {
      lng = locationData[0]; // longitude first in GeoJSON
      lat = locationData[1];  // latitude second
    }
    // Method 6: String parsing
    else if (typeof locationData.lat === 'string' || typeof locationData.lng === 'string') {
      lat = parseFloat(locationData.lat);
      lng = parseFloat(locationData.lng);
    }

    // Convert to numbers if they're strings
    if (typeof lat === 'string') lat = parseFloat(lat);
    if (typeof lng === 'string') lng = parseFloat(lng);

    // console.log('📊 Extraction result before validation:', { lat, lng, latType: typeof lat, lngType: typeof lng });
    
    // Validate coordinates
    const validation = validateCoordinates(lat, lng);
    
    // console.log('📊 Final result:', { lat, lng, valid: validation.valid, error: validation.error });
    
    return {
      lat,
      lng,
      valid: validation.valid,
      error: validation.error
    };
    
  } catch (error) {
    console.error('❌ Error extracting coordinates:', error);
    return { 
      lat: null, 
      lng: null, 
      error: `Coordinate extraction failed: ${error.message}` 
    };
  }
}

/**
 * Validate coordinate values
 */
export function validateCoordinates(lat, lng) {
  // Check if values exist and are numbers
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { valid: false, error: 'Missing latitude or longitude' };
  }

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Invalid coordinate format - not numbers' };
  }

  // Check coordinate ranges
  if (lat < -90 || lat > 90) {
    return { valid: false, error: `Invalid latitude: ${lat} (must be -90 to 90)` };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: `Invalid longitude: ${lng} (must be -180 to 180)` };
  }

  // Check if coordinates are in Nepal (rough bounds)
  const nepalBounds = {
    north: 30.5,
    south: 26.3,
    east: 88.3,
    west: 80.0
  };

  if (lat < nepalBounds.south || lat > nepalBounds.north || 
      lng < nepalBounds.west || lng > nepalBounds.east) {
    console.warn('⚠️ Coordinates outside Nepal boundaries:', { lat, lng });
    // Don't return invalid - just warn, as this might be intentional
  }

  return { valid: true, error: null };
}

/**
 * Open Google Maps navigation
 */
export function openGoogleMapsNavigation(destination, options = {}) {
  console.log('🗺️ Opening Google Maps navigation to:', destination);
  
  const coords = extractCoordinates(destination);
  
  if (!coords.valid) {
    console.error('❌ Invalid coordinates for Google Maps:', coords.error);
    throw new Error(`Cannot open Google Maps: ${coords.error}`);
  }

  console.log('✅ Extracted coordinates:', coords);

  // Build Google Maps URL
  let url = 'https://www.google.com/maps/dir/?api=1';
  
  // Add destination coordinates
  url += `&destination=${coords.lat},${coords.lng}`;
  
  // Add destination name if available
  if (destination.name) {
    url += `&destination_place_id=${encodeURIComponent(destination.name)}`;
  }
  
  // Add travel mode if specified
  if (options.travelMode) {
    const modes = {
      driving: 'driving',
      walking: 'walking',
      bicycling: 'bicycling',
      transit: 'transit'
    };
    if (modes[options.travelMode]) {
      url += `&travelmode=${modes[options.travelMode]}`;
    }
  }

  console.log('🔗 Opening Google Maps URL:', url);
  
  try {
    window.open(url, '_blank');
    return { success: true, url };
  } catch (error) {
    console.error('❌ Failed to open Google Maps:', error);
    throw new Error(`Failed to open Google Maps: ${error.message}`);
  }
}


/**
 * Test navigation with current location
 */
export async function testNavigationWithCurrentLocation(destination) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log('📍 Current location:', currentLocation);
        console.log('🎯 Destination:', destination);

        // Test coordinate extraction
        const coords = extractCoordinates(destination);
        
        if (coords.valid) {
          const distance = calculateDistance(
            currentLocation.lat, currentLocation.lng,
            coords.lat, coords.lng
          );
          
          resolve({
            success: true,
            currentLocation,
            destination: coords,
            distance: `${distance.toFixed(2)} km`,
            message: 'Navigation test successful'
          });
        } else {
          reject(new Error(coords.error));
        }
      },
      (error) => {
        reject(new Error(`Could not get current location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Calculate distance between two coordinates
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng, precision = 6) {
  if (isNaN(lat) || isNaN(lng)) {
    return 'Invalid coordinates';
  }
  
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Check if device supports navigation
 */
export function checkNavigationSupport() {
  return {
    geolocation: 'geolocation' in navigator,
    permissions: 'permissions' in navigator,
    userAgent: navigator.userAgent,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent)
  };
}