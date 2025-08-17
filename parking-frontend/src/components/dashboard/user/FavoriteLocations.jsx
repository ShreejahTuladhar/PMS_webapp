import { useState, useEffect } from 'react';
import { userService, locationService } from '../../../services';
import toast from 'react-hot-toast';

const FavoriteLocations = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    loadFavorites();
    loadAvailableLocations();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await userService.getFavoriteLocations();
      
      if (response.success) {
        setFavorites(response.favorites || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLocations = async () => {
    try {
      const response = await locationService.getLocations();
      
      if (response.success) {
        setAvailableLocations(response.locations || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleAddFavorite = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    try {
      const response = await userService.addFavoriteLocation(selectedLocation);
      
      if (response.success) {
        toast.success('Location added to favorites!');
        loadFavorites();
        setShowAddModal(false);
        setSelectedLocation('');
      } else {
        toast.error(response.error || 'Failed to add favorite location');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add favorite location');
    }
  };

  const handleRemoveFavorite = async (locationId) => {
    if (!window.confirm('Are you sure you want to remove this location from favorites?')) {
      return;
    }

    try {
      const response = await userService.removeFavoriteLocation(locationId);
      
      if (response.success) {
        toast.success('Location removed from favorites!');
        loadFavorites();
      } else {
        toast.error(response.error || 'Failed to remove favorite location');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite location');
    }
  };

  const handleBookNow = (locationId) => {
    // Navigate to booking page with pre-selected location
    window.open(`/booking?location=${locationId}`, '_blank');
  };

  const filteredFavorites = favorites.filter(favorite => 
    favorite.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your favorite locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Favorite Parking Locations</h2>
          <p className="text-gray-600">Quick access to your preferred parking spots</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Add Favorite
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search favorite locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite locations yet</h3>
          <p className="text-gray-500 mb-4">Add locations you park at frequently for quick access</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Add Your First Favorite
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Location Image */}
              {favorite.image && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={favorite.image}
                    alt={favorite.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{favorite.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {favorite.address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </button>
                </div>

                {/* Rating */}
                {favorite.rating && (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {getRatingStars(favorite.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {favorite.rating} ({favorite.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {favorite.features?.map((feature, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    Starting from
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Rs. {favorite.hourlyRate || 50}/hr
                  </div>
                </div>

                {/* Availability Status */}
                <div className="flex items-center mb-4">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    favorite.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm ${
                    favorite.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {favorite.isAvailable ? 'Available now' : 'Currently full'}
                  </span>
                </div>

                {/* Distance */}
                {favorite.distance && (
                  <div className="text-sm text-gray-600 mb-4">
                    📍 {favorite.distance} km away
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBookNow(favorite.id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => window.open(`/location/${favorite.id}`, '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Favorite Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Favorite Location</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedLocation('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Choose a location...</option>
                  {availableLocations
                    .filter(location => !favorites.some(fav => fav.id === location.id))
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.address}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedLocation('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFavorite}
                  disabled={!selectedLocation}
                  className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteLocations;