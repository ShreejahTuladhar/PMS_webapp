import React, { useState, useEffect } from 'react';

const ParkingTicket = ({ booking, onGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    generateTicket();
  }, [booking]);

  const generateTicket = async () => {
    // Simulate ticket generation process
    const steps = [
      { step: 0, message: 'Validating booking details...' },
      { step: 1, message: 'Generating unique ticket ID...' },
      { step: 2, message: 'Creating security features...' },
      { step: 3, message: 'Finalizing ticket...' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnimationStep(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate ticket data
    const ticket = {
      ticketId: `PKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      issueTime: new Date(),
      validFrom: new Date(),
      validUntil: new Date(Date.now() + booking.duration * 60 * 60 * 1000),
      parkingLocation: booking.parkingSpot.name,
      spaceNumber: booking.spaceId || 'TBD',
      vehicleType: booking.vehicleType,
      plateNumber: booking.plateNumber || 'N/A',
      rate: booking.totalCost / booking.duration,
      totalAmount: booking.totalCost,
      bookingId: booking.bookingId,
      securityCode: Math.random().toString(36).substring(2, 10).toUpperCase()
    };

    setTicketData(ticket);
    setIsGenerating(false);
    
    setTimeout(() => {
      onGenerated && onGenerated();
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  if (isGenerating) {
    const steps = [
      'Validating booking details...',
      'Generating unique ticket ID...',
      'Creating security features...',
      'Finalizing ticket...'
    ];

    return (
      <div className="text-center space-y-6">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-sm mx-auto">
          <div className="space-y-4">
            {/* Animated ticket icon */}
            <div className="w-16 h-16 mx-auto">
              <svg 
                className="w-full h-full text-blue-600 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            
            {/* Generation progress */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Generating Parking Ticket</h3>
              
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      index < animationStep ? 'bg-green-500' :
                      index === animationStep ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {index < animationStep ? (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      index <= animationStep ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((animationStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm">
          Please wait while we prepare your digital parking ticket with security features...
        </p>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <div className="text-center space-y-6">
      {/* Success animation */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Digital Parking Ticket */}
      <div className="bg-white border-2 border-blue-600 rounded-lg overflow-hidden max-w-sm mx-auto shadow-lg">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">ParkSathi</h3>
              <p className="text-blue-100 text-sm">Digital Parking Ticket</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">Ticket #</p>
              <p className="font-mono text-sm font-semibold">{ticketData.ticketId}</p>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          {/* Location Info */}
          <div className="text-center border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-800 text-lg">{ticketData.parkingLocation}</h4>
            <p className="text-gray-600 text-sm">{booking.parkingSpot.address}</p>
            <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              Space: {ticketData.spaceNumber}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Type:</span>
              <span className="font-medium capitalize">{ticketData.vehicleType}</span>
            </div>
            
            {ticketData.plateNumber !== 'N/A' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Plate Number:</span>
                <span className="font-mono font-medium">{ticketData.plateNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{formatDuration(booking.duration)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">Rs. {ticketData.rate}/hour</span>
            </div>
            
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-600 font-medium">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">Rs. {ticketData.totalAmount}</span>
            </div>
          </div>

          {/* Validity */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Valid From:</span>
              <span className="font-medium">{formatTime(ticketData.validFrom)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valid Until:</span>
              <span className="font-medium text-red-600">{formatTime(ticketData.validUntil)}</span>
            </div>
          </div>

          {/* Security Code */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Security Code</p>
            <p className="font-mono font-bold text-gray-800 bg-gray-100 py-2 px-4 rounded border-2 border-dashed border-gray-300">
              {ticketData.securityCode}
            </p>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Booking: {ticketData.bookingId}</span>
            <span>{formatTime(ticketData.issueTime)}</span>
          </div>
        </div>

        {/* Perforated edge effect */}
        <div className="h-4 bg-white relative">
          <div className="absolute inset-0 flex justify-center">
            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
          </div>
          <div className="absolute inset-0 flex justify-between px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-100 rounded-full border-2 border-white -mt-1.5"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Information
        </h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Keep this ticket accessible on your phone</li>
          <li>• Present the QR code at entry and exit</li>
          <li>• Note your security code for verification</li>
          <li>• Ticket expires at the specified time</li>
        </ul>
      </div>

      <p className="text-green-600 font-medium text-sm">
        ✅ Parking ticket generated successfully!
      </p>
    </div>
  );
};

export default ParkingTicket;