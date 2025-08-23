import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeGenerator from './QRCodeGenerator';
import GPSTracker from './GPSTracker';
import JourneyProgress from './JourneyProgress';
import ParkingTicket from './ParkingTicket';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const JourneySteps = {
  TICKET_GENERATION: 'ticket_generation',
  QR_CODE_DISPLAY: 'qr_code_display', 
  GPS_LOCK: 'gps_lock',
  NAVIGATION_START: 'navigation_start',
  IN_TRANSIT: 'in_transit',
  ARRIVED: 'arrived'
};

const ParkingJourney = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentBooking, navigationData, bookingStep } = useBooking();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(JourneySteps.TICKET_GENERATION);
  const [userLocation, setUserLocation] = useState(null);
  const [isGPSLocked, setIsGPSLocked] = useState(false);
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  // Debug logging
  console.log('🎦 ParkingJourney render:', {
    isOpen,
    currentBooking: !!currentBooking,
    bookingStep,
    navigationData: !!navigationData,
    currentStep
  });

  // Auto-advance through initial steps
  useEffect(() => {
    if (isOpen && currentBooking && bookingStep === 'confirmed' && navigationData) {
      if (currentStep === JourneySteps.TICKET_GENERATION && !ticketGenerated) {
        // Auto-generate ticket after 2 seconds
        const timer = setTimeout(() => {
          setTicketGenerated(true);
          setCurrentStep(JourneySteps.QR_CODE_DISPLAY);
          toast.success('🎫 Parking ticket generated successfully!');
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, ticketGenerated, isOpen, currentBooking, bookingStep, navigationData]);
  
  // Only show if booking is confirmed and we have navigation data
  if (!isOpen || !currentBooking || bookingStep !== 'confirmed' || !navigationData) {
    return null;
  }

  const parkingSpot = currentBooking.parkingSpot;

  const handleQRCodeGenerated = () => {
    setQrCodeGenerated(true);
    setCurrentStep(JourneySteps.GPS_LOCK);
    toast.success('🔲 QR Code ready for check-in!');
  };

  const handleGPSLocked = (location) => {
    setUserLocation(location);
    setIsGPSLocked(true);
    setCurrentStep(JourneySteps.NAVIGATION_START);
    toast.success('📍 GPS location locked successfully!');
  };

  const handleStartNavigation = () => {
    setJourneyStartTime(new Date());
    setCurrentStep(JourneySteps.IN_TRANSIT);
    
    // Calculate estimated arrival (assuming 30km/h average speed in city)
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng,
      navigationData.destination.lat,
      navigationData.destination.lng
    );
    
    const estimatedMinutes = Math.round((distance / 30) * 60); // Convert to minutes
    const arrival = new Date(Date.now() + estimatedMinutes * 60000);
    setEstimatedArrival(arrival);
    
    toast.success('🧭 Navigation started - Safe journey!');
    
    // Navigate to full-screen navigation after 1 second
    setTimeout(() => {
      try {
        navigate('/navigation/fullscreen', {
          state: {
            destination: navigationData.destination,
            bookingId: currentBooking.bookingId,
            startLocation: userLocation,
            journeyStartTime: new Date()
          }
        });
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Navigation failed. Please try again.');
      }
    }, 1000);
  };

  const handleCloseJourney = () => {
    onClose();
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case JourneySteps.TICKET_GENERATION:
        return 'Generating Your Parking Ticket';
      case JourneySteps.QR_CODE_DISPLAY:
        return 'Your Check-in QR Code';
      case JourneySteps.GPS_LOCK:
        return 'Locking GPS Location';
      case JourneySteps.NAVIGATION_START:
        return 'Ready to Start Journey';
      case JourneySteps.IN_TRANSIT:
        return 'Journey in Progress';
      case JourneySteps.ARRIVED:
        return 'You Have Arrived!';
      default:
        return 'Parking Journey';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case JourneySteps.TICKET_GENERATION:
        return 'Please wait while we prepare your digital parking ticket...';
      case JourneySteps.QR_CODE_DISPLAY:
        return 'Save this QR code to your phone for easy check-in at the parking location.';
      case JourneySteps.GPS_LOCK:
        return 'We need to lock your GPS location to provide accurate navigation.';
      case JourneySteps.NAVIGATION_START:
        return 'Everything is ready! Start your journey to the parking location.';
      case JourneySteps.IN_TRANSIT:
        return 'Follow the navigation instructions to reach your destination safely.';
      case JourneySteps.ARRIVED:
        return 'Welcome to your destination! Show your QR code to check in.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 z-[9999]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">{getStepTitle()}</h2>
              <p className="text-blue-100 text-sm">{getStepDescription()}</p>
            </div>
            <button
              onClick={handleCloseJourney}
              className="text-blue-200 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="p-6 border-b border-gray-200">
          <JourneyProgress 
            currentStep={currentStep}
            userLocation={userLocation}
            destination={navigationData.destination}
            journeyStartTime={journeyStartTime}
            estimatedArrival={estimatedArrival}
          />
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{parkingSpot.name}</h3>
                <p className="text-sm text-gray-600">{parkingSpot.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-semibold">{currentBooking.duration}h</p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="font-semibold capitalize">{currentBooking.vehicleType}</p>
              </div>
              <div>
                <p className="text-gray-500">Cost</p>
                <p className="font-semibold text-green-600">Rs. {currentBooking.totalCost}</p>
              </div>
            </div>
          </div>

          {/* Step-specific Content */}
          {currentStep === JourneySteps.TICKET_GENERATION && (
            <div className="text-center">
              <ParkingTicket 
                booking={currentBooking}
                onGenerated={() => setTicketGenerated(true)}
              />
            </div>
          )}

          {currentStep === JourneySteps.QR_CODE_DISPLAY && (
            <div className="text-center">
              <QRCodeGenerator 
                bookingId={currentBooking.bookingId}
                qrData={currentBooking.qrCode}
                onGenerated={handleQRCodeGenerated}
              />
            </div>
          )}

          {currentStep === JourneySteps.GPS_LOCK && (
            <div className="text-center">
              <GPSTracker 
                onLocationLocked={handleGPSLocked}
                destination={navigationData.destination}
              />
            </div>
          )}

          {currentStep === JourneySteps.NAVIGATION_START && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-green-800 mb-2">All Set! Ready to Go</h3>
                <p className="text-green-700 text-sm mb-4">
                  Your GPS is locked and QR code is ready. Time to start your journey!
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Distance to destination:</span>
                    <span className="font-medium">
                      {userLocation ? calculateDistance(
                        userLocation.lat, userLocation.lng,
                        navigationData.destination.lat, navigationData.destination.lng
                      ).toFixed(1) : '...'} km
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleStartNavigation}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
                  </svg>
                  <span>Start Navigation</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === JourneySteps.IN_TRANSIT && (
            <div className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Journey in Progress</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Follow the navigation to reach your parking destination safely.
                </p>
                
                {estimatedArrival && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Estimated arrival:</p>
                    <p className="font-semibold text-blue-600">
                      {estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Navigation will continue in full-screen mode
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Booking ID: {currentBooking.bookingId}</span>
            </div>
            
            {user && (
              <span>Welcome, {user.firstName}!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingJourney;