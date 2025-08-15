import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';

function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync internal state with defaultTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

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
      {/* Balanced Light Backdrop */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-blue-500/60 via-slate-600/50 to-blue-600/60 backdrop-blur-md transition-all duration-700 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-yellow-100/10 to-blue-200/15"></div>
        {/* Gentle light glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-white to-blue-100 rounded-full blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-yellow-100 to-white rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Premium Modal Container */}
      <div className="relative h-full flex items-center justify-center p-6">
        <div 
          className={`w-full max-w-lg max-h-[95vh] bg-gradient-to-br from-blue-50 via-white to-yellow-50 shadow-2xl transition-all duration-700 ease-out transform ${
            isOpen 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'
          } overflow-y-auto border-2 border-blue-200 rounded-3xl relative`}
        >
          {/* Gentle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/40 to-yellow-200/40 rounded-3xl blur-md opacity-50"></div>
          {/* Balanced Light Header */}
          <div className="bg-gradient-to-r from-blue-200 via-white to-yellow-200 text-gray-700 p-8 relative overflow-hidden rounded-t-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/30"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-white to-blue-50 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight drop-shadow-sm">
                  {activeTab === 'login' ? (
                    <>Welcome <span className="text-blue-600">Back!</span></>
                  ) : (
                    <>Join <span className="text-blue-600">ParkSathi!</span></>
                  )}
                </h3>
                <p className="text-gray-600 text-base font-medium">
                  {activeTab === 'login' 
                    ? 'Access your smart parking dashboard' 
                    : 'Create your account for intelligent parking solutions'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/95 text-blue-600 hover:text-blue-700 hover:bg-white p-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transform hover:scale-105 shadow-md relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-radial from-white via-blue-50 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Bright Form Content */}
          <div className="p-8 bg-white/80 relative z-10">
            <div className={`transition-all duration-700 transform ${
              activeTab === 'login' ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-95'
            }`}>
              {activeTab === 'login' ? (
                <Login onSwitchToRegister={handleSwitchToRegister} onClose={onClose} />
              ) : (
                <Register onSwitchToLogin={handleSwitchToLogin} onClose={onClose} />
              )}
            </div>
          </div>
          
          {/* Bright Footer */}
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 px-8 py-6 border-t border-yellow-200/50 rounded-b-3xl relative z-10">
            <div className="text-center">
              <p className="text-sm text-gray-700 font-bold mb-2">
                  Your data is protected with bright enterprise-grade security
              </p>
              <p className="text-xs text-gray-600 font-medium">
                By continuing, you agree to ParkSathi's <span className="text-orange-600 font-bold">Terms of Service</span> and <span className="text-orange-600 font-bold">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;