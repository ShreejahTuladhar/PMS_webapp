import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import BookingHistory from './BookingHistory';
import PaymentPortal from './PaymentPortal';
import UserProfile from './UserProfile';
import UserActivity from './UserActivity';
import { bookingService, userService } from '../../../services';

const UserDashboard = ({ hideHeader = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    recentBookings: [],
    totalBookings: 0,
    totalSpent: 0,
    savedAmount: 0,
    upcomingBookings: [],
    loading: true
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      const [bookingsResponse, statsResponse] = await Promise.all([
        bookingService.getUserBookings({ limit: 5, status: 'all' }),
        userService.getUserStats()
      ]);

      setDashboardData({
        recentBookings: bookingsResponse.bookings || [],
        totalBookings: statsResponse.totalBookings || 0,
        totalSpent: statsResponse.totalSpent || 0,
        savedAmount: statsResponse.savedAmount || 0,
        upcomingBookings: bookingsResponse.bookings?.filter(b => 
          b.status === 'confirmed' && new Date(b.startTime) > new Date()
        ) || [],
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'bookings', name: 'Bookings', icon: '🅿️' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'activity', name: 'Activity', icon: '📈' },
  ];

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
    <div className={hideHeader ? "" : "min-h-screen bg-gray-50"}>
      {!hideHeader && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Welcome back, {user?.firstName || 'User'}! 👋
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your parking bookings and account settings
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    + New Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-blue-100">Total Bookings</p>
                  <p className="text-2xl font-bold">{dashboardData.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-green-100">Total Spent</p>
                  <p className="text-2xl font-bold">Rs. {dashboardData.totalSpent}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-purple-100">Amount Saved</p>
                  <p className="text-2xl font-bold">Rs. {dashboardData.savedAmount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-orange-100">Upcoming</p>
                  <p className="text-2xl font-bold">{dashboardData.upcomingBookings.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                  {dashboardData.loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : dashboardData.recentBookings.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentBookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.locationName}</p>
                            <p className="text-sm text-gray-500">{new Date(booking.startTime).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-1">Rs. {booking.totalAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent bookings found</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm font-medium text-blue-800">Find Parking</p>
                    </button>
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition">
                      <div className="text-2xl mb-2">💳</div>
                      <p className="text-sm font-medium text-green-800">Add Payment</p>
                    </button>
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition">
                      <div className="text-2xl mb-2">📱</div>
                      <p className="text-sm font-medium text-purple-800">Digital Ticket</p>
                    </button>
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-sm font-medium text-orange-800">Support</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && <BookingHistory />}
            {activeTab === 'payments' && <PaymentPortal />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'activity' && <UserActivity />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;