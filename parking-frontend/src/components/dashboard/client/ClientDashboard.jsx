import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import ParkingManagement from './ParkingManagement';
import ParkingProfile from './ParkingProfile';
import RatesManagement from './RatesManagement';
import BusinessHours from './BusinessHours';
import PhotoUpload from './PhotoUpload';

const ClientDashboard = ({ hideHeader = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0
    },
    occupancy: {
      current: 0,
      average: 0,
      peak: 0
    },
    revenueChart: [],
    bookingChart: [],
    spaceUtilization: [],
    recentBookings: [],
    loading: true
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Simulate API call for client dashboard data
      const mockData = {
        revenue: {
          today: 2850,
          thisWeek: 18500,
          thisMonth: 75000,
          lastMonth: 68000
        },
        bookings: {
          total: 245,
          pending: 12,
          confirmed: 18,
          completed: 215
        },
        occupancy: {
          current: 78,
          average: 65,
          peak: 95
        },
        revenueChart: [
          { date: '2024-01-01', revenue: 12000 },
          { date: '2024-01-02', revenue: 15000 },
          { date: '2024-01-03', revenue: 8000 },
          { date: '2024-01-04', revenue: 22000 },
          { date: '2024-01-05', revenue: 18000 },
          { date: '2024-01-06', revenue: 25000 },
          { date: '2024-01-07', revenue: 20000 }
        ],
        bookingChart: [
          { hour: '06:00', bookings: 5 },
          { hour: '08:00', bookings: 15 },
          { hour: '10:00', bookings: 12 },
          { hour: '12:00', bookings: 20 },
          { hour: '14:00', bookings: 18 },
          { hour: '16:00', bookings: 25 },
          { hour: '18:00', bookings: 22 },
          { hour: '20:00', bookings: 8 }
        ],
        spaceUtilization: [
          { name: 'Occupied', value: 78, color: '#10B981' },
          { name: 'Available', value: 22, color: '#E5E7EB' }
        ],
        recentBookings: [
          {
            id: '1',
            bookingId: 'BK001',
            customerName: 'Ram Sharma',
            vehicle: 'Ba 1 Pa 1234',
            space: 'A-15',
            startTime: '2024-01-20T10:30:00Z',
            duration: 2,
            amount: 200,
            status: 'confirmed'
          },
          {
            id: '2',
            bookingId: 'BK002',
            customerName: 'Sita Pradhan',
            vehicle: 'Ba 2 Cha 5678',
            space: 'B-08',
            startTime: '2024-01-20T11:15:00Z',
            duration: 3,
            amount: 300,
            status: 'completed'
          }
        ],
        loading: false
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'parking', name: 'Parking Management', icon: '🅿️' },
    { id: 'profile', name: 'Profile', icon: '🏢' },
    { id: 'rates', name: 'Rates', icon: '💰' },
    { id: 'hours', name: 'Business Hours', icon: '⏰' },
    { id: 'photos', name: 'Photos', icon: '📸' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  if (!isAuthenticated || user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in as a parking owner to access this dashboard.</p>
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
                    Welcome, {user?.businessName || user?.firstName || 'Business Owner'}! 🏢
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your parking business and track performance
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    💰 View Earnings
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    + Add Space
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
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Today's Revenue</p>
                  <p className="text-3xl font-bold">Rs. {dashboardData.revenue.today?.toLocaleString()}</p>
                  <p className="text-sm text-green-100 mt-1">
                    +12% from yesterday
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Bookings</p>
                  <p className="text-3xl font-bold">{dashboardData.bookings.total}</p>
                  <p className="text-sm text-blue-100 mt-1">
                    {dashboardData.bookings.pending} pending
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Current Occupancy</p>
                  <p className="text-3xl font-bold">{dashboardData.occupancy.current}%</p>
                  <p className="text-sm text-purple-100 mt-1">
                    Avg: {dashboardData.occupancy.average}%
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Monthly Growth</p>
                  <p className="text-3xl font-bold">+{Math.round(((dashboardData.revenue.thisMonth - dashboardData.revenue.lastMonth) / dashboardData.revenue.lastMonth) * 100)}%</p>
                  <p className="text-sm text-orange-100 mt-1">
                    vs last month
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData.revenueChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tickFormatter={(value) => `Rs. ${value/1000}k`} />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Booking Patterns */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Booking Patterns</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.bookingChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} bookings`, 'Bookings']} />
                        <Bar dataKey="bookings" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Space Utilization */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Space Utilization</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboardData.spaceUtilization}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardData.spaceUtilization.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-4">
                      {dashboardData.spaceUtilization.map((entry, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                      {dashboardData.recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">
                                {booking.vehicle} • Space {booking.space} • {booking.duration}h
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-1">Rs. {booking.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parking' && <ParkingManagement />}
            {activeTab === 'profile' && <ParkingProfile />}
            {activeTab === 'rates' && <RatesManagement />}
            {activeTab === 'hours' && <BusinessHours />}
            {activeTab === 'photos' && <PhotoUpload />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;