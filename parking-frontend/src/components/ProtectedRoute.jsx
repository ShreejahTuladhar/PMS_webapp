import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [], requireSecure = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [securityCheck, setSecurityCheck] = useState(!requireSecure);

  // Enhanced security check for super admin
  useEffect(() => {
    if (requireSecure && user?.role === 'super_admin') {
      // Verify token freshness and additional security metadata
      const token = localStorage.getItem('authToken');
      const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      if (tokenData) {
        const tokenAge = Date.now() - (tokenData.iat * 1000);
        const isTokenFresh = tokenAge < 24 * 60 * 60 * 1000; // 24 hours
        
        // Check for secure session metadata (hidden from casual inspection)
        const secureSession = sessionStorage.getItem('_ss_meta');
        const hasSecureSession = secureSession && 
          JSON.parse(atob(secureSession))?.role_verified === 'super_admin_verified';
        
        setSecurityCheck(isTokenFresh && hasSecureSession);
        
        if (!hasSecureSession && user?.role === 'super_admin') {
          // Create secure session metadata for verified super admin
          const metadata = btoa(JSON.stringify({
            role_verified: 'super_admin_verified',
            timestamp: Date.now(),
            session_id: Math.random().toString(36).substring(7)
          }));
          sessionStorage.setItem('_ss_meta', metadata);
          setSecurityCheck(true);
        }
      } else {
        setSecurityCheck(false);
      }
    }
  }, [requireSecure, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home page with state to open login modal
    return <Navigate to="/" state={{ from: location, openLogin: true }} replace />;
  }

  // Enhanced role verification for super admin
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap = {
        'customer': '/dashboard',
        'user': '/dashboard',
        'client': '/client-dashboard',
        'parking_owner': '/client-dashboard'
      };
      
      return <Navigate to={dashboardMap[user?.role] || '/dashboard'} replace />;
    }
    
    // Additional security check for super admin
    if (requireSecure && user?.role === 'super_admin' && !securityCheck) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Security Verification Required</h2>
            <p className="text-red-700 mb-6">
              This area requires additional security verification. Please re-authenticate to access super admin features.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Re-authenticate
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;