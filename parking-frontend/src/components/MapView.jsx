import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom parking markers
const createParkingIcon = (availability) => {
  const color = availability > 0 ? '#10B981' : '#EF4444'; // green or red
  const iconHtml = `
    <div style="
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      P
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-parking-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to handle map centering
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const MapView = ({ parkingSpots, radius, center, onSpotSelect }) => {
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  // Default center (you can change this to your city's coordinates)
  const defaultCenter = [27.7172, 85.3240]; // Kathmandu, Nepal
  
  // Calculate map center and add coordinates to parking spots
  const mapCenter = useMemo(() => {
    if (center && center.lat && center.lng) {
      return [center.lat, center.lng];
    }
    return defaultCenter;
  }, [center]);

  // Add realistic coordinates to parking spots based on center
  const parkingSpotsWithCoords = useMemo(() => {
    const baseLatitude = mapCenter[0];
    const baseLongitude = mapCenter[1];
    
    return parkingSpots.map((spot, index) => ({
      ...spot,
      coordinates: [
        baseLatitude + (Math.random() - 0.5) * 0.02 * radius, // Random offset within radius
        baseLongitude + (Math.random() - 0.5) * 0.02 * radius,
      ],
    }));
  }, [parkingSpots, mapCenter, radius]);

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    onSpotSelect && onSpotSelect(spot);
  };

  const radiusInMeters = radius * 1000; // Convert km to meters

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Map View</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Radius: {radius}km</span>
          </div>
        </div>
      </div>

      <div className="relative h-96">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController center={{ lat: mapCenter[0], lng: mapCenter[1] }} zoom={13} />
          
          {/* Search radius circle */}
          <Circle
            center={mapCenter}
            radius={radiusInMeters}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
          
          {/* Parking spot markers */}
          {parkingSpotsWithCoords.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.coordinates}
              icon={createParkingIcon(spot.availability)}
              eventHandlers={{
                click: () => handleSpotClick(spot),
              }}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <h4 className="font-semibold mb-2">{spot.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{spot.address}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hourly Rate:</span>
                      <span className="font-semibold text-blue-600">${spot.hourlyRate}/hr</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Availability:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        spot.availability > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {spot.availability > 0 ? `${spot.availability} available` : 'Full'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{spot.distance < 1 ? `${Math.round(spot.distance * 1000)}m` : `${spot.distance}km`}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {spot.rating}
                      </span>
                    </div>
                    
                    {spot.businessHours.isOpen24 ? (
                      <div className="flex justify-between">
                        <span>Hours:</span>
                        <span className="text-green-600">24/7</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Hours:</span>
                        <span>{spot.businessHours.open} - {spot.businessHours.close}</span>
                      </div>
                    )}
                    
                    {spot.features.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {spot.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {spot.specialOffers && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-green-700 text-xs">
                        🎉 {spot.specialOffers}
                      </div>
                    )}
                    
                    <button 
                      className={`w-full mt-3 px-4 py-2 rounded font-medium text-sm transition ${
                        spot.availability > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={spot.availability === 0}
                      onClick={() => {
                        alert(`Booking initiated for ${spot.name}\nRate: $${spot.hourlyRate}/hr\nAvailability: ${spot.availability} spaces`);
                      }}
                    >
                      {spot.availability > 0 ? 'Book Now' : 'Full'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Controls */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Full</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
              <span>Search Area</span>
            </div>
          </div>
          <span>{parkingSpots.length} parking locations found</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;