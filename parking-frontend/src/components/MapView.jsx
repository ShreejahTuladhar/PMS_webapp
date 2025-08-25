import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
// 🔒 ADMIN-ONLY INTERNAL NAVIGATION (Hidden from regular users)
import NavigationControls from './navigation/NavigationControls';
import RouteVisualization from './navigation/RouteVisualization';
import { useAdminAccess } from '../hooks/useAdminAccess';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Get parking indicator - always returns 'P' for all parking locations
const getParkingIndicator = () => {
  return 'P';
};

// Create custom parking markers with professional design
const createParkingIcon = (availability, _spot) => {
  const color = availability > 0 ? '#059669' : '#DC2626'; // Professional green or red
  const abbreviation = getParkingIndicator();
  
  const iconHtml = `
    <div style="
      background: linear-gradient(135deg, ${color}, ${color}dd);
      border: 2px solid white;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 10px;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      letter-spacing: -0.5px;
    ">
      ${abbreviation}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-parking-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Create custom current location marker
const createCurrentLocationIcon = () => {
  const iconHtml = `
    <div style="position: relative;">
      <div style="
        background: linear-gradient(135deg, #2563EB, #1D4ED8);
        border: 2px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 8px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        YOU
      </div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 2px solid #2563EB;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.08);
        animation: locationPulse 2.5s infinite;
      "></div>
    </div>
    <style>
      @keyframes locationPulse {
        0% {
          transform: translate(-50%, -50%) scale(0.7);
          opacity: 1;
        }
        70% {
          transform: translate(-50%, -50%) scale(1.3);
          opacity: 0;
        }
        100% {
          transform: translate(-50%, -50%) scale(0.7);
          opacity: 0;
        }
      }
    </style>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'current-location-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map centering
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const MapView = ({ parkingSpots, radius, center, onSpotSelect, onBooking, onNavigationActivated }) => {
  const { canViewInternalNav } = useAdminAccess();
  const [_selectedSpot, setSelectedSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  // 🔒 ADMIN-ONLY INTERNAL NAVIGATION STATES (Hidden from regular users)
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [showNavigationControls, setShowNavigationControls] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  
  // Default center (you can change this to your city's coordinates)
  const defaultCenter = useMemo(() => [27.7172, 85.3240], []); // Kathmandu, Nepal

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy
        });
        setLocationPermission('granted');
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Auto-request location on component mount
  useEffect(() => {
    if (navigator.geolocation && locationPermission === 'prompt') {
      getCurrentLocation();
    }
  }, [locationPermission]);

  // Watch position for updates
  useEffect(() => {
    if (navigator.geolocation && locationPermission === 'granted') {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [locationPermission]);
  
  // Calculate map center and add coordinates to parking spots
  const mapCenter = useMemo(() => {
    if (center && center.lat && center.lng) {
      return [center.lat, center.lng];
    }
    return defaultCenter;
  }, [center, defaultCenter]);

  // Use actual coordinates from parking data
  const parkingSpotsWithCoords = useMemo(() => {
    if (!parkingSpots || !Array.isArray(parkingSpots)) {
      return [];
    }
    return parkingSpots.map((spot) => ({
      ...spot,
      coordinates: [spot.coordinates?.lat || 0, spot.coordinates?.lng || 0],
    }));
  }, [parkingSpots]);

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    onSpotSelect && onSpotSelect(spot);
  };

  // 🔒 ADMIN-ONLY INTERNAL NAVIGATION HANDLERS (Hidden from regular users)
  const handleNavigateToSpot = (spot) => {
    // Only allow internal navigation for super admins
    if (!canViewInternalNav) {
      console.warn('⚠️ MapView: Internal navigation access denied - super admin required');
      
      // Instead of showing internal navigation, notify parent to use Google Maps
      if (onNavigationActivated) {
        onNavigationActivated(spot);
      }
      return;
    }
    
    console.log('🔒 MapView: Starting internal navigation for admin:', spot);
    
    // Create destination object with original spot data - let navigationUtils handle coordinate extraction
    const destination = {
      ...spot,
      name: spot.name,
      address: spot.address
    };
    
    console.log('🧭 MapView: Created destination object:', destination);
    setNavigationDestination(destination);
    setShowNavigationControls(true);
    
    // Notify parent component about navigation activation
    if (onNavigationActivated) {
      onNavigationActivated(destination);
    }
  };

  const handleRouteCalculated = (route) => {
    setNavigationRoute(route);
  };

  const handleNavigationClose = () => {
    setShowNavigationControls(false);
    setNavigationRoute(null);
    setNavigationDestination(null);
  };

  const radiusInMeters = radius * 1000; // Convert km to meters

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Map View</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Radius: {radius}km</span>
            </div>
            
            {/* Location Status & Button */}
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                currentLocation 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : locationPermission === 'denied'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } ${isLoadingLocation ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {isLoadingLocation ? (
                <>
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Locating...</span>
                </>
              ) : currentLocation ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Located</span>
                </>
              ) : locationPermission === 'denied' ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Enable Location</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Locate Me</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-96">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController center={{ lat: mapCenter[0], lng: mapCenter[1] }} zoom={13} />
          
          {/* Search radius circle - hide during navigation */}
          {!navigationRoute && (
            <Circle
              center={mapCenter}
              radius={radiusInMeters}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          )}
          
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={createCurrentLocationIcon()}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Your Current Location
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
                    {currentLocation.accuracy && (
                      <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🔒 ADMIN-ONLY ROUTE VISUALIZATION (Hidden from regular users) */}
          {canViewInternalNav && (navigationRoute || navigationDestination) && (
            <RouteVisualization
              route={navigationRoute}
              currentLocation={currentLocation}
              destination={navigationDestination}
              showInstructions={false}
              showUserLocation={true}
              autoCalculateRoute={!navigationRoute} // Auto-calculate if no route provided
            />
          )}

          {/* Parking spot markers - hide other spots during navigation */}
          {parkingSpotsWithCoords
            .filter((spot) => {
              // During navigation, only show the selected destination
              if (navigationRoute && navigationDestination) {
                return spot.id === navigationDestination.id;
              }
              // When not navigating, show all spots
              return true;
            })
            .map((spot) => (
            <Marker
              key={spot.id}
              position={spot.coordinates}
              icon={createParkingIcon(spot.availability, spot)}
              eventHandlers={{
                click: () => handleSpotClick(spot),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-semibold text-gray-800 mb-2">{spot.name}</h4>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>{spot.address}</p>
                    <p className="text-xs mt-1">
                      {spot.availability > 0 ? `${spot.availability} spaces available` : 'No spaces available'} • 
                      Rs. {spot.hourlyRate}/hr
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      className={`w-full px-4 py-2 rounded font-medium text-sm transition ${
                        spot.availability > 0 && !spot.status
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={spot.availability === 0 || spot.status}
                      onClick={() => onBooking && onBooking(spot)}
                    >
                      {spot.status ? 'Not Available' : spot.availability > 0 ? '🅿️ Book Now' : 'Full'}
                    </button>
                    
                    <button
                      className="w-full px-4 py-2 rounded font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center space-x-2"
                      onClick={() => handleNavigateToSpot(spot)}
                    >
                      <span>🧭</span>
                      <span>Navigate Here</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* 🔒 ADMIN-ONLY INTERNAL NAVIGATION CONTROLS (Hidden from regular users) */}
        {canViewInternalNav && showNavigationControls && navigationDestination && (
          <div className="relative">
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold z-10">
              🔒 ADMIN ONLY
            </div>
            <NavigationControls
              destination={navigationDestination}
              onRouteCalculated={handleRouteCalculated}
              onNavigationStop={handleNavigationClose}
              isVisible={showNavigationControls}
              position="bottom-right"
            />
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Full</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
              <span>Search Area</span>
            </div>
            {currentLocation && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Your Location</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentLocation && locationPermission === 'granted' && (
              <span className="text-green-600 text-xs">
                 Location Active
              </span>
            )}
            <span>{parkingSpots.length} parking locations found</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;