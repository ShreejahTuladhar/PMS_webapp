import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import NavigationControls from './navigation/NavigationControls';
import RouteVisualization from './navigation/RouteVisualization';

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
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 11px;
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
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create custom current location marker with professional design
const createCurrentLocationIcon = () => {
  const iconHtml = `
    <div style="position: relative;">
      <div style="
        background: linear-gradient(135deg, #2563EB, #1D4ED8);
        border: 3px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        box-shadow: 0 3px 12px rgba(37, 99, 235, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 10px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        YOU
      </div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 48px;
        height: 48px;
        border: 2px solid #2563EB;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.08);
        transform: translate(-50%, -50%);
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
    iconSize: [48, 48],
    iconAnchor: [24, 24],
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

const FullScreenMapView = ({ parkingSpots, radius, center, onSpotSelect, onBooking }) => {
  const [_selectedSpot, setSelectedSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [_isLoadingLocation, _setIsLoadingLocation] = useState(false);
  const [_navigationRoute, _setNavigationRoute] = useState(null);
  const [_showNavigationControls, _setShowNavigationControls] = useState(false);
  const [_navigationDestination, _setNavigationDestination] = useState(null);
  
  // Default center (you can change this to your city's coordinates)
  const defaultCenter = useMemo(() => [27.7172, 85.3240], []); // Kathmandu, Nepal

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    _setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy
        });
        setLocationPermission('granted');
        _setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        _setIsLoadingLocation(false);
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
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={13} />
        
        {/* Search radius circle */}
        {center && center.lat && center.lng && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusInMeters}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createCurrentLocationIcon()}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold text-blue-600">Your Location</h4>
                <p className="text-sm text-gray-600">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking spot markers */}
        {parkingSpotsWithCoords.map((spot) => (
          <Marker
            key={spot.id}
            position={spot.coordinates}
            icon={createParkingIcon(spot.availableSpaces, spot)}
            eventHandlers={{
              click: () => handleSpotClick(spot),
            }}
          >
            <Popup>
              <div className="min-w-64">
                <h4 className="font-semibold text-lg mb-2">{spot.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{spot.address}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Rate</span>
                    <p className="font-semibold">Rs. {spot.hourlyRate}/hr</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Available</span>
                    <p className={`font-semibold ${spot.availableSpaces > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {spot.availableSpaces}/{spot.totalSpaces} spaces
                    </p>
                  </div>
                </div>

                {spot.features && spot.features.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Features</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spot.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onBooking && onBooking(spot)}
                    disabled={spot.availableSpaces === 0}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                      spot.availableSpaces > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {spot.availableSpaces > 0 ? 'Book Now' : 'Full'}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default FullScreenMapView;