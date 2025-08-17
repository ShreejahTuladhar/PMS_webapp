import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import SearchSection from './SearchSection';
import MapView from './MapView';
import ParkingList from './ParkingList';
import PremiumLocationBanner from './PremiumLocationBanner';
import AuthModal from './auth/AuthModal';
import BookingModal from './booking/BookingModal';
import BookingConfirmation from './booking/BookingConfirmation';
import Footer from './Footer';
import { locationService } from '../services';
import searchHistory from '../utils/searchHistory';

function Home({ focusSearch = false }) {
  const { isAuthenticated } = useAuth();
  const { currentBooking, bookingStep } = useBooking();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchRadius, setSearchRadius] = useState(0.5);
  const [searchLocation, setSearchLocation] = useState(null);
  const [originalSearchInput, setOriginalSearchInput] = useState(null); // Track original search input
  const [isSearched, setIsSearched] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [parkingSpotToBook, setParkingSpotToBook] = useState(null);
  const [_loading, setLoading] = useState(false);

  // Watch for booking confirmation
  useEffect(() => {
    if (bookingStep === 'confirmed' && currentBooking) {
      setIsConfirmationModalOpen(true);
    }
  }, [bookingStep, currentBooking]);

  // Handle redirect from ProtectedRoute to open login modal
  useEffect(() => {
    if (location.state?.openLogin) {
      setIsLoginModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.state?.openLogin]);

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Kathmandu area coordinates
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

  const handleSearch = async (location, searchType = 'manual') => {
    // Validate search parameters before proceeding
    if (!location) {
      console.warn('Search called without location parameter');
      return;
    }
    
    if (typeof location === 'string' && !location.trim()) {
      console.warn('Search called with empty string');
      return;
    }
    
    if (typeof location === 'object' && (!location.lat || !location.lng)) {
      console.warn('Search called with invalid location object:', location);
      return;
    }
    
    console.log('🔍 Home: Searching for parking near:', location, 'Type:', searchType);
    
    // Show special handling for current location searches
    if (searchType === 'current_location' || location.isCurrentLocation) {
      console.log('🌍 Home: Processing current location search with coordinates:', {
        lat: location.lat,
        lng: location.lng
      });
    }
    
    // Store original search input for radius changes
    setOriginalSearchInput(location);
    
    let searchLat, searchLng, searchLoc, searchQuery, locationTrimmed;
    
    if (typeof location === 'string') {
      // Validate string input
      locationTrimmed = location.trim();
      if (!locationTrimmed) {
        console.warn('Empty search string provided');
        return;
      }
      
      // For text searches, we'll let the backend handle location detection
      // Use a central Kathmandu coordinate as initial fallback, but backend will override this
      let defaultCoords = kathmanduAreas.ratnapark; // Central Kathmandu fallback
      
      // Try to get coordinates from known areas first as a hint
      try {
        const coordsResult = await locationService.getCoordinatesForLocationName(locationTrimmed);
        if (coordsResult.success && coordsResult.coordinates) {
          defaultCoords = coordsResult.coordinates;
          console.log(`🎯 Using extracted coordinates for "${locationTrimmed}":`, defaultCoords);
        } else {
          // Quick check for known area names (this is just a fallback, backend will handle the real search)
          const locationLower = locationTrimmed.toLowerCase();
          for (const [areaName, coords] of Object.entries(kathmanduAreas)) {
            if (locationLower.includes(areaName.toLowerCase()) || 
                areaName.toLowerCase().includes(locationLower)) {
              defaultCoords = coords;
              console.log(`🗺️ Using known area coordinates for "${locationTrimmed}":`, defaultCoords);
              break;
            }
          }
        }
      } catch (error) {
        console.warn('Error getting coordinates from extracted data, using fallback:', error);
      }
      
      // These are just initial coordinates - backend will provide the actual search center
      searchLat = defaultCoords.lat;
      searchLng = defaultCoords.lng;
      searchQuery = locationTrimmed;
      searchLoc = {
        address: locationTrimmed,
        lat: searchLat,
        lng: searchLng,
        isCurrentLocation: false
      };
    } else {
      // Location is already an object with coordinates
      // Validate coordinates
      if (!location.lat || !location.lng || 
          isNaN(location.lat) || isNaN(location.lng) ||
          location.lat < -90 || location.lat > 90 ||
          location.lng < -180 || location.lng > 180) {
        console.warn('Invalid coordinates provided:', location);
        return;
      }
      
      searchLat = location.lat;
      searchLng = location.lng;
      searchQuery = location.address || 'Current Location';
      searchLoc = location;
    }
    
    setLoading(true);
    const searchStartTime = Date.now();
    
    try {
      let response = null;
      let usedFallback = false;
      
      // Try backend search API first, but fallback immediately if it fails
      console.log('🔗 Home: Attempting backend search API...');
      try {
        // Use text-based search if the original input was a string
        if (typeof location === 'string') {
          console.log('🔍 Home: Using text-based search for:', locationTrimmed);
          response = await locationService.searchParkingSpotsByText(
            locationTrimmed,
            searchRadius,
            {
              isActive: true,
              limit: 50,
            }
          );
        } else {
          console.log('🗺️ Home: Using coordinate-based search for:', { lat: searchLat, lng: searchLng });
          console.log('📍 Home: Search radius:', searchRadius, 'km');
          response = await locationService.searchParkingSpots(
            { lat: searchLat, lng: searchLng },
            searchRadius,
            {
              isActive: true,
              limit: 50,
              sortBy: 'distance'
            }
          );
          console.log('📦 Home: Backend API response:', response);
        }
        
        // Check if the response indicates an error even with success flag
        if (!response.success || response.error) {
          throw new Error(response.error || 'Backend search API returned error');
        }
        
        // Check if no results were found, might indicate backend database is empty or search issue
        const resultSpots = response.parkingSpots || response.data || [];
        if (resultSpots.length === 0) {
          console.warn('Backend search returned 0 results, trying fallback method to get all locations');
          throw new Error('No results from backend search, using fallback');
        }
      } catch (searchError) {
        console.warn('Backend search API not available, using fallback method:', searchError.message);
        usedFallback = true;
        
        // Fallback to getAllParkingSpots with client-side filtering
        console.log('🔄 Using fallback: getAllParkingSpots with client-side filtering');
        response = await locationService.getAllParkingSpots({ 
          limit: 100, // Increase limit to get more locations
          // Remove isActive filter to get all locations and filter client-side
        });
        console.log('📦 Fallback response:', response);
      }
      
      const searchDuration = Date.now() - searchStartTime;
      
      if (response && response.success) {
        // Handle different response formats
        let parkingSpots = response.parkingSpots || response.data || [];
        console.log(`🏁 Raw parking spots received: ${parkingSpots.length}`, parkingSpots);
        
        // Update search center coordinates if backend provided them (for text searches)
        if (response.searchInfo && response.searchInfo.searchCenter) {
          const backendSearchCenter = response.searchInfo.searchCenter;
          console.log(`🎯 Using backend search center: ${backendSearchCenter.latitude}, ${backendSearchCenter.longitude}`);
          searchLat = backendSearchCenter.latitude;
          searchLng = backendSearchCenter.longitude;
          searchLoc = {
            address: response.searchInfo.foundLocation?.name || searchQuery,
            lat: searchLat,
            lng: searchLng,
            isCurrentLocation: false,
            foundLocation: response.searchInfo.foundLocation
          };
        }
        
        if (usedFallback) {
          // Apply client-side filtering for fallback
          console.log('Applying client-side filtering for fallback...');
          console.log(`📍 Search coordinates: ${searchLat}, ${searchLng}, radius: ${searchRadius}km`);
          
          parkingSpots = parkingSpots.map(spot => {
            const distance = calculateDistance(searchLat, searchLng, 
              spot.coordinates?.latitude || spot.coordinates?.lat || 0, 
              spot.coordinates?.longitude || spot.coordinates?.lng || 0);
            console.log(`📏 Distance to ${spot.name}: ${distance.toFixed(2)}km`);
            return {
              ...spot,
              distance
            };
          })
          .filter(spot => {
            const withinRadius = spot.distance <= searchRadius;
            console.log(`✅ ${spot.name} within ${searchRadius}km: ${withinRadius}`);
            return withinRadius;
          })
          .sort((a, b) => a.distance - b.distance);
        }
        
        // Transform database format to match expected format
        const parkingLocations = parkingSpots.map(spot => ({
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
          // Calculate distance if not provided by API
          distance: spot.distance || calculateDistance(searchLat, searchLng, 
            spot.coordinates?.latitude || spot.coordinates?.lat || 0, 
            spot.coordinates?.longitude || spot.coordinates?.lng || 0),
          // Add vehicle types for compatibility
          vehicleTypes: {
            car: spot.hourlyRate,
            motorcycle: Math.round(spot.hourlyRate * 0.7), // 30% discount for motorcycles
            bicycle: Math.round(spot.hourlyRate * 0.3)     // 70% discount for bicycles
          },
          // MapView compatibility properties
          businessHours: {
            isOpen24: false, // Default to false, could be derived from operatingHours
            open: spot.operatingHours?.start || '06:00',
            close: spot.operatingHours?.end || '22:00'
          },
          features: spot.amenities || [],
          rating: 4.2, // Default rating, could be calculated from reviews
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
        
        console.log(`🎯 Final result: Found ${parkingLocations.length} locations within ${searchRadius}km using ${usedFallback ? 'fallback method' : 'backend search'}`);
        console.log('🗺️ Parking locations to display on map:', parkingLocations);
        
        // Track successful search
        searchHistory.addRecentSearch(searchQuery, searchLoc);
        
        setSearchResults(parkingLocations);
      } else {
        console.error('Search failed:', response?.error || 'Unknown error');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error during search operation:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
    
    setSearchLocation(searchLoc);
    setIsSearched(true);
    setSelectedSpot(null);
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    
    // Re-search with new radius if we have a previous search
    if (originalSearchInput) {
      console.log(`🔄 Radius changed to ${newRadius}km, re-searching with:`, originalSearchInput);
      handleSearch(originalSearchInput, 'radius_change');
    }
  };

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
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

  // Handler for opening full-screen map mode
  const openFullScreenMap = (searchQuery = '') => {
    navigate('/search/fullscreen', { 
      state: { 
        searchQuery,
        searchResults,
        searchLocation 
      } 
    });
  };

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Animated overlay when auth modal is open */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 to-gray-900/20 z-10 transition-opacity duration-700 ${
        isLoginModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} />
      
      {/* Floating message when content is minimized */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-700 ${
        isLoginModalOpen 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white rounded-xl shadow-xl p-4 max-w-xs border border-blue-200">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Sign In Required</h3>
            <p className="text-xs text-gray-600">
              Complete authentication to book parking
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content Container with smooth animation */}
      <div className={`relative z-0 transition-all duration-700 ease-in-out transform origin-center ${
        isLoginModalOpen 
          ? 'scale-90 opacity-30 blur-sm pointer-events-none' 
          : 'scale-100 opacity-100 pointer-events-auto'
      }`}>
        <SearchSection 
          onSearch={handleSearch}
          onRadiusChange={handleRadiusChange}
          radius={searchRadius}
          focusSearch={focusSearch}
        />

        {isSearched && (
          <div className="container mx-auto px-4 py-8">
            {searchResults.length > 0 ? (
              <>
                {/* Premium Location Banner */}
                <PremiumLocationBanner 
                  parkingSpots={searchResults}
                  onBookNow={handleBooking}
                  onViewDetails={handleSpotSelect}
                />

                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Parking Spots Near You
                  </h2>
                  <div className="flex items-center justify-center space-x-4">
                    <p className="text-gray-600">
                      Found {searchResults.length} friendly parking spots within {searchRadius}km of where you want to go
                    </p>
                    <button
                      onClick={() => openFullScreenMap(searchLocation?.address || '')}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                      title="Open in full-screen mode"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span>Full Screen</span>
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="lg:order-1">
                    <MapView 
                      parkingSpots={searchResults}
                      radius={searchRadius}
                      center={searchLocation}
                      onSpotSelect={handleSpotSelect}
                      onBooking={handleBooking}
                    />
                  </div>
                  
                  <div className="lg:order-2">
                    <ParkingList 
                      parkingSpots={searchResults}
                      onBooking={handleBooking}
                      selectedSpot={selectedSpot}
                      onLoginRequired={handleLoginRequired}
                      onSpotSelect={handleSpotSelect}
                    />
                  </div>
                </div>
              </>
            ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Parking Found</h3>
                <p className="text-gray-600 mb-4">
                  No parking locations found within {searchRadius}km of your search area.
                </p>
                <button 
                  onClick={() => handleRadiusChange(searchRadius + 1)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Expand Search to {searchRadius + 1}km
                </button>
              </div>
            </div>
            )}
          </div>
        )}

        {!isSearched && (
          <div className="container mx-auto px-4 py-12">
            {/* Quick Parking CTA */}
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-blue-100 via-white to-yellow-100 rounded-3xl p-8 shadow-lg border border-blue-200 max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4"></div>
                  <h2 className="text-4xl font-bold text-gray-700 mb-4">
                    Need Parking? <span className="text-orange-600">Let's Go!</span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Need Parking? Come on in! • Our friendly, local parking helper makes it super easy!
                  </p>
                  
                  <Link
                    to="/parking"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Start Parking Journey
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>30-second setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">•</span>
                      <span>Digital ticket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">•</span>
                      <span>Instant entry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose ParkSathi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Made by Nepali neighbors for Nepali neighbors! Our simple, friendly parking helper makes finding and booking spots easy and affordable across our beautiful valley.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Finding</h3>
              <p className="text-gray-600">Find parking spots near you with our simple search. Just type where you're going and we'll help you find a good spot!</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 rounded-full p-4 inline-block mb-4">
              
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Prices</h3>
              <p className="text-gray-600">No hidden fees, no tricks! We keep prices fair and honest so parking doesn't hurt your wallet.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
              
              </div>
              <h3 className="text-xl font-semibold mb-2">Friendly Service</h3>
              <p className="text-gray-600">Real people helping real neighbors! Get your parking ticket quickly with our simple, caring service.</p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Enhanced AuthModal with slide-in animation */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        defaultTab="login"
      />
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        parkingSpot={parkingSpotToBook}
      />
      
      <BookingConfirmation 
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
      />

      
      <Footer />
    </div>
  );
}

export default Home;