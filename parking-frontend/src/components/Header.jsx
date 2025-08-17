import { useState, useEffect, useRef, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';
import ParkSathiLogo from './common/ParkSathiLogo';

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

  // const handleSignUp = () => {
  //   setAuthModalTab('register');
  //   setIsAuthModalOpen(true);
  // };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const switchToDashboard = (dashboardType) => {
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
    setAuthModalTab('login');
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

  // Close menu and dropdown on Escape key press
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ParkSathiLogo showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/about') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
            <Link 
              to="/parking" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/parking') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Park Now
            </Link>
            
            {/* Dashboard Link - Show only when authenticated */}
            {isAuthenticated && (
              <Link 
                to={user?.role === 'client' || user?.role === 'parking_owner' ? '/client-dashboard' : '/dashboard'}
                className={`text-sm font-medium transition-colors ${
                  isActiveLink('/dashboard') || isActiveLink('/client-dashboard')
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="relative" ref={dropdownRef}>
                    {/* Profile Button */}
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-expanded={isProfileDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.firstName || 'User'}
                      </span>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileDropdownOpen && (
                      <div 
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="user-menu"
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user?.firstName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user?.firstName} {user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.email || 'No email provided'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dashboard Switcher */}
                        <div className="py-1">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Dashboard Views
                          </div>
                          
                          <button 
                            onClick={() => switchToDashboard('user')}
                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                              getCurrentDashboardType() === 'user' 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Dashboard
                            {getCurrentDashboardType() === 'user' && (
                              <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <button 
                            onClick={() => switchToDashboard('client')}
                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                              getCurrentDashboardType() === 'client' 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Business Dashboard
                            {getCurrentDashboardType() === 'client' && (
                              <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        {/* Sign Out */}
                        <div className="border-t border-gray-100 py-1">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleSignIn}
                      className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActiveLink('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActiveLink('/about') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <Link 
                to="/parking" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActiveLink('/parking') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Park Now
              </Link>
              
              {/* Dashboard Links for Mobile */}
              {isAuthenticated && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-100 mt-2">
                    Dashboard Views
                  </div>
                  <button 
                    onClick={() => switchToDashboard('user')}
                    className={`px-4 py-2 text-sm font-medium text-left transition-colors ${
                      getCurrentDashboardType() === 'user' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Customer Dashboard
                  </button>
                  <button 
                    onClick={() => switchToDashboard('client')}
                    className={`px-4 py-2 text-sm font-medium text-left transition-colors ${
                      getCurrentDashboardType() === 'client' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Business Dashboard
                  </button>
                </>
              )}
              
              {/* Auth buttons for mobile */}
              {!loading && !isAuthenticated && (
                <div className="border-t border-gray-100 mt-2 pt-2 px-4 space-y-2">
                  <button 
                    onClick={handleSignIn}
                    className="w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
              
              {/* Mobile Logout */}
              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left border-t border-gray-100 mt-2 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
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