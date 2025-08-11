import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';

function BookingModal({ isOpen, onClose, parkingSpot }) {
  const { user } = useAuth();
  const { startBooking } = useBooking();
  
  const [duration, setDuration] = useState(2);
  const [vehicleType, setVehicleType] = useState('car');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !parkingSpot) return null;

  const hourlyRate = parkingSpot.vehicleTypes[vehicleType] || parkingSpot.hourlyRate;
  const totalCost = hourlyRate * duration;

  const handleBooking = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      startBooking(parkingSpot, duration, vehicleType);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Book Parking Spot</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Parking Spot Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">{parkingSpot.name}</h4>
            <p className="text-gray-600 text-sm mb-2">{parkingSpot.address}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Available Spaces:</span>
              <span className="font-medium text-green-600">{parkingSpot.availability} spaces</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                {Object.entries(parkingSpot.vehicleTypes).map(([type, rate]) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} - Rs. {rate}/hr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hours => (
                  <option key={hours} value={hours}>
                    {hours} {hours === 1 ? 'hour' : 'hours'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                {['card', 'esewa', 'khalti', 'cash'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-blue-600"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {method === 'esewa' ? 'eSewa' : method === 'khalti' ? 'Khalti' : method}
                      {method === 'card' && ' (Credit/Debit)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Rate per hour:</span>
              <span className="font-medium">Rs. {hourlyRate}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
              <span className="font-semibold text-gray-800">Total Cost:</span>
              <span className="font-bold text-blue-600 text-xl">Rs. {totalCost}</span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Booking For:</h5>
              <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">{user.phoneNumber}</p>
            </div>
          )}

          {/* Navigation Unlock Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
              </svg>
              <div>
                <h6 className="font-medium text-green-800">Navigation Included!</h6>
                <p className="text-sm text-green-700">Get Google Maps navigation to your parking spot after booking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleBooking}
            disabled={isProcessing || parkingSpot.availability === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Confirm Booking - Rs. ${totalCost}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;