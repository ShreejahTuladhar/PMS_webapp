import React, { useState, useEffect, useCallback, useRef } from 'react';
import NavigateButton from '../navigation/NavigateButton';

/**
 * 🎴 Single Parking Card View
 * A clean, modern single-card interface with smooth scroll navigation
 * Inspired by mobile card-based UIs with gesture support
 */
const SingleParkingCardView = ({ 
  parkingSpots = [], 
  selectedSpot, 
  onSpotSelect, 
  onBooking,
  onLoginRequired,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize current index based on selected spot
  useEffect(() => {
    if (selectedSpot && parkingSpots.length > 0) {
      const index = parkingSpots.findIndex(spot => 
        (spot.id || spot._id) === (selectedSpot.id || selectedSpot._id)
      );
      if (index >= 0 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [selectedSpot, parkingSpots, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (parkingSpots.length <= 1) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          navigateCard('prev');
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          navigateCard('next');
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(parkingSpots.length - 1);
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentIndex, parkingSpots.length]);

  // Touch navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      navigateCard('next'); // Swipe up = next
    } else {
      navigateCard('prev'); // Swipe down = previous
    }
  };

  // Navigation function with smooth animations
  const navigateCard = useCallback((direction) => {
    if (isAnimating || parkingSpots.length <= 1) return;

    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % parkingSpots.length;
    } else if (direction === 'prev') {
      newIndex = currentIndex === 0 ? parkingSpots.length - 1 : currentIndex - 1;
    }

    if (newIndex === currentIndex) return;

    setIsAnimating(true);

    // Update index immediately for smooth transition
    setCurrentIndex(newIndex);
    const newSpot = parkingSpots[newIndex];
    if (newSpot && onSpotSelect) {
      onSpotSelect(newSpot);
    }

    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, parkingSpots, isAnimating, onSpotSelect]);

  // Mouse wheel navigation
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (isAnimating) return;

    const direction = e.deltaY > 0 ? 'next' : 'prev';
    navigateCard(direction);
  }, [navigateCard, isAnimating]);

  // Handle booking click
  const handleBookingClick = (spot) => {
    if (!spot) return;
    
    if (spot.availableSpaces <= 0) return;
    
    if (onBooking) {
      onBooking(spot);
    }
  };

  if (!parkingSpots || parkingSpots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🅿️</div>
          <p className="text-lg">No parking spots available</p>
          <p className="text-sm mt-2">Try searching in a different area</p>
        </div>
      </div>
    );
  }

  const currentSpot = parkingSpots[currentIndex];
  if (!currentSpot) return null;

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const formatHours = (hours) => {
    if (!hours) return 'Hours not available';
    if (hours.isOpen24 || hours === '24/7') return 'Open 24/7';
    if (typeof hours === 'string') return hours;
    return `${hours.open || '06:00'} - ${hours.close || '22:00'}`;
  };

  const getAvailabilityColor = (available, total) => {
    if (available <= 0) return 'bg-red-100 text-red-700';
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'bg-green-100 text-green-700';
    if (percentage > 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative h-full focus:outline-none ${className}`}
      tabIndex={0}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Card Container */}
      <div className="flex flex-col h-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4 px-4 py-2 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            {currentIndex + 1} of {parkingSpots.length} parking spots
          </div>
          <div className="flex space-x-1">
            {parkingSpots.slice(0, Math.min(10, parkingSpots.length)).map((_, index) => {
              const isActive = Math.floor((currentIndex / parkingSpots.length) * Math.min(10, parkingSpots.length)) === index || 
                              (currentIndex === index && parkingSpots.length <= 10);
              return (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="flex-1 relative">
          <div 
            ref={cardRef}
            className={`w-full h-full transition-all duration-300 ease-out transform ${
              isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                      {currentSpot.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {currentSpot.address}
                    </p>
                    {currentSpot.distance !== undefined && (
                      <p className="text-blue-600 text-sm font-medium">
                        📍 {formatDistance(currentSpot.distance)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      Rs. {currentSpot.hourlyRate}/hr
                    </div>
                    {currentSpot.rating && (
                      <div className="flex items-center justify-end space-x-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium text-gray-700">{currentSpot.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentSpot.availableSpaces > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getAvailabilityColor(currentSpot.availableSpaces || 0, currentSpot.totalSpaces || 1)
                    }`}>
                      {currentSpot.availableSpaces > 0 
                        ? `${currentSpot.availableSpaces}/${currentSpot.totalSpaces} spaces`
                        : 'Full'
                      }
                    </span>
                  </div>

                  {/* Operating Hours */}
                  <div className="text-sm text-gray-600">
                    🕐 {formatHours(currentSpot.operatingHours || currentSpot.businessHours)}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 p-6 pt-4">
                {/* Features/Amenities */}
                {(currentSpot.features || currentSpot.amenities) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {(currentSpot.features || currentSpot.amenities || []).slice(0, 6).map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {feature.replace(/[_-]/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Types */}
                {currentSpot.vehicleTypes && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Vehicle Support</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(currentSpot.vehicleTypes).map(([type, rate]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {type === 'car' ? '🚗' : type === 'motorcycle' ? '🏍️' : type === 'bike' ? '🚲' : '🚛'}
                            </span>
                            <span className="text-sm capitalize font-medium">{type}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">Rs. {rate}/hr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-3">
                <div className="flex space-x-3">
                  <NavigateButton
                    selectedSpot={currentSpot}
                    isActive={true}
                    className="flex-1"
                    size="medium"
                  />
                  <button
                    onClick={() => handleBookingClick(currentSpot)}
                    disabled={currentSpot.availableSpaces <= 0}
                    className={`flex-2 font-semibold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] ${
                      currentSpot.availableSpaces > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                  >
                    {currentSpot.availableSpaces > 0 ? '🅿️ Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Instructions */}
        <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="text-lg">↕️</span>
              <span>Scroll</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="text-lg">⌨️</span>
              <span>Arrow keys</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="text-lg">📱</span>
              <span>Swipe</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleParkingCardView;