import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy load components for better performance
const Home = lazy(() => import("../pages/home/Home"));
const About = lazy(() => import("../pages/home/About"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const SearchParkingMap = lazy(() => import("../pages/parking/SearchParkingMap"));
const RegisterParking = lazy(() => import("../pages/parking/RegisterParking"));
const UserDashboard = lazy(() => import("../pages/user/UserDashboard"));
// const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
// const SuperAdminDashboard = lazy(() => import("../pages/superAdmin/SuperAdminDashboard"));

// 404 Not Found component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Navigate to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Go Home
      </Navigate>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchParkingMap />} />
              <Route path="/register-parking" element={<RegisterParking />} />

              {/* Protected User Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="dashboard" element={<div>Admin Dashboard Coming Soon</div>} />
                        <Route path="locations" element={<div>Manage Locations</div>} />
                        <Route path="bookings" element={<div>Manage Bookings</div>} />
                        <Route path="users" element={<div>Manage Users</div>} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                      </Routes>
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Protected Super Admin Routes */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="dashboard" element={<div>Super Admin Dashboard Coming Soon</div>} />
                        <Route path="analytics" element={<div>Analytics</div>} />
                        <Route path="system" element={<div>System Settings</div>} />
                        <Route path="*" element={<Navigate to="/superadmin/dashboard" />} />
                      </Routes>
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            // Default options for specific types
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />
      </ErrorBoundary>
    </Router>
  );
};

export default AppRoutes;
