import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { locationService } from '../services';
import searchHistory from '../utils/searchHistory';
import toast from 'react-hot-toast';
import FullScreenMapView from './FullScreenMapView';

const FullScreenMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [searchRadius, setSearchRadius] = useState(2); // km - use same naming as Home
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 }); // Kathmandu center
  const [sortBy, setSortBy] = useState('distance');
  const [searchLocation, setSearchLocation] = useState(null);
  const [originalSearchInput, setOriginalSearchInput] = useState(null);
  // mapRef removed - using MapView component instead

  // Kathmandu area coordinates (same as Home component)
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

  // Helper function to calculate distance between two coordinates (same as Home)
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

  // Initialize with search results from Home page if available
  useEffect(() => {
    if (location.state?.searchResults) {
      setSearchResults(location.state.searchResults);
      setSearchLocation(location.state.searchLocation);
      setOriginalSearchInput(location.state.searchQuery);
    } else if (searchQuery) {
      // If no search results passed, perform fresh search
      handleSearch(searchQuery);
    }
  }, []);

  // Real backend search function (adapted from Home component)
  const handleSearch = async (locationInput, searchType = 'manual') => {
    // Validate search parameters before proceeding
    if (!locationInput) {
      console.warn('Search called without location parameter');
      return;
    }
    
    if (typeof locationInput === 'string' && !locationInput.trim()) {
      console.warn('Search called with empty string');
      return;
    }
    
    if (typeof locationInput === 'object' && (!locationInput.lat || !locationInput.lng)) {
      console.warn('Search called with invalid location object:', locationInput);
      return;
    }
    
    console.log('Searching for parking near:', locationInput);
    
    // Store original search input for radius changes
    setOriginalSearchInput(locationInput);
    
    let searchLat, searchLng, searchLoc, searchQueryValue, locationTrimmed;
    
    if (typeof locationInput === 'string') {
      // Validate string input
      locationTrimmed = locationInput.trim();
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
      searchQueryValue = locationTrimmed;
      searchLoc = {
        address: locationTrimmed,
        lat: searchLat,
        lng: searchLng,
        isCurrentLocation: false
      };
    } else {
      // Location is already an object with coordinates
      // Validate coordinates
      if (!locationInput.lat || !locationInput.lng || 
          isNaN(locationInput.lat) || isNaN(locationInput.lng) ||
          locationInput.lat < -90 || locationInput.lat > 90 ||
          locationInput.lng < -180 || locationInput.lng > 180) {
        console.warn('Invalid coordinates provided:', locationInput);
        return;
      }
      
      searchLat = locationInput.lat;
      searchLng = locationInput.lng;
      searchQueryValue = locationInput.address || 'Current Location';
      searchLoc = locationInput;
    }
    
    setLoading(true);
    const searchStartTime = Date.now();
    
    try {
      let response = null;
      let usedFallback = false;
      
      // Try backend search API first, but fallback immediately if it fails
      console.log('Attempting backend search API...');
      try {
        // Use text-based search if the original input was a string
        if (typeof locationInput === 'string') {
          console.log('🔍 Using text-based search for:', locationTrimmed);
          response = await locationService.searchParkingSpotsByText(
            locationTrimmed,
            searchRadius,
            {
              isActive: true,
              limit: 50,
            }
          );
        } else {
          console.log('🗺️ Using coordinate-based search for:', { lat: searchLat, lng: searchLng });
          response = await locationService.searchParkingSpots(
            { lat: searchLat, lng: searchLng },
            searchRadius,
            {
              isActive: true,
              limit: 50,
              sortBy: 'distance'
            }
          );
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
            address: response.searchInfo.foundLocation?.name || searchQueryValue,
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
          expectedOpening: null,
          // Additional properties for full-screen map
          isAvailable: spot.availableSpaces > 0,
          type: spot.type || 'general'
        }));
        
        console.log(`🎯 Final result: Found ${parkingLocations.length} locations within ${searchRadius}km using ${usedFallback ? 'fallback method' : 'backend search'}`);
        console.log('🗺️ Parking locations to display on map:', parkingLocations);
        
        // Track successful search
        searchHistory.addRecentSearch(searchQueryValue, searchLoc);
        
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
    setMapCenter({ lat: searchLat, lng: searchLng });
  };

  // Backend integration complete - no need for old sample data loading

  // Removed old loadLocations function - using real backend integration from handleSearch

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    toast.loading('Getting your location...', { id: 'location-loading' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocationData = {
          lat: latitude,
          lng: longitude,
          address: 'Current Location',
          isCurrentLocation: true
        };

        console.log('🌍 Current location detected:', currentLocationData);
        
        try {
          // Update UI state
          setUserLocation(currentLocationData);
          setMapCenter({ lat: latitude, lng: longitude });
          setSearchQuery('Current Location');
          
          // Dismiss loading toast
          toast.dismiss('location-loading');
          toast.success('Location detected successfully');
          
          // Trigger backend search with current location
          await handleSearch(currentLocationData, 'current_location');
          
        } catch (error) {
          console.error('Error searching with current location:', error);
          toast.dismiss('location-loading');
          toast.error('Failed to search parking near your location');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.dismiss('location-loading');
        
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        toast.error(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    
    // Re-search with new radius if we have a previous search
    if (originalSearchInput) {
      console.log(`🔄 Radius changed to ${newRadius}km, re-searching with:`, originalSearchInput);
      handleSearch(originalSearchInput, 'radius_change');
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    // Update map center using the correct coordinate structure
    if (location.coordinates) {
      setMapCenter({
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      });
    }
  };

  const handleBookNow = (location) => {
    toast.success(`Redirecting to booking for ${location.name}`);
    // In real app, navigate to booking page with pre-selected location
  };

  const handleMinimize = () => {
    // Return to previous page with search results
    navigate(-1);
  };

  const getLocationTypeDisplay = (spot) => {
    const name = spot.name.toLowerCase();
    const address = spot.address.toLowerCase();
    const type = spot.type ? spot.type.toLowerCase() : '';
    
    // Hospital
    if (name.includes('hospital') || address.includes('hospital') || type.includes('hospital')) {
      return { abbr: 'H', color: '#DC2626', label: 'Hospital' };
    }
    // School/University/College
    if (name.includes('school') || name.includes('university') || name.includes('college') || 
        address.includes('school') || address.includes('university') || address.includes('college') ||
        type.includes('school') || type.includes('university') || type.includes('college')) {
      return { abbr: 'S', color: '#7C3AED', label: 'School' };
    }
    // Mall
    if (name.includes('mall') || address.includes('mall') || type.includes('mall')) {
      return { abbr: 'M', color: '#059669', label: 'Mall' };
    }
    // Shopping Center
    if (name.includes('shopping') || address.includes('shopping') || type.includes('shopping')) {
      return { abbr: 'SC', color: '#0891B2', label: 'Shopping' };
    }
    // Airport
    if (name.includes('airport') || address.includes('airport') || type.includes('airport')) {
      return { abbr: 'A', color: '#EA580C', label: 'Airport' };
    }
    // Hotel
    if (name.includes('hotel') || address.includes('hotel') || type.includes('hotel')) {
      return { abbr: 'HT', color: '#BE185D', label: 'Hotel' };
    }
    // Office/Business
    if (name.includes('office') || name.includes('business') || address.includes('office') || 
        type.includes('office') || type.includes('business')) {
      return { abbr: 'O', color: '#374151', label: 'Office' };
    }
    // Restaurant
    if (name.includes('restaurant') || name.includes('cafe') || address.includes('restaurant') ||
        type.includes('restaurant') || type.includes('cafe')) {
      return { abbr: 'R', color: '#F59E0B', label: 'Restaurant' };
    }
    // Tourist/Temple/Heritage
    if (name.includes('temple') || name.includes('durbar') || name.includes('tourist') ||
        address.includes('temple') || address.includes('durbar') || type.includes('tourist')) {
      return { abbr: 'T', color: '#8B5CF6', label: 'Tourist' };
    }
    // Default parking
    return { abbr: 'P', color: '#6B7280', label: 'Parking' };
  };

  const getAvailabilityColor = (availableSpaces, totalSpaces) => {
    const percentage = (availableSpaces / totalSpaces) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMinimize}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 font-medium"
              title="Return to main interface"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Minimize</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Full-Screen Parking Search</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Found {searchResults.length} locations</span>
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close and go home"
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
          <FullScreenMapView 
            parkingSpots={searchResults}
            radius={searchRadius}
            center={searchLocation}
            onSpotSelect={handleLocationSelect}
            onBooking={handleBookNow}
          />
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
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
                onClick={handleSearchClick}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
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
            ) : searchResults.length === 0 ? (
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
                {searchResults.map((location) => (
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
                              <div 
                                className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: getLocationTypeDisplay(location).color }}
                                title={getLocationTypeDisplay(location).label}
                              >
                                {getLocationTypeDisplay(location).abbr}
                              </div>
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
                            <div 
                              className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-semibold"
                              style={{ backgroundColor: getLocationTypeDisplay(location).color }}
                              title={getLocationTypeDisplay(location).label}
                            >
                              {getLocationTypeDisplay(location).abbr}
                            </div>
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

export default FullScreenMapPage;