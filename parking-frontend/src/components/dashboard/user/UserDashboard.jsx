import { useState } from 'react';
import { BaseDashboard } from '../base/BaseDashboard';
import BookingHistory from './BookingHistory';
import PaymentPortal from './PaymentPortal';
import UserProfile from './UserProfile';
import UserActivity from './UserActivity';
import TransactionHistory from './TransactionHistory';
import VehicleManagement from './VehicleManagement';
import FavoriteLocations from './FavoriteLocations';
import SmartQuickActions from './SmartQuickActions';
import DigitalTicketModal from './DigitalTicketModal';
import SupportModal from './SupportModal';
import ParkingSearchMap from '../../search/ParkingSearchMap';
import BookingManager from '../BookingManager';
import { bookingService, userService } from '../../../services';
import { safeArray, safeObject, filterValidBookings, safeAsync } from '../../../utils/apiSafety';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDigitalTicket, setShowDigitalTicket] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showParkingSearch, setShowParkingSearch] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handle modal opening from quick actions
   * @param {'digital_ticket' | 'support' | 'parking_search'} modalType - Type of modal to open
   * @param {Object} params - Modal parameters
   * @param {string} [params.bookingId] - Booking ID for digital ticket modal
   * @param {string} [params.query] - Search query for parking search modal
   */
  const handleModalOpen = (modalType, params = {}) => {
    switch (modalType) {
      case 'digital_ticket':
        setSelectedBookingId(params.bookingId || null);
        setShowDigitalTicket(true);
        break;
      case 'support':
        setShowSupport(true);
        break;
      case 'parking_search':
        setSearchQuery(params.query || '');
        setShowParkingSearch(true);
        break;
      default:
        console.warn('Unknown modal type:', modalType);
    }
  };

  // Handle tab changes from quick actions
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // 🚀 Professional-grade data loader with enterprise-level error handling
  const loadUserData = safeAsync(async (setDashboardData) => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    
    const [bookingsResponse, statsResponse] = await Promise.all([
      bookingService.getBookings({ limit: 5, status: 'all' }),
      userService.getUserStats()
    ]);

    // 🛡️ Use professional API safety utilities
    const bookings = filterValidBookings(safeArray(bookingsResponse, 'bookings'));
    const stats = safeObject(statsResponse, 'data');

    // 📊 Calculate derived data safely
    const now = new Date();
    const upcomingBookings = bookings.filter(b => 
      b.status === 'confirmed' && 
      b.startTime && 
      new Date(b.startTime) > now
    );

    setDashboardData({
      recentBookings: bookings.slice(0, 5),
      totalBookings: stats.totalBookings || bookings.length,
      totalSpent: stats.totalSpent || 0,
      savedAmount: stats.savedAmount || 0,
      upcomingBookings,
      loading: false,
      lastUpdated: now.toISOString()
    });
  }, (setDashboardData) => {
    // 🔥 Graceful fallback on complete failure
    setDashboardData(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
  });

  const initialState = {
    recentBookings: [],
    totalBookings: 0,
    totalSpent: 0,
    savedAmount: 0,
    upcomingBookings: []
  };

  const additionalTabs = [
    { id: 'bookings', name: 'Booking Manager', icon: '📋' },
    { id: 'transactions', name: 'Transaction History', icon: '' },
    { id: 'vehicles', name: 'Vehicle Details', icon: '' },
    { id: 'favorites', name: 'Favorite Locations', icon: '' },
    { id: 'payments', name: 'Payments', icon: '' },
    { id: 'activity', name: 'Activity', icon: '' },
  ];

  return (
    <>
      <BaseDashboard
        userType="user"
        loadDataFunction={loadUserData}
        initialDashboardState={initialState}
        additionalTabs={additionalTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
      {{
        headerActions: (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + New Booking
            </button>
          </div>
        ),
        quickStats: ({ dashboardData }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalBookings || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {dashboardData?.totalSpent || 0}</p>
                </div>
              </div>
            </div>

            {/* Amount Saved */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Amount Saved</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {dashboardData?.savedAmount || 0}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.upcomingBookings?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ),
        renderTabContent: ({ activeTab, dashboardData }) => {
          if (activeTab === 'overview') {
            return (
              <div className="space-y-6">
                {/* Recent Bookings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                      View all →
                    </button>
                  </div>
                  {dashboardData.loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-3">Loading your bookings...</p>
                    </div>
                  ) : dashboardData.recentBookings.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentBookings.slice(0, 4).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{booking.locationName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.startTime).toLocaleDateString()} • {booking.duration || 2}h
                              </p>
                            </div>
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
                            <p className="text-sm font-bold text-gray-900 mt-1">Rs. {booking.totalAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No recent bookings found</p>
                      <p className="text-sm text-gray-400 mt-1">Your booking history will appear here</p>
                    </div>
                  )}
                </div>

                {/* Smart Quick Actions */}
                <SmartQuickActions 
                  onTabChange={handleTabChange}
                  onModalOpen={handleModalOpen}
                />
              </div>
            );
          }
          
          if (activeTab === 'bookings') return <BookingManager />;
          if (activeTab === 'transactions') return <TransactionHistory />;
          if (activeTab === 'vehicles') return <VehicleManagement />;
          if (activeTab === 'favorites') return <FavoriteLocations />;
          if (activeTab === 'payments') return <PaymentPortal />;
          if (activeTab === 'profile') return <UserProfile />;
          if (activeTab === 'activity') return <UserActivity />;
          
          return null;
        }
      }}
    </BaseDashboard>

      {/* Modals */}
      <DigitalTicketModal
        isOpen={showDigitalTicket}
        onClose={() => setShowDigitalTicket(false)}
        bookingId={selectedBookingId}
      />
      
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />

      <ParkingSearchMap
        isOpen={showParkingSearch}
        onClose={() => setShowParkingSearch(false)}
        initialSearchQuery={searchQuery}
      />
    </>
  );
};

export default UserDashboard;