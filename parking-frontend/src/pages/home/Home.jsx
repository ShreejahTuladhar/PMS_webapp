import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  searchLocationsByAddress, 
  getUserLocation, 
  searchNearbyParkingLocations 
} from "../../services/parkingAPI";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color = 'blue', icon = '🚗') => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">${icon}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const parkingIcon = createCustomIcon('#059669', '🅿️');
const userIcon = createCustomIcon('#DC2626', '📍');

const Home = () => {
  const dispatch = useDispatch();
  const { 
    nearbyLocations, 
    isLoading, 
    error, 
    mapCenter, 
    userLocation,
    searchFilters 
  } = useSelector((state) => state.parking);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize map with default center (Kathmandu)
  const defaultCenter = [27.7172, 85.3240];
  const currentCenter = mapCenter ? [mapCenter.lat, mapCenter.lng] : defaultCenter;

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      return;
    }

    try {
      await dispatch(searchLocationsByAddress(searchTerm, searchRadius));
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [dispatch, searchTerm, searchRadius]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await dispatch(getUserLocation());
      if (location) {
        // Search for parking near user's current location
        await dispatch(searchNearbyParkingLocations({
          latitude: location.lat,
          longitude: location.lng,
          maxDistance: searchRadius
        }));
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  }, [dispatch, searchRadius]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatPrice = (price) => {
    return `Rs. ${price}/hr`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">🚗 ParkSmart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Find Parking Near You
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Search for available parking spaces by location name or use your current location
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter location (e.g., Kathmandu, Thamel, Ring Road)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchTerm.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? '🔍' : 'Search'}
                </button>
                
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Use my location"
                >
                  📍
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  title="Search filters"
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Search Radius:</label>
                    <select
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value={1000}>1 km</option>
                      <option value={2000}>2 km</option>
                      <option value={5000}>5 km</option>
                      <option value={10000}>10 km</option>
                      <option value={20000}>20 km</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={currentCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong>📍 Your Location</strong>
                    <br />
                    <small className="text-gray-600">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </small>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Search Radius Circle */}
            {userLocation && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius}
                pathOptions={{
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  color: '#3B82F6',
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Parking Location Markers */}
            {nearbyLocations.map((location) => (
              <Marker
                key={location._id}
                position={[location.coordinates.latitude, location.coordinates.longitude]}
                icon={parkingIcon}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">{location.name}</h3>
                    <p className="text-gray-600 text-sm">{location.address}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Available:</span>
                        <span className={`ml-1 ${location.availableSpaces > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {location.availableSpaces}/{location.totalSpaces}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Price:</span>
                        <span className="ml-1 text-blue-600">{formatPrice(location.hourlyRate)}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div><strong>Hours:</strong> {location.operatingHours?.start} - {location.operatingHours?.end}</div>
                      {location.distance && (
                        <div><strong>Distance:</strong> {formatDistance(location.distance)}</div>
                      )}
                    </div>
                    
                    {location.amenities && location.amenities.length > 0 && (
                      <div className="text-sm">
                        <strong>Amenities:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {location.amenities.map((amenity, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <Link
                        to={`/login?redirect=/book/${location._id}`}
                        className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Book Parking
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 font-medium">Searching for parking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Parking Results */}
        <div className="w-80 bg-white shadow-lg border-l overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {nearbyLocations.length > 0 ? (
                `Found ${nearbyLocations.length} Parking Locations`
              ) : (
                'Search for Parking'
              )}
            </h3>

            {nearbyLocations.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🚗</div>
                <p>Search for a location to find nearby parking spots</p>
              </div>
            )}

            <div className="space-y-4">
              {nearbyLocations.map((location) => (
                <div key={location._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{location.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      location.availableSpaces > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {location.availableSpaces > 0 ? 'Available' : 'Full'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{location.address}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Spaces:</span>
                      <span className="ml-1 font-medium">{location.availableSpaces}/{location.totalSpaces}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rate:</span>
                      <span className="ml-1 font-medium text-blue-600">{formatPrice(location.hourlyRate)}</span>
                    </div>
                    {location.distance && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Distance:</span>
                        <span className="ml-1 font-medium">{formatDistance(location.distance)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/login?redirect=/book/${location._id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Book Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
