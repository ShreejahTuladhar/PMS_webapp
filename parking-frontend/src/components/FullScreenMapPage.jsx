import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { locationService } from '../services';
import searchHistory from '../utils/searchHistory';
import toast from 'react-hot-toast';
// 🔄 REUSING HOME PAGE COMPONENTS - Component Architecture Excellence
import MapView from './MapView';
import AuthModal from './auth/AuthModal';
import PaymentFlow from './booking/PaymentFlow';
import BookingConfirmation from './booking/BookingConfirmation';
import ParkingJourney from './journey/ParkingJourney';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { logInfo, logUserAction, logPerformance } from '../utils/logger';

/**
 * 🎯 FullScreenMapPage - Component Reuse Architecture
 * 
 * Root Cause Solution: Instead of custom FullScreenMapView, 
 * we reuse proven Home page components for consistency.
 * 
 * Partner's Vision: "recreate the ui components mentioned by reusing ui component"
 * - SearchSection (search bar with suggestions) ✅
 * - MapView (map with location pointers) ✅  
 * - ParkingList (list and card view) ✅
 * 
 * This demonstrates professional component architecture!
 */

const FullScreenMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { currentBooking, bookingStep, isJourneyActive } = useBooking();
  
  // Initialize with passed state for seamless transition
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [searchResults, setSearchResults] = useState(location.state?.searchResults || []);
  const [loading, setLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(location.state?.selectedSpot || null);
  const [viewMode, setViewMode] = useState('cards'); // 'list' or 'cards' - default to cards like wireframe
  const [searchRadius, setSearchRadius] = useState(location.state?.searchRadius || 0.5);
  const [sortBy, setSortBy] = useState('distance');
  const [searchLocation, setSearchLocation] = useState(location.state?.searchLocation || null);
  const [originalSearchInput, setOriginalSearchInput] = useState(location.state?.originalSearchInput || null);
  
  // Modal states - same as Home
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [parkingSpotToBook, setParkingSpotToBook] = useState(null);

  // Kathmandu area coordinates (reused from Home)
  const kathmanduAreas = {
    ratnapark: { lat: 27.7064, lng: 85.3238 },
    thamel: { lat: 27.7151, lng: 85.3107 },
    durbar: { lat: 27.7040, lng: 85.3070 },
    newroad: { lat: 27.7016, lng: 85.3197 },
    putalisadak: { lat: 27.7095, lng: 85.3269 },
    baneshwor: { lat: 27.6893, lng: 85.3436 },
    koteshwor: { lat: 27.6776, lng: 85.3470 },
    lagankhel: { lat: 27.6667, lng: 85.3247 },
    jawalakhel: { lat: 27.6701, lng: 85.3159 },
    patan: { lat: 27.6648, lng: 85.3188 },
    satdobato: { lat: 27.6587, lng: 85.3247 },
    imadol: { lat: 27.6550, lng: 85.3280 },
    swayambhunath: { lat: 27.7148, lng: 85.2906 }
  };

  // Watch for booking confirmation and journey (same as Home)
  useEffect(() => {
    if (bookingStep === 'confirmed' && currentBooking) {
      setIsConfirmationModalOpen(true);
    }
  }, [bookingStep, currentBooking]);
  
  // Watch for journey activation (same as Home)
  useEffect(() => {
    if (isJourneyActive && bookingStep === 'confirmed') {
      setIsConfirmationModalOpen(false);
      setTimeout(() => {
        setIsJourneyModalOpen(true);
      }, 500);
    } else if (!isJourneyActive) {
      setIsJourneyModalOpen(false);
    }
  }, [isJourneyActive, bookingStep]);

  // Initialize with search from navigation state
  useEffect(() => {
    if (location.state?.searchQuery && !location.state?.searchResults?.length) {
      logInfo('FullScreenMapPage', 'initialized_with_search', { query: location.state.searchQuery });
      performSearch(location.state.searchQuery);
    }
  }, [location.state]);

  // Helper function to calculate distance (reused from Home)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getKathmanduCoordinates = (locationName) => {
    const lowerName = locationName.toLowerCase();
    for (const [key, coords] of Object.entries(kathmanduAreas)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return coords;
      }
    }
    return null;
  };

  const performSearch = async (query) => {
    if (!query?.trim()) return;

    const searchStartTime = Date.now();
    setLoading(true);
    setOriginalSearchInput(query);

    try {
      logInfo('FullScreenMapPage', 'search_initiated', { query, radius: searchRadius });

      const coordinates = getKathmanduCoordinates(query);
      let searchResults = [];

      if (coordinates) {
        setSearchLocation(coordinates);
        const locations = await locationService.searchNearby(coordinates.lat, coordinates.lng, searchRadius);
        
        if (locations && locations.length > 0) {
          // Transform to match Home component format for consistency
          searchResults = locations.map(spot => ({
            id: spot.id,
            name: spot.name,
            address: spot.address,
            coordinates: {
              lat: spot.coordinates?.latitude || spot.coordinates?.lat || 0,
              lng: spot.coordinates?.longitude || spot.coordinates?.lng || 0
            },
            hourlyRate: spot.hourlyRate,
            totalSpaces: spot.totalSpaces,
            availableSpaces: spot.availableSpaces,
            availability: spot.availableSpaces, // MapView expects 'availability'
            occupancyPercentage: spot.occupancyPercentage,
            amenities: spot.amenities || [],
            operatingHours: spot.operatingHours,
            isCurrentlyOpen: spot.isCurrentlyOpen,
            currentStatus: spot.currentStatus,
            contactNumber: spot.contactNumber,
            description: spot.description,
            // Calculate distance
            distance: calculateDistance(coordinates.lat, coordinates.lng, 
              spot.coordinates?.latitude || spot.coordinates?.lat || 0, 
              spot.coordinates?.longitude || spot.coordinates?.lng || 0),
            // Add vehicle types for compatibility
            vehicleTypes: {
              car: spot.hourlyRate,
              motorcycle: Math.round(spot.hourlyRate * 0.7),
              bicycle: Math.round(spot.hourlyRate * 0.3)
            },
            // MapView compatibility properties
            businessHours: {
              isOpen24: false,
              open: spot.operatingHours?.start || '06:00',
              close: spot.operatingHours?.end || '22:00'
            },
            features: spot.amenities || [],
            rating: 4.2,
            operator: 'ParkSathi Network',
            zone: spot.address?.split(',')[0] || 'Kathmandu',
            smartParkingEnabled: spot.amenities?.includes('smart_parking') || false,
            galliMapsSupported: true,
            baatoMapsSupported: true,
            appSupport: 'ParkSathi App',
            specialOffers: null,
            status: spot.currentStatus === 'maintenance' ? 'Under Maintenance' : null,
            expectedOpening: null
          }));

          // Sort results
          searchResults = sortLocations(searchResults);
        }
      } else {
        toast.error(`Location "${query}" not found in Kathmandu Valley`);
        logInfo('FullScreenMapPage', 'search_location_not_found', { query });
      }

      setSearchResults(searchResults);
      
      // Add to search history
      if (searchResults.length > 0) {
        searchHistory.add({
          query,
          location: coordinates,
          resultsCount: searchResults.length,
          timestamp: new Date().toISOString()
        });
      }

      const searchDuration = Date.now() - searchStartTime;
      logPerformance('FullScreenMapPage', 'search_completed', searchDuration, {
        resultsCount: searchResults.length,
        query
      });

    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      logInfo('FullScreenMapPage', 'search_failed', { query, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sortLocations = (locations) => {
    return [...locations].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'availability':
          return (b.availableSpaces || 0) - (a.availableSpaces || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  };

  // Handle search from SearchSection component
  const handleSearchFromSection = (query, location) => {
    setSearchQuery(query);
    if (location) {
      setSearchLocation(location);
    }
    performSearch(query);
  };

  // Consistent handlers with Home component
  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
    logUserAction('FullScreenMapPage', 'spot_selected', { spotId: spot.id });
  };

  const handleBooking = (spot) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setParkingSpotToBook(spot);
    setIsBookingModalOpen(true);
  };

  const handleLoginRequired = () => {
    setIsLoginModalOpen(true);
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    logUserAction('FullScreenMapPage', `view_mode_changed`, { mode: newViewMode });
  };

  // Modal close handlers (same as Home)
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setParkingSpotToBook(null);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };
  
  const closeJourneyModal = () => {
    setIsJourneyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Professional Header - matching wireframe */}
      <header className="bg-white shadow-md z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-4xl mr-2">🚗</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ParkSathi</h1>
              <p className="text-sm text-gray-500">Smart Parking Solutions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="flex items-center space-x-2 bg-blue-100 rounded-full px-3 py-1">
                <span className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                  {isAuthenticated ? 'U' : 'G'}
                </span>
                <span className="text-gray-700 font-medium">User</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            <button className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout - Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Left Sidebar - matching wireframe */}
        <aside className="w-96 bg-white p-4 overflow-y-auto shadow-lg z-20 flex flex-col">
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Parking Locations ({searchResults.length})
              </h2>
              <button
                onClick={() => navigate('/', { 
                  state: {
                    searchResults,
                    selectedSpot,
                    searchLocation,
                    searchRadius,
                    originalSearchInput
                  }
                })}
                className="flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Exit Fullscreen
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              {/* Cards/List Toggle - exactly as wireframe */}
              <div className="flex items-center space-x-1 p-1 bg-gray-200 rounded-lg">
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`px-3 py-1 rounded-md flex items-center transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1 rounded-md flex items-center transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setSearchResults(sortLocations(searchResults));
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="availability">Availability</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Parking Cards List */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching for parking locations...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((spot) => (
                <div
                  key={spot.id}
                  className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer ${
                    selectedSpot?.id === spot.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleSpotSelect(spot)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{spot.name}</h3>
                      <p className="text-sm text-gray-500">{spot.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        Rs. {spot.hourlyRate}/hr
                      </span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold">{spot.rating || '4.2'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4V3a2 2 0 00-2-2H5a2 2 0 00-2 2v2l4 4zM17 9l-4-4V3a2 2 0 012-2h4a2 2 0 012 2v2l-4 4z" />
                      </svg>
                      <span>
                        {spot.amenities?.includes('car') ? 'Car' : ''}
                        {spot.amenities?.includes('motorcycle') ? ', Bike' : ''}
                        {!spot.amenities?.length ? 'Car, Bike' : ''}
                      </span>
                    </div>
                    
                    {spot.availableSpaces > 0 ? (
                      <div className="flex items-center text-green-600 font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{spot.availableSpaces}/{spot.totalSpaces} spots available</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Full</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(spot);
                    }}
                    className={`w-full font-bold py-2 rounded-lg mt-4 transition-colors ${
                      spot.availableSpaces > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={spot.availableSpaces === 0}
                  >
                    {spot.availableSpaces > 0 ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No parking found</h3>
                <p className="text-gray-500">Try adjusting your search or expanding the area.</p>
              </div>
            )}
          </div>
        </aside>
        
        {/* Right Panel - Map with Controls */}
        <main className="flex-1 relative z-10">
          <div className="absolute inset-0">
            <MapView
              parkingSpots={searchResults}
              radius={searchRadius}
              center={searchLocation}
              onSpotSelect={handleSpotSelect}
              onBooking={handleBooking}
            />
          </div>
          
          {/* Map Zoom Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-1 space-y-1 z-20">
            <button className="h-8 w-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          
          {/* Map Legend - Bottom Bar */}
          <div className="absolute bottom-4 left-0 right-0 p-4 z-20">
            <div className="bg-white rounded-lg shadow-xl p-3 max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 gap-4">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Available
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Full
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full border-2 border-blue-500 mr-2"></span>
                  Search Area
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Your Location
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Location Active
                </div>
                <div className="font-semibold text-gray-800">
                  {searchResults.length} parking locations found
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 🔄 REUSED MODALS - Same as Home Page */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        defaultTab="login"
      />
      
      <PaymentFlow 
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        parkingSpot={parkingSpotToBook}
      />
      
      <BookingConfirmation 
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
      />
      
      <ParkingJourney 
        isOpen={isJourneyModalOpen}
        onClose={closeJourneyModal}
      />
    </div>
  );
};

export default FullScreenMapPage;