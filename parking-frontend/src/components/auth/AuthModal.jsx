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
      {/* Premium Backdrop */}
      <div 
        className={`absolute inset-0 bg-gradient-primary/80 backdrop-blur-md transition-all duration-700 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-600/10"></div>
      </div>
      
      {/* Premium Modal Container */}
      <div className="relative h-full flex items-center justify-center p-6">
        <div 
          className={`card-premium w-full max-w-lg max-h-[95vh] shadow-2xl transition-all duration-700 ease-out transform ${
            isOpen 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'
          } overflow-y-auto border border-yellow-200/30`}
        >
          {/* Premium Header */}
          <div className="bg-gradient-hero text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                  {activeTab === 'login' ? (
                    <>Welcome <span className="text-gradient-golden">Back!</span></>
                  ) : (
                    <>Join <span className="text-gradient-golden">ParkSmart!</span></>
                  )}
                </h3>
                <p className="text-white/90 text-base font-medium">
                  {activeTab === 'login' 
                    ? '🚀 Access your premium parking dashboard' 
                    : '✨ Create your account for luxury parking solutions'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="glass-dark text-yellow-300 hover:text-yellow-200 hover:bg-white/20 p-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Premium Tab Navigation */}
          <div className="glass-dark px-8 py-6 border-b border-gray-200/30">
            <div className="flex rounded-2xl glass p-2">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all duration-500 relative overflow-hidden ${
                  activeTab === 'login'
                    ? 'bg-gradient-primary text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="relative z-10">🔐 Sign In</span>
                {activeTab === 'login' && (
                  <div className="absolute inset-0 bg-gradient-subtle opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all duration-500 relative overflow-hidden ${
                  activeTab === 'register'
                    ? 'bg-gradient-primary text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="relative z-10">✨ Sign Up</span>
                {activeTab === 'register' && (
                  <div className="absolute inset-0 bg-gradient-subtle opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </div>
          
          {/* Premium Form Content */}
          <div className="p-8">
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
          
          {/* Premium Footer */}
          <div className="glass-dark px-8 py-6 border-t border-gray-200/30">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">
                🛡️ Your data is protected with enterprise-grade security
              </p>
              <p className="text-xs text-gray-500">
                By continuing, you agree to ParkSmart's <span className="text-yellow-600 font-semibold">Terms of Service</span> and <span className="text-yellow-600 font-semibold">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;