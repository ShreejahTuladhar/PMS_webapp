import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../hooks/useBooking';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import ESewaPayment from '../payment/ESewaPayment';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PaymentFlow = ({ isOpen, onClose, parkingSpot }) => {
  const { user } = useAuth();
  const { startBooking } = useBooking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    duration: 3,
    vehicleType: 'motorcycle',
    paymentMethod: 'cash',
    plateNumber: '',
    spaceId: 'A001',
    customerInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    }
  });
  
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
    }
  }, [user]);

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
      setCurrentStep(prev => Math.min(prev + 1, 3));
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
      
      const bookingData = {
        locationId: parkingSpot.id || parkingSpot._id,
        spaceId: formData.spaceId,
        vehicleInfo: {
          plateNumber: formData.plateNumber.trim(),
          vehicleType: formData.vehicleType
        },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        paymentMethod: formData.paymentMethod,
        totalAmount: totalCost,
        customerInfo: formData.customerInfo,
        paymentData: paymentData,
        notes: `ParkSathi booking for ${formData.duration} hour${formData.duration > 1 ? 's' : ''}`
      };
      
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
        setCurrentStep(4); // Move to confirmation step
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setPaymentResult({
        success: false,
        error: error.message
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

        {/* Vehicle Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Vehicle Plate Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div className="space-y-2">
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
          </div>
        ) : (
          <p className="text-red-600">{paymentResult?.error || 'Something went wrong with your booking.'}</p>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  );

  const stepTitles = {
    1: 'Booking Details',
    2: 'Customer Information', 
    3: 'Payment',
    4: 'Confirmation'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Book Parking Spot</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 4: {stepTitles[currentStep]}</p>
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
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep ? 'bg-blue-600 text-white' :
                  step < currentStep ? 'bg-green-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
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
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        {currentStep < 4 && (
          <div className="px-6 pb-6">
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {currentStep < 3 && (
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