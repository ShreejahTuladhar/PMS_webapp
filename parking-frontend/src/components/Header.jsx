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
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="absolute inset-0 bg-gradient-primary opacity-95"></div>
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center py-4">
          {/* Premium Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="glass-dark p-3 rounded-2xl bg-gradient-primary transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-7 h-7 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-primary rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Park<span className="text-gradient-golden">Smart</span>
              </h1>
              <p className="text-xs text-yellow-300/80 font-medium">Premium Parking Solutions</p>
            </div>
          </Link>

          {/* Premium Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isActiveLink('/') 
                  ? 'text-yellow-300 bg-white/10 shadow-lg' 
                  : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
              }`}
            >
              Home
              {isActiveLink('/') && (
                <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-xl"></div>
              )}
            </Link>
            <Link 
              to="/about" 
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isActiveLink('/about') 
                  ? 'text-yellow-300 bg-white/10 shadow-lg' 
                  : 'text-white/90 hover:text-yellow-300 hover:bg-white/5'
              }`}
            >
              About
              {isActiveLink('/about') && (
                <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-xl"></div>
              )}
            </Link>
            
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="glass-dark p-2 rounded-full bg-gradient-primary">
                          <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="text-white/80 hover:text-red-300 transition-colors duration-300 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleSignIn}
                      className="text-white/90 hover:text-yellow-300 transition-colors duration-300 font-medium px-4 py-2 rounded-xl hover:bg-white/5"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleSignUp}
                      className="btn-golden px-6 py-2 rounded-xl font-bold text-sm relative overflow-hidden group"
                    >
                      <span className="relative z-10">Sign Up</span>
                      <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Premium Mobile Menu Button */}
          <button 
            className="md:hidden p-3 rounded-xl glass-dark transition-all duration-300 hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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