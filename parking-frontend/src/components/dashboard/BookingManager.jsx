import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BookingManager = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active'); // active, history, all
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [extendDuration, setExtendDuration] = useState(1);
  const [filter, setFilter] = useState({ status: '', location: '', vehicle: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchBookings();
  }, [selectedTab, pagination.page, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filter.status && { status: filter.status }),
        ...(filter.location && { locationId: filter.location }),
      };

      // Filter by tab
      if (selectedTab === 'active') {
        params.status = 'confirmed,active,pending';
      } else if (selectedTab === 'history') {
        params.status = 'completed,cancelled,expired';
      }

      const response = await api.get('/users/bookings', { params });
      
      if (response.data.success) {
        setBookings(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await api.put(`/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason
      });

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleExtendBooking = async () => {
    if (!selectedBooking) return;

    try {
      const currentEndTime = new Date(selectedBooking.endTime);
      const newEndTime = new Date(currentEndTime.getTime() + extendDuration * 60 * 60 * 1000);

      const response = await api.put(`/bookings/${selectedBooking._id}/extend`, {
        newEndTime: newEndTime.toISOString()
      });

      if (response.data.success) {
        toast.success('Booking extended successfully');
        setShowExtendModal(false);
        setExtendDuration(1);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Error extending booking:', error);
      toast.error('Failed to extend booking');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelBooking = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    return ['pending', 'confirmed'].includes(booking.status) && startTime > now;
  };

  const canExtendBooking = (booking) => {
    const now = new Date();
    const endTime = new Date(booking.endTime);
    return booking.status === 'active' || 
           (booking.status === 'confirmed' && now >= new Date(booking.startTime));
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter.vehicle && !booking.vehicleInfo.plateNumber.toLowerCase().includes(filter.vehicle.toLowerCase())) {
      return false;
    }
    return true;
  });

  const tabs = [
    { id: 'active', label: 'Active Bookings', count: bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)).length },
    { id: 'history', label: 'History', count: bookings.filter(b => ['completed', 'cancelled', 'expired'].includes(b.status)).length },
    { id: 'all', label: 'All Bookings', count: bookings.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Manager</h2>
          <p className="text-gray-600">Manage your parking bookings and reservations</p>
        </div>
        <div className="text-sm text-gray-500">
          Welcome, {user?.firstName || 'User'}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Filter</label>
            <input
              type="text"
              placeholder="Search by plate number..."
              value={filter.vehicle}
              onChange={(e) => setFilter(prev => ({ ...prev, vehicle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', location: '', vehicle: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">You don't have any bookings matching the current filters.</p>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const startDateTime = formatDateTime(booking.startTime);
            const endDateTime = formatDateTime(booking.endTime);
            
            return (
              <div key={booking._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Booking Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Booking #{booking._id.slice(-8)}
                        </span>
                      </div>

                      {/* Location & Vehicle Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                          <p className="text-sm text-gray-600">{booking.locationId?.name || 'Parking Location'}</p>
                          <p className="text-sm text-gray-500">Space: {booking.spaceId}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Vehicle</h4>
                          <p className="text-sm text-gray-600">
                            {booking.vehicleInfo.plateNumber} • {booking.vehicleInfo.vehicleType}
                          </p>
                        </div>
                      </div>

                      {/* Time & Duration */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Start:</span>
                          <p className="font-medium">{startDateTime.date}</p>
                          <p className="text-gray-600">{startDateTime.time}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">End:</span>
                          <p className="font-medium">{endDateTime.date}</p>
                          <p className="text-gray-600">{endDateTime.time}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium text-green-600">Rs. {booking.totalAmount}</p>
                          <p className="text-gray-600">{booking.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {canExtendBooking(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowExtendModal(true);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        >
                          Extend
                        </button>
                      )}

                      {booking.qrCode && (
                        <button
                          onClick={() => {
                            // Show QR code modal
                            toast.success('QR Code feature coming soon!');
                          }}
                          className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                        >
                          QR Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extend Booking</h3>
              <p className="text-gray-600 mb-4">
                How many additional hours would you like to extend your booking?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Hours
                </label>
                <select
                  value={extendDuration}
                  onChange={(e) => setExtendDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 12].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} {hours === 1 ? 'hour' : 'hours'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowExtendModal(false);
                    setExtendDuration(1);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendBooking}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Extend Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;