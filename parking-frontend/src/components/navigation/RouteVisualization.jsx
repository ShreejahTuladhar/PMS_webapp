import React, { useEffect, useRef } from 'react';
import { Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

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
  className = ''
}) => {
  const routeRef = useRef(null);

  // Convert route geometry to leaflet format
  const getRouteCoordinates = () => {
    if (!route || !route.geometry || !route.geometry.coordinates) {
      return [];
    }

    return route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  };

  // Get route style based on traffic or road conditions
  const getRouteStyle = () => {
    return {
      color: '#3b82f6',
      weight: 6,
      opacity: 0.8,
      smoothFactor: 1,
      dashArray: null,
      lineCap: 'round',
      lineJoin: 'round'
    };
  };

  // Get instruction positions
  const getInstructionMarkers = () => {
    if (!route || !route.instructions || !showInstructions) {
      return [];
    }

    return route.instructions.slice(0, -1).map((instruction, index) => ({
      position: [instruction.location.lat, instruction.location.lng],
      instruction: instruction,
      key: `instruction-${index}`
    }));
  };

  const routeCoordinates = getRouteCoordinates();
  const instructionMarkers = getInstructionMarkers();

  return (
    <div className={className}>
      {/* Auto-fit bounds when route changes */}
      {route && <AutoFitBounds route={route} />}
      
      {/* Route polyline */}
      {routeCoordinates.length > 0 && (
        <>
          {/* Route shadow for better visibility */}
          <Polyline
            positions={routeCoordinates}
            color="#000000"
            weight={8}
            opacity={0.3}
            smoothFactor={1}
          />
          
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
      {destination && (
        <Marker
          position={[destination.lat || destination.coordinates?.lat, destination.lng || destination.coordinates?.lng]}
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
      )}

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
      {route && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">🗺️</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                {(route.distance / 1000).toFixed(1)} km
              </div>
              <div className="text-xs text-gray-500">
                {Math.ceil(route.duration / 60)} minutes
              </div>
            </div>
          </div>
          
          {route.instructions && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                {route.instructions.length} navigation steps
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteVisualization;