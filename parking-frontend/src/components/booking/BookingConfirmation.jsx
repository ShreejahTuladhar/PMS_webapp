import { useEffect, useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';

function BookingConfirmation({ isOpen, onClose }) {
  const { currentBooking, navigationData, startNavigation, completeBooking } = useBooking();
  const [showQR, setShowQR] = useState(false);

  if (!isOpen || !currentBooking) return null;

  const handleStartNavigation = () => {
    if (navigationData) {
      startNavigation();
      
      // Create Google Maps URL with directions
      const origin = 'current+location'; // or use actual coordinates if available
      const destination = `${navigationData.destination.lat},${navigationData.destination.lng}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
      
      // Open Google Maps in new tab
      window.open(googleMapsUrl, '_blank');
      
      // Close modal after starting navigation
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleOpenInApp = () => {
    if (navigationData) {
      // Try to open in Google Maps mobile app
      const destination = `${navigationData.destination.lat},${navigationData.destination.lng}`;
      const mapsAppUrl = `comgooglemaps://?daddr=${destination}&directionsmode=driving`;
      
      // For Android
      const androidUrl = `geo:0,0?q=${destination}(${encodeURIComponent(navigationData.destination.name)})`;
      
      // Try to open app, fallback to browser
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Try to open native app first
        window.location.href = navigator.userAgent.includes('iPhone') ? mapsAppUrl : androidUrl;
        
        // Fallback to web version after a short delay
        setTimeout(() => {
          handleStartNavigation();
        }, 1500);
      } else {
        handleStartNavigation();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="text-center p-8">
          {/* Success Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your parking spot has been reserved successfully.</p>
          
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Booking ID:</span>
                <p className="font-mono font-semibold text-blue-600">{currentBooking.bookingId}</p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-semibold">{currentBooking.duration} hours</p>
              </div>
              <div>
                <span className="text-gray-500">Vehicle Type:</span>
                <p className="font-semibold capitalize">{currentBooking.vehicleType}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Cost:</span>
                <p className="font-semibold text-green-600">Rs. {currentBooking.totalCost}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500">Location:</span>
              <p className="font-semibold">{currentBooking.parkingSpot.name}</p>
              <p className="text-sm text-gray-600">{currentBooking.parkingSpot.address}</p>
            </div>
          </div>
          
          {/* QR Code Section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold text-blue-800 mb-1">Entry QR Code</h3>
                <p className="text-sm text-blue-600">Show this code at the parking entrance</p>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
            </div>
            
            {showQR && (
              <div className="mt-4 bg-white p-4 rounded border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <div className="bg-gray-200 w-32 h-32 mx-auto rounded flex items-center justify-center mb-2">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M4 12h2.01M4 8h2.01" />
                    </svg>
                  </div>
                  <p className="text-xs font-mono text-gray-600">{currentBooking.qrCode}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-green-800 mb-2">🎉 Navigation Unlocked!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Get turn-by-turn directions to your parking spot using Google Maps.
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={handleOpenInApp}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    🗺️ Open in Google Maps App
                  </button>
                  
                  <button
                    onClick={handleStartNavigation}
                    className="w-full bg-white text-green-700 border border-green-300 py-2 px-4 rounded-lg hover:bg-green-50 transition font-medium"
                  >
                    🌐 Open in Browser
                  </button>
                </div>
                
                <p className="text-xs text-green-600 mt-2">
                  📍 Destination: {navigationData?.destination.name}
                </p>
              </div>
            </div>
          </div>
          
          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please arrive within 15 minutes of your booking time</li>
              <li>• Show your QR code at the entrance gate</li>
              <li>• Keep your booking ID for any inquiries</li>
              <li>• Contact support if you need to extend your booking</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              completeBooking();
              onClose();
            }}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;