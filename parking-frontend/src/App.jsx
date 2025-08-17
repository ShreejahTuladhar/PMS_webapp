import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ErrorBoundary } from './components/common';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import CustomerJourney from './components/customer/CustomerJourney';
import UserDashboard from './components/dashboard/user/UserDashboard';
import ClientDashboard from './components/dashboard/client/ClientDashboard';
import SuperAdminDashboard from './components/dashboard/superadmin/SuperAdminDashboard';
import FullScreenMapPage from './components/FullScreenMapPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/common/NotFound';
import CinematicLoadingScreen from './components/loading/CinematicLoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);

  useEffect(() => {
    // Always show loading screen on every visit (like YouTube ads)
    setIsLoading(true);
  }, []);

  const handleLoadingComplete = () => {
    console.log('🚀 App.jsx: handleLoadingComplete called!');
    setIsLoading(false);
    setFocusSearch(true); // Enable search focus after loading
    // Add a slight delay before showing the main app for smooth transition
    setTimeout(() => {
      console.log('🚀 App.jsx: Setting appInitialized to true');
      setAppInitialized(true);
    }, 200);
  };

  // Show loading screen
  if (isLoading) {
    return <CinematicLoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${appInitialized ? 'opacity-100' : 'opacity-0'}`}>
              <Header />
              <Routes>
                <Route path="/" element={<Home focusSearch={focusSearch} />} />
                <Route path="/about" element={<About />} />
                <Route path="/parking" element={<CustomerJourney />} />
                <Route path="/search/fullscreen" element={<FullScreenMapPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'user']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['client', 'parking_owner']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} /> 
              </Routes>
            </div>
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
