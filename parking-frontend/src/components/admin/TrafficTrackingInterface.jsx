import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import googleNavigationService from '../../services/googleNavigationService';
import navigationService from '../../services/navigationService';
import toast from 'react-hot-toast';

/**
 * Admin-only component for tracking user traffic and navigation patterns
 * Only accessible to super admins for traffic flow analysis
 */
const TrafficTrackingInterface = ({ isOpen, onClose, className = '' }) => {
  const { isSuperAdmin, canViewTraffic } = useAdminAccess();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingData, setTrackingData] = useState({
    activeUsers: 0,
    totalNavigations: 0,
    locationUpdates: 0,
    lastUpdate: null
  });
  const [locationHistory, setLocationHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);

  // Security check - only render for super admins
  if (!canViewTraffic || !isSuperAdmin) {
    console.warn('⚠️ TrafficTracking: Access denied - super admin required');
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      initializeTracking();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const initializeTracking = async () => {
    try {
      console.log('🔒 AdminTraffic: Initializing traffic tracking...');
      
      // Get current location for admin
      let location = googleNavigationService.getCurrentLocationSync();
      
      if (!location) {
        location = await googleNavigationService.initializeLocation();
      }
      
      setCurrentLocation(location);
      
      // Subscribe to location updates
      googleNavigationService.onLocationUpdate(handleLocationUpdate);
      
      setIsTracking(true);
      console.log('✅ AdminTraffic: Traffic tracking initialized');
      toast.success('🔒 Admin traffic tracking active');
      
    } catch (error) {
      console.error('❌ AdminTraffic: Initialization failed:', error);
      toast.error(`Tracking initialization failed: ${error.message}`);
    }
  };

  const handleLocationUpdate = useCallback((location) => {
    setCurrentLocation(location);
    
    // Add to location history (keep last 50 entries)
    setLocationHistory(prev => [
      {
        ...location,
        id: Date.now(),
        type: 'location_update'
      },
      ...prev.slice(0, 49)
    ]);

    // Update tracking stats
    setTrackingData(prev => ({
      ...prev,
      locationUpdates: prev.locationUpdates + 1,
      lastUpdate: new Date().toISOString()
    }));
    
    console.log('📊 AdminTraffic: Location tracked:', location);
  }, []);

  const cleanup = () => {
    if (isTracking) {
      googleNavigationService.offLocationUpdate(handleLocationUpdate);
      setIsTracking(false);
      console.log('🛑 AdminTraffic: Tracking stopped');
    }
  };

  const clearTrackingData = () => {
    setLocationHistory([]);
    setTrackingData({
      activeUsers: 0,
      totalNavigations: 0,
      locationUpdates: 0,
      lastUpdate: null
    });
    toast.success('🗑️ Tracking data cleared');
  };

  const exportTrackingData = () => {
    const data = {
      trackingStats: trackingData,
      locationHistory: locationHistory,
      currentLocation: currentLocation,
      exportTime: new Date().toISOString(),
      adminUser: 'super_admin' // Don't expose actual user info
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('📊 Traffic data exported');
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-white rounded-lg shadow-xl border-2 border-red-200 ${className}`}>
      {/* Admin Header with Security Indicator */}
      <div className="flex items-center justify-between p-4 border-b border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-red-900 flex items-center">
            <span className="text-2xl mr-2">🔒</span>
            Admin Traffic Tracking
          </h3>
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
            SUPER ADMIN ONLY
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tracking Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {trackingData.locationUpdates}
            </div>
            <div className="text-sm text-blue-800">Location Updates</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {isTracking ? '🟢' : '🔴'}
            </div>
            <div className="text-sm text-green-800">
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </div>
          </div>
        </div>

        {/* Current Admin Location */}
        {currentLocation && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📍 Admin Current Location</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</div>
              <div>Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m</div>
              <div>Last Update: {new Date(currentLocation.timestamp).toLocaleTimeString()}</div>
              {currentLocation.speed > 0 && (
                <div>Speed: {Math.round((currentLocation.speed || 0) * 3.6)}km/h</div>
              )}
            </div>
          </div>
        )}

        {/* Location History */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-900">📊 Traffic Flow Data</h4>
            <span className="text-sm text-gray-600">
              {locationHistory.length} entries
            </span>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {locationHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tracking data available
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {locationHistory.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="text-xs text-gray-600 flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="font-mono">
                      {entry.lat.toFixed(4)}, {entry.lng.toFixed(4)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span className="text-gray-400">•</span>
                    <span>±{Math.round(entry.accuracy || 0)}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportTrackingData}
              disabled={locationHistory.length === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              📊 Export Data
            </button>
            
            <button
              onClick={clearTrackingData}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 text-sm"
            >
              🗑️ Clear Data
            </button>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500">⚠️</span>
              <div className="text-xs text-yellow-800">
                <div className="font-semibold mb-1">Admin Notice:</div>
                <div>This interface tracks location data for traffic flow analysis. Use responsibly and in compliance with privacy policies.</div>
              </div>
            </div>
          </div>

          {/* Last Update Info */}
          {trackingData.lastUpdate && (
            <div className="text-center text-xs text-gray-500">
              Last tracking update: {new Date(trackingData.lastUpdate).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficTrackingInterface;