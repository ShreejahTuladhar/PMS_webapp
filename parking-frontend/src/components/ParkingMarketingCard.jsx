import React, { useState } from 'react';
import landmarkImagesService from '../services/landmarkImagesService';
import './ParkingMarketingCard.css';

/**
 * Premium Parking Marketing Card Component
 * Compact card for displaying parking location with marketing appeal
 */
const ParkingMarketingCard = ({ 
  parkingLocation, 
  onBookNow, 
  onViewDetails, 
  isCompact = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Safe destructuring with defaults
  if (!parkingLocation) {
    return null;
  }

  const { 
    name, 
    landmarkName, 
    marketing, 
    pricing, 
    amenities = [], 
    coordinates,
    totalSpaces = 0,
    availableSpaces = 0,
    operatingHours = {},
    district,
    category,
    peakHours,
    hourlyRate // Direct hourly rate from database
  } = parkingLocation;

  // Get landmark-specific images
  const locationImages = landmarkImagesService.getLocationImages(parkingLocation);
  const cardImage = marketing?.thumbnailImage || 
                   locationImages.thumbnailImage ||
                   '/images/default-parking-card.jpg';

  // Handle pricing - check if we have pricing object or direct hourlyRate
  const actualPricing = pricing || {
    hourlyRate: hourlyRate || 0,
    studentDiscount: 0,
    touristPackage: null
  };

  const availabilityPercentage = totalSpaces > 0 ? (availableSpaces / totalSpaces) * 100 : 0;
  const isHighDemand = availabilityPercentage < 30;
  const isModerateDemand = availabilityPercentage < 60;

  // Handle view details with transition effect
  const handleViewDetailsClick = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      onViewDetails?.(parkingLocation);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className={`parking-marketing-card ${isCompact ? 'compact' : ''} ${category} ${isTransitioning ? 'view-details-transition animating' : 'view-details-transition'}`}>
      {/* Card Header with Image */}
      <div className="card-header">
        <div className="card-image-container">
          <img 
            src={imageError ? landmarkImagesService.getLandmarkFallback(landmarkName, category) : cardImage}
            alt={`${name} - ${landmarkName || 'Parking Location'}`}
            className="card-image"
            onError={() => setImageError(true)}
          />
          
          {/* Availability Badge */}
          <div className={`availability-badge ${
            isHighDemand ? 'high-demand' : 
            isModerateDemand ? 'moderate-demand' : 'available'
          }`}>
            {availableSpaces} spaces left
          </div>

          {/* Category Badge */}
          <div className={`category-badge ${category}`}>
            {getCategoryIcon(category)} {getCategoryLabel(category)}
          </div>

          {/* Premium Badge if applicable */}
          {marketing?.marketingTags?.includes('Premium') && (
            <div className="premium-badge">👑 PREMIUM</div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Title and Location */}
        <div className="card-title-section">
          <h3 className="card-title">{marketing?.title || name}</h3>
          <p className="card-location">
            📍 Near {landmarkName} • {district}
          </p>
        </div>

        {/* Pricing */}
        <div className="card-pricing">
          <div className="price-main">
            <span className="price-value">₹{actualPricing.hourlyRate}</span>
            <span className="price-unit">/hour</span>
          </div>
          {actualPricing.studentDiscount > 0 && (
            <div className="price-discount">
              🎓 {Math.round(actualPricing.studentDiscount * 100)}% off for students
            </div>
          )}
          {actualPricing.touristPackage && (
            <div className="price-package">
              🎒 Tourist package: ₹{actualPricing.touristPackage}
            </div>
          )}
        </div>

        {/* Key Features */}
        <div className="card-features">
          {marketing?.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="feature-tag">
              ✨ {feature}
            </div>
          ))}
        </div>

        {/* Amenities Icons */}
        <div className="card-amenities">
          {amenities.slice(0, 6).map((amenity, index) => (
            <span 
              key={index} 
              className="amenity-icon-small" 
              title={amenity.replace('_', ' ')}
            >
              {getAmenityIcon(amenity)}
            </span>
          ))}
          {amenities.length > 6 && (
            <span className="amenities-more">+{amenities.length - 6}</span>
          )}
        </div>

        {/* Status Info */}
        <div className="card-status">
          <div className="status-item">
            <span className="status-icon">🕒</span>
            <span className="status-text">
              {operatingHours.is24Hours ? '24/7 Access' : 
               `${operatingHours.start} - ${operatingHours.end}`}
            </span>
          </div>
          <div className="status-item">
            <span className="status-icon">🚗</span>
            <span className="status-text">{totalSpaces} total spaces</span>
          </div>
        </div>

        {/* Peak Hours Warning */}
        {peakHours && peakHours.length > 0 && (
          <div className="peak-hours-warning">
            ⚡ Peak hours: {peakHours.join(', ')}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <button 
          className={`btn btn-secondary ${isTransitioning ? 'opacity-75' : ''}`}
          onClick={handleViewDetailsClick}
          disabled={isTransitioning}
        >
          {isTransitioning ? (
            <>
              <span className="animate-spin">⏳</span>
              Switching to List...
            </>
          ) : (
            <>
              👁️ View Details
            </>
          )}
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => onBookNow?.(parkingLocation)}
        >
          Book Now
        </button>
      </div>

      {/* Marketing Overlay for Special Offers */}
      {marketing?.marketingTags?.includes('Special Offer') && (
        <div className="special-offer-ribbon">
          🎁 SPECIAL OFFER
        </div>
      )}
    </div>
  );
};

/**
 * Get category display label
 */
const getCategoryLabel = (category) => {
  const labels = {
    heritage: 'Heritage Site',
    religious: 'Religious',
    educational: 'Educational',
    commercial: 'Shopping',
    tourist: 'Tourist Area',
    transportation: 'Transport Hub',
    medical: 'Healthcare',
    government: 'Government',
    industrial: 'Industrial',
    viewpoints: 'Scenic View',
    neighborhoods: 'Residential'
  };
  return labels[category] || category;
};

/**
 * Get category icon
 */
const getCategoryIcon = (category) => {
  const icons = {
    heritage: '🏛️',
    religious: '🕉️',
    educational: '🎓',
    commercial: '🛒',
    tourist: '🎒',
    transportation: '🚌',
    medical: '🏥',
    government: '🏛️',
    industrial: '🏭',
    viewpoints: '🏔️',
    neighborhoods: '🏘️'
  };
  return icons[category] || '🅿️';
};

/**
 * Get amenity icon
 */
const getAmenityIcon = (amenity) => {
  const iconMap = {
    security: '🔒',
    cctv: '📹',
    lighting: '💡',
    mobile_payment: '📱',
    restroom: '🚻',
    wifi: '📶',
    ev_charging: '⚡',
    valet_service: '🤵',
    car_wash: '🚿',
    tourist_info: 'ℹ️',
    guide_booking: '👨‍🏫',
    photography_spots: '📸',
    souvenir_shop: '🛍️',
    student_discount: '🎓',
    bicycle_parking: '🚲',
    bus: '🚌',
    truck_parking: '🚛',
    covered_parking: '🏠'
  };
  
  return iconMap[amenity] || '🅿️';
};

export default ParkingMarketingCard;