import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const BaseDashboard = ({ 
  children, 
  userType = 'user',
  loadDataFunction,
  initialDashboardState,
  additionalTabs = []
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    ...initialDashboardState
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDataFunction && loadDataFunction(setDashboardData);
    }
  }, [isAuthenticated, user, loadDataFunction]);

  const baseTabs = [
    { id: 'overview', name: 'Overview', icon: '' },
    { id: 'profile', name: 'Profile', icon: '' },
  ];

  const allTabs = [...baseTabs, ...additionalTabs];

  const getUserGreeting = () => {
    switch (userType) {
      case 'client':
        return `Welcome, ${user?.businessName || user?.firstName || 'Business Owner'}! 🏢`;
      case 'admin':
        return `Welcome, ${user?.firstName || 'Administrator'}! 🔧`;
      default:
        return `Welcome back, ${user?.firstName || 'User'}! 👋`;
    }
  };

  const getUserSubtitle = () => {
    switch (userType) {
      case 'client':
        return 'Manage your parking business and track performance';
      case 'admin':
        return 'System administration and management';
      default:
        return 'Manage your parking bookings and account settings';
    }
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

  // Role-based access validation for client dashboard
  if (userType === 'client') {
    // Anyone can access client dashboard (business view)
    // This allows users to switch between customer and business perspectives
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {getUserGreeting()}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {getUserSubtitle()}
                </p>
              </div>
              {children.headerActions}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {activeTab === 'overview' && typeof children.quickStats === 'function' 
          ? children.quickStats({ dashboardData, user, setDashboardData })
          : activeTab === 'overview' && children.quickStats}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {children.renderTabContent({ 
              activeTab, 
              dashboardData, 
              user,
              setDashboardData 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseDashboard;