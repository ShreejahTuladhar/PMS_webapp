import React from 'react';
import ParkingMarketingCard from './ParkingMarketingCard';
// import specialOffersService from '../services/specialOffersService'; // Removed promotional offers
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

  // Removed offers grouping functionality
  const spotsWithOffers = [];
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

  return (
    <div className="parking-marketing-grid">
      {/* Special offers summary removed */}

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

              {/* Promotional overlays removed */}
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
            <span className="stat-number">{parkingSpots.filter(s => s.availableSpaces > 0).length}</span>
            <span className="stat-label">Available Now</span>
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