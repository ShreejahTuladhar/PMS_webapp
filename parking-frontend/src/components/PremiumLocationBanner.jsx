import React from 'react';
import ParkingProfileBanner from './ParkingProfileBanner';
// import specialOffersService from '../services/specialOffersService'; // Removed promotional offers
import landmarkImagesService from '../services/landmarkImagesService';
import './PremiumLocationBanner.css';

/**
 * Premium Location Banner Component
 * Displays featured parking locations with profile banners
 */
const PremiumLocationBanner = ({ parkingSpots, onBookNow, onViewDetails }) => {
  // Filter and sort premium locations
  const premiumLocations = parkingSpots
    .filter(spot => {
      // Show locations with marketing data and heritage/tourist categories
      return (
        spot.marketing && 
        spot.landmarkName &&
        ['heritage', 'tourist', 'religious', 'viewpoints'].includes(spot.category)
      );
    })
    .map(spot => ({
      ...spot,
      hasActiveOffers: false, // Removed promotional offers
      locationImages: landmarkImagesService.getLocationImages(spot)
    }))
    .sort((a, b) => {
      // Priority: availability > rating
      const availabilityA = (a.availableSpaces / a.totalSpaces) || 0;
      const availabilityB = (b.availableSpaces / b.totalSpaces) || 0;
      
      return availabilityB - availabilityA;
    })
    .slice(0, 3); // Show top 3 premium locations

  if (premiumLocations.length === 0) {
    return null;
  }

  return (
    <div className="premium-location-banner">
      <div className="premium-header">
        <div className="premium-title">
          <span className="premium-icon">👑</span>
          <h2>Featured Premium Locations</h2>
          <span className="premium-subtitle">
            Discover exceptional parking at Kathmandu's iconic landmarks
          </span>
        </div>
        
        {/* Special offers badge removed */}
      </div>

      <div className="premium-locations-grid">
        {premiumLocations.map((location, index) => (
          <div key={location.id} className={`premium-location-card priority-${index + 1}`}>
            {/* Priority Badge */}
            <div className="priority-badge">
              {index === 0 ? '🥇 TOP CHOICE' : index === 1 ? '🥈 POPULAR' : '🥉 FEATURED'}
            </div>

            {/* Profile Banner */}
            <ParkingProfileBanner 
              parkingLocation={location}
            />

            {/* Action Buttons */}
            <div className="premium-actions">
              <button
                onClick={() => onViewDetails?.(location)}
                className="btn btn-outline"
              >
                <span className="btn-icon">👁️</span>
                View Details
              </button>
              <button
                onClick={() => onBookNow?.(location)}
                className="btn btn-primary"
                disabled={!location.availableSpaces}
              >
                <span className="btn-icon">🅿️</span>
                {location.availableSpaces ? 'Book Premium Spot' : 'Currently Full'}
              </button>
            </div>

            {/* Special offer highlight removed */}

            {/* Quick Stats */}
            <div className="premium-quick-stats">
              <div className="quick-stat">
                <span className="stat-icon">📍</span>
                <span className="stat-text">{location.district}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">🏛️</span>
                <span className="stat-text">{location.landmarkName}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">🅿️</span>
                <span className="stat-text">{location.availableSpaces}/{location.totalSpaces} available</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Benefits */}
      <div className="premium-benefits">
        <h3>Why Choose Premium Locations?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🏛️</span>
            <span className="benefit-text">Near UNESCO Heritage Sites</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span className="benefit-text">Priority Booking</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💎</span>
            <span className="benefit-text">Premium Amenities</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⭐</span>
            <span className="benefit-text">Enhanced Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLocationBanner;