import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { extractCoordinates, openGoogleMapsNavigation } from '../../utils/navigationUtils';
import navigationService from '../../services/navigationService';

// Enhanced navigation service with voice guidance
class UnifiedNavigationService {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.currentVoice = null;
    this.isVoiceEnabled = true;
    this.lastSpokenInstruction = null;
    this.lastSpeakTime = null;
    this.watchId = null;
    this.isTracking = false;
    this.currentRoute = null;
    this.routeInstructions = [];
  }

  initializeVoice() {
    if (!this.speechSynthesis) return false;

    const voices = this.speechSynthesis.getVoices();
    this.currentVoice = voices.find(voice => 
      voice.lang.includes('en') && !voice.name.includes('Google')
    ) || voices[0];

    return true;
  }

  speak(text, priority = 'normal') {
    if (!this.isVoiceEnabled || !this.speechSynthesis || !text) return;

    if (this.lastSpokenInstruction === text && priority !== 'high') return;

    if (priority === 'high') {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.currentVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onend = () => {
      this.lastSpokenInstruction = text;
    };

    this.speechSynthesis.speak(utterance);
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

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

  generateInstruction(fromLat, fromLng, toLat, toLng, distance) {
    const bearing = this.calculateBearing(fromLat, fromLng, toLat, toLng);
    const direction = this.bearingToDirection(bearing);
    
    if (distance > 1) {
      return `Continue ${direction} for ${distance.toFixed(1)} kilometers`;
    } else if (distance > 0.1) {
      return `Continue ${direction} for ${(distance * 1000).toFixed(0)} meters`;
    } else {
      return `You have arrived at your destination`;
    }
  }

  formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  formatDuration(minutes) {
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000
        }
      );
    });
  }

  startLocationTracking(onUpdate, onError) {
    if (this.isTracking || !navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        };
        onUpdate(location);
      },
      onError,
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000
      }
    );

    this.isTracking = true;
  }

  stopLocationTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  async calculateRoute(start, destination) {
    try {
      console.log('🗺️ UnifiedNavigation: Calculating route from', start, 'to', destination);
      
      // Use the existing navigationService for OSRM routing
      const routeData = await navigationService.calculateRoute(start, destination, {
        alternatives: false,
        steps: true
      });
      
      console.log('✅ UnifiedNavigation: Route calculated successfully:', routeData);
      
      this.currentRoute = routeData;
      this.routeInstructions = routeData.instructions || [];
      
      return routeData;
    } catch (error) {
      console.error('❌ UnifiedNavigation: Route calculation failed:', error);
      throw new Error(`Route calculation failed: ${error.message}`);
    }
  }

  getRouteCoordinates() {
    if (!this.currentRoute || !this.currentRoute.geometry || !this.currentRoute.geometry.coordinates) {
      return [];
    }

    // Convert from [lng, lat] to [lat, lng] for Leaflet
    return this.currentRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }

  getCurrentInstruction(currentLocation) {
    if (!this.routeInstructions || this.routeInstructions.length === 0) {
      return null;
    }

    // Find closest upcoming instruction
    let closestInstruction = null;
    let minDistance = Infinity;

    this.routeInstructions.forEach(instruction => {
      if (instruction.location) {
        const distance = this.calculateDistance(
          currentLocation.lat, currentLocation.lng,
          instruction.location.lat, instruction.location.lng
        );

        if (distance < minDistance && distance > 0.01) { // Only upcoming instructions (>10m away)
          minDistance = distance;
          closestInstruction = instruction;
        }
      }
    });

    return closestInstruction;
  }
}

// Map component
const NavigationMap = ({ currentLocation, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 16);
    }
  }, [currentLocation, map]);

  return null;
};

