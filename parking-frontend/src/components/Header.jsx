import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();

  const handleSignIn = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-blue-200/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-200"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-blue-50/30"></div>
      {/* Gentle light glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/30 to-blue-50/30 animate-pulse"></div>
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center py-4">
          {/* Premium Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Gentle light bulb icon */}
              <div className="p-3 rounded-2xl bg-white/95 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white relative overflow-hidden">
                <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>
                </svg>
                {/* Gentle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/40 to-blue-200/40 rounded-2xl blur-sm opacity-40 group-hover:opacity-70 transition duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-700 tracking-tight drop-shadow-sm">
                Park<span className="text-blue-600">Smart</span>
              </h1>
              <p className="text-xs text-gray-600 font-medium">💡 Warm Parking Solutions</p>
            </div>
          </Link>

          {/* Premium Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group overflow-hidden ${
                isActiveLink('/') 
                  ? 'text-gray-700 bg-white/90 shadow-md border-2 border-blue-300' 
                  : 'text-gray-700 hover:text-gray-800 gentle-glow-hover'
              }`}
            >
              <span className="relative z-10">Home</span>
              {/* Gentle glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-80 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
              {/* Active state glow */}
              {isActiveLink('/') && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/40 via-white/60 to-blue-100/40 rounded-xl"></div>
              )}
            </Link>
            <Link 
              to="/about" 
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group overflow-hidden ${
                isActiveLink('/about') 
                  ? 'text-gray-700 bg-white/90 shadow-md border-2 border-blue-300' 
                  : 'text-gray-700 hover:text-gray-800 gentle-glow-hover'
              }`}
            >
              <span className="relative z-10">About</span>
              {/* Gentle glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-80 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
              {/* Active state glow */}
              {isActiveLink('/about') && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/40 via-white/60 to-blue-100/40 rounded-xl"></div>
              )}
            </Link>

            <Link 
              to="/parking" 
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group overflow-hidden ${
                isActiveLink('/parking') 
                  ? 'text-gray-700 bg-white/90 shadow-md border-2 border-blue-300' 
                  : 'text-gray-700 hover:text-gray-800 gentle-glow-hover'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">🚗 Park Now</span>
              {/* Gentle glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-80 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
              {/* Active state glow */}
              {isActiveLink('/parking') && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/40 via-white/60 to-blue-100/40 rounded-xl"></div>
              )}
            </Link>
            
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="p-2 rounded-full bg-white shadow-lg">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="absolute -inset-1 bg-yellow-400/60 rounded-full blur-sm opacity-50"></div>
                      </div>
                      <span className="text-gray-800 font-bold">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-800 hover:text-red-600 transition-colors duration-300 font-bold px-4 py-2 rounded-lg hover:bg-white/50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleSignIn}
                      className="text-gray-700 hover:text-gray-800 transition-colors duration-300 font-medium px-6 py-3 rounded-xl hover:bg-white/70 relative group overflow-hidden"
                    >
                      <span className="relative z-10">Sign In</span>
                      <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-70 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
                    </button>
                    <button 
                      onClick={handleSignUp}
                      className="px-6 py-3 rounded-xl font-medium text-sm relative overflow-hidden group bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <span className="relative z-10">Sign Up</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute -inset-1 bg-blue-300/40 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                    </button>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Bright Mobile Menu Button */}
          <button 
            className="md:hidden p-3 rounded-xl bg-white/90 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl group relative overflow-hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
          </button>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-white/20">
            <nav className="flex flex-col space-y-3 pt-6">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActiveLink('/') 
                    ? 'text-yellow-300 bg-white/10 shadow-lg' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActiveLink('/about') 
                    ? 'text-yellow-300 bg-white/10 shadow-lg' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
                }`}
              >
                About
              </Link>
              
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="relative">
                          <div className="glass-dark p-2 rounded-full bg-gradient-primary">
                            <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="absolute -inset-0.5 bg-gradient-primary rounded-full blur opacity-30"></div>
                        </div>
                        <span className="text-white font-semibold">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-red-300 hover:text-red-200 font-medium px-4 py-2 text-left transition-colors duration-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-white/20">
                      <button 
                        onClick={handleSignIn}
                        className="text-white/90 hover:text-yellow-300 px-4 py-3 text-left font-medium rounded-xl hover:bg-white/5 transition-all duration-300"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={handleSignUp}
                        className="btn-golden px-4 py-3 rounded-xl hover:bg-blue-700 text-left font-bold"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        defaultTab={authModalTab}
      />
    </header>
  );
};

export default Header;