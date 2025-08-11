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
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/common/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/parking" element={<CustomerJourney />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client-dashboard" 
                  element={
                    <ProtectedRoute>
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
