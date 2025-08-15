import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignIn = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };


  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const switchToDashboard = (dashboardType) => {
    console.log('Switching to dashboard:', dashboardType); // Debug log
    const path = dashboardType === 'client' ? '/client-dashboard' : '/dashboard';
    navigate(path);
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const getCurrentDashboardType = () => {
    if (location.pathname === '/client-dashboard') return 'client';
    if (location.pathname === '/dashboard') return 'user';
    return user?.role === 'client' || user?.role === 'parking_owner' ? 'client' : 'user';
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-blue-200/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-200 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-blue-50/30 pointer-events-none"></div>
      {/* Gentle light glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/30 to-blue-50/30 animate-pulse pointer-events-none"></div>
      <div className="container mx-auto px-6 relative z-10">
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
              <h1 className="text-2xl font-bold text-gray-700 tracking-tight">
                <span className="text-green-600"></span> Park<span className="text-orange-600">Sathi</span>
              </h1>
              <p className="text-xs text-gray-600 font-medium">आफ्नै पार्किङ समाधान • Your Local Parking Helper</p>
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
              <span className="relative z-10 flex items-center gap-2"> Park Now</span>
              {/* Gentle glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-80 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
              {/* Active state glow */}
              {isActiveLink('/parking') && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/40 via-white/60 to-blue-100/40 rounded-xl"></div>
              )}
            </Link>
            
            {/* Dashboard Link - Show only when authenticated */}
            {isAuthenticated && (
              <Link 
                to={user?.role === 'client' || user?.role === 'parking_owner' ? '/client-dashboard' : '/dashboard'}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group overflow-hidden ${
                  isActiveLink('/dashboard') || isActiveLink('/client-dashboard')
                    ? 'text-gray-700 bg-white/90 shadow-md border-2 border-blue-300' 
                    : 'text-gray-700 hover:text-gray-800 gentle-glow-hover'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  📊 Dashboard
                </span>
                {/* Gentle glow effect */}
                <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-80 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
                {/* Active state glow */}
                {(isActiveLink('/dashboard') || isActiveLink('/client-dashboard')) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/40 via-white/60 to-blue-100/40 rounded-xl"></div>
                )}
              </Link>
            )}
            
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="relative z-20" ref={dropdownRef}>
                    <button 
                      onClick={(e) => {
                        console.log('Profile button clicked'); // Debug log
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      }}
                      className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative z-30"
                      type="button"
                    >
                      <div className="relative">
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/60 to-purple-400/60 rounded-full blur-sm opacity-50"></div>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-800 font-bold text-sm">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">
                          {getCurrentDashboardType() === 'client' ? 'Business Owner' : 'Customer'}
                        </div>
                      </div>
                      <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[100]">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-900 font-bold">
                                {user?.firstName} {user?.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user?.email || 'No email provided'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Dashboard Views
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              switchToDashboard('user');
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                              getCurrentDashboardType() === 'user' 
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            type="button"
                          >
                            <div className={`p-1.5 rounded-lg ${
                              getCurrentDashboardType() === 'user' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">Customer Dashboard</div>
                              <div className="text-xs text-gray-500">Book parking, manage payments</div>
                            </div>
                            {getCurrentDashboardType() === 'user' && (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              switchToDashboard('client');
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                              getCurrentDashboardType() === 'client' 
                                ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            type="button"
                          >
                            <div className={`p-1.5 rounded-lg ${
                              getCurrentDashboardType() === 'client' 
                                ? 'bg-purple-100 text-purple-600' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">Business Dashboard</div>
                              <div className="text-xs text-gray-500">Manage spaces, analytics, revenue</div>
                            </div>
                            {getCurrentDashboardType() === 'client' && (
                              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-200 p-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group cursor-pointer"
                            type="button"
                          >
                            <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
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
              
              <Link 
                to="/parking" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActiveLink('/parking') 
                    ? 'text-yellow-300 bg-white/10 shadow-lg' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
                }`}
              >
                 Park Now
              </Link>
              
              {/* Dashboard Link in Mobile Menu */}
              {isAuthenticated && (
                <Link 
                  to={user?.role === 'client' || user?.role === 'parking_owner' ? '/client-dashboard' : '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActiveLink('/dashboard') || isActiveLink('/client-dashboard')
                      ? 'text-yellow-300 bg-white/10 shadow-lg' 
                      : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
                  }`}
                >
                  📊 Dashboard
                </Link>
              )}
              
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="relative">
                          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/60 to-purple-400/60 rounded-full blur opacity-50"></div>
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-xs text-white/70 capitalize">
                            {getCurrentDashboardType() === 'client' ? 'Business Owner' : 'Customer'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-2">
                        <div className="text-xs text-white/60 font-semibold uppercase mb-2">Dashboard Views</div>
                        <div className="space-y-1">
                          <button 
                            onClick={() => switchToDashboard('user')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              getCurrentDashboardType() === 'user' 
                                ? 'bg-white/20 text-white border-l-2 border-blue-300' 
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">Customer Dashboard</span>
                          </button>
                          
                          <button 
                            onClick={() => switchToDashboard('client')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              getCurrentDashboardType() === 'client' 
                                ? 'bg-white/20 text-white border-l-2 border-purple-300' 
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">Business Dashboard</span>
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="text-red-300 hover:text-red-200 font-medium px-4 py-2 text-left transition-colors duration-300 border-t border-white/10 pt-3"
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