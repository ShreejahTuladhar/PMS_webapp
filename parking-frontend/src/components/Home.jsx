import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import SearchSection from './SearchSection';
import MapView from './MapView';
import ParkingList from './ParkingList';
import AuthModal from './auth/AuthModal';
import BookingModal from './booking/BookingModal';
import BookingConfirmation from './booking/BookingConfirmation';
import Footer from './Footer';
import { calculateDistance, kathmanduAreas } from '../data/kathmanduParkingData';
import kathmanduRealParkingDataExport from '../data/kathmanduRealParkingData';

function Home() {
  const { isAuthenticated } = useAuth();
  const { currentBooking, bookingStep } = useBooking();
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchRadius, setSearchRadius] = useState(2);
  const [searchLocation, setSearchLocation] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [parkingSpotToBook, setParkingSpotToBook] = useState(null);

  // Watch for booking confirmation
  useEffect(() => {
    if (bookingStep === 'confirmed' && currentBooking) {
      setIsConfirmationModalOpen(true);
    }
  }, [bookingStep, currentBooking]);

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
    
    // Calculate distances and filter by radius
    const parkingWithDistances = kathmanduRealParkingDataExport.map(parking => ({
      ...parking,
      distance: calculateDistance(searchLat, searchLng, parking.coordinates.lat, parking.coordinates.lng)
    }));
    
    const filteredResults = parkingWithDistances.filter(spot => spot.distance <= searchRadius);
    
    setSearchResults(filteredResults);
    setSearchLocation(searchLoc);
    setIsSearched(true);
    setSelectedSpot(null);
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    
    if (searchResults.length > 0 && searchLocation) {
      // Recalculate with new radius
      const parkingWithDistances = kathmanduRealParkingDataExport.map(parking => ({
        ...parking,
        distance: calculateDistance(searchLocation.lat, searchLocation.lng, parking.coordinates.lat, parking.coordinates.lng)
      }));
      
      const filteredResults = parkingWithDistances.filter(spot => spot.distance <= newRadius);
      setSearchResults(filteredResults);
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
                    Parking Options Near You
                  </h2>
                  <p className="text-gray-600">
                    Found {searchResults.length} parking locations within {searchRadius}km
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose ParkSmart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our smart parking solution makes finding and booking parking spaces effortless with real-time availability and competitive pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">Find parking spaces near your destination with customizable radius and real-time availability.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
              <p className="text-gray-600">Compare prices across multiple parking locations and choose the most affordable option.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">Reserve your parking spot in advance and get guaranteed access with QR code entry.</p>
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