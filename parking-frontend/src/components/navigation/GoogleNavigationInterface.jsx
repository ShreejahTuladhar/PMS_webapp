import React, { useState, useEffect, useCallback } from 'react';
import googleNavigationService from '../../services/googleNavigationService';
import toast from 'react-hot-toast';

const GoogleNavigationInterface = ({ 
  destination, 
  isOpen, 
  onClose, 
  className = '',
  autoStart = false
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Initialize location when component opens
  useEffect(() => {
    if (isOpen) {
      initializeLocation();
    }
  }, [isOpen]);

  // Auto-start navigation if requested
  useEffect(() => {
    if (autoStart && currentLocation && destination && isOpen) {
      setTimeout(() => {
        handleGoogleNavigation();
      }, 1000); // Small delay for better UX
    }
  }, [autoStart, currentLocation, destination, isOpen]);

  const initializeLocation = async () => {
    setIsInitializing(true);
    setLocationError(null);

    try {
      console.log('🌍 GoogleNavInterface: Initializing location...');
      
      // Check if service already has location
      let location = googleNavigationService.getCurrentLocationSync();
      
      if (!location) {
        // Initialize location service
        location = await googleNavigationService.initializeLocation();
      }
      
      setCurrentLocation(location);
      
      // Subscribe to location updates
      googleNavigationService.onLocationUpdate(handleLocationUpdate);
      
      console.log('✅ GoogleNavInterface: Location initialized');
      toast.success('📍 Location ready for navigation');
      
    } catch (error) {
      console.error('❌ GoogleNavInterface: Location initialization failed:', error);
      setLocationError(error.message);
      toast.error(error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLocationUpdate = useCallback((location) => {
    setCurrentLocation(location);
    console.log('📱 GoogleNavInterface: Location updated:', location);
  }, []);

  const handleGoogleNavigation = () => {
    if (!destination) {
      toast.error('No destination selected');
      return;
    }

    if (!currentLocation) {
      toast.error('Current location not available');
      return;
    }

    try {
      console.log('🗺️ GoogleNavInterface: Starting Google Maps navigation');
      
      const result = googleNavigationService.navigate(destination, {
        preferApp: true,
        userLocation: currentLocation
      });

      // Add to navigation history
      const historyEntry = {
        id: Date.now(),
        destination: destination,
        startLocation: currentLocation,
        timestamp: new Date().toISOString(),
        provider: result.provider,
        method: result.method
      };
      
      setNavigationHistory(prev => [historyEntry, ...prev.slice(0, 4)]);

      toast.success('🗺️ Opening Google Maps navigation');
      console.log('✅ GoogleNavInterface: Navigation started with Google Maps');

    } catch (error) {
      console.error('❌ GoogleNavInterface: Google Maps navigation failed:', error);
      toast.error(`Navigation failed: ${error.message}`);
    }
  };

  const handleLocationRefresh = () => {
    initializeLocation();
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      googleNavigationService.offLocationUpdate(handleLocationUpdate);
    };
  }, [handleLocationUpdate]);

  if (!isOpen) return null;

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <h3 className="text-lg font-bold text-blue-900 flex items-center">
          <span className="text-2xl mr-2">🗺️</span>
          Google Maps Navigation
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Location Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">📍 Current Location</h4>
            <button
              onClick={handleLocationRefresh}
              disabled={isInitializing}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
            >
              {isInitializing ? 'Getting...' : 'Refresh'}
            </button>
          </div>

          {isInitializing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Getting your location...</span>
            </div>
          ) : locationError ? (
            <div className="text-red-600 text-sm">
              ⚠️ {locationError}
            </div>
          ) : currentLocation ? (
            <div className="text-sm text-gray-600">
              <div>📍 Ready for navigation</div>
              <div className="text-xs mt-1">
                Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Location unavailable</div>
          )}
        </div>

        {/* Destination Info */}
        {destination && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{destination.address}</p>
                {destination.distance && (
                  <p className="text-xs text-blue-600 mt-1">
                    📏 {destination.distance} km away
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleNavigation}
            disabled={!currentLocation || !destination || isInitializing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>🗺️</span>
            <span>Open in Google Maps</span>
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Will open Google Maps with turn-by-turn directions
            </p>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="border-t pt-4">
          <h5 className="font-medium text-gray-700 mb-2">Quick Actions</h5>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (destination) {
                  const coords = googleNavigationService.extractCoordinates(destination);
                  if (coords.valid) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
                  }
                }
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm"
            >
              📍 View on Map
            </button>
            
            <button
              onClick={() => {
                if (destination && currentLocation) {
                  const coords = googleNavigationService.extractCoordinates(destination);
                  if (coords.valid) {
                    navigator.clipboard.writeText(`${coords.lat},${coords.lng}`);
                    toast.success('📋 Coordinates copied');
                  }
                }
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm"
            >
              📋 Copy Location
            </button>
          </div>
        </div>

        {/* Recent Navigation History */}
        {navigationHistory.length > 0 && (
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-700 mb-2">Recent Navigation</h5>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {navigationHistory.map((entry) => (
                <div key={entry.id} className="text-xs text-gray-500 flex items-center space-x-2">
                  <span>🗺️</span>
                  <span className="truncate">{entry.destination.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleNavigationInterface;