import { apiHelpers } from './api';

class BookingService {
  async createBooking(bookingData) {
    try {
      const result = await apiHelpers.post('/bookings', bookingData);
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          message: result.data.message || 'Booking created successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  }

  async getBookings(params = {}) {
    try {
      const result = await apiHelpers.get('/bookings', { params });
      
      if (result.success) {
        return {
          success: true,
          bookings: result.data.bookings,
          pagination: result.data.pagination,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch bookings',
      };
    }
  }

  async getBookingById(bookingId) {
    try {
      const result = await apiHelpers.get(`/bookings/${bookingId}`);
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch booking',
      };
    }
  }

  async updateBooking(bookingId, updateData) {
    try {
      const result = await apiHelpers.put(`/bookings/${bookingId}`, updateData);
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          message: result.data.message || 'Booking updated successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update booking',
      };
    }
  }

  async cancelBooking(bookingId, reason = '') {
    try {
      const result = await apiHelpers.patch(`/bookings/${bookingId}/cancel`, { reason });
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          message: result.data.message || 'Booking cancelled successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to cancel booking',
      };
    }
  }

  async completeBooking(bookingId) {
    try {
      const result = await apiHelpers.patch(`/bookings/${bookingId}/complete`);
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          message: result.data.message || 'Booking completed successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to complete booking',
      };
    }
  }

  async verifyPayment(bookingId, paymentData) {
    try {
      const result = await apiHelpers.post(`/bookings/${bookingId}/payment/verify`, paymentData);
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          payment: result.data.payment,
          message: result.data.message || 'Payment verified successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to verify payment',
      };
    }
  }

  async getBookingQR(bookingId) {
    try {
      const result = await apiHelpers.get(`/bookings/${bookingId}/qr`);
      
      if (result.success) {
        return {
          success: true,
          qrCode: result.data.qrCode,
          qrData: result.data.qrData,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate QR code',
      };
    }
  }

  async extendBooking(bookingId, additionalTime) {
    try {
      const result = await apiHelpers.patch(`/bookings/${bookingId}/extend`, {
        additionalTime,
      });
      
      if (result.success) {
        return {
          success: true,
          booking: result.data.booking,
          additionalCost: result.data.additionalCost,
          message: result.data.message || 'Booking extended successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to extend booking',
      };
    }
  }

  async getBookingHistory(params = {}) {
    try {
      const result = await apiHelpers.get('/bookings/history', { params });
      
      if (result.success) {
        return {
          success: true,
          bookings: result.data.bookings,
          pagination: result.data.pagination,
          statistics: result.data.statistics,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch booking history',
      };
    }
  }

  async checkAvailability(locationId, startTime, endTime, vehicleType) {
    try {
      const result = await apiHelpers.get('/bookings/availability', {
        params: {
          locationId,
          startTime,
          endTime,
          vehicleType,
        },
      });
      
      if (result.success) {
        return {
          success: true,
          available: result.data.available,
          availableSpots: result.data.availableSpots,
          conflictingBookings: result.data.conflictingBookings,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to check availability',
      };
    }
  }
}

export default new BookingService();