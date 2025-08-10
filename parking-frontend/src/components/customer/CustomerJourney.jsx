import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VehicleRegistration from './VehicleRegistration';
import DigitalTicket from './DigitalTicket';
import EntryExit from './EntryExit';
import PaymentVerification from './PaymentVerification';
import CustomerSupport from './CustomerSupport';

function CustomerJourney() {
  const { user } = useAuth();
  const [journeyStep, setJourneyStep] = useState('welcome'); // welcome, vehicle, entry, parked, exit, support
  const [customerData, setCustomerData] = useState({
    vehicle: null,
    ticket: null,
    parking: null,
    payment: null
  });

  // Steps: welcome → vehicle → entry → parked → exit
  const steps = [
    { id: 'welcome', name: 'Welcome', icon: '🎯', description: 'Ready to park?' },
    { id: 'vehicle', name: 'Vehicle', icon: '🚗', description: 'Register your vehicle' },
    { id: 'entry', name: 'Entry', icon: '🎫', description: 'Get your digital ticket' },
    { id: 'parked', name: 'Parked', icon: '✨', description: 'Enjoy your stay' },
    { id: 'exit', name: 'Exit', icon: '🚀', description: 'Quick & easy exit' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === journeyStep);
  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Magical Header */}
      <div className="bg-gradient-to-r from-blue-100 via-white to-yellow-100 border-b border-blue-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                  index <= currentStepIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-white border-2 border-blue-200 text-blue-400'
                }`}>
                  <span className="text-lg">{step.icon}</span>
                  {index <= currentStepIndex && (
                    <div className="absolute -inset-1 bg-blue-300/30 rounded-full blur-sm animate-pulse"></div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                    index < currentStepIndex ? 'bg-blue-500' : 'bg-blue-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-1">
              {currentStep.name}
            </h2>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Step */}
        {journeyStep === 'welcome' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/90 rounded-3xl p-12 shadow-xl border border-blue-200 relative overflow-hidden">
              <div className="absolute top-4 right-8 w-24 h-24 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
              
              <div className="text-6xl mb-6">🎯</div>
              <h1 className="text-4xl font-bold text-gray-700 mb-4">
                Welcome to <span className="text-blue-600">Smart Parking</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience magical, hassle-free parking in just a few simple steps. 
                We'll guide you through everything!
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-semibold text-gray-700">Lightning Fast</div>
                  <div className="text-sm text-gray-600">Park in under 30 seconds</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-semibold text-gray-700">Digital First</div>
                  <div className="text-sm text-gray-600">Everything on your phone</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">💡</div>
                  <div className="font-semibold text-gray-700">Smart & Simple</div>
                  <div className="text-sm text-gray-600">Intelligent automation</div>
                </div>
              </div>

              <button
                onClick={() => setJourneyStep('vehicle')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 Start Your Journey
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Registration Step */}
        {journeyStep === 'vehicle' && (
          <VehicleRegistration
            onComplete={(vehicleData) => {
              setCustomerData(prev => ({ ...prev, vehicle: vehicleData }));
              setJourneyStep('entry');
            }}
            onBack={() => setJourneyStep('welcome')}
          />
        )}

        {/* Entry/Digital Ticket Step */}
        {journeyStep === 'entry' && (
          <EntryExit
            mode="entry"
            vehicleData={customerData.vehicle}
            onComplete={(ticketData) => {
              setCustomerData(prev => ({ ...prev, ticket: ticketData }));
              setJourneyStep('parked');
            }}
            onBack={() => setJourneyStep('vehicle')}
          />
        )}

        {/* Parked Step - Show Digital Ticket */}
        {journeyStep === 'parked' && (
          <DigitalTicket
            ticketData={customerData.ticket}
            vehicleData={customerData.vehicle}
            onExit={() => setJourneyStep('exit')}
            onSupport={() => setJourneyStep('support')}
          />
        )}

        {/* Exit Step */}
        {journeyStep === 'exit' && (
          <PaymentVerification
            ticketData={customerData.ticket}
            onComplete={(paymentData) => {
              setCustomerData(prev => ({ ...prev, payment: paymentData }));
              // Redirect to completion or home
            }}
            onBack={() => setJourneyStep('parked')}
          />
        )}

        {/* Support Step */}
        {journeyStep === 'support' && (
          <CustomerSupport
            customerData={customerData}
            onClose={() => setJourneyStep('parked')}
          />
        )}
      </div>

      {/* Floating Support Button */}
      {journeyStep !== 'support' && (
        <button
          onClick={() => setJourneyStep('support')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 z-50"
        >
          <div className="text-xl">💬</div>
        </button>
      )}
    </div>
  );
}

export default CustomerJourney;