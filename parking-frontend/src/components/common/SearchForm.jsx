import { useState } from 'react';
import { useAsyncState } from '../../hooks';

function SearchForm({ onSearch, onRadiusChange, radius, loading: externalLoading }) {
  const [location, setLocation] = useState('');
  const { loading: geoLoading, execute: getGeolocation } = useAsyncState();
  
  const isLoading = externalLoading || geoLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim());
    }
  };

  const handleCurrentLocation = async () => {
    try {
      await getGeolocation(async () => {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: 'Current Location',
                isCurrentLocation: true,
              };
              onSearch(locationData);
              resolve(locationData);
            },
            (error) => {
              reject(new Error('Unable to get your location. Please check location permissions.'));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            }
          );
        });
      });
    } catch (error) {
      console.error('Geolocation error:', error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="location" className="sr-only">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where do you want to park? (e.g., Thamel, Ratna Park)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {geoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Getting...</span>
                </>
              ) : (
                <>
                  <span className="text-lg"></span>
                  <span className="hidden sm:inline">Use Current</span>
                </>
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !location.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {externalLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <span className="text-lg"></span>
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="radius" className="text-sm font-medium text-gray-700">
            Search Radius:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id="radius"
              min="1"
              max="10"
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value))}
              className="flex-1"
              disabled={isLoading}
            />
            <span className="text-sm font-semibold text-blue-600 min-w-[40px]">
              {radius}km
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchForm;