import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import SearchSection from './SearchSection';
import MapView from './MapView';
import ParkingList from './ParkingList';
import AuthModal from './auth/AuthModal';
import BookingModal from './booking/BookingModal';
import BookingConfirmation from './booking/BookingConfirmation';
import Footer from './Footer';
import { locationService } from '../services';

function Home() {
  const { isAuthenticated } = useAuth();
  const { currentBooking, bookingStep } = useBooking();
  const location = useLocation();
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchRadius, setSearchRadius] = useState(2);
  const [searchLocation, setSearchLocation] = useState(null);
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
    patan: { lat: 27.6648, lng: 85.3188 }
  };

  const handleSearch = async (location) => {
    console.log('Searching for parking near:', location);
    
    let searchLat, searchLng, searchLoc;
    
    if (typeof location === 'string') {
      // Try to match with known Kathmandu areas
      const locationLower = location.toLowerCase();
      let matchedArea = null;
      
      for (const [areaName, coords] of Object.entries(kathmanduAreas)) {
        if (locationLower.includes(areaName.toLowerCase()) || 
            areaName.toLowerCase().includes(locationLower)) {
          matchedArea = coords;
          break;
        }
      }
      
      // If no match found, default to central Kathmandu (Ratna Park)
      const defaultCoords = matchedArea || kathmanduAreas.ratnapark;
      
      searchLat = defaultCoords.lat;
      searchLng = defaultCoords.lng;
      searchLoc = {
        address: location,
        lat: searchLat,
        lng: searchLng,
        isCurrentLocation: false
      };
    } else {
      // Location is already an object with coordinates
      searchLat = location.lat;
      searchLng = location.lng;
      searchLoc = location;
    }
    
    setLoading(true);
    
    try {
      // Fetch all parking locations from the database
      console.log('📍 Fetching parking locations from database...');
      const response = await locationService.getAllParkingSpots({ 
        limit: 50,
        isActive: true 
      });
      
      if (response.success) {
        // Transform database format to match expected format
        const parkingLocations = response.parkingSpots.map(spot => ({
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
        
        console.log(`📊 Fetched ${parkingLocations.length} parking locations`);
        
        // Calculate distances and filter by radius
        const parkingWithDistances = parkingLocations.map(parking => ({
          ...parking,
          distance: calculateDistance(searchLat, searchLng, parking.coordinates.lat, parking.coordinates.lng)
        }));
        
        const filteredResults = parkingWithDistances
          .filter(spot => spot.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance); // Sort by distance
        
        console.log(`🎯 Found ${filteredResults.length} locations within ${searchRadius}km`);
        
        setSearchResults(filteredResults);
      } else {
        console.error('Failed to fetch locations:', response.error);
        // Fallback to empty results
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching parking locations:', error);
      // Show error to user
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
    
    // Re-search with new radius if we have a previous search location
    if (searchLocation) {
      handleSearch(searchLocation);
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
        />

        {isSearched && (
          <div className="container mx-auto px-4 py-8">
            {searchResults.length > 0 ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    <span className="text-green-600">🅿️</span> Parking Spots Near You • नजिकैको पार्किङ
                  </h2>
                  <p className="text-gray-600">
                    Found {searchResults.length} friendly parking spots within {searchRadius}km of where you want to go
                  </p>
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
                  <div className="text-6xl mb-4">🚗</div>
                  <h2 className="text-4xl font-bold text-gray-700 mb-4">
                    पार्किङ चाहिन्छ? <span className="text-orange-600">आउनुहोस्!</span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Need Parking? Come on in! • Our friendly, local parking helper makes it super easy!
                  </p>
                  
                  <Link
                    to="/parking"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      ✨ Start Parking Journey
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>30-second setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Digital ticket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Instant entry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              <span className="text-green-600">🏠</span> Why Choose ParkSathi? <span className="text-orange-600">किन छान्ने?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Made by Nepali neighbors for Nepali neighbors! Our simple, friendly parking helper makes finding and booking spots easy and affordable across our beautiful valley.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Finding • सजिलो खोजी</h3>
              <p className="text-gray-600">Find parking spots near you with our simple search. Just type where you're going and we'll help you find a good spot!</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 rounded-full p-4 inline-block mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Prices • उचित मूल्य</h3>
              <p className="text-gray-600">No hidden fees, no tricks! We keep prices fair and honest so parking doesn't hurt your wallet.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Friendly Service • मित्रवत् सेवा</h3>
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