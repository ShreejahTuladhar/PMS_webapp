import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom parking markers
const createParkingIcon = (availability) => {
  const color = availability > 0 ? '#10B981' : '#EF4444'; // green or red
  const iconHtml = `
    <div style="
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      P
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-parking-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Create custom current location marker
const createCurrentLocationIcon = () => {
  const iconHtml = `
    <div style="position: relative;">
      <div style="
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.1);
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          opacity: 0.5;
          transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
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

const MapView = ({ parkingSpots, radius, center, onSpotSelect, onBooking }) => {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Default center (you can change this to your city's coordinates)
  const defaultCenter = [27.7172, 85.3240]; // Kathmandu, Nepal

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
  }, []);

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
  }, [center]);

  // Use actual coordinates from parking data
  const parkingSpotsWithCoords = useMemo(() => {
    return parkingSpots.map((spot) => ({
      ...spot,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
    }));
  }, [parkingSpots]);

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    onSpotSelect && onSpotSelect(spot);
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
          
          {/* Search radius circle */}
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

          {/* Parking spot markers */}
          {parkingSpotsWithCoords.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.coordinates}
              icon={createParkingIcon(spot.availability)}
              eventHandlers={{
                click: () => handleSpotClick(spot),
              }}
            >
              <Popup>
                <div className="p-3 text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">{spot.name}</h4>
                  <button 
                    className={`px-4 py-2 rounded font-medium text-sm transition ${
                      spot.availability > 0 && !spot.status
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={spot.availability === 0 || spot.status}
                    onClick={() => onBooking && onBooking(spot)}
                  >
                    {spot.status ? 'Not Available' : spot.availability > 0 ? 'Book Now' : 'Full'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
                📍 Location Active
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