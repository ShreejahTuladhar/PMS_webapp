import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function DigitalTicket({ ticketData, vehicleData, onExit, onSupport }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExtending, setIsExtending] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const entryTime = new Date(ticketData.entryTime);
  const parkingDuration = Math.floor((currentTime - entryTime) / (1000 * 60)); // minutes
  const hours = Math.floor(parkingDuration / 60);
  const minutes = parkingDuration % 60;
  
  const currentCost = Math.ceil(parkingDuration / 60) * ticketData.pricing.hourlyRate;

  const qrData = JSON.stringify({
    ticketId: ticketData.id,
    vehiclePlate: vehicleData.licensePlate,
    entryTime: ticketData.entryTime,
    location: ticketData.location.name,
    userId: 'user123'
  });

  const handleExtendParking = async () => {
    setIsExtending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExtending(false);
    // Show success message or update ticket data
  };

  const getStatusColor = () => {
    if (hours < 2) return 'text-green-600';
    if (hours < 4) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getStatusMessage = () => {
    if (hours < 1) return 'Just parked ';
    if (hours < 2) return 'All good ';
    if (hours < 4) return 'Getting longer ';
    return 'Long stay ';
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Main Digital Ticket */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl shadow-2xl overflow-hidden relative mb-6">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl"></div>
        
        {/* Header */}
        <div className="p-6 pb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-80 font-medium">ACTIVE PARKING</div>
              <div className="text-2xl font-bold">{ticketData.id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">SPACE</div>
              <div className="text-2xl font-bold text-yellow-300">
                {ticketData.location.spaceNumber}
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {vehicleData.type === 'car' ? 'CAR' :
                 vehicleData.type === 'motorcycle' ? 'BIKE' :
                 vehicleData.type === 'suv' ? 'SUV' : 'VEHICLE'} 
              </span>
              <div>
                <div className="font-bold text-xl">{vehicleData.licensePlate}</div>
                <div className="text-sm opacity-80">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="px-6 pb-6 relative z-10">
          <div className="text-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
            >
              {showQR ? (
                <QRCodeSVG 
                  value={qrData} 
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <div className="text-4xl text-blue-600"></div>
                </div>
              )}
            </button>
            <div className="text-sm mt-3 opacity-90">
              {showQR ? 'Tap to hide • Show this at exit' : 'Tap to show QR code'}
            </div>
          </div>
        </div>

        {/* Parking Details */}
        <div className="bg-white/5 backdrop-blur-sm p-6 relative z-10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="opacity-80">Entry Time</div>
              <div className="font-semibold text-lg">
                {entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <div className="opacity-80">Duration</div>
              <div className={`font-semibold text-lg ${getStatusColor()}`}>
                {hours}h {minutes}m
              </div>
            </div>
            <div>
              <div className="opacity-80">Current Cost</div>
              <div className="font-semibold text-lg text-yellow-300">
                NPR {currentCost}
              </div>
            </div>
            <div>
              <div className="opacity-80">Status</div>
              <div className="font-semibold">
                {getStatusMessage()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Information Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
           Parking Location
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-semibold text-gray-800">{ticketData.location.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Address</span>
            <span className="font-semibold text-gray-800 text-right">
              {ticketData.location.address}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Level</span>
            <span className="font-semibold text-gray-800">
              Level {ticketData.location.level}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Rate</span>
            <span className="font-semibold text-gray-800">
              NPR {ticketData.pricing.hourlyRate}/hour
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-4 mb-6 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="text-sm font-medium text-gray-700">
            Live Updates Active • Last updated: {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        {hours >= 3 && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-xl border border-yellow-200">
            <div className="text-sm text-yellow-800">
                <strong>Friendly Reminder:</strong> You've been parked for {hours} hours. 
              Consider extending your parking if you need more time!
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Extend Parking */}
        <button
          onClick={handleExtendParking}
          disabled={isExtending}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isExtending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Extending Parking...
              </>
            ) : (
              <>
                 Extend Parking Time
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
             Ready to Exit & Pay
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Support Button */}
        <button
          onClick={onSupport}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
        >
           Need Help? Contact Support
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            Quick Tips
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">•</span>
            <span>Keep this ticket active until you exit the parking area</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">•</span>
            <span>Show the QR code at the exit gate for quick processing</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">•</span>
            <span>Payment will be processed automatically when you exit</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">•</span>
            <span>Contact support anytime if you need assistance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigitalTicket;