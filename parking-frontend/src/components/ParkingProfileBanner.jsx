import React, { useState } from 'react';
import landmarkImagesService from '../services/landmarkImagesService';
import './ParkingProfileBanner.css';

/**
 * Premium Parking Profile Banner Component
 * Displays marketing banner with image, title, and key features
 */
const ParkingProfileBanner = ({ parkingLocation }) => {
  const [imageError, setImageError] = useState(false);
  const { marketing, name, landmarkName, amenities, pricing, category } = parkingLocation;
  
  if (!marketing) {
    return null;
  }

  // Get landmark-specific images
  const locationImages = landmarkImagesService.getLocationImages(parkingLocation);
  const bannerImageSrc = marketing?.bannerImage || 
                         locationImages.bannerImage ||
                         locationImages.marketingImage;

  const {
    title,
    subtitle,
    marketingTags,
    features,
    targetAudience,
    district
  } = marketing;

  return (
    <div className="parking-profile-banner">
      {/* Banner Image Section */}
      <div className="banner-image-container">
        <img 
          src={imageError ? landmarkImagesService.getLandmarkFallback(landmarkName, category) : bannerImageSrc}
          alt={`${title || name} - ${landmarkName || 'Premium Parking'}`}
          className="banner-image"
          onError={() => setImageError(true)}
        />
        <div className="banner-overlay">
          <div className="banner-content">
            <h1 className="banner-title">{title}</h1>
            <p className="banner-subtitle">{subtitle}</p>
            
            {/* Marketing Tags */}
            <div className="marketing-tags">
              {marketingTags.slice(0, 3).map((tag, index) => (
                <span key={index} className={`marketing-tag ${category}`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Key Stats */}
            <div className="banner-stats">
              <div className="stat-item">
                <span className="stat-value">₹{pricing.hourlyRate}</span>
                <span className="stat-label">per hour</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{parkingLocation.totalSpaces}</span>
                <span className="stat-label">total spaces</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{parkingLocation.availableSpaces}</span>
                <span className="stat-label">available now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="banner-features">
        <div className="features-container">
          <h3 className="features-title">Premium Features</h3>
          <div className="features-grid">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">🅿️</span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="amenities-preview">
          <h3 className="amenities-title">Available Amenities</h3>
          <div className="amenities-icons">
            {amenities.slice(0, 6).map((amenity, index) => (
              <div key={index} className="amenity-icon" title={amenity.replace('_', ' ')}>
                {getAmenityIcon(amenity)}
              </div>
            ))}
            {amenities.length > 6 && (
              <div className="amenity-more">+{amenities.length - 6}</div>
            )}
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="banner-location-info">
        <div className="location-item">
          <span className="location-icon">📍</span>
          <span className="location-text">Near {landmarkName}</span>
        </div>
        <div className="location-item">
          <span className="location-icon">🏛️</span>
          <span className="location-text">{district} District</span>
        </div>
        <div className="location-item">
          <span className="location-icon">👥</span>
          <span className="location-text">Perfect for {targetAudience}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Get icon for amenity type
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
    '24_hour_access': '🕐',
    luggage_storage: '🧳',
    wheelchair_access: '♿',
    emergency_parking: '🚨'
  };
  
  return iconMap[amenity] || '🅿️';
};

export default ParkingProfileBanner;