import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import ParkingMarketingGrid from './ParkingMarketingGrid';
import specialOffersService from '../services/specialOffersService';

const ParkingList = ({ parkingSpots, onBooking, selectedSpot, onLoginRequired, onSpotSelect }) => {
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('cards'); // 'list' or 'cards'
  const [favorites, setFavorites] = useState(new Set());
  const [highlightedSpot, setHighlightedSpot] = useState(null);
  const { isAuthenticated } = useAuth();
  const listContainerRef = useRef(null);
  const spotRefs = useRef({});

  // Check if any locations have marketing data to show marketing view by default
  const hasMarketingData = parkingSpots.some(spot => 
    spot.marketing || spot.landmarkName || spot.category
  );

  // Auto-set to cards view if marketing data is available
  useEffect(() => {
    if (hasMarketingData && viewMode !== 'list') {
      setViewMode('cards');
    }
  }, [hasMarketingData, viewMode]);

  const handleBookingClick = (spot) => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    onBooking(spot);
  };

  // Handle view details - switch to list view and highlight the spot
  const handleViewDetails = (spot) => {
    // Switch to list view for detailed view
    setViewMode('list');
    
    // Highlight the spot
    setHighlightedSpot(spot.id);
    
    // Call parent's spot select handler if available
    if (onSpotSelect) {
      onSpotSelect(spot);
    }
    
    // Auto-scroll to the spot after a short delay to ensure DOM is updated
    setTimeout(() => scrollToSpot(spot.id), 100);
    
    // Remove highlight after a few seconds
    setTimeout(() => setHighlightedSpot(null), 3000);
  };

  // Scroll to specific spot in list view
  const scrollToSpot = (spotId) => {
    const spotElement = spotRefs.current[spotId];
    if (spotElement && listContainerRef.current) {
      spotElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  const toggleFavorite = (spotId) => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    const newFavorites = new Set(favorites);
    if (newFavorites.has(spotId)) {
      newFavorites.delete(spotId);
    } else {
      newFavorites.add(spotId);
    }
    setFavorites(newFavorites);
    // TODO: Save to backend/localStorage
  };

  const sortedSpots = [...parkingSpots].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'availability':
        return b.availability - a.availability;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.distance - b.distance;
    }
  });

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatHours = (hours) => {
    if (!hours.isOpen24) {
      return `${hours.open} - ${hours.close}`;
    }
    return '24/7';
  };

  const getAvailabilityColor = (availability, total) => {
    const percentage = (availability / total) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Count special offers
  const spotsWithOffers = parkingSpots.filter(spot => 
    specialOffersService.hasActiveOffers(spot)
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Parking Locations ({parkingSpots.length})
            </h3>
            {spotsWithOffers > 0 && (
              <p className="text-sm text-green-600 font-medium mt-1">
                🎁 {spotsWithOffers} location{spotsWithOffers !== 1 ? 's' : ''} with special offers
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🎴 Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📋 List
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="distance">Distance</option>
                <option value="price">Price</option>
                <option value="availability">Availability</option>
                <option value="rating">Rating</option>
                {hasMarketingData && (
                  <>
                    <option value="offers">Special Offers</option>
                    <option value="category">Category</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Rendering Based on View Mode */}
      {viewMode === 'cards' ? (
        <div className="p-4">
          <ParkingMarketingGrid
            parkingSpots={sortedSpots}
            onBookNow={handleBookingClick}
            onViewDetails={handleViewDetails}
            selectedSpot={selectedSpot}
            sortBy={sortBy}
          />
        </div>
      ) : (
        <div ref={listContainerRef} className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {sortedSpots.map((spot) => {
            // Add special offers to each spot for list view
            const offers = specialOffersService.generateSpecialOffers(spot);
            const bestOffer = specialOffersService.getBestOffer(spot);
            const enhancedSpot = { ...spot, specialOffers: offers, bestOffer };
            
            const isSelected = selectedSpot?.id === enhancedSpot.id;
            const isHighlighted = highlightedSpot === enhancedSpot.id;
            
            return (
            <div 
              key={enhancedSpot.id}
              ref={el => spotRefs.current[enhancedSpot.id] = el}
              onClick={() => onSpotSelect?.(enhancedSpot)}
              className={`p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer relative ${
                isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              } ${
                isHighlighted ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-400 shadow-lg transform scale-[1.02]' : ''
              }`}
            >
              {/* Highlighted Indicator */}
              {isHighlighted && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  <span>👁️</span>
                  <span>View Details</span>
                </div>
              )}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 mb-1">{enhancedSpot.name}</h4>
                    {enhancedSpot.bestOffer && (
                      <span className={`px-2 py-1 text-xs rounded-full text-white bg-${enhancedSpot.bestOffer.color}-500`}>
                        {enhancedSpot.bestOffer.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(enhancedSpot.id);
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      favorites.has(enhancedSpot.id)
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title={favorites.has(enhancedSpot.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-2">{enhancedSpot.address}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {formatDistance(enhancedSpot.distance)}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatHours(enhancedSpot.businessHours || enhancedSpot.operatingHours)}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {enhancedSpot.rating || 4.5}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {enhancedSpot.bestOffer && enhancedSpot.bestOffer.discountedPrice ? (
                  <div>
                    <div className="text-lg font-bold text-green-600 mb-1">
                      रु {enhancedSpot.bestOffer.discountedPrice}/hr
                      <span className="text-sm text-gray-400 line-through ml-2">
                        रु {enhancedSpot.hourlyRate}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Save रु {enhancedSpot.hourlyRate - enhancedSpot.bestOffer.discountedPrice}/hr
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    रु {enhancedSpot.hourlyRate}/hr
                  </div>
                )}
                {enhancedSpot.vehicleTypes?.motorcycle && (
                  <div className="text-sm text-gray-600">
                    रु {enhancedSpot.vehicleTypes.motorcycle}/hr (motorcycle)
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(enhancedSpot.availableSpaces || enhancedSpot.availability, enhancedSpot.totalSpaces)}`}>
                  {(enhancedSpot.availableSpaces || enhancedSpot.availability) > 0 ? (
                    `${enhancedSpot.availableSpaces || enhancedSpot.availability}/${enhancedSpot.totalSpaces} available`
                  ) : (
                    'Full'
                  )}
                </span>
                
                {/* Display category badge if available */}
                {enhancedSpot.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                    {enhancedSpot.category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )}
                
                {(enhancedSpot.features || enhancedSpot.amenities?.slice(0, 3) || []).map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {feature.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleBookingClick(enhancedSpot)}
                disabled={(enhancedSpot.availableSpaces || enhancedSpot.availability) === 0}
                className={`px-4 py-2 rounded font-medium text-sm transition ${
                  (enhancedSpot.availableSpaces || enhancedSpot.availability) > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {(enhancedSpot.availableSpaces || enhancedSpot.availability) > 0 ? (isAuthenticated ? 'Book Now' : 'Sign in to Book') : 'Full'}
              </button>
            </div>

            {/* Enhanced Special Offers Display */}
            {enhancedSpot.bestOffer && (
              <div className={`mt-2 p-3 bg-gradient-to-r rounded-lg text-sm`} 
                   style={{
                     background: `linear-gradient(135deg, var(--color-${enhancedSpot.bestOffer.color === 'green' ? 'success' : enhancedSpot.bestOffer.color === 'red' ? 'error' : 'warning'}), rgba(255,255,255,0.9))`
                   }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {enhancedSpot.bestOffer.icon} {enhancedSpot.bestOffer.title}
                    </div>
                    <div className="text-white opacity-90 text-xs mt-1">
                      {enhancedSpot.bestOffer.description}
                    </div>
                  </div>
                  {enhancedSpot.bestOffer.validUntil && (
                    <div className="text-white text-xs opacity-80 text-right">
                      Expires in: {specialOffersService.formatTimeRemaining(
                        (enhancedSpot.bestOffer.validUntil.getTime() - new Date().getTime()) / 60000
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          );
          })}
        </div>
      )}

      {parkingSpots.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg mb-2">No parking locations found</p>
          <p className="text-sm">Try expanding your search radius or searching in a different area</p>
        </div>
      )}
    </div>
  );
};

export default ParkingList;