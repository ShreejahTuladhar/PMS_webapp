import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { extractCoordinates, openGoogleMapsNavigation } from '../../utils/navigationUtils';

// Enhanced navigation service with voice guidance
class NavigationService {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.currentVoice = null;
    this.isVoiceEnabled = true;
    this.lastSpokenInstruction = null;
    this.currentInstruction = null;
    this.routeSteps = [];
    this.currentStepIndex = 0;
  }

  // Initialize voice synthesis
  initializeVoice() {
    if (!this.speechSynthesis) return false;

    const voices = this.speechSynthesis.getVoices();
    // Prefer English voices
    this.currentVoice = voices.find(voice => 
      voice.lang.includes('en') && !voice.name.includes('Google')
    ) || voices[0];

    return true;
  }

  // Speak navigation instruction
  speak(text, priority = 'normal') {
    if (!this.isVoiceEnabled || !this.speechSynthesis || !text) return;

    // Don't repeat the same instruction too frequently
    if (this.lastSpokenInstruction === text && priority !== 'high') {
      return;
    }

    // Cancel any ongoing speech for high priority messages
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
    console.log('🔊 Navigation speech:', text);
  }

  // Generate navigation instructions based on direction
  generateInstruction(fromLat, fromLng, toLat, toLng, distance) {
    const bearing = this.calculateBearing(fromLat, fromLng, toLat, toLng);
    const direction = this.bearingToDirection(bearing);
    
    let instruction = '';
    
    if (distance > 1) {
      instruction = `Continue ${direction} for ${distance.toFixed(1)} kilometers`;
    } else if (distance > 0.1) {
      instruction = `Continue ${direction} for ${(distance * 1000).toFixed(0)} meters`;
    } else {
      instruction = `You have arrived at your destination`;
    }

    return instruction;
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

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Map component that handles route display
const NavigationMap = ({ currentLocation, destination, onLocationUpdate }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 16);
    }
  }, [currentLocation, map]);

  return null;
};

// Custom marker icons
const createCurrentLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background: linear-gradient(45deg, #2563EB, #1D4ED8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
      "></div>
    `,
    className: 'current-location-pulse',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: linear-gradient(45deg, #DC2626, #B91C1C);
        border: 3px solid white;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);
      ">🅿️</div>
    `,
    className: 'destination-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const FullScreenNavigationEnhanced = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [navigationService] = useState(() => new NavigationService());
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize navigation from route state
  useEffect(() => {
    if (location.state) {
      const { destination: dest, startLocation, journeyStartTime: startTime } = location.state;
      
      console.log('🗺️ Enhanced Navigation initialized:', { dest, startLocation });
      
      // Validate and extract coordinates
      const coords = extractCoordinates(dest);
      if (!coords.valid) {
        setError(`Invalid destination coordinates: ${coords.error}`);
        setIsLoading(false);
        return;
      }

      setDestination({
        ...dest,
        lat: coords.lat,
        lng: coords.lng
      });
      
      if (startLocation) {
        setCurrentLocation(startLocation);
      }
      
      setJourneyStartTime(startTime ? new Date(startTime) : new Date());
      setIsLoading(false);
      
      // Initialize voice
      navigationService.initializeVoice();
      navigationService.speak('Navigation started. Calculating route to your destination.', 'high');
      
    } else {
      setError('No navigation data provided');
      setIsLoading(false);
    }
  }, [location.state, navigationService]);

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation || isTracking) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        };

        setCurrentLocation(newLocation);
        updateNavigation(newLocation);
      },
      (error) => {
        console.error('❌ Location tracking error:', error);
        setError(`Location tracking failed: ${error.message}`);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [isTracking]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  }, [watchId]);

  // Update navigation based on current location
  const updateNavigation = useCallback((location) => {
    if (!destination || hasArrived) return;

    const distance = navigationService.calculateDistance(
      location.lat, location.lng,
      destination.lat, destination.lng
    );

    setRemainingDistance(distance);
    
    // Check if arrived (within 50 meters)
    if (distance < 0.05) {
      if (!hasArrived) {
        setHasArrived(true);
        navigationService.speak('You have arrived at your destination. Happy parking!', 'high');
        toast.success('🎉 You have arrived at your destination!');
        stopLocationTracking();
      }
      return;
    }

    // Generate and speak instruction
    const instruction = navigationService.generateInstruction(
      location.lat, location.lng,
      destination.lat, destination.lng,
      distance
    );

    setCurrentInstruction(instruction);
    
    // Speak instruction occasionally (every 30 seconds or significant changes)
    const now = Date.now();
    if (!navigationService.lastSpeakTime || now - navigationService.lastSpeakTime > 30000) {
      navigationService.speak(instruction);
      navigationService.lastSpeakTime = now;
    }

    // Calculate estimated time (assuming average speed)
    const estimatedSpeed = location.speed ? location.speed * 3.6 : 25; // km/h
    setRemainingTime((distance / estimatedSpeed) * 60); // minutes
  }, [destination, hasArrived, navigationService, stopLocationTracking]);

  // Start tracking when component mounts
  useEffect(() => {
    if (destination && !isTracking) {
      startLocationTracking();
    }
    
    return () => {
      stopLocationTracking();
    };
  }, [destination, isTracking, startLocationTracking, stopLocationTracking]);

  // Voice toggle
  const toggleVoice = () => {
    const newVoiceState = !isVoiceEnabled;
    setIsVoiceEnabled(newVoiceState);
    navigationService.isVoiceEnabled = newVoiceState;
    
    navigationService.speak(
      newVoiceState ? 'Voice guidance enabled' : 'Voice guidance disabled',
      'high'
    );
  };

  // External navigation
  const handleExternalNavigation = () => {
    if (!destination) return;
    
    try {
      openGoogleMapsNavigation(destination);
      toast.success('Opening Google Maps');
    } catch (error) {
      toast.error(`Failed to open Google Maps: ${error.message}`);
    }
  };

  // Format time
  const formatTime = (minutes) => {
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Format distance
  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl">Initializing Navigation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold">Navigation Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentLocation || !destination) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={17}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <NavigationMap 
            currentLocation={currentLocation}
            destination={destination}
          />
          
          {/* Current Location Marker */}
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createCurrentLocationIcon()}
          />
          
          {/* Destination Marker */}
          <Marker
            position={[destination.lat, destination.lng]}
            icon={createDestinationIcon()}
          />
          
          {/* Route Line */}
          <Polyline
            positions={[
              [currentLocation.lat, currentLocation.lng],
              [destination.lat, destination.lng]
            ]}
            pathOptions={{
              color: '#2563EB',
              weight: 4,
              opacity: 0.8,
              dashArray: hasArrived ? '10, 5' : '0'
            }}
          />
        </MapContainer>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{destination.name}</h3>
                <p className="text-sm text-gray-600 truncate">{destination.address}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors ml-4"
                title="Exit Navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-20 right-4 z-[1000] space-y-2">
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

      {/* Bottom Navigation Panel */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-4">
        {/* Current Instruction */}
        {!hasArrived && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-800">{currentInstruction || 'Calculating route...'}</p>
                <div className="flex items-center space-x-4 text-sm text-blue-600 mt-1">
                  <span>📏 {formatDistance(remainingDistance)}</span>
                  <span>⏱️ {formatTime(remainingTime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arrival Status */}
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

        {/* External Navigation Options */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-3">Or continue with external navigation:</p>
          <button
            onClick={() => handleExternalNavigation()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>🗺️</span>
            <span>Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenNavigationEnhanced;