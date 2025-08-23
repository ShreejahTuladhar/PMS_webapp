import React, { useState, useEffect, useCallback } from 'react';
import navigationService from '../../services/navigationService';
import toast from 'react-hot-toast';

const NavigationInterface = ({ 
  destination, 
  isOpen, 
  onClose, 
  onRouteCalculated,
  className = '' 
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [navigationStats, setNavigationStats] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  // Handle location updates
  const handleLocationUpdate = useCallback((location) => {
    setCurrentLocation(location);
    
    if (isNavigating && route) {
      // Get next instruction based on current location
      const nextInstruction = navigationService.getNextInstruction(location);
      setCurrentInstruction(nextInstruction);

      // Update navigation stats
      if (destination) {
        const remainingDistance = navigationService.calculateDistance(
          location.lat, location.lng,
          destination.lat, destination.lng
        );
        
        setNavigationStats(prev => ({
          ...prev,
          remainingDistance: remainingDistance,
          currentSpeed: location.speed || 0,
          accuracy: location.accuracy || 0
        }));
      }
    }
  }, [isNavigating, route, destination]);

  // Handle location errors
  const handleLocationError = useCallback((error) => {
    console.error('Navigation location error:', error);
    setError(error.message);
    toast.error(error.message);
  }, []);

  // Initialize location tracking when component opens
  useEffect(() => {
    if (isOpen) {
      checkLocationPermission();
    }
    
    return () => {
      if (isNavigating) {
        stopNavigation();
      }
    };
  }, [isOpen]);

  // Check location permission status
  const checkLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });

      if (permission.state === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.warn('Permission API not supported:', error);
      getCurrentLocation(); // Fallback to direct geolocation
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const location = await navigationService.getCurrentLocation();
      setCurrentLocation(location);
      setError(null);
    } catch (error) {
      handleLocationError(error);
    }
  };

  // Start navigation
  const startNavigation = async () => {
    if (!destination) {
      toast.error('No destination specified');
      return;
    }

    if (!currentLocation) {
      toast.error('Current location not available');
      return;
    }

    setIsCalculatingRoute(true);
    setError(null);

    try {
      const navigationResult = await navigationService.startNavigation(destination, {
        profile: 'driving',
        alternatives: false,
        steps: true
      });

      setRoute(navigationResult.route);
      setNavigationStats({
        totalDistance: navigationResult.distance,
        estimatedTime: navigationResult.estimatedTime,
        remainingDistance: navigationResult.distance,
        currentSpeed: 0,
        accuracy: 0
      });
      
      setIsNavigating(true);
      setCurrentInstruction(navigationResult.instructions[0]);

      // Start location tracking
      navigationService.startLocationTracking(handleLocationUpdate, handleLocationError);

      // Notify parent component about route
      if (onRouteCalculated) {
        onRouteCalculated(navigationResult.route);
      }

      toast.success('Navigation started!');
      console.log('✅ Navigation started successfully');

    } catch (error) {
      console.error('❌ Failed to start navigation:', error);
      setError(error.message);
      toast.error(`Navigation failed: ${error.message}`);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    navigationService.stopNavigation();
    setIsNavigating(false);
    setRoute(null);
    setCurrentInstruction(null);
    setNavigationStats(null);
    setError(null);
    
    toast.success('Navigation stopped');
    console.log('🛑 Navigation stopped');
  };

  // Open in external navigation app
  const openExternalNavigation = (app = 'auto') => {
    if (!destination) return;
    
    console.log('🧭 NavigationInterface: Opening external navigation with destination:', destination);
    navigationService.openExternalNavigation(destination, app);
    toast.success(`Opening in ${app === 'auto' ? 'external' : app} navigation`);
  };

  // Format instruction for display
  const formatInstruction = (instruction) => {
    if (!instruction) return null;
    
    return {
      ...instruction,
      distanceText: navigationService.formatDistance(instruction.distance),
      durationText: navigationService.formatDuration(instruction.duration)
    };
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🧭</span>
          Navigation
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Destination Info */}
        {destination && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">📍</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                <p className="text-sm text-gray-600">{destination.address}</p>
                {destination.distance && (
                  <p className="text-xs text-blue-600 mt-1">
                    📏 {destination.distance} km away
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Location Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentLocation 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentLocation ? '✅ Located' : '📍 Locating...'}
            </span>
          </div>
          
          {currentLocation && (
            <div className="text-xs text-gray-500">
              Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m
              {currentLocation.speed > 0 && (
                <span> • Speed: {Math.round((currentLocation.speed || 0) * 3.6)}km/h</span>
              )}
            </div>
          )}
        </div>

        {/* Navigation Stats */}
        {navigationStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {navigationService.formatDistance(navigationStats.remainingDistance * 1000)}
                </div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {navigationStats.estimatedTime}m
                </div>
                <div className="text-xs text-gray-600">ETA</div>
              </div>
            </div>
          </div>
        )}

        {/* Current Instruction */}
        {currentInstruction && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentInstruction.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {currentInstruction.instruction}
                </div>
                <div className="text-sm text-gray-600">
                  in {navigationService.formatDistance(currentInstruction.distance)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Location Permission Request */}
        {locationPermission === 'prompt' && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500 text-xl">📍</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Location Access Required</h4>
                <p className="text-sm text-gray-600 mb-3">
                  To provide navigation, we need access to your location.
                </p>
                <button
                  onClick={getCurrentLocation}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Permission Denied */}
        {locationPermission === 'denied' && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start space-x-3">
              <span className="text-red-500 text-xl">🚫</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Location Access Denied</h4>
                <p className="text-sm text-gray-600">
                  Please enable location permissions in your browser settings to use navigation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isNavigating ? (
            <button
              onClick={startNavigation}
              disabled={!currentLocation || !destination || isCalculatingRoute}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isCalculatingRoute ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating Route...</span>
                </>
              ) : (
                <>
                  <span>🧭</span>
                  <span>Start Navigation</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopNavigation}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🛑</span>
              <span>Stop Navigation</span>
            </button>
          )}

          {/* External Navigation Options */}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2">Or open in external app:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openExternalNavigation('google')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => openExternalNavigation('waze')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>🚗</span>
                <span>Waze</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationInterface;