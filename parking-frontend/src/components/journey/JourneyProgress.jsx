import React from 'react';

const JourneyProgress = ({ 
  currentStep, 
  userLocation, 
  destination, 
  journeyStartTime, 
  estimatedArrival 
}) => {
  
  const steps = [
    { 
      id: 'ticket_generation', 
      label: 'Ticket', 
      icon: '🎫',
      description: 'Generate parking ticket'
    },
    { 
      id: 'qr_code_display', 
      label: 'QR Code', 
      icon: '📱',
      description: 'Create check-in QR code'
    },
    { 
      id: 'gps_lock', 
      label: 'GPS Lock', 
      icon: '📍',
      description: 'Lock GPS position'
    },
    { 
      id: 'navigation_start', 
      label: 'Navigate', 
      icon: '🧭',
      description: 'Start navigation'
    },
    { 
      id: 'in_transit', 
      label: 'Journey', 
      icon: '🚗',
      description: 'Drive to destination'
    },
    { 
      id: 'arrived', 
      label: 'Arrived', 
      icon: '🏁',
      description: 'Check in at location'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getStepStatus = (stepIndex) => {
    const currentIndex = getCurrentStepIndex();
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
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

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getJourneyDuration = () => {
    if (!journeyStartTime) return null;
    
    const now = new Date();
    const diffMs = now - journeyStartTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Step Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-green-100 text-green-600 border-2 border-green-500' 
                    : status === 'active'
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-500 animate-pulse'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                  }
                `}>
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    status === 'active' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.max(0, (getCurrentStepIndex() / (steps.length - 1)) * 100)}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Journey Information */}
      {userLocation && destination && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Distance Information */}
            <div className="text-center">
              <p className="text-gray-500 mb-1">Distance</p>
              <p className="font-semibold text-gray-800">
                {calculateDistance(
                  userLocation.lat, 
                  userLocation.lng,
                  destination.lat, 
                  destination.lng
                ).toFixed(1)} km
              </p>
            </div>
            
            {/* Time Information */}
            <div className="text-center">
              <p className="text-gray-500 mb-1">
                {journeyStartTime ? 'Duration' : 'Est. Time'}
              </p>
              <p className="font-semibold text-gray-800">
                {journeyStartTime ? getJourneyDuration() : 
                 estimatedArrival ? formatTime(estimatedArrival) : 'Calculating...'}
              </p>
            </div>
          </div>
          
          {/* Additional Journey Info */}
          {(journeyStartTime || estimatedArrival) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                {journeyStartTime && (
                  <span>Started: {formatTime(journeyStartTime)}</span>
                )}
                {estimatedArrival && (
                  <span>ETA: {formatTime(estimatedArrival)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Step Description */}
      {currentStep && (
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              {steps.find(step => step.id === currentStep)?.description || 'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Journey Status */}
      {currentStep === 'in_transit' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-medium">Journey in progress</span>
          </div>
        </div>
      )}
      
      {currentStep === 'arrived' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">🎉</span>
            <span className="text-yellow-700 text-sm font-medium">You have arrived! Show your QR code to check in.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyProgress;