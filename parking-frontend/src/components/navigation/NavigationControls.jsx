import React, { useState } from 'react';
import NavigationInterface from './NavigationInterface';

const NavigationControls = ({ 
  destination, 
  onNavigationStart, 
  onNavigationStop,
  onRouteCalculated,
  isVisible = true,
  position = 'bottom-right' // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
}) => {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4', 
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4'
    };
    return positions[position] || positions['bottom-right'];
  };

  const handleNavigationToggle = () => {
    setIsNavigationOpen(!isNavigationOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsNavigationOpen(false);
    setIsMinimized(false);
    if (onNavigationStop) {
      onNavigationStop();
    }
  };

  if (!isVisible || !destination) return null;

  return (
    <div className={`fixed z-[1000] ${getPositionClasses()}`}>
      {/* Floating Navigation Button */}
      {!isNavigationOpen && (
        <button
          onClick={handleNavigationToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
          title="Start Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline font-medium">Navigate</span>
        </button>
      )}

      {/* Minimized Navigation Panel */}
      {isMinimized && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex items-center space-x-3 cursor-pointer max-w-sm"
             onClick={() => setIsMinimized(false)}>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600">🧭</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              Navigation Active
            </div>
            <div className="text-xs text-gray-500 truncate">
              To: {destination.name}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Full Navigation Interface */}
      {isNavigationOpen && !isMinimized && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 max-h-[80vh] overflow-hidden">
          {/* Header with minimize/close controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">🧭</span>
              Navigation
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Interface Content */}
          <div className="max-h-[calc(80vh-4rem)] overflow-y-auto">
            <NavigationInterface
              destination={destination}
              isOpen={true}
              onClose={() => {}} // Handled by parent controls
              onRouteCalculated={onRouteCalculated}
              className="border-0 shadow-none rounded-none"
            />
          </div>
        </div>
      )}

      {/* Quick Navigation Options (when closed) */}
      {!isNavigationOpen && (
        <div className="mt-3 space-y-2">
          <button
            onClick={() => {
              if (destination) {
                try {
                  // Extract numeric lat/lng values for external navigation
                  let lat, lng;
                  
                  // Handle various coordinate formats
                  if (typeof destination.lat === 'object' && destination.lat !== null) {
                    lat = destination.lat.coordinates?.lat || destination.lat.lat || destination.lat[1] || destination.lat.value;
                  } else {
                    lat = destination.lat || destination.coordinates?.lat;
                  }
                  
                  if (typeof destination.lng === 'object' && destination.lng !== null) {
                    lng = destination.lng.coordinates?.lng || destination.lng.lng || destination.lng[0] || destination.lng.value;
                  } else {
                    lng = destination.lng || destination.coordinates?.lng;
                  }
                  
                  const numericLat = typeof lat === 'number' ? lat : parseFloat(lat);
                  const numericLng = typeof lng === 'number' ? lng : parseFloat(lng);
                  
                  if (!isNaN(numericLat) && !isNaN(numericLng) && 
                      numericLat >= -90 && numericLat <= 90 && 
                      numericLng >= -180 && numericLng <= 180) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${numericLat},${numericLng}`;
                    window.open(url, '_blank');
                  } else {
                    console.error('❌ Invalid coordinates for Google Maps:', { lat: numericLat, lng: numericLng });
                    alert('Unable to open navigation - invalid coordinates');
                  }
                } catch (error) {
                  console.error('❌ Error opening Google Maps:', error);
                  alert('Unable to open navigation');
                }
              }
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
            title="Open in Google Maps"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              if (destination) {
                try {
                  // Extract numeric lat/lng values for external navigation
                  let lat, lng;
                  
                  // Handle various coordinate formats
                  if (typeof destination.lat === 'object' && destination.lat !== null) {
                    lat = destination.lat.coordinates?.lat || destination.lat.lat || destination.lat[1] || destination.lat.value;
                  } else {
                    lat = destination.lat || destination.coordinates?.lat;
                  }
                  
                  if (typeof destination.lng === 'object' && destination.lng !== null) {
                    lng = destination.lng.coordinates?.lng || destination.lng.lng || destination.lng[0] || destination.lng.value;
                  } else {
                    lng = destination.lng || destination.coordinates?.lng;
                  }
                  
                  const numericLat = typeof lat === 'number' ? lat : parseFloat(lat);
                  const numericLng = typeof lng === 'number' ? lng : parseFloat(lng);
                  
                  if (!isNaN(numericLat) && !isNaN(numericLng) && 
                      numericLat >= -90 && numericLat <= 90 && 
                      numericLng >= -180 && numericLng <= 180) {
                    const url = `https://waze.com/ul?ll=${numericLat},${numericLng}&navigate=yes`;
                    window.open(url, '_blank');
                  } else {
                    console.error('❌ Invalid coordinates for Waze:', { lat: numericLat, lng: numericLng });
                    alert('Unable to open navigation - invalid coordinates');
                  }
                } catch (error) {
                  console.error('❌ Error opening Waze:', error);
                  alert('Unable to open navigation');
                }
              }
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
            title="Open in Waze"
          >
            <span className="text-lg">🚗</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NavigationControls;