import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import googleNavigationService from '../../services/googleNavigationService';
import api from '../../services/api';

/**
 * 🎯 Optimized Booking Flow - Streamlined for Better UX
 * Focuses on essential steps with clear progression
 */
const OptimizedBookingFlow = ({ isOpen, onClose, parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Simplified booking states
  const [step, setStep] = useState(1); // 1: Details, 2: Confirm, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  
  // Essential booking data
  const [bookingData, setBookingData] = useState({
    duration: 2,
    vehicleType: 'car',
    plateNumber: '',
    paymentMethod: 'cash', // Default for now
    isHereNow: true // Simple toggle instead of complex location detection
  });
  
  const [errors, setErrors] = useState({});
  
  // Calculate pricing
  const calculateTotal = () => {
    if (!parkingSpot?.hourlyRate) return 0;
    return parkingSpot.hourlyRate * bookingData.duration;
  };

  // Validate essential fields
  const validateBookingData = () => {
    const newErrors = {};
    
    if (!bookingData.plateNumber.trim()) {
      newErrors.plateNumber = 'Vehicle plate number required';
    } else if (bookingData.plateNumber.length < 2) {
      newErrors.plateNumber = 'Please enter valid plate number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process booking
  const handleBookingSubmit = async () => {
    if (!validateBookingData()) return;

    setIsProcessing(true);
    setErrors({});
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + (bookingData.isHereNow ? 2 * 60000 : 15 * 60000));
      const endTime = new Date(startTime.getTime() + bookingData.duration * 60 * 60000);
      
      const booking = {
        locationId: parkingSpot.id || parkingSpot._id,
        spaceId: `space_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Generate unique space ID
        vehicleInfo: {
          plateNumber: bookingData.plateNumber.trim().toUpperCase(),
          vehicleType: bookingData.vehicleType
        },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        paymentMethod: bookingData.paymentMethod,
        bookingType: bookingData.isHereNow ? 'immediate' : 'advance',
        totalAmount: calculateTotal(),
        notes: `${bookingData.duration} hour parking`
      };
      
      const response = await api.post('/bookings', booking);
      
      if (response.data?.success) {
        const confirmation = {
          bookingId: response.data.bookingId || `QR${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
          qrCode: `QR${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
          ...booking,
          confirmationTime: new Date().toISOString()
        };

        setBookingConfirmed(confirmation);
        setStep(3);
        toast.success('🎫 Booking confirmed successfully!');
      } else {
        toast.error('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle navigation to parking spot
  const handleGetDirections = () => {
    try {
      googleNavigationService.navigate(parkingSpot, {
        preferApp: true
      });
      toast.success('🗺️ Opening directions in Google Maps');
    } catch (error) {
      toast.error('Could not open directions');
    }
  };

  if (!isOpen || !parkingSpot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">🅿️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quick Parking</h2>
              <div className="text-sm text-gray-600">
                Step {step} of 3
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-6">
          {/* Step 1: Booking Details */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Parking Spot Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{parkingSpot.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{parkingSpot.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    Rs. {parkingSpot.hourlyRate}/hour
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {parkingSpot.availableSpaces} spaces available
                  </span>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BA 1 PA 1234"
                    value={bookingData.plateNumber}
                    onChange={(e) => setBookingData(prev => ({ ...prev, plateNumber: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.plateNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.plateNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.plateNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      value={bookingData.vehicleType}
                      onChange={(e) => setBookingData(prev => ({ ...prev, vehicleType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="car">🚗 Car</option>
                      <option value="motorcycle">🏍️ Motorcycle</option>
                      <option value="bicycle">🚲 Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <select
                      value={bookingData.duration}
                      onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={8}>8 hours</option>
                      <option value={24}>24 hours</option>
                    </select>
                  </div>
                </div>

                {/* Simple Location Toggle */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isHereNow"
                      checked={bookingData.isHereNow}
                      onChange={(e) => setBookingData(prev => ({ ...prev, isHereNow: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isHereNow" className="text-sm text-gray-700">
                      <span className="font-medium">I'm here now</span>
                      <span className="text-gray-500 block">
                        {bookingData.isHereNow ? 'Parking starts in 2 minutes' : 'Parking starts in 15 minutes'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue to Confirmation
              </button>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Booking</h3>
                <p className="text-gray-600">Please review the details before confirming</p>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-right">{parkingSpot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{bookingData.plateNumber.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">Rs. {parkingSpot.hourlyRate}/hour</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-green-600">Rs. {calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBookingSubmit}
                  disabled={isProcessing}
                  className="flex-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success & QR Code */}
          {step === 3 && bookingConfirmed && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">Your parking spot is reserved. Navigate to the location.</p>
              
              {/* QR Code */}
              <div className="bg-gray-100 rounded-xl p-6">
                <div className="text-2xl font-mono text-gray-800 mb-2">{bookingConfirmed.qrCode}</div>
                <p className="text-sm text-gray-600">Show this code at parking</p>
              </div>

              {/* Booking Details */}
              <div className="text-left bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono">{bookingConfirmed.bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{bookingConfirmed.vehicleInfo.plateNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-bold text-green-600">Rs. {bookingConfirmed.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGetDirections}
                  className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🗺️</span>
                  <span>Get Directions</span>
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedBookingFlow;