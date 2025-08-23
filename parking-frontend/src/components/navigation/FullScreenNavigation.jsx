import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Navigation directions service (mock implementation)
const getDirections = async (start, end) => {
  // In a real app, you'd use Google Directions API, Mapbox, or similar
  // For demo purposes, we'll create a simple route
  const steps = [
    {
      instruction: "Head north on current road",
      distance: "0.5 km",
      duration: "2 min",
      coordinates: [start.lat + 0.002, start.lng + 0.001]
    },
    {
      instruction: "Turn right onto Main Street",
      distance: "1.2 km", 
      duration: "4 min",
      coordinates: [start.lat + 0.005, start.lng + 0.008]
    },
    {
      instruction: "Continue straight for 800m",
      distance: "0.8 km",
      duration: "3 min", 
      coordinates: [start.lat + 0.008, start.lng + 0.012]
    },
    {
      instruction: "Turn left to reach destination",
      distance: "0.3 km",
      duration: "1 min",
      coordinates: [end.lat, end.lng]
    }
  ];

  return {
    route: steps.map(step => step.coordinates),
    steps: steps,
    totalDistance: "2.8 km",
    totalDuration: "10 min"
  };
};

// Map component that centers on current location
const NavigationMap = ({ currentLocation, destination, route, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 16);
    }
  }, [currentLocation, map]);

  return null;
};

// Custom icons for navigation
const createCurrentLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #2563EB, #1D4ED8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(37, 99, 235, 0.6);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          border: 2px solid #2563EB;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.1);
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
      </style>
    `,
    className: 'current-location-navigation',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(45deg, #DC2626, #B91C1C);
        border: 3px solid white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      ">🅿️</div>
    `,
    className: 'destination-navigation',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const FullScreenNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [voice, setVoice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from location state
  useEffect(() => {
    console.log('🗺️ FullScreenNavigation state:', location.state);
    
    if (location.state) {
      const { destination: dest, bookingId, startLocation, journeyStartTime: startTime } = location.state;
      
      console.log('📍 Navigation data:', { dest, startLocation });
      
      setDestination(dest);
      setCurrentLocation(startLocation);
      setJourneyStartTime(startTime ? new Date(startTime) : new Date());
      setIsNavigating(true);
    } else {
      console.log('⚠️ No navigation state, getting current location');
      // Fallback - get current location
      getCurrentLocation();
    }
  }, [location.state]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Calculate route when we have both locations
  useEffect(() => {
    if (currentLocation && destination && !route) {
      calculateRoute();
    }
  }, [currentLocation, destination, route]);

  const calculateRoute = async () => {
    try {
      const directions = await getDirections(currentLocation, destination);
      setRoute(directions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Could not calculate route');
      setIsLoading(false);
    }
  };

  // Track location and progress
  useEffect(() => {
    if (!isNavigating || !currentLocation || !destination) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);

        // Check if arrived at destination (within 50 meters)
        const distance = calculateDistance(latitude, longitude, destination.lat, destination.lng);
        if (distance < 0.05 && !hasArrived) { // 50 meters
          setHasArrived(true);
          toast.success('🎉 You have arrived at your destination!');
          speakInstruction('You have arrived at your destination. Happy parking!');
        }
      },
      (error) => {
        console.error('Error tracking location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, currentLocation, destination, hasArrived]);

  // Voice instructions
  const speakInstruction = useCallback((text) => {
    if (!voice || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }, [voice]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getJourneyDuration = () => {
    if (!journeyStartTime) return '0m';
    
    const now = new Date();
    const diffMs = now - journeyStartTime;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 60 ? `${diffMins}m` : `${Math.floor(diffMins/60)}h ${diffMins%60}m`;
  };

  const handleEndNavigation = () => {
    navigate(-1);
  };

  const handleStartParking = () => {
    // Signal to the parking flow that navigation has ended and parking should begin
    navigate('/parking', { 
      state: { 
        navigationCompleted: true,
        destination: destination,
        arrivalTime: new Date().toISOString(),
        journeyDuration: getJourneyDuration(),
        message: 'Navigation completed successfully! Ready to start parking process.',
        currentLocation: currentLocation
      }
    });
  };

  const getCurrentInstruction = () => {
    if (!route || !route.steps) return "Calculating route...";
    
    if (hasArrived) {
      return "You have arrived at your destination!";
    }
    
    if (currentStep >= route.steps.length) {
      return "Continue to destination";
    }
    
    return route.steps[currentStep]?.instruction || "Follow the route";
  };

  const getDistanceToDestination = () => {
    if (!currentLocation || !destination) return "Calculating...";
    
    const distance = calculateDistance(
      currentLocation.lat, currentLocation.lng,
      destination.lat, destination.lng
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
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

  // Validate coordinates before rendering map
  const hasValidCurrentLocation = currentLocation && 
    typeof currentLocation.lat === 'number' && 
    typeof currentLocation.lng === 'number' &&
    !isNaN(currentLocation.lat) && 
    !isNaN(currentLocation.lng);
    
  const hasValidDestination = destination && 
    typeof destination.lat === 'number' && 
    typeof destination.lng === 'number' &&
    !isNaN(destination.lat) && 
    !isNaN(destination.lng);

  if (!hasValidCurrentLocation || !hasValidDestination) {
    console.error('Invalid coordinates:', { 
      currentLocation, 
      destination,
      hasValidCurrentLocation,
      hasValidDestination 
    });
    
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <p className="text-xl">Unable to start navigation</p>
          <p className="text-sm text-gray-300">
            {!hasValidCurrentLocation ? 'Invalid current location coordinates' : 'Invalid destination coordinates'}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
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
          zoom={16}
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
            route={route}
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
          
          {/* Route Polyline */}
          {route && route.route && (
            <Polyline
              positions={route.route}
              pathOptions={{
                color: '#2563EB',
                weight: 6,
                opacity: 0.8,
                dashArray: '10, 5'
              }}
            />
          )}
        </MapContainer>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 truncate">{destination.name}</h3>
                <p className="text-sm text-gray-600 truncate">{destination.address}</p>
              </div>
              <button
                onClick={handleEndNavigation}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
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
            onClick={() => setVoice(!voice)}
            className={`p-3 rounded-lg shadow-lg transition-colors ${
              voice ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 7h4l1 1v8l-1 1H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Panel */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-4">
        {/* Current Instruction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-800">{getCurrentInstruction()}</p>
              {route && route.steps && currentStep < route.steps.length && (
                <p className="text-sm text-blue-600">
                  {route.steps[currentStep]?.distance} • {route.steps[currentStep]?.duration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Journey Information */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-semibold text-gray-800">{getDistanceToDestination()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold text-gray-800">{getJourneyDuration()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ETA</p>
            <p className="font-semibold text-gray-800">
              {route?.totalDuration || 'Calculating...'}
            </p>
          </div>
        </div>

        {/* Arrival Status and Actions */}
        {hasArrived && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">You have arrived!</p>
                  <p className="text-sm text-green-600">Ready to start the parking process</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleStartParking}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>End Journey & Start Parking</span>
              </button>
              
              <button
                onClick={handleEndNavigation}
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close Navigation</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual End Journey Option (for testing) */}
        {!hasArrived && isNavigating && (
          <div className="mt-4">
            <button
              onClick={handleStartParking}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>End Journey Now (Test Mode)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullScreenNavigation;