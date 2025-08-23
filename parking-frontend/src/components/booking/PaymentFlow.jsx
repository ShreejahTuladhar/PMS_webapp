import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../hooks/useBooking';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import ESewaPayment from '../payment/ESewaPayment';
import TimeSlotPicker from './TimeSlotPicker';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PaymentFlow = ({ isOpen, onClose, parkingSpot }) => {
  const { user } = useAuth();
  const { startBooking, confirmBooking } = useBooking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    duration: 3,
    vehicleType: 'motorcycle',
    paymentMethod: 'cash',
    plateNumber: '',
    spaceId: 'A001',
    selectedVehicleId: '',
    customerInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    }
  });
  
  const [userVehicles, setUserVehicles] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phoneNumber || ''
        }
      }));
      
      // Fetch user vehicles
      fetchUserVehicles();
    }
  }, [user]);
  
  const fetchUserVehicles = async () => {
    try {
      const response = await api.get('/users/vehicles');
      if (response.data.success) {
        const vehicles = response.data.vehicles || [];
        setUserVehicles(vehicles);
        
        // Auto-select default vehicle
        const defaultVehicle = vehicles.find(v => v.isDefault);
        if (defaultVehicle) {
          setFormData(prev => ({
            ...prev,
            selectedVehicleId: defaultVehicle.id,
            plateNumber: defaultVehicle.plateNumber,
            vehicleType: defaultVehicle.vehicleType
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Demo vehicles
      const demoVehicles = [
        {
          id: '1',
          plateNumber: 'BA 1 PA 3014',
          vehicleType: 'car',
          make: 'Toyota',
          model: 'Corolla',
          isDefault: true
        },
        {
          id: '2',
          plateNumber: 'BA 2 CHA 5678',
          vehicleType: 'motorcycle',
          make: 'Honda',
          model: 'CB 150R',
          isDefault: false
        }
      ];
      setUserVehicles(demoVehicles);
      
      // Auto-select default vehicle
      const defaultVehicle = demoVehicles.find(v => v.isDefault);
      if (defaultVehicle) {
        setFormData(prev => ({
          ...prev,
          selectedVehicleId: defaultVehicle.id,
          plateNumber: defaultVehicle.plateNumber,
          vehicleType: defaultVehicle.vehicleType
        }));
      }
    }
  };
  
  const handleVehicleSelection = (vehicleId) => {
    const selectedVehicle = userVehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        selectedVehicleId: vehicleId,
        plateNumber: selectedVehicle.plateNumber,
        vehicleType: selectedVehicle.vehicleType
      }));
    } else {
      // Manual entry
      setFormData(prev => ({
        ...prev,
        selectedVehicleId: '',
        plateNumber: '',
        vehicleType: 'car'
      }));
    }
  };

  if (!isOpen || !parkingSpot) return null;

  const hourlyRate = parkingSpot.vehicleTypes?.[formData.vehicleType] || parkingSpot.hourlyRate || 50;
  const totalCost = hourlyRate * formData.duration;

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.plateNumber.trim()) {
          newErrors.plateNumber = 'Vehicle plate number is required';
        } else if (formData.plateNumber.length < 2 || formData.plateNumber.length > 15) {
          newErrors.plateNumber = 'Plate number must be between 2 and 15 characters';
        }
        break;
        
      case 2:
        if (!selectedTimeSlot) {
          newErrors.timeSlot = 'Please select a time slot';
          toast.error('Please select a time slot to continue');
        }
        break;
        
      case 3:
        if (!formData.customerInfo.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.customerInfo.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.customerInfo.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.customerInfo.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.customerInfo.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field.split('.').pop()];
      return newErrors;
    });
  };

  const processPayment = async (paymentData = null) => {
    setIsProcessing(true);
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      const endTime = new Date(startTime.getTime() + formData.duration * 60 * 60000);
      
      // Ensure we have required fields
      if (!formData.plateNumber || !formData.plateNumber.trim()) {
        throw new Error('Vehicle plate number is required');
      }
      
      // Extract valid locationId
      const locationId = parkingSpot._id || parkingSpot.id;
      if (!locationId) {
        throw new Error('Invalid parking location - missing ID');
      }
      
      // Use selected time slot if available
      let actualStartTime = startTime;
      let actualEndTime = endTime;
      let actualSpaceId = formData.spaceId;
      
      if (selectedTimeSlot) {
        actualStartTime = new Date(selectedTimeSlot.startDateTime);
        actualEndTime = new Date(selectedTimeSlot.endDateTime);
        actualSpaceId = selectedTimeSlot.spaceId;
      }
      
      const bookingData = {
        locationId: locationId,
        spaceId: actualSpaceId,
        vehicleInfo: {
          plateNumber: formData.plateNumber.trim(),
          vehicleType: formData.vehicleType
        },
        startTime: actualStartTime.toISOString(),
        endTime: actualEndTime.toISOString(),
        paymentMethod: formData.paymentMethod,
        notes: `ParkSathi booking for ${formData.duration} hour${formData.duration > 1 ? 's' : ''}`
      };
      
      console.log('🔍 Booking data being sent:', bookingData);
      
      const response = await api.post('/bookings', bookingData);
      
      if (response.data.success) {
        setPaymentResult({
          success: true,
          bookingId: response.data.booking?.id,
          transactionId: paymentData?.id || `CASH-${Date.now()}`,
          amount: totalCost
        });
        
        toast.success('Booking confirmed successfully!');
        startBooking(parkingSpot, formData.duration, formData.vehicleType);
        
        // Pass booking details to confirmation
        const bookingDetails = {
          plateNumber: formData.plateNumber,
          spaceId: formData.spaceId,
          customerInfo: formData.customerInfo
        };
        
        setCurrentStep(5); // Move to confirmation step
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Handle specific backend validation errors
      let errorMessage = error.message || 'Payment failed. Please try again.';
      
      if (error.message && error.message.includes('amenities')) {
        errorMessage = 'There was an issue with the parking location data. Please try a different parking spot or contact support.';
        console.error('Backend data validation error - amenities enum issue:', error.message);
      } else if (error.message && error.message.includes('validation failed')) {
        errorMessage = 'Invalid parking location data. Please try again or contact support.';
      }
      
      toast.error(errorMessage);
      setPaymentResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = (details, data) => {
    console.log('PayPal payment successful:', details);
    processPayment({
      id: details.id,
      status: details.status,
      payer: details.payer,
      amount: details.purchase_units[0].amount
    });
  };

  const handlePayPalError = (err) => {
    console.error('PayPal payment error:', err);
    toast.error('PayPal payment failed. Please try again.');
  };

  const handleCashPayment = () => {
    processPayment({
      id: `CASH-${Date.now()}`,
      status: 'COMPLETED',
      method: 'cash'
    });
  };


  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
        
        {/* Parking Spot Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">{parkingSpot.name}</h4>
          <p className="text-gray-600 text-sm mb-2">{parkingSpot.location?.address || parkingSpot.address}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Available Spaces:</span>
            <span className="font-medium text-green-600">{parkingSpot.capacity || parkingSpot.availability} spaces</span>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vehicle
          </label>
          
          {userVehicles.length > 0 ? (
            <div className="space-y-3">
              {/* Registered Vehicles */}
              <div className="space-y-2">
                {userVehicles.map(vehicle => (
                  <label key={vehicle.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="vehicleSelection"
                      value={vehicle.id}
                      checked={formData.selectedVehicleId === vehicle.id}
                      onChange={(e) => handleVehicleSelection(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{vehicle.plateNumber}</span>
                        <span className="text-sm text-gray-500 capitalize">({vehicle.vehicleType})</span>
                        {vehicle.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Manual Entry Option */}
              <label className="flex items-center p-3 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="vehicleSelection"
                  value=""
                  checked={formData.selectedVehicleId === ''}
                  onChange={(e) => handleVehicleSelection(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-blue-600">+ Add new vehicle manually</span>
                  <p className="text-sm text-gray-600">Enter vehicle details below</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No saved vehicles found. Please enter details below.</p>
            </div>
          )}
        </div>
        
        {/* Manual Vehicle Entry (when no vehicle selected or manual entry chosen) */}
        {(userVehicles.length === 0 || formData.selectedVehicleId === '') && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800">Vehicle Details</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => updateFormData('vehicleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="motorcycle">Motorcycle - Rs. 11/hr</option>
                <option value="car">Car - Rs. 25/hr</option>
                <option value="truck">Truck - Rs. 50/hr</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Plate Number *
              </label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => updateFormData('plateNumber', e.target.value.toUpperCase())}
                placeholder="e.g., BA 1 PA 3014"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.plateNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={15}
              />
              {errors.plateNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (hours)
          </label>
          <select
            value={formData.duration}
            onChange={(e) => updateFormData('duration', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hours => (
              <option key={hours} value={hours}>
                {hours} {hours === 1 ? 'hour' : 'hours'}
              </option>
            ))}
          </select>
        </div>


        {/* Parking Space */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parking Space *
          </label>
          <select
            value={formData.spaceId}
            onChange={(e) => updateFormData('spaceId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {['A001', 'A002', 'A003', 'B001', 'B002', 'B003', 'C001', 'C002'].map(space => (
              <option key={space} value={space}>
                Space {space}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Rate per hour:</span>
            <span className="font-medium">Rs. {hourlyRate}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{formData.duration} {formData.duration === 1 ? 'hour' : 'hours'}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <span className="font-semibold text-gray-800">Total Cost:</span>
            <span className="font-bold text-blue-600 text-xl">Rs. {totalCost}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.customerInfo.firstName}
              onChange={(e) => updateFormData('customerInfo.firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.customerInfo.lastName}
              onChange={(e) => updateFormData('customerInfo.lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.customerInfo.email}
            onChange={(e) => updateFormData('customerInfo.email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.customerInfo.phone}
            onChange={(e) => updateFormData('customerInfo.phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-2">Booking Summary</h5>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Vehicle:</span>
              <span>{formData.plateNumber} ({formData.vehicleType})</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{formData.duration} hours</span>
            </div>
            <div className="flex justify-between">
              <span>Space:</span>
              <span>{formData.spaceId}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>Rs. {totalCost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        
        {/* Payment Method Selection */}
        <div className="space-y-3 mb-6">
          {[
            { value: 'paypal', label: 'PayPal', subtitle: 'Pay with PayPal (Credit/Debit Cards accepted)' },
            { value: 'esewa', label: 'eSewa', subtitle: 'Digital wallet payment in Nepal' },
            { value: 'cash', label: 'Cash', subtitle: 'Pay in cash at the location' }
          ].map(method => (
            <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={formData.paymentMethod === method.value}
                onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                className="mr-3 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">{method.label}</div>
                <div className="text-sm text-gray-500">{method.subtitle}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Payment Processing */}
        {formData.paymentMethod === 'paypal' && (
          <div className="border rounded-lg p-4">
            <PayPalScriptProvider options={{
              "client-id": "test", // Replace with your PayPal client ID
              currency: "USD"
            }}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        value: (totalCost / 100).toFixed(2) // Convert NPR to USD approximation
                      }
                    }]
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then(handlePayPalSuccess);
                }}
                onError={handlePayPalError}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {formData.paymentMethod === 'esewa' && (
          <div className="border rounded-lg">
            <ESewaPayment
              amount={totalCost}
              onSuccess={(paymentData) => {
                console.log('eSewa payment successful:', paymentData);
                processPayment(paymentData);
              }}
              onError={(error) => {
                console.error('eSewa payment error:', error);
                toast.error(error);
              }}
              onCancel={() => {
                updateFormData('paymentMethod', 'cash');
                toast.info('Payment cancelled. You can select another payment method.');
              }}
            />
          </div>
        )}

        {formData.paymentMethod === 'cash' && (
          <div className="border rounded-lg p-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Cash Payment</h4>
              <p className="text-sm text-gray-600">Pay Rs. {totalCost} in cash at the parking location</p>
            </div>
            <button
              onClick={handleCashPayment}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Confirm Cash Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="mb-6">
        {paymentResult?.success ? (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {paymentResult?.success ? 'Booking Confirmed!' : 'Booking Failed'}
        </h3>
        
        {paymentResult?.success ? (
          <div className="space-y-4">
            <p className="text-gray-600">Your parking spot has been reserved successfully.</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono">{paymentResult.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{paymentResult.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">Rs. {paymentResult.amount}</span>
                </div>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🎯 What's Next?</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>✅ 1. Generate your QR parking ticket</p>
                <p>📱 2. Show QR code at parking entrance</p>
                <p>🚗 3. Start navigation to parking location</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  try {
                    // Prepare the confirmed booking data to trigger the park journey
                    const paymentDetails = {
                      paymentId: paymentResult.transactionId,
                      amount: totalCost,
                      method: formData.paymentMethod,
                      status: 'completed'
                    };
                    
                    // Ensure parkingSpot has coordinates for navigation
                    const parkingSpotWithCoordinates = {
                      ...parkingSpot,
                      coordinates: {
                        lat: parkingSpot.coordinates?.lat || parkingSpot.lat || 27.7172,
                        lng: parkingSpot.coordinates?.lng || parkingSpot.lng || 85.3240
                      },
                      address: parkingSpot.address || parkingSpot.location?.address || 'Unknown Address'
                    };
                    
                    const bookingData = {
                      plateNumber: formData.plateNumber,
                      spaceId: formData.spaceId,
                      customerInfo: formData.customerInfo,
                      duration: formData.duration,
                      vehicleType: formData.vehicleType,
                      timeSlot: selectedTimeSlot,
                      bookingId: paymentResult.bookingId
                    };
                    
                    // Start booking first (if not already started)
                    startBooking(parkingSpotWithCoordinates, formData.duration, formData.vehicleType);
                    
                    // Then confirm booking to trigger park journey
                    setTimeout(() => {
                      confirmBooking(paymentDetails, bookingData);
                      toast.success('🎫 Starting your park journey with ticket generation...');
                      onClose();
                    }, 100);
                    
                  } catch (error) {
                    console.error('Error starting park journey:', error);
                    toast.error('Failed to start park journey. Please try again.');
                  }
                }}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-1.53-6.36l.74-.74m0 0l.73.73m-.73-.73h.01m-.01 0v.01M12 8h.01M8 12h.01m.72 3.83l.74.74m-.74-.74l.73-.73m-.73.73h.01m-.01 0v-.01" />
                </svg>
                <span>🎫 Start Park Journey & Generate Ticket</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close & Park Later
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-600">{paymentResult?.error || 'Something went wrong with your booking.'}</p>
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const stepTitles = {
    1: 'Booking Details',
    2: 'Time Slot Selection',
    3: 'Customer Information', 
    4: 'Payment',
    5: 'Confirmation'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Book Parking Spot</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 5: {stepTitles[currentStep]}</p>
          </div>
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

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep ? 'bg-blue-600 text-white' :
                  step < currentStep ? 'bg-green-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot(null); // Reset time slot when date changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <TimeSlotPicker
                  parkingSpot={parkingSpot}
                  selectedDate={selectedDate}
                  selectedDuration={formData.duration}
                  selectedVehicleType={formData.vehicleType}
                  onTimeSlotSelected={setSelectedTimeSlot}
                />
              </div>
            </div>
          )}
          {currentStep === 3 && renderStep2()}
          {currentStep === 4 && renderStep3()}
          {currentStep === 5 && renderStep4()}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="px-6 pb-6">
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;