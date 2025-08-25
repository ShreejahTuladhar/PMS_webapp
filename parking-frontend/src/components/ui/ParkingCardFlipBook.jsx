import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 🎴 Surreal Parking Card Flip Book
 * A mesmerizing single-card interface with smooth flip animations
 * Human-Computer Interaction focused on immersive experience
 */
const ParkingCardFlipBook = ({ 
  parkingSpots, 
  selectedSpot, 
  onSpotSelect, 
  onBooking,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('none');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize current index based on selected spot
  useEffect(() => {
    if (selectedSpot && parkingSpots.length > 0) {
      const index = parkingSpots.findIndex(spot => spot.id === selectedSpot.id);
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
          navigateCard('first');
          break;
        case 'End':
          e.preventDefault();
          navigateCard('last');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      navigateCard('next');
    } else {
      navigateCard('prev');
    }
  };

  // Navigation function with smooth animations
  const navigateCard = useCallback((direction) => {
    if (isAnimating || parkingSpots.length <= 1) return;

    let newIndex = currentIndex;

    switch (direction) {
      case 'next':
        newIndex = (currentIndex + 1) % parkingSpots.length;
        setAnimationDirection('down');
        break;
      case 'prev':
        newIndex = currentIndex === 0 ? parkingSpots.length - 1 : currentIndex - 1;
        setAnimationDirection('up');
        break;
      case 'first':
        newIndex = 0;
        setAnimationDirection('up');
        break;
      case 'last':
        newIndex = parkingSpots.length - 1;
        setAnimationDirection('down');
        break;
      default:
        return;
    }

    if (newIndex === currentIndex) return;

    setIsAnimating(true);

    // Visual feedback for flip action (simulate sound with visual cue)
    if (cardRef.current) {
      cardRef.current.style.filter = 'brightness(1.2) saturate(1.3)';
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.filter = 'brightness(1) saturate(1)';
        }
      }, 200);
    }

    // Smooth transition
    setTimeout(() => {
      setCurrentIndex(newIndex);
      const newSpot = parkingSpots[newIndex];
      if (newSpot && onSpotSelect) {
        onSpotSelect(newSpot);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('none');
      }, 300);
    }, 150);
  }, [currentIndex, parkingSpots, isAnimating, onSpotSelect]);

  // Mouse wheel navigation
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (isAnimating) return;

    if (e.deltaY > 0) {
      navigateCard('next');
    } else if (e.deltaY < 0) {
      navigateCard('prev');
    }
  }, [navigateCard, isAnimating]);

  // Auto-focus container for keyboard events
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  if (!parkingSpots || parkingSpots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🅿️</div>
          <p className="text-lg">No parking spots available</p>
        </div>
      </div>
    );
  }

  const currentSpot = parkingSpots[currentIndex];
  if (!currentSpot) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative h-full flex flex-col items-center justify-center focus:outline-none flipbook-focus ${className}`}
      tabIndex={0}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(147, 197, 253, 0.05) 0%, transparent 70%)',
      }}
    >
      {/* Flip Book Container */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Background Cards for Depth Effect */}
        <div className="absolute inset-0 transform translate-y-2 scale-95 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-xl"></div>
        </div>
        <div className="absolute inset-0 transform translate-y-1 scale-97 opacity-60">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg"></div>
        </div>

        {/* Main Card */}
        <div 
          ref={cardRef}
          className={`relative w-full transition-all duration-300 ease-out transform perspective-1000 ${
            isAnimating 
              ? animationDirection === 'up' 
                ? 'animate-flip-up' 
                : 'animate-flip-down'
              : 'hover:scale-105 hover:shadow-2xl'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            minHeight: '400px'
          }}
        >
          {/* Card Content */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden card-hover touch-feedback">
            {/* Surreal Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-pink-400/10 opacity-60 animate-gradient"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl animate-floating"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-floating" style={{ animationDelay: '2s' }}></div>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none"></div>

            {/* Card Header */}
            <div className="relative p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-2xl text-gray-800 leading-tight mb-2 line-clamp-2">
                    {currentSpot.name}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                    {currentSpot.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    Rs. {currentSpot.hourlyRate}/hr
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-lg">{currentSpot.rating || '4.2'}</span>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4V3a2 2 0 00-2-2H5a2 2 0 00-2 2v2l4 4zM17 9l-4-4V3a2 2 0 012-2h4a2 2 0 012 2v2l-4 4z" />
                  </svg>
                  <span className="font-semibold text-lg">Car, Bike</span>
                </div>
                
                {currentSpot.availableSpaces > 0 ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="px-4 py-2 rounded-full text-base font-bold bg-green-100 text-green-800">
                      {currentSpot.availableSpaces}/{currentSpot.totalSpaces} available
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="px-4 py-2 rounded-full text-base font-bold bg-red-100 text-red-800">
                      Full
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onBooking && onBooking(currentSpot)}
                className={`w-full font-bold py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  currentSpot.availableSpaces > 0
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
                disabled={currentSpot.availableSpaces === 0}
              >
                {currentSpot.availableSpaces > 0 ? '🅿️ Book This Spot' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="flex flex-col items-center mt-6 space-y-4">
        {/* Card Counter */}
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
          <span className="text-sm font-semibold text-gray-700">
            {currentIndex + 1} of {parkingSpots.length}
          </span>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-2">
          {parkingSpots.slice(0, Math.min(5, parkingSpots.length)).map((_, index) => {
            const actualIndex = Math.floor(currentIndex / Math.max(1, Math.floor(parkingSpots.length / 5))) === index;
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  actualIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>

        {/* Navigation Hints with Surreal Styling */}
        <div className="glass rounded-xl p-3 text-center text-sm text-gray-600 space-y-2 animate-breathe">
          <div className="flex items-center justify-center space-x-6">
            <span className="flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-1">
              <span className="text-lg animate-bounce">↑↓</span>
              <span className="font-medium">Scroll</span>
            </span>
            <span className="flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-1">
              <span className="text-lg">⌨️</span>
              <span className="font-medium">Arrow keys</span>
            </span>
            <span className="flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-1">
              <span className="text-lg animate-pulse">📱</span>
              <span className="font-medium">Swipe</span>
            </span>
          </div>
          <div className="text-xs text-blue-600 font-medium opacity-80">
            Experience the surreal flip book of parking spaces
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingCardFlipBook;