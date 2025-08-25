import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParkingMarketingCard from './ParkingMarketingCard';
// import specialOffersService from '../services/specialOffersService'; // Removed promotional offers
import './ParkingMarketingGrid.css';

/**
 * Marketing Grid Component - Single Card View
 * Displays one parking card at a time with scroll navigation
 */
const ParkingMarketingGrid = ({ 
  parkingSpots, 
  onBookNow, 
  onViewDetails, 
  selectedSpot,
  sortBy = 'distance' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
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

  // Removed special offers functionality
  const enhancedSpots = parkingSpots.map(spot => ({
    ...spot,
    hasActiveOffers: false
  }));

  // Sort spots based on criteria
  const sortedSpots = [...enhancedSpots].sort((a, b) => {
    switch (sortBy) {
      case 'price': {
        const priceA = a.hourlyRate || a.discountedRate || 0;
        const priceB = b.hourlyRate || b.discountedRate || 0;
        return priceA - priceB;
      }
      case 'availability':
        return (b.availableSpaces / b.totalSpaces) - (a.availableSpaces / a.totalSpaces);
      case 'offers':
        return 0; // No offers functionality
      case 'category':
        return a.category?.localeCompare(b.category || '') || 0;
      default:
        return (a.distance || 0) - (b.distance || 0);
    }
  });

  // Navigation function with smooth animations
  const navigateCard = useCallback((direction) => {
    if (isAnimating || sortedSpots.length <= 1) return;

    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % sortedSpots.length;
    } else if (direction === 'prev') {
      newIndex = currentIndex === 0 ? sortedSpots.length - 1 : currentIndex - 1;
    }

    if (newIndex === currentIndex) return;

    setIsAnimating(true);
    setCurrentIndex(newIndex);

    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, sortedSpots.length, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sortedSpots.length <= 1) return;

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
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [navigateCard, sortedSpots.length]);

  // Mouse wheel navigation
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (isAnimating || sortedSpots.length <= 1) return;

    const direction = e.deltaY > 0 ? 'next' : 'prev';
    navigateCard(direction);
  }, [navigateCard, isAnimating, sortedSpots.length]);

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

  // Removed offers grouping functionality
  const orderedSpots = sortedSpots;

  if (parkingSpots.length === 0) {
    return (
      <div className="marketing-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🅿️</div>
          <h3>No parking locations found</h3>
          <p>Try expanding your search radius or searching in a different area</p>
        </div>
      </div>
    );
  }

  // Get current parking spot
  const currentSpot = orderedSpots[currentIndex];

  if (!currentSpot) {
    return (
      <div className="marketing-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🅿️</div>
          <h3>No parking locations found</h3>
          <p>Try expanding your search radius or searching in a different area</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="parking-marketing-grid single-card-mode"
      tabIndex={0}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ outline: 'none' }}
    >
      {/* Progress Indicator */}
      <div className="single-card-progress">
        <div className="progress-info">
          <span className="current-position">{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span className="total-count">{orderedSpots.length}</span>
          <span className="locations-label">parking locations</span>
        </div>
        
        {/* Progress Dots */}
        <div className="progress-dots">
          {orderedSpots.slice(0, Math.min(10, orderedSpots.length)).map((_, index) => {
            const isActive = Math.floor((currentIndex / orderedSpots.length) * Math.min(10, orderedSpots.length)) === index ||
                           (currentIndex === index && orderedSpots.length <= 10);
            return (
              <div
                key={index}
                className={`progress-dot ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (orderedSpots.length <= 10) {
                    setCurrentIndex(index);
                  }
                }}
                style={{ cursor: orderedSpots.length <= 10 ? 'pointer' : 'default' }}
              />
            );
          })}
        </div>
      </div>

      {/* Single Marketing Card */}
      <div className="single-card-container">
        <div 
          className={`marketing-card-wrapper single-card ${
            isAnimating ? 'animating' : ''
          } ${
            selectedSpot?.id === currentSpot.id ? 'selected' : ''
          }`}
        >
          <ParkingMarketingCard
            parkingLocation={currentSpot}
            onBookNow={onBookNow}
            onViewDetails={onViewDetails}
            isCompact={false}
          />
        </div>
      </div>

      {/* Navigation Instructions */}
      <div className="single-card-instructions">
        <div className="instruction-group">
          <span className="instruction-item">
            <span className="instruction-icon">↕️</span>
            <span className="instruction-text">Scroll to navigate</span>
          </span>
          <span className="instruction-item">
            <span className="instruction-icon">⌨️</span>
            <span className="instruction-text">Use arrow keys</span>
          </span>
          <span className="instruction-item">
            <span className="instruction-icon">📱</span>
            <span className="instruction-text">Swipe up/down</span>
          </span>
        </div>
      </div>

      {/* Compact Summary Info */}
      <div className="single-card-summary">
        <div className="summary-compact">
          <div className="summary-item">
            <span className="summary-icon">🅿️</span>
            <span className="summary-text">{parkingSpots.length} total</span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">✅</span>
            <span className="summary-text">{parkingSpots.filter(s => s.availableSpaces > 0).length} available</span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">🚗</span>
            <span className="summary-text">{parkingSpots.reduce((sum, spot) => sum + (spot.availableSpaces || 0), 0)} spaces</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMarketingGrid;