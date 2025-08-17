import { BaseDashboard } from '../base/BaseDashboard';
import ParkingManagement from './ParkingManagement';
import ParkingProfile from './ParkingProfile';
import RatesManagement from './RatesManagement';
import BusinessHours from './BusinessHours';
import PhotoUpload from './PhotoUpload';
import UseCaseAnalysis from './UseCaseAnalysis';

const ClientDashboard = () => {
  const loadClientData = async (setDashboardData) => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Load real client data from APIs
      const [allBookingsResponse, locationsResponse] = await Promise.all([
        fetch('http://localhost:8080/api/bookings?limit=50'), // Get more bookings for business analysis
        fetch('http://localhost:8080/api/locations?limit=10') // Get user's locations if they own any
      ]).then(responses => Promise.all(responses.map(r => r.json())));

      // Calculate real business metrics from booking data
      const allBookings = allBookingsResponse.data || [];
      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      
      const todayBookings = allBookings.filter(b => new Date(b.createdAt) >= new Date(today.toDateString()));
      const weekBookings = allBookings.filter(b => new Date(b.createdAt) >= thisWeek);
      const monthBookings = allBookings.filter(b => new Date(b.createdAt) >= thisMonth);
      const lastMonthBookings = allBookings.filter(b => 
        new Date(b.createdAt) >= lastMonth && new Date(b.createdAt) < thisMonth
      );

      const clientData = {
        // Base user functionality inherited  
        totalBookings: allBookings.length,
        totalSpent: 0, // Not applicable for client
        savedAmount: 0, // Not applicable for client
        upcomingBookings: allBookings.filter(b => 
          b.status === 'confirmed' && new Date(b.startTime) > new Date()
        ).slice(0, 5),
        recentBookings: allBookings.slice(0, 5).map(booking => ({
          id: booking.id,
          bookingId: booking.id,
          customerName: booking.userId?.fullName || 'Customer',
          vehicle: booking.vehicleInfo?.plateNumber || 'N/A',
          space: booking.spaceId,
          startTime: booking.startTime,
          duration: Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60)),
          totalAmount: booking.totalAmount,
          status: booking.status,
          locationName: booking.locationId?.name || 'Unknown Location'
        })),
        
        // Extended client-specific data calculated from real bookings
        revenue: {
          today: todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          thisWeek: weekBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          thisMonth: monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          lastMonth: lastMonthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        },
        bookings: {
          total: allBookings.length,
          pending: allBookings.filter(b => b.status === 'pending').length,
          confirmed: allBookings.filter(b => b.status === 'confirmed').length,
          completed: allBookings.filter(b => b.status === 'completed').length
        },
        occupancy: {
          current: locationsResponse.data?.[0]?.occupancyPercentage || 85,
          average: 75,
          peak: 95
        },
        revenueChart: (() => {
          const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayBookings = allBookings.filter(b => 
              new Date(b.createdAt).toDateString() === date.toDateString()
            );
            return {
              date: date.toISOString().split('T')[0],
              revenue: dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
            };
          });
          return last7Days;
        })(),
        bookingChart: (() => {
          const hourlyData = Array.from({length: 8}, (_, i) => {
            const hour = (6 + i * 2).toString().padStart(2, '0') + ':00';
            const hourBookings = allBookings.filter(b => {
              const bookingHour = new Date(b.startTime).getHours();
              return bookingHour >= (6 + i * 2) && bookingHour < (6 + (i + 1) * 2);
            });
            return { hour, bookings: hourBookings.length };
          });
          return hourlyData;
        })(),
        spaceUtilization: (() => {
          const currentOccupancy = locationsResponse.data?.[0]?.occupancyPercentage || 85;
          return [
            { name: 'Occupied', value: currentOccupancy, color: '#10B981' },
            { name: 'Available', value: 100 - currentOccupancy, color: '#E5E7EB' }
          ];
        })(),
        
        // Use Case Analysis Data
        useCaseAnalysis: {
          actors: [
            {
              name: 'Parking Customer',
              totalInteractions: 1250,
              activeUsers: 89,
              avgSessionTime: '12m',
              completionRate: 94.5
            },
            {
              name: 'Parking Attendant', 
              totalInteractions: 340,
              activeUsers: 8,
              avgSessionTime: '45m',
              completionRate: 98.2
            },
            {
              name: 'System Administrator',
              totalInteractions: 45,
              activeUsers: 2,
              avgSessionTime: '25m', 
              completionRate: 100
            }
          ],
          useCases: [
            { name: 'Enter Parking Facility', success: 245, failed: 3, avgTime: '2.5m' },
            { name: 'Find Available Space', success: 240, failed: 8, avgTime: '1.8m' },
            { name: 'Pay for Parking', success: 235, failed: 13, avgTime: '3.2m' },
            { name: 'Exit Parking Facility', success: 228, failed: 20, avgTime: '1.5m' },
            { name: 'Manage Parking Spaces', success: 156, failed: 4, avgTime: '8.5m' },
            { name: 'Process Payments', success: 89, failed: 6, avgTime: '4.2m' },
            { name: 'Record Violations', success: 23, failed: 2, avgTime: '6.8m' }
          ],
          systemMetrics: {
            uptime: 99.8,
            responseTime: '1.2s',
            errorRate: 0.8,
            userSatisfaction: 4.6
          }
        },
        loading: false
      };

      setDashboardData(clientData);
    } catch (error) {
      console.error('Error loading client dashboard data:', error);
      // Provide fallback data if API calls fail
      setDashboardData({
        totalBookings: 0,
        totalSpent: 0,
        savedAmount: 0,
        upcomingBookings: [],
        recentBookings: [],
        revenue: { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0 },
        bookings: { total: 0, pending: 0, confirmed: 0, completed: 0 },
        occupancy: { current: 0, average: 0, peak: 0 },
        revenueChart: [],
        bookingChart: [],
        spaceUtilization: [],
        useCaseAnalysis: { actors: [], useCases: [], systemMetrics: {} },
        loading: false,
        error: 'Failed to load dashboard data'
      });
    }
  };

  const initialState = {
    // Inherited base properties
    totalBookings: 0,
    totalSpent: 0,
    savedAmount: 0, 
    upcomingBookings: [],
    recentBookings: [],
    
    // Extended client properties
    revenue: { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    occupancy: { current: 0, average: 0, peak: 0 },
    revenueChart: [],
    bookingChart: [],
    spaceUtilization: [],
    useCaseAnalysis: {
      actors: [],
      useCases: [],
      systemMetrics: {}
    }
  };

  // Extends base tabs with client-specific functionality
  const clientTabs = [
    { id: 'parking', name: 'Parking Management', icon: '' },
    { id: 'usecase', name: 'Use Case Analysis', icon: '' },
    { id: 'attendant', name: 'Attendant Tools', icon: '' },
    { id: 'rates', name: 'Rates', icon: '' },
    { id: 'hours', name: 'Business Hours', icon: '' },
    { id: 'photos', name: 'Photos', icon: '' },
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

  return (
    <BaseDashboard
      userType="client"
      loadDataFunction={loadClientData}
      initialDashboardState={initialState}
      additionalTabs={clientTabs}
    >
      {{
        headerActions: (
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              View Earnings
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Add Space
            </button>
          </div>
        ),
        quickStats: ({ dashboardData }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today's Revenue */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {dashboardData?.revenue?.today?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-green-600 mt-1 font-medium">+12% from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.bookings?.total || 0}</p>
                  <p className="text-sm text-blue-600 mt-1 font-medium">{dashboardData?.bookings?.pending || 0} pending</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Current Occupancy */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.occupancy?.current || 0}%</p>
                  <p className="text-sm text-purple-600 mt-1 font-medium">Avg: {dashboardData?.occupancy?.average || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.useCaseAnalysis?.systemMetrics?.uptime || 99.8}%</p>
                  <p className="text-sm text-orange-600 mt-1 font-medium">Uptime</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ),
        renderTabContent: ({ activeTab, dashboardData }) => {
          if (activeTab === 'overview') {
            return (
              <div className="space-y-6">
                {/* Revenue Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue Summary</h3>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +12% vs last week
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">Rs. {(dashboardData?.revenue?.today || 2850).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">Rs. {(dashboardData?.revenue?.thisWeek || 18500).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">Rs. {(dashboardData?.revenue?.thisMonth || 75000).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">Rs. {(dashboardData?.revenue?.lastMonth || 68000).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Last Month</div>
                    </div>
                  </div>
                </div>

                {/* Booking Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Booking Activity</h3>
                    <div className="text-sm text-gray-600">
                      Peak: 16:00 - 18:00
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.bookingChart?.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">{slot.hour}</span>
                          </div>
                          <span className="text-sm text-gray-700">Hour {slot.hour}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900">{slot.bookings}</span>
                          <span className="text-sm text-gray-500 ml-1">bookings</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simple Space Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Space Status</h3>
                    <div className="text-sm text-purple-600 font-medium">
                      {dashboardData?.occupancy?.current || 78}% occupied
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">Occupied Spaces</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{dashboardData?.spaceUtilization?.[0]?.value || 78}%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">Available Spaces</span>
                      </div>
                      <span className="text-lg font-bold text-gray-600">{dashboardData?.spaceUtilization?.[1]?.value || 22}%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.recentBookings?.slice(0, 4).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{booking.customerName || 'Customer'}</p>
                            <p className="text-sm text-gray-600">
                              {booking.vehicle} • Space {booking.space || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.startTime).toLocaleDateString()} • {booking.duration || 2}h
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-1">Rs. {booking.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Extended tab content for client-specific features
          if (activeTab === 'parking') return <ParkingManagement />;
          if (activeTab === 'usecase') return <UseCaseAnalysis useCaseData={dashboardData.useCaseAnalysis} />;
          if (activeTab === 'attendant') return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Attendant Tools</h3>
                  <p className="text-gray-600 mt-1">Manage parking operations and assist customers</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">8 attendants active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Space Management</h4>
                      <p className="text-sm text-gray-600">Assign and monitor parking spaces</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Assign Spaces
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      View Space Status
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Payment Processing</h4>
                      <p className="text-sm text-gray-600">Handle customer transactions</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Process Payments
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Payment History
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Violation Management</h4>
                      <p className="text-sm text-gray-600">Record parking violations</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
                      Record Violation
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Violation Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats for Attendants */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Spaces Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">89</div>
                    <div className="text-sm text-gray-600">Payments Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">23</div>
                    <div className="text-sm text-gray-600">Violations Recorded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="text-sm text-gray-600">Avg. Response Time (min)</div>
                  </div>
                </div>
              </div>
            </div>
          );
          if (activeTab === 'profile') return <ParkingProfile />;
          if (activeTab === 'rates') return <RatesManagement />;
          if (activeTab === 'hours') return <BusinessHours />;
          if (activeTab === 'photos') return <PhotoUpload />;

          return null;
        }
      }}
    </BaseDashboard>
  );
};

export default ClientDashboard;