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
import DashboardContainer from './components/dashboard/DashboardContainer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/parking" element={<CustomerJourney />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardContainer />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user-dashboard" 
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
              </Routes>
            </div>
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
