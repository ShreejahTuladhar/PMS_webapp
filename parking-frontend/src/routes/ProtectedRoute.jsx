import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const ProtectedRoute = ({ children, requiredRole, fallbackPath = "/login" }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();


  useEffect(() => {
    // Show appropriate error messages
    if (!isLoading && !isAuthenticated) {
      toast.error("Please log in to access this page", {
        duration: 3000,
        position: 'top-right',
      });
    } else if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
      toast.error("You don't have permission to access this page", {
        duration: 3000,
        position: 'top-right',
      });
    }
  }, [isAuthenticated, user, requiredRole, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Store the attempted URL to redirect after login
    return <Navigate 
      to={fallbackPath} 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Check role-based access
  if (requiredRole) {
    const userRole = user.role;
    
    // Handle different role formats from backend
    const normalizedUserRole = userRole === 'parking_admin' ? 'admin' : 
                              userRole === 'super_admin' ? 'superadmin' : 
                              userRole;
    
    if (normalizedUserRole !== requiredRole) {
      // Redirect based on user's actual role
      const roleRedirects = {
        customer: "/user/dashboard",
        admin: "/admin/dashboard", 
        superadmin: "/superadmin/dashboard"
      };
      
      const redirectPath = roleRedirects[normalizedUserRole] || "/";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
