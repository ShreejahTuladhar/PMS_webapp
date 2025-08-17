import { useState, useEffect, useRef } from 'react';
import { locationService } from '../../services';
import toast from 'react-hot-toast';

const ParkingSearchMap = ({ isOpen, onClose, initialSearchQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [distanceRange, setDistanceRange] = useState(5); // km
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 }); // Kathmandu center
  const [sortBy, setSortBy] = useState('distance');
  const mapRef = useRef(null);

  // Sample parking locations data
  const sampleLocations = [
    {
      id: 'loc_001',
      name: 'Tribhuvan Airport Parking',
      address: 'Tribhuvan International Airport, Kathmandu',
      coordinates: { lat: 27.6966, lng: 85.3591 },
      hourlyRate: 50,
      totalSpaces: 200,
      availableSpaces: 45,
      features: ['24/7 Security', 'CCTV', 'Covered Parking', 'EV Charging'],
      rating: 4.5,
      reviewCount: 128,
      distance: 2.3,
      isAvailable: true,
      type: 'airport',
      images: ['/images/parking1.jpg']
    },
    {
      id: 'loc_002',
      name: 'City Center Mall',
      address: 'Kamalpokhari, Kathmandu',
      coordinates: { lat: 27.7172, lng: 85.3240 },
      hourlyRate: 40,
      totalSpaces: 150,
      availableSpaces: 23,
      features: ['Shopping Mall', 'Food Court', 'ATM', 'Restrooms'],
      rating: 4.2,
      reviewCount: 95,
      distance: 0.8,
      isAvailable: true,
      type: 'mall',
      images: ['/images/parking2.jpg']
    },
    {
      id: 'loc_003',
      name: 'Durbar Marg Premium',
      address: 'Durbar Marg, Kathmandu',
      coordinates: { lat: 27.7089, lng: 85.3206 },
      hourlyRate: 80,
      totalSpaces: 50,
      availableSpaces: 8,
      features: ['Valet Service', 'Premium Location', 'Security Guard', 'Car Wash'],
      rating: 4.8,
      reviewCount: 67,
      distance: 1.2,
      isAvailable: true,
      type: 'premium',
      images: ['/images/parking3.jpg']
    },
    {
      id: 'loc_004',
      name: 'Thamel Tourist Hub',
      address: 'Thamel, Kathmandu',
      coordinates: { lat: 27.7155, lng: 85.3111 },
      hourlyRate: 35,
      totalSpaces: 80,
      availableSpaces: 0,
      features: ['Tourist Area', 'Restaurants Nearby', 'Budget Friendly'],
      rating: 3.9,
      reviewCount: 156,
      distance: 1.5,
      isAvailable: false,
      type: 'tourist',
      images: ['/images/parking4.jpg']
    },
    {
      id: 'loc_005',
      name: 'New Road Shopping Area',
      address: 'New Road, Kathmandu',
      coordinates: { lat: 27.7050, lng: 85.3088 },
      hourlyRate: 45,
      totalSpaces: 100,
      availableSpaces: 34,
      features: ['Shopping District', 'Public Transport', 'Wheelchair Access'],
      rating: 4.1,
      reviewCount: 203,
      distance: 2.1,
      isAvailable: true,
      type: 'shopping',
      images: ['/images/parking5.jpg']
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadLocations();
      getCurrentLocation();
    }
  }, [isOpen, searchQuery, distanceRange]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      
      // In real app, this would call the API
      // const response = await locationService.searchLocations({
      //   query: searchQuery,
      //   distance: distanceRange,
      //   coordinates: userLocation
      // });
      
      // For now, filter sample data based on search query
      let filteredLocations = sampleLocations;
      
      if (searchQuery) {
        filteredLocations = sampleLocations.filter(location =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort locations
      filteredLocations.sort((a, b) => {
        switch (sortBy) {
          case 'distance': return a.distance - b.distance;
          case 'price': return a.hourlyRate - b.hourlyRate;
          case 'rating': return b.rating - a.rating;
          case 'availability': return b.availableSpaces - a.availableSpaces;
          default: return 0;
        }
      });

      setLocations(filteredLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load parking locations');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const handleSearch = () => {
    loadLocations();
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapCenter(location.coordinates);
  };

  const handleBookNow = (location) => {
    toast.success(`Redirecting to booking for ${location.name}`);
    // In real app, navigate to booking page with pre-selected location
  };

  const getTypeIcon = (type) => {
    const icons = {
      airport: '✈️',
      mall: '🏬',
      premium: '⭐',
      tourist: '🏛️',
      shopping: '🛍️',
      default: '🅿️'
    };
    return icons[type] || icons.default;
  };

  const getAvailabilityColor = (availableSpaces, totalSpaces) => {
    const percentage = (availableSpaces / totalSpaces) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 font-medium"
              title="Return to main interface"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Minimize</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Find Parking</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Found {locations.length} locations</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close search"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Placeholder Map */}
          <div 
            ref={mapRef}
            className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative"
          >
            {/* Map placeholder content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
                <p className="text-gray-500">Map integration with parking locations</p>
              </div>
            </div>

            {/* Sample map markers */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className={`absolute w-8 h-8 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedLocation?.id === location.id ? 'scale-125' : ''
                }`}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`
                }}
                onClick={() => handleLocationSelect(location)}
              >
                <div className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm ${
                  location.isAvailable ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {getTypeIcon(location.type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
          {/* Search Controls */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search location (e.g., Thamel, Airport, Mall)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
              <button
                onClick={getCurrentLocation}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Use My Location
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <select
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">View Mode</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    viewMode === 'card' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-500">Try adjusting your search or distance range</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedLocation?.id === location.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    {viewMode === 'card' ? (
                      // Card View
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTypeIcon(location.type)}</span>
                              <h3 className="font-semibold text-gray-900">{location.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">Rs. {location.hourlyRate}/hr</p>
                            <p className="text-xs text-gray-500">{location.distance} km away</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-600">{location.rating} ({location.reviewCount})</span>
                          </div>
                          <div className={`text-sm font-medium ${getAvailabilityColor(location.availableSpaces, location.totalSpaces)}`}>
                            {location.availableSpaces}/{location.totalSpaces} available
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {location.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookNow(location);
                          }}
                          disabled={!location.isAvailable}
                          className={`w-full py-2 rounded-lg font-medium transition ${
                            location.isAvailable
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {location.isAvailable ? 'Book Now' : 'Not Available'}
                        </button>
                      </div>
                    ) : (
                      // List View
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span>{getTypeIcon(location.type)}</span>
                            <h3 className="font-medium text-gray-900">{location.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{location.distance} km • Rs. {location.hourlyRate}/hr</p>
                          <div className={`text-xs ${getAvailabilityColor(location.availableSpaces, location.totalSpaces)}`}>
                            {location.availableSpaces} spaces available
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookNow(location);
                          }}
                          disabled={!location.isAvailable}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            location.isAvailable
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {location.isAvailable ? 'Book' : 'Full'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearchMap;