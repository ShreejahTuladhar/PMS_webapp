import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UnifiedNavigationSystem from '../navigation/UnifiedNavigationSystem';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// Smart booking flow that adapts based on user location and booking type
const SmartBookingFlow = ({ isOpen, onClose, parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core booking data
  const [bookingData, setBookingData] = useState({
    duration: 2,
    vehicleType: 'car',
    paymentMethod: 'cash',
    plateNumber: '',
    spaceId: 'A001'
  });
  
  // Smart flow states
  const [currentFlow, setCurrentFlow] = useState('detecting'); // 'detecting', 'remote', 'onsite'
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToParking, setDistanceToParking] = useState(null);
  const [bookingStep, setBookingStep] = useState('form'); // 'form', 'payment', 'confirmation', 'navigation'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Navigation states
  const [showNavigation, setShowNavigation] = useState(false);
  const [navigationMode, setNavigationMode] = useState('floating');
  
  // QR and ticket data
  const [qrCode, setQrCode] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Smart location detection and flow determination
  useEffect(() => {
    if (!isOpen || !parkingSpot) return;

    detectUserLocationAndFlow();
  }, [isOpen, parkingSpot]);


  const detectUserLocationAndFlow = async () => {
    try {
      // Get user's current location
      const position = await getCurrentPosition();
      const currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(currentLocation);

      // Calculate distance to parking spot
      const parkingLocation = {
        lat: parkingSpot.coordinates?.lat || parkingSpot.lat || 27.7172,
        lng: parkingSpot.coordinates?.lng || parkingSpot.lng || 85.3240
      };

      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        parkingLocation.lat, parkingLocation.lng
      );

      setDistanceToParking(distance);

      // Determine smart flow based on distance
      if (distance < 0.1) { // Within 100m - user is already at parking
        setCurrentFlow('onsite');
        toast.success('📍 You\'re at the parking location! Streamlined booking activated.');
      } else { // User needs to travel to parking
        setCurrentFlow('remote');
        toast(`🚗 Parking is ${formatDistance(distance * 1000)} away. Navigation will be available after booking.`);
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      // Default to remote flow if location fails
      setCurrentFlow('remote');
      toast('📍 Location access denied. Using standard booking flow.', {
        icon: '⚠️',
        style: { background: '#fff3cd', color: '#856404' }
      });
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    });
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const validateBookingData = () => {
    const newErrors = {};
    
    if (!bookingData.plateNumber.trim()) {
      newErrors.plateNumber = 'Vehicle plate number is required';
    } else if (bookingData.plateNumber.length < 2 || bookingData.plateNumber.length > 15) {
      newErrors.plateNumber = 'Plate number must be between 2-15 characters';
    }
    
    if (!bookingData.spaceId.trim()) {
      newErrors.spaceId = 'Please select a parking space';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processBooking = async () => {
    if (!validateBookingData()) return;

    setIsProcessing(true);
    setErrors({});
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + (currentFlow === 'onsite' ? 2 * 60000 : 10 * 60000)); // 2min for onsite, 10min for remote
      const endTime = new Date(startTime.getTime() + bookingData.duration * 60 * 60000);
      
      const booking = {
        locationId: parkingSpot.id || parkingSpot._id,
        spaceId: bookingData.spaceId,
        vehicleInfo: {
          plateNumber: bookingData.plateNumber.trim(),
          vehicleType: bookingData.vehicleType
        },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        paymentMethod: bookingData.paymentMethod,
        bookingType: currentFlow, // 'onsite' or 'remote'
        userLocation: userLocation,
        distanceToParking: distanceToParking,
        notes: `Smart ${currentFlow} booking for ${bookingData.duration} hour${bookingData.duration > 1 ? 's' : ''}`
      };
      
      const response = await api.post('/bookings', booking);
      
      if (response.data && response.data.success) {
        const confirmedBooking = {
          ...booking,
          bookingId: response.data.bookingId || `PMS${Date.now()}`,
          qrCode: `QR${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
          status: 'confirmed',
          confirmationTime: new Date().toISOString()
        };

        setQrCode(confirmedBooking.qrCode);
        setBookingConfirmed(true);

        // SmartBookingFlow is self-contained - no need for external booking context

        // Smart next step based on flow type
        if (currentFlow === 'onsite') {
          setBookingStep('confirmation');
          toast.success('🎫 Booking confirmed! You can start parking immediately.');
        } else {
          setBookingStep('navigation');
          toast.success('🎫 Booking confirmed! Navigation is ready.');
        }
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (error.status === 400 && error.data?.errors) {
        const validationErrors = {};
        error.data.errors.forEach(err => {
          if (err.path?.includes('plateNumber')) {
            validationErrors.plateNumber = err.msg;
          } else if (err.path?.includes('spaceId')) {
            validationErrors.spaceId = err.msg;
          }
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.message || 'Booking failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigationComplete = () => {
    toast.success('🎉 You\'ve arrived! Your parking spot is ready.');
    setBookingStep('confirmation');
  };

  if (!isOpen || !parkingSpot) return null;

  const hourlyRate = parkingSpot.vehicleTypes?.[bookingData.vehicleType] || parkingSpot.hourlyRate;
  const totalCost = hourlyRate * bookingData.duration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Parking Booking</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                currentFlow === 'onsite' 
                  ? 'bg-green-100 text-green-700' 
                  : currentFlow === 'remote'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {currentFlow === 'onsite' ? '📍 On-site' : 
                 currentFlow === 'remote' ? '🚗 Remote' : '🔍 Detecting...'}
              </span>
              {distanceToParking && (
                <span className="text-xs text-gray-500">
                  {formatDistance(distanceToParking * 1000)} away
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Parking Spot Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{parkingSpot.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{parkingSpot.address || parkingSpot.location?.address}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rate: NPR {hourlyRate}/hour</span>
              <span className="text-lg font-bold text-blue-600">NPR {totalCost}</span>
            </div>
          </div>

          {/* Booking Form */}
          {bookingStep === 'form' && (
            <div className="space-y-4">
              {/* Vehicle Plate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Plate Number *
                </label>
                <input
                  type="text"
                  value={bookingData.plateNumber}
                  onChange={(e) => setBookingData({...bookingData, plateNumber: e.target.value.toUpperCase()})}
                  placeholder="Enter plate number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.plateNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.plateNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Duration
                </label>
                <select
                  value={bookingData.duration}
                  onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6,8,12,24].map(hour => (
                    <option key={hour} value={hour}>
                      {hour} hour{hour > 1 ? 's' : ''} - NPR {hourlyRate * hour}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={bookingData.vehicleType}
                  onChange={(e) => setBookingData({...bookingData, vehicleType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bike">Bike</option>
                </select>
              </div>

              {/* Parking Space (simplified for onsite) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Space
                </label>
                {currentFlow === 'onsite' ? (
                  <select
                    value={bookingData.spaceId}
                    onChange={(e) => setBookingData({...bookingData, spaceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A001">A-001 (Available)</option>
                    <option value="A002">A-002 (Available)</option>
                    <option value="B001">B-001 (Available)</option>
                  </select>
                ) : (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    Space will be assigned automatically upon arrival
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="digital">Digital Payment</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={processBooking}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>🎫</span>
                    <span>Confirm Booking - NPR {totalCost}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Step (for remote bookings) */}
          {bookingStep === 'navigation' && currentFlow === 'remote' && (
            <div className="space-y-4">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 mb-4">Your parking spot is reserved. Navigate to the location.</p>
                
                {qrCode && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <div className="text-2xl font-mono text-gray-800">{qrCode}</div>
                    <p className="text-xs text-gray-600 mt-1">Show this code at parking</p>
                  </div>
                )}
              </div>

              <UnifiedNavigationSystem
                mode="modal"
                destination={{
                  lat: parkingSpot.coordinates?.lat || parkingSpot.lat || 27.7172,
                  lng: parkingSpot.coordinates?.lng || parkingSpot.lng || 85.3240,
                  name: parkingSpot.name,
                  address: parkingSpot.address || parkingSpot.location?.address
                }}
                isOpen={true}
                onNavigationComplete={handleNavigationComplete}
              />
            </div>
          )}

          {/* Confirmation Step (for onsite bookings or after navigation) */}
          {bookingStep === 'confirmation' && (
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentFlow === 'onsite' ? 'Ready to Park!' : 'You\'ve Arrived!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentFlow === 'onsite' 
                  ? 'Your parking space is ready. You can start parking now.'
                  : 'Your parking space is waiting for you.'
                }
              </p>
              
              {qrCode && (
                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                  <div className="text-3xl font-mono text-gray-800 mb-2">{qrCode}</div>
                  <p className="text-sm text-gray-600">Show this QR code to the parking attendant</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
                >
                  Start Parking
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
                >
                  View in Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartBookingFlow;