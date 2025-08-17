import { useState, useEffect } from 'react';
import { bookingService } from '../../../services';

const DigitalTicketModal = ({ isOpen, onClose, bookingId = null }) => {
  const [activeBooking, setActiveBooking] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadActiveBooking();
    }
  }, [isOpen, bookingId]);

  const loadActiveBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      let booking = null;

      if (bookingId) {
        // Load specific booking
        const response = await bookingService.getBookingById(bookingId);
        booking = response.booking;
      } else {
        // Load most recent active booking
        const response = await bookingService.getBookings({ 
          status: 'active,confirmed', 
          limit: 1,
          sortBy: 'startTime',
          sortOrder: 'desc'
        });
        booking = response.bookings?.[0];
      }

      if (booking) {
        setActiveBooking(booking);
        
        // Generate QR code data (using a simple web-based QR generator)
        const qrData = `PARKING:${booking.id}:${booking.vehicleInfo?.plateNumber}:${booking.verificationCode || 'PARK' + booking.id.slice(-4).toUpperCase()}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        
        setQrCodeUrl(qrUrl);
      } else {
        setError('No active parking session found');
      }
    } catch (err) {
      console.error('Error loading active booking:', err);
      setError('Failed to load parking ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleExtendParking = () => {
    // Implementation for extending parking time
    alert('Extend parking feature coming soon!');
  };

  const handleEndParking = () => {
    if (window.confirm('Are you sure you want to end your parking session?')) {
      // Implementation for ending parking
      alert('End parking feature coming soon!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Digital Parking Ticket</h2>
              <p className="text-blue-100 text-sm">Mobile Parking Pass</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your parking ticket...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Parking</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          ) : activeBooking ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeBooking.status)}`}>
                  <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                  {activeBooking.status.charAt(0).toUpperCase() + activeBooking.status.slice(1)} Parking
                </span>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Parking QR Code" className="w-40 h-40 mx-auto" />
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">Scan at entry/exit gates</p>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{activeBooking.locationName || 'Parking Location'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{activeBooking.vehicleInfo?.plateNumber || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">{formatTime(activeBooking.startTime)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">{formatTime(activeBooking.endTime)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">Rs. {activeBooking.totalAmount}</span>
                </div>

                {activeBooking.verificationCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono font-bold text-lg">{activeBooking.verificationCode}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleExtendParking}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🕐 Extend Parking Time
                </button>
                
                <button
                  onClick={handleEndParking}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  🚗 End Parking Session
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📱 How to use:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Present QR code at entry gate</li>
                  <li>• Keep this ticket accessible during parking</li>
                  <li>• Scan QR code at exit gate when leaving</li>
                  <li>• Use verification code if QR fails</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketModal;