const BookingService = require('../../services/bookingService');
const Booking = require('../../models/Booking');
const ParkingLocation = require('../../models/ParkingLocation');
const { createTestUser, createTestLocation, createTestBooking } = require('../helpers');

describe('BookingService', () => {
  describe('validateBookingRequest', () => {
    it('should validate a valid booking request', async () => {
      const location = await createTestLocation();
      const startTime = new Date(Date.now() + 60000); // 1 minute from now
      const endTime = new Date(Date.now() + 3660000); // 1 hour 1 minute from now

      const result = await BookingService.validateBookingRequest(
        location._id,
        'A1',
        startTime,
        endTime
      );

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('space');
      expect(result).toHaveProperty('bookingStart');
      expect(result).toHaveProperty('bookingEnd');
    });

    it('should throw error for non-existent location', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const startTime = new Date(Date.now() + 60000);
      const endTime = new Date(Date.now() + 3660000);

      await expect(
        BookingService.validateBookingRequest(nonExistentId, 'A1', startTime, endTime)
      ).rejects.toThrow('Parking location not found or inactive');
    });

    it('should throw error for inactive location', async () => {
      const location = await createTestLocation({ isActive: false });
      const startTime = new Date(Date.now() + 60000);
      const endTime = new Date(Date.now() + 3660000);

      await expect(
        BookingService.validateBookingRequest(location._id, 'A1', startTime, endTime)
      ).rejects.toThrow('Parking location not found or inactive');
    });

    it('should throw error for non-existent space', async () => {
      const location = await createTestLocation();
      const startTime = new Date(Date.now() + 60000);
      const endTime = new Date(Date.now() + 3660000);

      await expect(
        BookingService.validateBookingRequest(location._id, 'NONEXISTENT', startTime, endTime)
      ).rejects.toThrow('Parking space not found');
    });

    it('should throw error for occupied space', async () => {
      const location = await createTestLocation();
      // Manually set space status to occupied
      location.spaces[0].status = 'occupied';
      await location.save();

      const startTime = new Date(Date.now() + 60000);
      const endTime = new Date(Date.now() + 3660000);

      await expect(
        BookingService.validateBookingRequest(location._id, 'A1', startTime, endTime)
      ).rejects.toThrow('Parking space is occupied');
    });

    it('should throw error for past start time', async () => {
      const location = await createTestLocation();
      const startTime = new Date(Date.now() - 60000); // 1 minute ago
      const endTime = new Date(Date.now() + 3600000);

      await expect(
        BookingService.validateBookingRequest(location._id, 'A1', startTime, endTime)
      ).rejects.toThrow('Start time must be in the future');
    });

    it('should throw error when end time is before start time', async () => {
      const location = await createTestLocation();
      const startTime = new Date(Date.now() + 3660000); // 1 hour 1 minute from now
      const endTime = new Date(Date.now() + 60000); // 1 minute from now

      await expect(
        BookingService.validateBookingRequest(location._id, 'A1', startTime, endTime)
      ).rejects.toThrow('End time must be after start time');
    });
  });

  describe('checkConflictingBookings', () => {
    it('should pass when no conflicting bookings exist', async () => {
      const location = await createTestLocation();
      const user = await createTestUser();

      const startTime = new Date(Date.now() + 60000);
      const endTime = new Date(Date.now() + 3660000);

      const result = await BookingService.checkConflictingBookings(
        location._id,
        'A1',
        startTime,
        endTime
      );

      expect(result).toBe(true);
    });

    it('should throw error when conflicting booking exists', async () => {
      const location = await createTestLocation();
      const user = await createTestUser();

      // Create a conflicting booking
      await createTestBooking({
        locationId: location._id,
        spaceId: 'A1',
        startTime: new Date(Date.now() + 30000), // 30 seconds from now
        endTime: new Date(Date.now() + 3630000), // 1 hour 30 seconds from now
        status: 'confirmed'
      }, user, location);

      const startTime = new Date(Date.now() + 60000); // 1 minute from now
      const endTime = new Date(Date.now() + 3660000); // 1 hour 1 minute from now

      await expect(
        BookingService.checkConflictingBookings(location._id, 'A1', startTime, endTime)
      ).rejects.toThrow('Time slot conflicts with existing booking');
    });
  });

  describe('calculateBookingAmount', () => {
    it('should calculate correct amount for whole hours', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T12:00:00Z');
      const hourlyRate = 100;

      const amount = BookingService.calculateBookingAmount(startTime, endTime, hourlyRate);
      expect(amount).toBe(200); // 2 hours * 100
    });

    it('should round up partial hours', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:30:00Z'); // 30 minutes
      const hourlyRate = 100;

      const amount = BookingService.calculateBookingAmount(startTime, endTime, hourlyRate);
      expect(amount).toBe(100); // Rounded up to 1 hour * 100
    });
  });

  describe('generateQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const bookingData = {
        locationId: '507f1f77bcf86cd799439011',
        spaceId: 'A1',
        userId: '507f1f77bcf86cd799439012',
      };

      const qrCode = await BookingService.generateQRCode(bookingData);
      
      expect(qrCode).toBeDefined();
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const user = await createTestUser();
      const location = await createTestLocation();

      const bookingData = {
        userId: user._id,
        locationId: location._id,
        spaceId: 'A1',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car',
          make: 'Toyota',
          model: 'Camry'
        },
        startTime: new Date(Date.now() + 60000),
        endTime: new Date(Date.now() + 3660000),
        paymentMethod: 'cash',
        totalAmount: 100,
        notes: 'Test booking'
      };

      const booking = await BookingService.createBooking(bookingData);

      expect(booking).toBeDefined();
      expect(booking.userId.toString()).toBe(user._id.toString());
      expect(booking.locationId.toString()).toBe(location._id.toString());
      expect(booking.spaceId).toBe('A1');
      expect(booking.vehicleInfo.plateNumber).toBe('ABC123');
      expect(booking.paymentMethod).toBe('cash');
      expect(booking.status).toBe('confirmed');
      expect(booking.paymentStatus).toBe('completed');
    });

    it('should create pending booking for non-cash payment', async () => {
      const user = await createTestUser();
      const location = await createTestLocation();

      const bookingData = {
        userId: user._id,
        locationId: location._id,
        spaceId: 'A1',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car'
        },
        startTime: new Date(Date.now() + 60000),
        endTime: new Date(Date.now() + 3660000),
        paymentMethod: 'paypal',
        totalAmount: 100
      };

      const booking = await BookingService.createBooking(bookingData);

      expect(booking.status).toBe('pending');
      expect(booking.paymentStatus).toBe('pending');
    });
  });

  describe('calculateCancellationRefund', () => {
    it('should return 100% refund for cancellation more than 24 hours before', async () => {
      const booking = {
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
        totalAmount: 100,
        paymentStatus: 'completed'
      };

      const { refundAmount, refundPercentage } = BookingService.calculateCancellationRefund(booking);

      expect(refundPercentage).toBe(100);
      expect(refundAmount).toBe(100);
    });

    it('should return 50% refund for cancellation between 2-24 hours before', async () => {
      const booking = {
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        totalAmount: 100,
        paymentStatus: 'completed'
      };

      const { refundAmount, refundPercentage } = BookingService.calculateCancellationRefund(booking);

      expect(refundPercentage).toBe(50);
      expect(refundAmount).toBe(50);
    });

    it('should return 0% refund for cancellation less than 2 hours before', async () => {
      const booking = {
        startTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        totalAmount: 100,
        paymentStatus: 'completed'
      };

      const { refundAmount, refundPercentage } = BookingService.calculateCancellationRefund(booking);

      expect(refundPercentage).toBe(0);
      expect(refundAmount).toBe(0);
    });

    it('should return 0 refund for unpaid booking', async () => {
      const booking = {
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
        totalAmount: 100,
        paymentStatus: 'pending'
      };

      const { refundAmount, refundPercentage } = BookingService.calculateCancellationRefund(booking);

      expect(refundPercentage).toBe(100);
      expect(refundAmount).toBe(0);
    });
  });
});