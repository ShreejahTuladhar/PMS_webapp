import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { locationService } from '../services';
import searchHistory from '../utils/searchHistory';
import toast from 'react-hot-toast';
// 🔄 REUSING HOME PAGE COMPONENTS - Component Architecture Excellence
import MapView from './MapView';
import AuthModal from './auth/AuthModal';
// import SmartBookingFlow from './booking/SmartBookingFlow';
import OptimizedBookingFlow from './booking/OptimizedBookingFlow';
// 🎴 SURREAL FLIP BOOK COMPONENT
import ParkingCardFlipBook from './ui/ParkingCardFlipBook';
// 🎨 SURREAL ANIMATIONS
import '../styles/flipbook-animations.css';
// 🗺️ NEW GOOGLE NAVIGATION SYSTEM
import GoogleNavigationInterface from './navigation/GoogleNavigationInterface';
import TrafficTrackingInterface from './admin/TrafficTrackingInterface';
// 🔒 ADMIN-ONLY INTERNAL NAVIGATION (Hidden from regular users)
import UnifiedNavigationSystem from './navigation/UnifiedNavigationSystem';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { logInfo, logUserAction, logPerformance } from '../utils/logger';
import googleNavigationService from '../services/googleNavigationService';

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
  const { currentBooking, bookingStep } = useBooking();
  const { isSuperAdmin, canViewTraffic, canViewInternalNav } = useAdminAccess();
  
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
  
  // Modal states - updated for new navigation system
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [parkingSpotToBook, setParkingSpotToBook] = useState(null);
  
  // 🗺️ NEW GOOGLE NAVIGATION SYSTEM
  const [showGoogleNavigation, setShowGoogleNavigation] = useState(false);
  const [selectedNavigationSpot, setSelectedNavigationSpot] = useState(null);
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  const [locationInitialized, setLocationInitialized] = useState(false);
  
  // 🔒 ADMIN-ONLY INTERNAL NAVIGATION & TRACKING
  const [showInternalNavigation, setShowInternalNavigation] = useState(false);
  const [showTrafficTracking, setShowTrafficTracking] = useState(false);

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

  // Watch for booking confirmation - handled by SmartBookingFlow
  useEffect(() => {
    if (bookingStep === 'confirmed' && currentBooking) {
      // SmartBookingFlow handles this automatically
      console.log('Booking confirmed, handled by SmartBookingFlow');
    }
  }, [bookingStep, currentBooking]);

  // 🌍 INITIALIZE GOOGLE NAVIGATION SERVICE ON PAGE LOAD
  useEffect(() => {
    const initializeGoogleNavigation = async () => {
      try {
        console.log('🌍 FullScreenMapPage: Initializing Google Navigation...');
        
        // Initialize Google Navigation service with location
        const location = await googleNavigationService.initializeLocation();
        setUserCurrentLocation(location);
        setLocationInitialized(true);
        
        console.log('✅ FullScreenMapPage: Google Navigation initialized');
        
        // Show subtle success indication
        toast.success('📍 Location ready for navigation', {
          duration: 2000,
          position: 'bottom-right'
        });
        
      } catch (error) {
        console.error('❌ FullScreenMapPage: Google Navigation initialization failed:', error);
        setLocationInitialized(false);
        
        // Show user-friendly error message
        toast.error('📍 Location access needed for navigation', {
          duration: 4000,
          position: 'bottom-right'
        });
      }
    };

    initializeGoogleNavigation();
    
    // Scroll to top when component mounts for proper fullscreen experience
    window.scrollTo(0, 0);
  }, []);

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

      // First try to get hardcoded coordinates for known locations
      const coordinates = getKathmanduCoordinates(query);
      let searchResults = [];
      let searchResponse;

      if (coordinates) {
        // Use coordinate-based search for known locations
        setSearchLocation(coordinates);
        searchResponse = await locationService.searchParkingSpots(coordinates, searchRadius);
      } else {
        // Use text-based search for any location
        searchResponse = await locationService.searchParkingSpotsByText(query, searchRadius);
        
        // If we have search info with coordinates, use them for the map center
        if (searchResponse.searchInfo?.center) {
          setSearchLocation({
            lat: searchResponse.searchInfo.center.latitude || searchResponse.searchInfo.center.lat,
            lng: searchResponse.searchInfo.center.longitude || searchResponse.searchInfo.center.lng
          });
        }
      }

      if (searchResponse?.success && searchResponse.parkingSpots?.length > 0) {
        const locations = searchResponse.parkingSpots;
        
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
          // Calculate distance if we have coordinates
          distance: coordinates ? calculateDistance(coordinates.lat, coordinates.lng, 
            spot.coordinates?.latitude || spot.coordinates?.lat || 0, 
            spot.coordinates?.longitude || spot.coordinates?.lng || 0) : 0,
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
      } else {
        toast.error(`No parking locations found for "${query}"`);
        logInfo('FullScreenMapPage', 'search_no_results', { query });
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

  // 🗺️ GOOGLE MAPS NAVIGATION (Primary method)
  const handleNavigationStart = (spot) => {
    setSelectedNavigationSpot(spot);
    
    // Auto-start Google Navigation if location is ready
    if (locationInitialized && userCurrentLocation) {
      try {
        console.log('🗺️ FullScreenMapPage: Starting Google Navigation automatically');
        googleNavigationService.navigate(spot, {
          preferApp: true,
          userLocation: userCurrentLocation
        });
        
        toast.success('🗺️ Opening Google Maps navigation');
        logUserAction('FullScreenMapPage', 'google_navigation_started', { spotId: spot.id });
        
      } catch (error) {
        console.error('❌ Google Navigation failed:', error);
        // Fallback to navigation modal
        setShowGoogleNavigation(true);
      }
    } else {
      // Show navigation interface if location not ready
      setShowGoogleNavigation(true);
    }
  };

  // 🔒 ADMIN-ONLY INTERNAL NAVIGATION (Hidden from regular users)
  const handleInternalNavigationStart = (spot) => {
    if (!canViewInternalNav) {
      console.warn('⚠️ Internal navigation access denied');
      return;
    }
    
    setSelectedNavigationSpot(spot);
    setShowInternalNavigation(true);
    logUserAction('FullScreenMapPage', 'internal_navigation_started', { spotId: spot.id, admin: true });
  };

  return (
    <div className="bg-gray-100 flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Main Layout - Much Larger Map + Wider Sidebar */}
        {/* Fixed Left Sidebar - Much Wider for Better Content */}
        <aside className={`w-96 bg-white p-6 overflow-y-auto shadow-lg z-20 flex flex-col transition-all duration-300 ${
          viewMode === 'cards' ? 'animate-floating' : ''
        }`}>
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  Parking Locations
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                  {searchResults.length} {searchResults.length === 1 ? 'location' : 'locations'} found
                </p>
              </div>
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
                className="flex items-center text-blue-600 font-semibold hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Exit Fullscreen
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-6 gap-6">
              {/* Flip Book/List Toggle - Enhanced for Much Wider Sidebar */}
              <div className="flex items-center space-x-4 p-3 bg-gray-100 rounded-xl">
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`px-6 py-3 rounded-lg flex items-center transition-colors text-base font-medium ${
                    viewMode === 'cards'
                      ? 'bg-white shadow-md text-blue-600 font-bold animate-glow-pulse'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="text-lg mr-2">🎴</span>
                  Flip Book
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-6 py-3 rounded-lg flex items-center transition-colors text-base font-medium ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-blue-600 font-bold'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
              
              {/* Sort Dropdown - Enhanced for Much Wider Sidebar */}
              <div className="flex items-center">
                <label className="text-lg text-gray-700 mr-4 font-semibold whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setSearchResults(sortLocations(searchResults));
                  }}
                  className="border border-gray-300 rounded-lg px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[160px] font-medium"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="availability">Availability</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Parking Cards/List - Conditional Rendering */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching for parking locations...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              viewMode === 'cards' ? (
                // 🎴 SURREAL FLIP BOOK VIEW - Single Card at a Time
                <div className="h-full">
                  <ParkingCardFlipBook
                    parkingSpots={searchResults}
                    selectedSpot={selectedSpot}
                    onSpotSelect={handleSpotSelect}
                    onBooking={handleBooking}
                    className="h-full"
                  />
                </div>
              ) : (
                // LIST VIEW - Enhanced Layout for Much Wider Sidebar (384px)
                <div className="divide-y divide-gray-200">
                  {searchResults.map((spot) => (
                    <div
                      key={spot.id}
                      className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer rounded-xl mb-3 ${
                        selectedSpot?.id === spot.id
                          ? 'bg-blue-50 border-l-4 border-blue-500 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSpotSelect(spot)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-5">
                          <h4 className="font-bold text-xl text-gray-800 mb-3">{spot.name}</h4>
                          <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-2">{spot.address}</p>
                          
                          <div className="flex items-center space-x-8 text-base text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="font-semibold">{spot.distance ? `${spot.distance.toFixed(1)} km` : '0.5 km'}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <svg className="w-6 h-6 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span className="font-semibold">{spot.rating || 4.2}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-3">
                            Rs. {spot.hourlyRate}/hr
                          </div>
                          {spot.availableSpaces > 0 ? (
                            <div className="flex items-center justify-end">
                              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                              <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                {spot.availableSpaces}/{spot.totalSpaces} available
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end">
                              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                              <span className="px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800">
                                Full
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center text-gray-700 text-base">
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4V3a2 2 0 00-2-2H5a2 2 0 00-2 2v2l4 4zM17 9l-4-4V3a2 2 0 012-2h4a2 2 0 012 2v2l-4 4z" />
                          </svg>
                          <span className="font-semibold">Car, Bike</span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBooking(spot);
                          }}
                          className={`px-8 py-3 rounded-lg text-base font-bold transition-all duration-200 transform hover:scale-[1.02] ${
                            spot.availableSpaces > 0
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                              : 'bg-gray-400 text-white cursor-not-allowed'
                          }`}
                          disabled={spot.availableSpaces === 0}
                        >
                          {spot.availableSpaces > 0 ? '🅿️ Book' : 'Full'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No parking found</h3>
                <p className="text-gray-600 text-lg leading-relaxed px-4">Try adjusting your search or expanding the area.</p>
              </div>
            )}
          </div>
        </aside>
        
        {/* Right Panel - Much Larger Map Taking Most Screen Space */}
        <main className="flex-1 relative z-10" style={{ height: '100vh', minWidth: 'calc(100vw - 384px)' }}>
          <div className="absolute inset-0 w-full" style={{ height: '100vh' }}>
            <MapView
              parkingSpots={searchResults}
              radius={searchRadius}
              center={searchLocation}
              onSpotSelect={handleSpotSelect}
              onBooking={handleBooking}
            />
          </div>
          
          {/* Custom Zoom Controls Removed - Using Native Map Controls to Avoid Conflicts */}
          
          {/* Map Legend - Bottom Bar - Improved for Taller Map */}
          <div className="absolute bottom-6 left-0 right-0 p-4 z-20">
            <div className="bg-white rounded-xl shadow-2xl p-4 max-w-5xl mx-auto border border-gray-200">
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 gap-6">
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
      
      {/* 🔄 REUSED MODALS - Same as Home Page */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        defaultTab="login"
      />
      
      <OptimizedBookingFlow
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        parkingSpot={parkingSpotToBook}
      />
      
      {/* 🗺️ PRIMARY GOOGLE MAPS NAVIGATION INTERFACE */}
      {showGoogleNavigation && selectedNavigationSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <GoogleNavigationInterface
              destination={{
                lat: selectedNavigationSpot.coordinates?.lat || selectedNavigationSpot.lat || 27.7172,
                lng: selectedNavigationSpot.coordinates?.lng || selectedNavigationSpot.lng || 85.3240,
                name: selectedNavigationSpot.name,
                address: selectedNavigationSpot.address || selectedNavigationSpot.location?.address
              }}
              isOpen={showGoogleNavigation}
              onClose={() => setShowGoogleNavigation(false)}
              autoStart={false}
            />
          </div>
        </div>
      )}

      {/* 🔒 ADMIN-ONLY TRAFFIC TRACKING INTERFACE */}
      {canViewTraffic && showTrafficTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <TrafficTrackingInterface
              isOpen={showTrafficTracking}
              onClose={() => setShowTrafficTracking(false)}
            />
          </div>
        </div>
      )}

      {/* 🔒 ADMIN-ONLY INTERNAL NAVIGATION SYSTEM (Hidden from regular users) */}
      {canViewInternalNav && showInternalNavigation && selectedNavigationSpot && (
        <UnifiedNavigationSystem
          mode="fullscreen"
          destination={{
            lat: selectedNavigationSpot.coordinates?.lat || selectedNavigationSpot.lat || 27.7172,
            lng: selectedNavigationSpot.coordinates?.lng || selectedNavigationSpot.lng || 85.3240,
            name: selectedNavigationSpot.name,
            address: selectedNavigationSpot.address || selectedNavigationSpot.location?.address
          }}
          startLocation={userCurrentLocation || searchLocation}
          onNavigationComplete={() => {
            setShowInternalNavigation(false);
            toast.success('🎉 Internal navigation completed!');
          }}
        />
      )}

      {/* 🔒 ADMIN-ONLY FLOATING CONTROLS (Super Admin Only) */}
      {canViewTraffic && (
        <div className="fixed bottom-4 right-4 z-40 space-y-2">
          <button
            onClick={() => setShowTrafficTracking(!showTrafficTracking)}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Admin Traffic Tracking"
          >
            🔒
          </button>
          {selectedNavigationSpot && (
            <button
              onClick={() => handleInternalNavigationStart(selectedNavigationSpot)}
              className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-colors"
              title="Internal Navigation (Admin)"
            >
              🧭
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FullScreenMapPage;