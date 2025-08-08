import { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isOpen) return null;

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-700 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-700 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container - Centered */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div 
          className={`bg-white shadow-2xl w-full max-w-lg max-h-[95vh] rounded-2xl transition-all duration-700 ease-out transform ${
            isOpen 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'
          } overflow-y-auto`}
        >
          {/* Header with enhanced styling */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {activeTab === 'login' ? 'Welcome Back!' : 'Join ParkSmart!'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {activeTab === 'login' 
                    ? 'Sign in to access your parking dashboard' 
                    : 'Create your account to start parking smart'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex rounded-lg bg-white p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            <div className={`transition-all duration-500 transform ${
              activeTab === 'login' ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-90'
            }`}>
              {activeTab === 'login' ? (
                <Login onSwitchToRegister={handleSwitchToRegister} onClose={onClose} />
              ) : (
                <Register onSwitchToLogin={handleSwitchToLogin} onClose={onClose} />
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to ParkSmart's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;