import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function EntryExit({ mode, vehicleData, ticketData, onComplete, onBack }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [processStep, setProcessStep] = useState('ready'); // ready, processing, success
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const isEntry = mode === 'entry';
  const currentTime = new Date();
  
  const ticketId = generatedTicket?.id || `PKG-${Date.now()}`;
  const qrData = generatedTicket ? JSON.stringify({
    ticketId: generatedTicket.id,
    vehiclePlate: vehicleData.licensePlate,
    entryTime: generatedTicket.entryTime,
    location: generatedTicket.location,
    userId: 'user123' // Should come from auth context
  }) : '';

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessStep('processing');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isEntry) {
      // Generate ticket for entry
      const ticket = {
        id: ticketId,
        vehiclePlate: vehicleData.licensePlate,
        vehicleInfo: vehicleData,
        entryTime: currentTime.toISOString(),
        location: {
          name: 'Downtown Parking Plaza',
          address: '123 Main Street, Kathmandu',
          spaceNumber: `A${Math.floor(Math.random() * 50) + 1}`,
          level: Math.floor(Math.random() * 3) + 1
        },
        pricing: {
          hourlyRate: 150, // NPR per hour
          dailyRate: 1200,
          currency: 'NPR'
        },
        status: 'active',
        qrCode: qrData
      };
      setGeneratedTicket(ticket);
      
      // Simulate successful entry
      setTimeout(() => {
        setProcessStep('success');
        setIsProcessing(false);
        setIsSuccess(true);
      }, 1000);
      
    } else {
      // Process exit
      setTimeout(() => {
        setProcessStep('success');
        setIsProcessing(false);
        setIsSuccess(true);
      }, 1000);
    }
  };

  const handleComplete = () => {
    onComplete(isEntry ? generatedTicket : { exitTime: currentTime.toISOString(), ...ticketData });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white/95 rounded-3xl shadow-2xl border border-blue-200 overflow-hidden relative">
        {/* Magical background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-100 to-blue-100 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '1.5s'}}></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 relative">
          <div className="text-center relative z-10">
            <div className="text-5xl mb-4">{isEntry ? '' : ''}</div>
            <h2 className="text-3xl font-bold mb-2">
              {isEntry ? 'Park Entry' : 'Exit Process'}
            </h2>
            <p className="text-blue-100">
              {isEntry 
                ? 'Generating your digital parking ticket...' 
                : 'Processing payment and exit authorization...'
              }
            </p>
          </div>
        </div>

        <div className="p-8 relative z-10">
          {/* Ready State */}
          {processStep === 'ready' && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  {isEntry ? 'Ready to Enter?' : 'Ready to Exit?'}
                </h3>
                
                {/* Vehicle Summary */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-3xl">
                      {vehicleData.type === 'car' ? '' : 
                       vehicleData.type === 'motorcycle' ? '' : 
                       vehicleData.type === 'suv' ? '' : ''}
                    </span>
                    <div className="text-center">
                      <div className="font-bold text-xl text-gray-700">
                        {vehicleData.licensePlate}
                      </div>
                      <div className="text-gray-600">
                        {vehicleData.year} {vehicleData.make} {vehicleData.model}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {vehicleData.color} {vehicleData.type}
                      </div>
                    </div>
                  </div>
                </div>

                {isEntry && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Space available at Downtown Plaza</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Hourly rate: NPR 150/hour</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Digital ticket with QR code</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleProcess}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isEntry ? ' Generate Ticket & Enter' : ' Process Payment & Exit'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

          {/* Processing State */}
          {processStep === 'processing' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{isEntry ? '' : '⚡'}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {isEntry ? 'Generating Your Digital Ticket...' : 'Processing Exit...'}
                </h3>
                <p className="text-gray-600">
                  {isEntry 
                    ? 'Creating QR code and assigning parking space...'
                    : 'Calculating charges and processing payment...'
                  }
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            </div>
          )}

          {/* Success State - Entry */}
          {processStep === 'success' && isEntry && generatedTicket && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4"></div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Welcome! You're All Set!
                </h3>
                <p className="text-gray-600">
                  Your digital parking ticket is ready. Save this to your phone!
                </p>
              </div>

              {/* Digital Ticket Preview */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm opacity-80">PARKING TICKET</div>
                      <div className="text-2xl font-bold">{generatedTicket.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">SPACE</div>
                      <div className="text-xl font-bold">
                        {generatedTicket.location.spaceNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="bg-white p-4 rounded-xl inline-block">
                      <QRCodeSVG 
                        value={qrData} 
                        size={120}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-sm mt-2 opacity-80">
                      Scan this QR code at exit
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="opacity-80">Vehicle</div>
                      <div className="font-semibold">{vehicleData.licensePlate}</div>
                    </div>
                    <div>
                      <div className="opacity-80">Entry Time</div>
                      <div className="font-semibold">
                        {new Date(generatedTicket.entryTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div className="opacity-80">Rate</div>
                      <div className="font-semibold">NPR {generatedTicket.pricing.hourlyRate}/hr</div>
                    </div>
                    <div>
                      <div className="opacity-80">Level</div>
                      <div className="font-semibold">Level {generatedTicket.location.level}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                 Continue to Parking
              </button>
            </div>
          )}

          {/* Success State - Exit */}
          {processStep === 'success' && !isEntry && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                Thank You for Parking with Us!
              </h3>
              <p className="text-gray-600">
                Payment processed successfully. Safe travels!
              </p>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="text-green-700 font-semibold mb-2">
                  Payment Summary
                </div>
                <div className="text-2xl font-bold text-green-600">
                  NPR 450.00 PAID
                </div>
                <div className="text-sm text-green-600 mt-2">
                  Parked for 3 hours • Receipt sent to email
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                 Return Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EntryExit;