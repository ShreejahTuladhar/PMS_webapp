import { useEffect, useRef, useState, useCallback } from 'react';
import { Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import navigationService from '../../services/navigationService';

// Create custom user location marker
const createUserLocationIcon = () => {
  const iconHtml = `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: white;
      "></div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Create destination marker
const createDestinationIcon = () => {
  const iconHtml = `
    <div style="
      width: 32px;
      height: 40px;
      position: relative;
    ">
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">🎯</div>
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'destination-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 32],
  });
};

// Create instruction markers
const createInstructionIcon = (instruction) => {
  const iconHtml = `
    <div style="
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">
      ${instruction.index}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'instruction-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Auto-fit bounds component
const AutoFitBounds = ({ route }) => {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.bounds) {
      const bounds = L.latLngBounds(
        route.bounds.southWest,
        route.bounds.northEast
      );
      
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16
      });
    }
  }, [map, route]);
  
  return null;
};

const RouteVisualization = ({ 
  route, 
  currentLocation, 
  destination,
  showInstructions = true,
  showUserLocation = true,
  autoCalculateRoute = false
}) => {
  const routeRef = useRef(null);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Auto-calculate route when enabled
  const calculateRouteIfNeeded = useCallback(async () => {
    if (!autoCalculateRoute || !currentLocation || !destination || isCalculatingRoute) {
      return;
    }

    setIsCalculatingRoute(true);
    try {
      console.log('🗺️ RouteVisualization: Auto-calculating route...');
      const routeData = await navigationService.calculateRoute(currentLocation, destination, {
        alternatives: false,
        steps: true
      });
      setCalculatedRoute(routeData);
      console.log('✅ RouteVisualization: Route calculated successfully');
    } catch (error) {
      console.error('❌ RouteVisualization: Route calculation failed:', error);
      setCalculatedRoute(null);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [autoCalculateRoute, currentLocation, destination, isCalculatingRoute]);

  // Trigger route calculation when dependencies change
  useEffect(() => {
    calculateRouteIfNeeded();
  }, [calculateRouteIfNeeded]);

  // Convert route geometry to leaflet format
  const getRouteCoordinates = () => {
    // Use calculated route if available, otherwise use provided route
    const activeRoute = calculatedRoute || route;
    
    if (!activeRoute || !activeRoute.geometry || !activeRoute.geometry.coordinates) {
      // Fallback to direct line if no route available
      if (currentLocation && destination) {
        const destLat = destination.lat || destination.coordinates?.lat || destination.coordinates?.[0];
        const destLng = destination.lng || destination.coordinates?.lng || destination.coordinates?.[1];
        
        if (destLat && destLng) {
          return [
            [currentLocation.lat, currentLocation.lng],
            [destLat, destLng]
          ];
        }
      }
      return [];
    }

    return activeRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  };

  // Get route style based on route type
  const getRouteStyle = () => {
    const isCalculatedRoute = calculatedRoute !== null;
    
    return {
      color: isCalculatedRoute ? '#3b82f6' : '#9CA3AF',
      weight: isCalculatedRoute ? 6 : 4,
      opacity: isCalculatedRoute ? 0.9 : 0.6,
      smoothFactor: 1,
      dashArray: isCalculatedRoute ? null : '5, 5',
      lineCap: 'round',
      lineJoin: 'round'
    };
  };

  // Get instruction positions
  const getInstructionMarkers = () => {
    const activeRoute = calculatedRoute || route;
    
    if (!activeRoute || !activeRoute.instructions || !showInstructions) {
      return [];
    }

    return activeRoute.instructions.slice(0, -1)
      .filter(instruction => 
        instruction.location && 
        typeof instruction.location.lat === 'number' && 
        typeof instruction.location.lng === 'number' &&
        !isNaN(instruction.location.lat) &&
        !isNaN(instruction.location.lng)
      )
      .map((instruction, index) => ({
        position: [instruction.location.lat, instruction.location.lng],
        instruction: instruction,
        key: `instruction-${index}`
      }));
  };

  const routeCoordinates = getRouteCoordinates();
  const instructionMarkers = getInstructionMarkers();

  return (
    <>
      {/* Auto-fit bounds when route changes */}
      {route && <AutoFitBounds route={route} />}
      
      {/* Route calculating indicator */}
      {isCalculatingRoute && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600">Calculating optimal route...</span>
          </div>
        </div>
      )}
      
      {/* Route polyline */}
      {routeCoordinates.length > 0 && (
        <>
          {/* Route shadow for better visibility - only for calculated routes */}
          {calculatedRoute && (
            <Polyline
              positions={routeCoordinates}
              color="#000000"
              weight={8}
              opacity={0.3}
              smoothFactor={1}
            />
          )}
          
          {/* Main route line */}
          <Polyline
            ref={routeRef}
            positions={routeCoordinates}
            {...getRouteStyle()}
          />
        </>
      )}

      {/* User location marker */}
      {showUserLocation && currentLocation && (
        <Marker
          position={[currentLocation.lat, currentLocation.lng]}
          icon={createUserLocationIcon()}
          zIndexOffset={1000}
        >
          {/* User location popup */}
          {/*<Popup>
            <div className="text-sm">
              <div className="font-semibold mb-1">📍 Your Location</div>
              <div className="text-gray-600">
                Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m
              </div>
              {currentLocation.speed > 0 && (
                <div className="text-gray-600">
                  Speed: {Math.round((currentLocation.speed || 0) * 3.6)}km/h
                </div>
              )}
            </div>
          </Popup>*/}
        </Marker>
      )}

      {/* Destination marker */}
      {(() => {
        if (!destination) return null;
        
        // Extract coordinates safely
        let lat, lng;
        
        if (typeof destination.lat === 'number' && typeof destination.lng === 'number') {
          lat = destination.lat;
          lng = destination.lng;
        } else if (destination.coordinates && Array.isArray(destination.coordinates) && destination.coordinates.length >= 2) {
          lat = destination.coordinates[0]; // latitude first in our format
          lng = destination.coordinates[1]; // longitude second
        } else if (destination.coordinates?.lat && destination.coordinates?.lng) {
          lat = destination.coordinates.lat;
          lng = destination.coordinates.lng;
        }
        
        // Only render marker if we have valid coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.warn('⚠️ RouteVisualization: Invalid destination coordinates:', destination);
          return null;
        }
        
        return (
          <Marker
            position={[lat, lng]}
            icon={createDestinationIcon()}
            zIndexOffset={900}
          >
          {/*<Popup>
            <div className="text-sm max-w-xs">
              <div className="font-semibold mb-1">🎯 {destination.name}</div>
              <div className="text-gray-600">{destination.address}</div>
              {route && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    📏 {(route.distance / 1000).toFixed(1)}km • 
                    ⏱️ {Math.ceil(route.duration / 60)}min
                  </div>
                </div>
              )}
            </div>
          </Popup>*/}
          </Marker>
        );
      })()}

      {/* Instruction markers */}
      {instructionMarkers.map(({ position, instruction, key }) => (
        <Marker
          key={key}
          position={position}
          icon={createInstructionIcon(instruction)}
          zIndexOffset={800}
        >
          {/*<Popup>
            <div className="text-sm max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{instruction.icon}</span>
                <span className="font-semibold">Step {instruction.index}</span>
              </div>
              <div className="mb-2">{instruction.instruction}</div>
              <div className="text-xs text-gray-500">
                📏 {(instruction.distance / 1000).toFixed(1)}km • 
                ⏱️ {Math.ceil(instruction.duration / 60)}min
              </div>
              {instruction.roadName && instruction.roadName !== 'Unnamed Road' && (
                <div className="text-xs text-gray-600 mt-1">
                  🛣️ {instruction.roadName}
                </div>
              )}
            </div>
          </Popup>*/}
        </Marker>
      ))}

      {/* Route information overlay */}
      {(route || calculatedRoute) && !isCalculatingRoute && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">{calculatedRoute ? '🗺️' : '📍'}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                {calculatedRoute 
                  ? `${(calculatedRoute.distance / 1000).toFixed(1)} km`
                  : route
                  ? `${(route.distance / 1000).toFixed(1)} km`
                  : 'Route'
                }
              </div>
              <div className="text-xs text-gray-500">
                {calculatedRoute 
                  ? `${Math.ceil(calculatedRoute.duration / 60)} minutes`
                  : route
                  ? `${Math.ceil(route.duration / 60)} minutes`
                  : 'Direct line'
                }
              </div>
            </div>
          </div>
          
          {(calculatedRoute?.instructions || route?.instructions) && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                {(calculatedRoute?.instructions || route?.instructions).length} navigation steps
                {calculatedRoute && <span className="text-green-600 ml-1">• Optimized</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RouteVisualization;

// Usage example:
// <RouteVisualization
//   currentLocation={userLocation}
//   destination={parkingSpot}
//   autoCalculateRoute={true}  // Enable automatic route calculation
//   showInstructions={true}
//   showUserLocation={true}
// />