// Custom icons
const createCurrentLocationIcon = () => {
  return L.divIcon({
    html: `<div style="width: 16px; height: 16px; background: linear-gradient(45deg, #2563EB, #1D4ED8); border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);"></div>`,
    className: 'current-location-pulse',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    html: `<div style="width: 30px; height: 30px; background: linear-gradient(45deg, #DC2626, #B91C1C); border: 3px solid white; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);">🅿️</div>`,
    className: 'destination-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const UnifiedNavigationSystem = ({ 
  mode = 'fullscreen', // 'fullscreen', 'modal', 'floating'
  destination,
  isOpen = false,
  onClose,
  onNavigationComplete,
  startLocation,
  className = '',
  bookingData = null // Pass booking data for dynamic Park Now integration
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [navigationService] = useState(() => new UnifiedNavigationService());
  const [currentLocation, setCurrentLocation] = useState(startLocation || null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [normalizedDestination, setNormalizedDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Initialize destination
  useEffect(() => {
    let dest = destination;
    
    // Handle route state for fullscreen mode
    if (mode === 'fullscreen' && location.state?.destination) {
      dest = location.state.destination;
    }

    if (!dest) {
      setError('No destination provided');
      setIsLoading(false);
      return;
    }

    const coords = extractCoordinates(dest);
    if (!coords.valid) {
      setError(`Invalid destination coordinates: ${coords.error}`);
      setIsLoading(false);
      return;
    }

    setNormalizedDestination({
      ...dest,
      lat: coords.lat,
      lng: coords.lng
    });
    
    setIsLoading(false);
    navigationService.initializeVoice();
  }, [destination, location.state, mode, navigationService]);

  // Calculate route when both locations are available
  useEffect(() => {
    const calculateInitialRoute = async () => {
      if (!currentLocation || !normalizedDestination || isCalculatingRoute) return;

      setIsCalculatingRoute(true);
      try {
        console.log('🗺️ UnifiedNavigation: Calculating initial route...');
        await navigationService.calculateRoute(currentLocation, normalizedDestination);
        const coordinates = navigationService.getRouteCoordinates();
        setRouteCoordinates(coordinates);
        console.log('✅ UnifiedNavigation: Initial route calculated with', coordinates.length, 'points');
      } catch (error) {
        console.error('❌ UnifiedNavigation: Initial route calculation failed:', error);
        // Fall back to direct line if routing fails
        if (currentLocation && normalizedDestination) {
          setRouteCoordinates([
            [currentLocation.lat, currentLocation.lng],
            [normalizedDestination.lat, normalizedDestination.lng]
          ]);
        }
      } finally {
        setIsCalculatingRoute(false);
      }
    };

    calculateInitialRoute();
  }, [currentLocation, normalizedDestination, navigationService, isCalculatingRoute]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await navigationService.getCurrentLocation();
      setCurrentLocation(location);
      setError(null);
    } catch (error) {
      setError(`Location access failed: ${error.message}`);
    }
  }, [navigationService]);

  // Handle location updates during navigation
  const handleLocationUpdate = useCallback((location) => {
    setCurrentLocation(location);

    if (!normalizedDestination || hasArrived) return;

    const distance = navigationService.calculateDistance(
      location.lat, location.lng,
      normalizedDestination.lat, normalizedDestination.lng
    );

    setRemainingDistance(distance);

    // Check if arrived (within 50 meters)
    if (distance < 0.05) {
      if (!hasArrived) {
        setHasArrived(true);
        navigationService.speak('You have arrived at your destination. Happy parking!', 'high');
        toast.success('🎉 You have arrived!');
        navigationService.stopLocationTracking();
        setIsNavigating(false);
        
        if (onNavigationComplete) {
          onNavigationComplete();
        }
      }
      return;
    }

    // Use route-based instruction if available
    const routeInstruction = navigationService.getCurrentInstruction(location);
    let instruction;
    
    if (routeInstruction) {
      instruction = routeInstruction.instruction;
    } else {
      // Fallback to simple direction instruction
      instruction = navigationService.generateInstruction(
        location.lat, location.lng,
        normalizedDestination.lat, normalizedDestination.lng,
        distance
      );
    }

    setCurrentInstruction(instruction);

    // Voice guidance with throttling
    const now = Date.now();
    if (!navigationService.lastSpeakTime || now - navigationService.lastSpeakTime > 30000) {
      navigationService.speak(instruction);
      navigationService.lastSpeakTime = now;
    }

    // Calculate ETA
    const estimatedSpeed = location.speed ? location.speed * 3.6 : 25;
    setRemainingTime((distance / estimatedSpeed) * 60);
  }, [normalizedDestination, hasArrived, navigationService, onNavigationComplete]);

  // Start navigation
  const startNavigation = useCallback(async () => {
    if (!normalizedDestination || !currentLocation) return;

    setIsNavigating(true);
    setError(null);
    
    navigationService.speak('Navigation started. Calculating route to your destination.', 'high');
    
    navigationService.startLocationTracking(
      handleLocationUpdate,
      (error) => {
        setError(`Location tracking failed: ${error.message}`);
      }
    );

    toast.success('Navigation started!');
  }, [normalizedDestination, currentLocation, navigationService, handleLocationUpdate]);

  // Stop navigation - with Park Now integration
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setHasArrived(false);
    setCurrentInstruction('');
    setRemainingDistance(0);
    setRemainingTime(0);
    
    navigationService.stopLocationTracking();
    
    // If we have booking data, trigger Park Now journey
    if (bookingData && navigate) {
      toast.success('Navigation stopped - Starting Park Now journey...');
      navigate('/parking', {
        state: {
          navigationCompleted: true,
          bookingData: bookingData,
          destination: normalizedDestination,
          arrivalTime: new Date().toISOString(),
          journeyDuration: remainingTime ? navigationService.formatDuration(remainingTime) : 'N/A',
          currentLocation: currentLocation,
          message: '🎯 Navigation stopped - Complete your Park Now journey to get your digital parking ticket.'
        }
      });
      
      if (onClose) {
        onClose();
      }
    } else {
      toast.success('Navigation stopped');
    }
  }, [navigationService, bookingData, navigate, normalizedDestination, remainingTime, currentLocation, onClose]);

  // Toggle voice
  const toggleVoice = () => {
    const newState = !isVoiceEnabled;
    setIsVoiceEnabled(newState);
    navigationService.isVoiceEnabled = newState;
    navigationService.speak(
      newState ? 'Voice guidance enabled' : 'Voice guidance disabled',
      'high'
    );
  };

  // External navigation
  const openExternalNavigation = () => {
    if (!normalizedDestination) return;
    
    try {
      openGoogleMapsNavigation(normalizedDestination);
      toast.success('Opening Google Maps');
    } catch (error) {
      toast.error(`Failed to open Google Maps: ${error.message}`);
    }
  };

  // Auto-start location when component opens
  useEffect(() => {
    if ((isOpen || mode === 'fullscreen') && !currentLocation) {
      getCurrentLocation();
    }
  }, [isOpen, mode, currentLocation, getCurrentLocation]);

  // Render based on mode
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg">Initializing Navigation...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-red-400 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold">Navigation Error</h2>
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setError(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Map for fullscreen mode */}
        {mode === 'fullscreen' && currentLocation && normalizedDestination && (
          <div className="flex-1 relative">
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={17}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              <NavigationMap 
                currentLocation={currentLocation}
                destination={normalizedDestination}
              />
              
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={createCurrentLocationIcon()}
              />
              
              <Marker
                position={[normalizedDestination.lat, normalizedDestination.lng]}
                icon={createDestinationIcon()}
              />
              
              {/* Route visualization */}
              {routeCoordinates.length > 0 && (
                <>
                  {/* Route shadow for better visibility */}
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: '#000000',
                      weight: 6,
                      opacity: 0.3
                    }}
                  />
                  
                  {/* Main route line */}
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: '#2563EB',
                      weight: 4,
                      opacity: 0.9,
                      smoothFactor: 1,
                      lineCap: 'round',
                      lineJoin: 'round',
                      dashArray: hasArrived ? '10, 5' : null
                    }}
                  />
                </>
              )}
              
              {/* Fallback direct line if no route calculated yet */}
              {routeCoordinates.length === 0 && isCalculatingRoute && (
                <Polyline
                  positions={[
                    [currentLocation.lat, currentLocation.lng],
                    [normalizedDestination.lat, normalizedDestination.lng]
                  ]}
                  pathOptions={{
                    color: '#9CA3AF',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </MapContainer>

            {/* Top controls for fullscreen */}
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{normalizedDestination.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{normalizedDestination.address}</p>
                    {isCalculatingRoute && (
                      <div className="flex items-center mt-1 text-xs text-blue-600">
                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                        Calculating optimal route...
                      </div>
                    )}
                    {routeCoordinates.length > 0 && navigationService.currentRoute && (
                      <div className="flex items-center mt-1 text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Route: {navigationService.formatDistance(navigationService.currentRoute.distance)} • {navigationService.formatDuration(navigationService.currentRoute.duration / 60)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 ml-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice control for fullscreen */}
            <div className="absolute top-20 right-4 z-[1000]">
              <button
                onClick={toggleVoice}
                className={`p-3 rounded-lg shadow-lg transition-colors ${
                  isVoiceEnabled ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                }`}
                title={isVoiceEnabled ? 'Disable Voice' : 'Enable Voice'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isVoiceEnabled 
                      ? "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 7h4l1 1v8l-1 1H5a2 2 0 01-2-2V9a2 2 0 012-2z" 
                      : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    } 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navigation info panel */}
        <div className={`bg-white ${mode === 'fullscreen' ? 'border-t' : ''} p-4 space-y-4`}>
          {/* Destination info for non-fullscreen modes */}
          {mode !== 'fullscreen' && normalizedDestination && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📍</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{normalizedDestination.name}</h4>
                  <p className="text-sm text-gray-600">{normalizedDestination.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current instruction */}
          {isNavigating && !hasArrived && currentInstruction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-800">{currentInstruction}</p>
                  <div className="flex items-center space-x-4 text-sm text-blue-600 mt-1">
                    <span>📏 {navigationService.formatDistance(remainingDistance * 1000)}</span>
                    <span>⏱️ {navigationService.formatDuration(remainingTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Arrival status */}
          {hasArrived && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">🎉 You have arrived!</p>
                  <p className="text-sm text-green-600">Ready to start parking</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                disabled={!currentLocation || !normalizedDestination || isCalculatingRoute}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCalculatingRoute ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating Route...</span>
                  </>
                ) : (
                  <>
                    <span>🧭</span>
                    <span>Start Navigation</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={stopNavigation}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <span>🛑</span>
                  <span>{bookingData ? 'Stop Navigation & Park Now' : 'Stop Navigation'}</span>
                </button>
                {bookingData && (
                  <p className="text-xs text-center text-gray-500">
                    Stopping navigation will start your Park Now journey
                  </p>
                )}
              </div>
            )}

            {/* External navigation */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Or open in external app:</p>
              <button
                onClick={openExternalNavigation}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render based on mode and visibility
  if (mode === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white">
        {renderContent()}
      </div>
    );
  }

  if (mode === 'floating' && isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-[1000] ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline font-medium">Navigate</span>
        </button>
      </div>
    );
  }

  if (!isOpen && mode !== 'fullscreen') return null;

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 ${className} ${
      mode === 'floating' ? 'fixed bottom-4 right-4 z-[1000] w-80 sm:w-96 max-h-[80vh] overflow-hidden' : ''
    }`}>
      {/* Header for modal/floating modes */}
      {mode !== 'fullscreen' && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">🧭</span>
            Navigation
          </h3>
          <div className="flex items-center space-x-1">
            {mode === 'floating' && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={mode === 'floating' ? 'max-h-[calc(80vh-4rem)] overflow-y-auto' : ''}>
        {renderContent()}
      </div>
    </div>
  );
};

export default UnifiedNavigationSystem;