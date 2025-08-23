import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const GPSTracker = ({ onLocationLocked, destination }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('initializing'); // 'initializing', 'searching', 'locking', 'locked', 'error'
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [watchId, setWatchId] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [showManualLock, setShowManualLock] = useState(false);

  useEffect(() => {
    startGPSTracking();
    
    // Show manual lock button after 30 seconds if still trying to lock
    const fallbackTimer = setTimeout(() => {
      if (gpsStatus !== 'locked' && gpsStatus !== 'error') {
        setShowManualLock(true);
        toast('🔓 Manual GPS lock now available if needed', { 
          icon: 'ℹ️',
          duration: 4000 
        });
      }
    }, 30000);
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearTimeout(fallbackTimer);
    };
  }, []);
  
  // Also show manual lock if we have a location but accuracy is poor
  useEffect(() => {
    if (currentLocation && locationAccuracy > 50 && gpsStatus === 'locking') {
      const poorAccuracyTimer = setTimeout(() => {
        setShowManualLock(true);
      }, 10000);
      
      return () => clearTimeout(poorAccuracyTimer);
    }
  }, [currentLocation, locationAccuracy, gpsStatus]);

  const startGPSTracking = async () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      toast.error('GPS not supported on this device');
      return;
    }

    // Check if running in secure context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setGpsStatus('error');
      toast.error('Location services require HTTPS connection');
      return;
    }

    try {
      setIsTracking(true);
      setGpsStatus('searching');
      
      // Check permission status first
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        if (permission.state === 'denied') {
          setGpsStatus('error');
          toast.error('Location permission denied. Please enable location access.');
          return;
        }
      }

      // Get initial position with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationUpdate(position);
          setGpsStatus('locking');
          
          // Start watching position for more accurate lock
          const id = navigator.geolocation.watchPosition(
            handleLocationUpdate,
            handleLocationError,
            {
              enableHighAccuracy: true,
              timeout: 30000,
              maximumAge: 10000
            }
          );
          setWatchId(id);
        },
        (error) => {
          console.warn('High accuracy GPS failed, trying standard accuracy', error);
          // Fallback to standard accuracy with longer timeout
          navigator.geolocation.getCurrentPosition(
            (position) => {
              handleLocationUpdate(position);
              setGpsStatus('locking');
              
              // Start watching with standard accuracy
              const id = navigator.geolocation.watchPosition(
                handleLocationUpdate,
                handleLocationError,
                {
                  enableHighAccuracy: false,
                  timeout: 45000,
                  maximumAge: 30000
                }
              );
              setWatchId(id);
            },
            (finalError) => {
              console.warn('Standard accuracy also failed, trying one more time with maximum timeout', finalError);
              // Last resort: try with maximum tolerance
              navigator.geolocation.getCurrentPosition(
                handleLocationUpdate,
                handleLocationError,
                {
                  enableHighAccuracy: false,
                  timeout: 60000,
                  maximumAge: 300000
                }
              );
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 120000
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 60000
        }
      );

    } catch (error) {
      console.error('Error starting GPS tracking:', error);
      setGpsStatus('error');
      toast.error('Failed to start GPS tracking');
    }
  };

  const handleLocationUpdate = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    const newLocation = {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
      timestamp: new Date(),
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed
    };

    setCurrentLocation(newLocation);
    setLocationAccuracy(accuracy);
    
    // Add to location history for accuracy averaging
    setLocationHistory(prev => {
      const updated = [...prev, newLocation].slice(-5); // Keep last 5 readings
      return updated;
    });

    // More lenient auto-lock conditions for better user experience
    if (accuracy <= 20 && locationHistory.length >= 2) {
      setGpsStatus('locked');
      
      // Calculate average position from recent readings for better accuracy
      const avgLocation = calculateAverageLocation([...locationHistory, newLocation]);
      
      // Auto-lock after getting stable GPS reading (reduced delay)
      setTimeout(() => {
        handleLockGPS(avgLocation);
      }, 1500);
    } else if (accuracy <= 100) {
      setGpsStatus('locking');
    } else {
      setGpsStatus('searching');
    }
  };

  const handleLocationError = (error) => {
    console.error('GPS location error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      PERMISSION_DENIED: error.PERMISSION_DENIED,
      POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
      TIMEOUT: error.TIMEOUT
    });
    
    let errorMessage = 'Unable to get your location';
    let shouldSetError = true;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions in your browser.';
        setPermissionStatus('denied');
        setGpsStatus('error');
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please ensure GPS is enabled.';
        setGpsStatus('error');
        break;
      case error.TIMEOUT:
        // For timeout errors, show manual lock option instead of complete failure
        if (!showManualLock && gpsStatus !== 'locked') {
          setShowManualLock(true);
          errorMessage = 'GPS taking longer than expected. You can now manually lock your position.';
          toast(errorMessage, { 
            icon: '⏰',
            duration: 5000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B'
            }
          });
          shouldSetError = false;
        } else {
          errorMessage = 'Location request timed out. Please try again or use manual lock.';
        }
        break;
      default:
        errorMessage = `GPS error (code: ${error.code}): ${error.message}`;
        setGpsStatus('error');
    }
    
    if (shouldSetError && error.code === error.TIMEOUT) {
      // Don't set error status for timeout if we have some location data
      if (!currentLocation) {
        setGpsStatus('error');
        toast.error(errorMessage);
      }
    } else if (shouldSetError && error.code !== error.TIMEOUT) {
      toast.error(errorMessage);
    }
  };

  const calculateAverageLocation = (locations) => {
    if (locations.length === 0) return null;
    
    const totalLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
    const totalLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
    const totalAccuracy = locations.reduce((sum, loc) => sum + loc.accuracy, 0);
    
    return {
      lat: totalLat / locations.length,
      lng: totalLng / locations.length,
      accuracy: totalAccuracy / locations.length,
      timestamp: new Date()
    };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const handleLockGPS = (location = currentLocation) => {
    if (location) {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      
      setIsTracking(false);
      toast.success('🎯 GPS location locked successfully!');
      onLocationLocked(location);
    }
  };

  const handleRetryGPS = () => {
    setLocationHistory([]);
    setGpsStatus('initializing');
    setCurrentLocation(null);
    setLocationAccuracy(null);
    setShowManualLock(false);
    startGPSTracking();
  };

  const handleManualLock = () => {
    if (currentLocation) {
      toast.success('🎯 GPS manually locked for navigation!');
      handleLockGPS(currentLocation);
    } else {
      toast.error('No GPS location available to lock');
    }
  };

  const getStatusIcon = () => {
    switch (gpsStatus) {
      case 'searching':
        return (
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'locking':
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case 'locked':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (gpsStatus) {
      case 'searching':
        return 'Searching for GPS satellites...';
      case 'locking':
        return 'Locking GPS position for accurate navigation...';
      case 'locked':
        return 'GPS location locked! Ready for navigation.';
      case 'error':
        return 'GPS error occurred. Please try again.';
      default:
        return 'Initializing GPS tracking...';
    }
  };

  const getAccuracyStatus = () => {
    if (!locationAccuracy) return { color: 'gray', text: 'Unknown' };
    
    if (locationAccuracy <= 5) return { color: 'green', text: 'Excellent' };
    if (locationAccuracy <= 10) return { color: 'green', text: 'Very Good' };
    if (locationAccuracy <= 20) return { color: 'yellow', text: 'Good' };
    if (locationAccuracy <= 50) return { color: 'orange', text: 'Fair' };
    return { color: 'red', text: 'Poor' };
  };

  return (
    <div className="text-center space-y-6">
      {/* GPS Status Icon */}
      <div className="flex justify-center">
        {getStatusIcon()}
      </div>

      {/* Status Message */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{getStatusMessage()}</h3>
        
        {gpsStatus === 'searching' && (
          <p className="text-gray-600 text-sm">
            Make sure you're outdoors or near a window for better GPS signal
          </p>
        )}
        
        {gpsStatus === 'locking' && (
          <p className="text-gray-600 text-sm">
            Getting precise location for optimal navigation accuracy
          </p>
        )}
      </div>

      {/* Location Information */}
      {currentLocation && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Latitude</p>
              <p className="font-mono font-medium">{currentLocation.lat.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p className="font-mono font-medium">{currentLocation.lng.toFixed(6)}</p>
            </div>
          </div>
          
          {locationAccuracy && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-sm">GPS Accuracy:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full bg-${getAccuracyStatus().color}-500`}></span>
                <span className={`text-sm font-medium text-${getAccuracyStatus().color}-600`}>
                  {getAccuracyStatus().text} (±{Math.round(locationAccuracy)}m)
                </span>
              </div>
            </div>
          )}
          
          {destination && currentLocation && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Distance to destination:</span>
              <span className="text-sm font-medium text-blue-600">
                {calculateDistance(
                  currentLocation.lat, currentLocation.lng,
                  destination.lat, destination.lng
                ).toFixed(1)} km
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {gpsStatus === 'locking' && locationHistory.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 text-sm font-medium">GPS Lock Progress</span>
            <span className="text-blue-600 text-sm">{Math.min(locationHistory.length, 5)}/5</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((locationHistory.length / 5) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-blue-600 text-xs mt-2">
            Collecting multiple GPS readings for better accuracy...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {gpsStatus === 'locked' && (
          <button
            onClick={() => handleLockGPS()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Confirm GPS Lock</span>
          </button>
        )}
        
        {/* Manual Lock Button - appears when taking too long or accuracy is poor */}
        {showManualLock && currentLocation && gpsStatus !== 'locked' && gpsStatus !== 'error' && (
          <button
            onClick={handleManualLock}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Lock GPS Position</span>
          </button>
        )}
        
        {gpsStatus === 'error' && (
          <button
            onClick={handleRetryGPS}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry GPS Lock</span>
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="text-left">
            <h4 className="font-medium text-yellow-800 text-sm mb-1">GPS Tips:</h4>
            <ul className="text-yellow-700 text-xs space-y-1">
              <li>• Move to an open area with clear sky view</li>
              <li>• Keep your device steady during GPS lock</li>
              <li>• Enable high accuracy location mode</li>
              <li>• Wait for "Excellent" or "Very Good" accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTracker;