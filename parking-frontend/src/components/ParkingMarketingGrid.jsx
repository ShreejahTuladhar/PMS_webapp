import React from 'react';
import ParkingMarketingCard from './ParkingMarketingCard';
import specialOffersService from '../services/specialOffersService';
import './ParkingMarketingGrid.css';

/**
 * Marketing Grid Component
 * Displays parking locations as marketing cards with special offers
 */
const ParkingMarketingGrid = ({ 
  parkingSpots, 
  onBookNow, 
  onViewDetails, 
  selectedSpot,
  sortBy = 'distance' 
}) => {

  // Enhance parking spots with special offers
  const enhancedSpots = parkingSpots.map(spot => {
    const offers = specialOffersService.generateSpecialOffers(spot);
    const bestOffer = specialOffersService.getBestOffer(spot);
    const isPeakHours = specialOffersService.isCurrentlyPeakHours(spot);
    const surgeInfo = specialOffersService.getPeakHoursSurgeInfo(spot);

    return {
      ...spot,
      specialOffers: offers,
      bestOffer,
      isPeakHours,
      surgeInfo,
      hasActiveOffers: offers.length > 0
    };
  });

  // Sort spots based on criteria
  const sortedSpots = [...enhancedSpots].sort((a, b) => {
    switch (sortBy) {
      case 'price': {
        const priceA = a.bestOffer ? a.bestOffer.discountedPrice || a.hourlyRate : a.hourlyRate;
        const priceB = b.bestOffer ? b.bestOffer.discountedPrice || b.hourlyRate : b.hourlyRate;
        return priceA - priceB;
      }
      case 'availability':
        return (b.availableSpaces / b.totalSpaces) - (a.availableSpaces / a.totalSpaces);
      case 'offers':
        return b.specialOffers.length - a.specialOffers.length;
      case 'category':
        return a.category?.localeCompare(b.category || '') || 0;
      default:
        return (a.distance || 0) - (b.distance || 0);
    }
  });

  // Group spots by offers for better visual presentation
  const spotsWithOffers = sortedSpots.filter(spot => spot.hasActiveOffers);
  const spotsWithoutOffers = sortedSpots.filter(spot => !spot.hasActiveOffers);
  
  const orderedSpots = [...spotsWithOffers, ...spotsWithoutOffers];

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

  return (
    <div className="parking-marketing-grid">
      {/* Special Offers Summary */}
      {spotsWithOffers.length > 0 && (
        <div className="offers-summary">
          <div className="offers-header">
            <span className="offers-icon">🎁</span>
            <span className="offers-text">
              {spotsWithOffers.length} location{spotsWithOffers.length !== 1 ? 's' : ''} with special offers available!
            </span>
          </div>
        </div>
      )}

      {/* Marketing Cards Grid */}
      <div className="marketing-cards-container">
        <div className="marketing-cards-grid">
          {orderedSpots.map((spot, index) => (
            <div 
              key={spot.id || spot._id} 
              className={`marketing-card-wrapper ${
                selectedSpot?.id === spot.id ? 'selected' : ''
              } ${
                spot.hasActiveOffers ? 'has-offers' : ''
              }`}
            >
              <ParkingMarketingCard
                parkingLocation={spot}
                onBookNow={onBookNow}
                onViewDetails={onViewDetails}
                isCompact={false}
              />

              {/* Special Offer Overlay */}
              {spot.bestOffer && (
                <div className={`special-offer-overlay ${spot.bestOffer.color}`}>
                  <div className="offer-content">
                    <div className="offer-badge">
                      {spot.bestOffer.icon} {spot.bestOffer.badge}
                    </div>
                    <div className="offer-title">{spot.bestOffer.title}</div>
                    {spot.bestOffer.validUntil && (
                      <div className="offer-expiry">
                        Expires in: {specialOffersService.formatTimeRemaining(
                          (spot.bestOffer.validUntil.getTime() - new Date().getTime()) / 60000
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Peak Hours Warning */}
              {spot.isPeakHours && spot.surgeInfo && (
                <div className="peak-hours-overlay">
                  <div className="peak-warning">
                    ⚡ Peak Hours - ₹{spot.surgeInfo.surgePrice}/hr
                  </div>
                </div>
              )}

              {/* Priority Badge for Featured Locations */}
              {index < 3 && spot.hasActiveOffers && (
                <div className="priority-badge">
                  ⭐ FEATURED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Summary Info */}
      <div className="grid-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{parkingSpots.length}</span>
            <span className="stat-label">Total Locations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{spotsWithOffers.length}</span>
            <span className="stat-label">Special Offers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {parkingSpots.reduce((sum, spot) => sum + (spot.availableSpaces || 0), 0)}
            </span>
            <span className="stat-label">Available Spaces</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMarketingGrid;