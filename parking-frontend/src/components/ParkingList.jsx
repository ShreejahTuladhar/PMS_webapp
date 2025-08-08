import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ParkingList = ({ parkingSpots, onBooking, selectedSpot, onLoginRequired }) => {
  const [sortBy, setSortBy] = useState('distance');
  const { isAuthenticated } = useAuth();

  const handleBookingClick = (spot) => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    onBooking(spot);
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

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Parking Locations ({parkingSpots.length})
          </h3>
          
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
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedSpots.map((spot) => (
          <div 
            key={spot.id} 
            className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
              selectedSpot?.id === spot.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{spot.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{spot.address}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {formatDistance(spot.distance)}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatHours(spot.businessHours)}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {spot.rating}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  ${spot.hourlyRate}/hr
                </div>
                {spot.vehicleTypes.motorcycle && (
                  <div className="text-sm text-gray-600">
                    ${spot.vehicleTypes.motorcycle}/hr (motorcycle)
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(spot.availability, spot.totalSpaces)}`}>
                  {spot.availability > 0 ? (
                    `${spot.availability}/${spot.totalSpaces} available`
                  ) : (
                    'Full'
                  )}
                </span>
                
                {spot.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {feature}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleBookingClick(spot)}
                disabled={spot.availability === 0}
                className={`px-4 py-2 rounded font-medium text-sm transition ${
                  spot.availability > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {spot.availability > 0 ? (isAuthenticated ? 'Book Now' : 'Sign in to Book') : 'Full'}
              </button>
            </div>

            {spot.specialOffers && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                🎉 {spot.specialOffers}
              </div>
            )}
          </div>
        ))}
      </div>

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