import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserDashboard from './user/UserDashboard';
import ClientDashboard from './client/ClientDashboard';

const DashboardContainer = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentDashboard, setCurrentDashboard] = useState('user');

  useEffect(() => {
    // Set initial dashboard based on user role
    if (user?.role === 'client' || user?.role === 'parking_owner') {
      setCurrentDashboard('client');
    } else {
      setCurrentDashboard('user');
    }
  }, [user]);

  const toggleDashboard = (dashboardType) => {
    setCurrentDashboard(dashboardType);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Toggle Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Switch between User and Business Owner perspectives
                </p>
              </div>
              
              {/* Dashboard Toggle Buttons */}
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <button
                    onClick={() => toggleDashboard('user')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      currentDashboard === 'user'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    👤 User Profile
                  </button>
                  <button
                    onClick={() => toggleDashboard('client')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ml-1 ${
                      currentDashboard === 'client'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    🏢 Business Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {currentDashboard === 'user' ? (
          <UserDashboard hideHeader={true} />
        ) : (
          <ClientDashboard hideHeader={true} />
        )}
      </div>
    </div>
  );
};

export default DashboardContainer;