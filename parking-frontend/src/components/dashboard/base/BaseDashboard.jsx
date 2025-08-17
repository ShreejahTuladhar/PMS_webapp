import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const BaseDashboard = ({ 
  children, 
  userType = 'user',
  loadDataFunction,
  initialDashboardState,
  additionalTabs = [],
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}) => {
  const { user, isAuthenticated } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;
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
        return `Welcome, ${user?.businessName || user?.firstName || 'Business Owner'}!`;
      case 'admin':
        return `Welcome, ${user?.firstName || 'Administrator'}!`;
      default:
        return `Welcome back, ${user?.firstName || 'User'}!`;
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Background matching home page */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"></div>
        <div className="absolute inset-0 opacity-35">
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-transparent to-blue-900/30"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
            <p className="text-white/90">You need to be logged in to access your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background matching home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"></div>
      <div className="absolute inset-0 opacity-35">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 left-1/6 w-28 h-28 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-transparent to-blue-900/30"></div>
      
      {/* Header Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-200/80 via-white/90 to-yellow-200/80 backdrop-blur-md border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-800">
                {getUserGreeting()}
              </h1>
              <p className="mt-2 text-gray-700">
                {getUserSubtitle()}
              </p>
            </div>
            {children.headerActions && (
              <div className="mt-4 md:mt-0 md:ml-4">
                {children.headerActions}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {activeTab === 'overview' && children.quickStats && (
          <div className="mb-8">
            {typeof children.quickStats === 'function' 
              ? children.quickStats({ dashboardData, user, setDashboardData })
              : children.quickStats
            }
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-yellow-50/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50">
          <div className="border-b border-blue-200/50">
            <nav className="flex space-x-8 px-6">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-orange-400 text-orange-600 scale-105'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-yellow-300'
                  }`}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {children.renderTabContent && children.renderTabContent({ 
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