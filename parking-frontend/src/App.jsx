import { useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import MapView from './components/MapView';
import ParkingList from './components/ParkingList';

const mockParkingData = [
  {
    id: 1,
    name: "Downtown Parking Plaza",
    address: "123 Main St, Downtown",
    distance: 0.3,
    hourlyRate: 8,
    vehicleTypes: { car: 8, motorcycle: 4 },
    availability: 15,
    totalSpaces: 50,
    rating: 4.5,
    businessHours: { open: "06:00", close: "22:00", isOpen24: false },
    features: ["Covered", "Security", "EV Charging"],
    specialOffers: "Weekend 20% off"
  },
  {
    id: 2,
    name: "City Center Garage",
    address: "456 Oak Ave, City Center",
    distance: 0.7,
    hourlyRate: 12,
    vehicleTypes: { car: 12, motorcycle: 6 },
    availability: 0,
    totalSpaces: 100,
    rating: 4.2,
    businessHours: { isOpen24: true },
    features: ["Indoor", "Security", "Valet"],
    specialOffers: null
  },
  {
    id: 3,
    name: "Metro Station Parking",
    address: "789 Transit Blvd, Metro Area",
    distance: 1.2,
    hourlyRate: 6,
    vehicleTypes: { car: 6, motorcycle: 3 },
    availability: 25,
    totalSpaces: 75,
    rating: 4.0,
    businessHours: { open: "05:00", close: "23:00", isOpen24: false },
    features: ["Transit Access", "Affordable"],
    specialOffers: "Free first hour for new users"
  },
  {
    id: 4,
    name: "Shopping Mall Parking",
    address: "321 Commerce Way, Mall District",
    distance: 2.1,
    hourlyRate: 5,
    vehicleTypes: { car: 5, motorcycle: 2.5 },
    availability: 40,
    totalSpaces: 200,
    rating: 3.8,
    businessHours: { open: "08:00", close: "22:00", isOpen24: false },
    features: ["Large", "Shopping Access", "Family Friendly"],
    specialOffers: "Free parking with $50+ purchase"
  }
];

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchRadius, setSearchRadius] = useState(2);
  const [searchLocation, setSearchLocation] = useState(null);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = async (location) => {
    console.log('Searching for parking near:', location);
    
    // Mock search - filter results by radius
    const filteredResults = mockParkingData.filter(spot => spot.distance <= searchRadius);
    
    // Set search location with coordinates
    let searchLoc = location;
    if (typeof location === 'string') {
      // Mock coordinates for text search (you would use geocoding API in real app)
      searchLoc = {
        address: location,
        lat: 27.7172, // Default to Kathmandu
        lng: 85.3240,
        isCurrentLocation: false
      };
    }
    
    setSearchResults(filteredResults);
    setSearchLocation(searchLoc);
    setIsSearched(true);
    setSelectedSpot(null);
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    
    // Re-filter results if we have search results
    if (searchResults.length > 0) {
      const filteredResults = mockParkingData.filter(spot => spot.distance <= newRadius);
      setSearchResults(filteredResults);
    }
  };

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
  };

  const handleBooking = (spot) => {
    alert(`Booking initiated for ${spot.name}\nRate: $${spot.hourlyRate}/hr\nAvailability: ${spot.availability} spaces`);
    // Here you would implement the actual booking logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
                  />
                </div>
                
                <div className="lg:order-2">
                  <ParkingList 
                    parkingSpots={searchResults}
                    onBooking={handleBooking}
                    selectedSpot={selectedSpot}
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
  );
}

export default App;
