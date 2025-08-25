import React from 'react';
import SingleParkingCardView from './SingleParkingCardView';

/**
 * 🎯 Demo Component for Single Parking Card View
 * Shows the single card view with sample data for testing
 */
const SingleCardDemo = () => {
  // Sample parking data for demonstration
  const sampleParkingSpots = [
    {
      id: 'demo-1',
      name: 'City Center Parking Plaza',
      address: 'New Baneshwor, Kathmandu, Nepal',
      distance: 0.3,
      hourlyRate: 50,
      availableSpaces: 15,
      totalSpaces: 50,
      rating: 4.5,
      operatingHours: { open: '06:00', close: '22:00', isOpen24: false },
      features: ['CCTV Security', 'Covered Parking', 'EV Charging', 'Wheelchair Accessible'],
      vehicleTypes: {
        car: 50,
        motorcycle: 25,
        bike: 15
      },
      amenities: ['Security Guard', 'Clean Restrooms', 'Valet Service']
    },
    {
      id: 'demo-2',
      name: 'Durbar Square Heritage Parking',
      address: 'Basantapur Durbar Square, Kathmandu',
      distance: 0.8,
      hourlyRate: 40,
      availableSpaces: 8,
      totalSpaces: 30,
      rating: 4.2,
      operatingHours: { open: '07:00', close: '21:00', isOpen24: false },
      features: ['Heritage Location', 'Tourist Friendly', 'Guide Services'],
      vehicleTypes: {
        car: 40,
        motorcycle: 20
      },
      amenities: ['Historical Significance', 'Local Guides', 'Souvenir Shop']
    },
    {
      id: 'demo-3',
      name: 'Thamel Night Market Parking',
      address: 'Thamel, Kathmandu, Nepal',
      distance: 1.2,
      hourlyRate: 60,
      availableSpaces: 0,
      totalSpaces: 25,
      rating: 4.7,
      operatingHours: { isOpen24: true },
      features: ['24/7 Access', 'Night Market Access', 'Restaurant Nearby', 'Hotel Pickup'],
      vehicleTypes: {
        car: 60,
        motorcycle: 30,
        bike: 20
      },
      amenities: ['24/7 Security', 'Food Court', 'ATM Available', 'WiFi Zone']
    },
    {
      id: 'demo-4',
      name: 'Airport Express Parking',
      address: 'Ring Road, Sinamangal, Kathmandu',
      distance: 5.5,
      hourlyRate: 35,
      availableSpaces: 45,
      totalSpaces: 100,
      rating: 4.0,
      operatingHours: { isOpen24: true },
      features: ['Airport Shuttle', 'Long-term Parking', 'Luggage Assistance'],
      vehicleTypes: {
        car: 35,
        motorcycle: 20,
        bus: 80
      },
      amenities: ['Airport Shuttle', 'Luggage Storage', 'Car Wash Service']
    },
    {
      id: 'demo-5',
      name: 'Garden of Dreams Premium',
      address: 'Kaiser Mahal, Kathmandu, Nepal',
      distance: 0.6,
      hourlyRate: 80,
      availableSpaces: 5,
      totalSpaces: 15,
      rating: 4.8,
      operatingHours: { open: '08:00', close: '20:00', isOpen24: false },
      features: ['Premium Location', 'Valet Parking', 'Luxury Service', 'Garden Views'],
      vehicleTypes: {
        car: 80,
        motorcycle: 40
      },
      amenities: ['Concierge Service', 'Premium Lounge', 'Complimentary Water']
    }
  ];

  const handleBooking = (spot) => {
    console.log('🅿️ Booking requested for:', spot.name);
    alert(`Booking demo: ${spot.name}\nRate: Rs. ${spot.hourlyRate}/hr\nAvailable: ${spot.availableSpaces} spaces`);
  };

  const handleSpotSelect = (spot) => {
    console.log('📍 Spot selected:', spot.name);
  };

  const handleLoginRequired = () => {
    console.log('🔐 Login required');
    alert('Please login to book parking spots');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🃏 Single Card View Demo
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the new single parking card interface. Use scroll wheel, arrow keys, 
          or swipe gestures to navigate through different parking spots one at a time.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Interactive Demo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Navigate through {sampleParkingSpots.length} sample parking locations using:
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">🖱️ Mouse scroll</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">⌨️ Arrow keys</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">📱 Touch swipe</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">🏠 Home/End keys</span>
          </div>
        </div>

        <div className="h-[500px]">
          <SingleParkingCardView
            parkingSpots={sampleParkingSpots}
            selectedSpot={sampleParkingSpots[0]}
            onSpotSelect={handleSpotSelect}
            onBooking={handleBooking}
            onLoginRequired={handleLoginRequired}
            className="h-full"
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Features Demonstrated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Navigation</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Smooth scroll navigation</li>
              <li>• Keyboard arrow key support</li>
              <li>• Touch gesture recognition</li>
              <li>• Visual progress indicators</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">UI Elements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clean card-based design</li>
              <li>• Availability status indicators</li>
              <li>• Multiple vehicle type support</li>
              <li>• Feature and amenity display</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Interactions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Book Now functionality</li>
              <li>• Navigation integration</li>
              <li>• Responsive design</li>
              <li>• Accessibility support</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Data Display</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time availability</li>
              <li>• Multiple pricing tiers</li>
              <li>• Operating hours</li>
              <li>• Distance calculation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCardDemo;