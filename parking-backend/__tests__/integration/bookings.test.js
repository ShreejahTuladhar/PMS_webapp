const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createTestUser, createTestLocation, createTestBooking, generateJWT } = require('../helpers');

// Mock socket manager to avoid socket.io dependency issues in tests
jest.mock('../../utils/socketManager', () => ({
  emitSpaceUpdate: jest.fn(),
  emitAvailabilityUpdate: jest.fn(),
  emitBookingUpdate: jest.fn(),
  emitUserNotification: jest.fn(),
}));

describe('Bookings API Integration Tests', () => {
  let user, location, authToken;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    user = await createTestUser();
    location = await createTestLocation();
    authToken = generateJWT(user._id);
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        locationId: location._id,
        spaceId: 'A1',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car',
          make: 'Toyota',
          model: 'Camry',
        },
        startTime: new Date(Date.now() + 60000).toISOString(),
        endTime: new Date(Date.now() + 3660000).toISOString(),
        paymentMethod: 'cash',
        notes: 'Test booking',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.spaceId).toBe('A1');
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.qrCode).toBeDefined();
    });

    it('should return error without authentication', async () => {
      const bookingData = {
        locationId: location._id,
        spaceId: 'A1',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car',
        },
        startTime: new Date(Date.now() + 60000).toISOString(),
        endTime: new Date(Date.now() + 3660000).toISOString(),
        paymentMethod: 'cash',
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should return error for non-existent location', async () => {
      const nonExistentLocationId = new mongoose.Types.ObjectId();
      const bookingData = {
        locationId: nonExistentLocationId,
        spaceId: 'A1',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car',
        },
        startTime: new Date(Date.now() + 60000).toISOString(),
        endTime: new Date(Date.now() + 3660000).toISOString(),
        paymentMethod: 'cash',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Parking location not found or inactive');
    });

    it('should return error for non-existent space', async () => {
      const bookingData = {
        locationId: location._id,
        spaceId: 'NONEXISTENT',
        vehicleInfo: {
          plateNumber: 'ABC123',
          vehicleType: 'car',
        },
        startTime: new Date(Date.now() + 60000).toISOString(),
        endTime: new Date(Date.now() + 3660000).toISOString(),
        paymentMethod: 'cash',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Parking space not found');
    });
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      // Create some test bookings
      await createTestBooking({}, user, location);
      await createTestBooking({
        spaceId: 'A2',
        startTime: new Date(Date.now() + 120000),
        endTime: new Date(Date.now() + 3720000),
      }, user, location);
    });

    it('should get user bookings successfully', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=confirmed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(booking => booking.status === 'confirmed')).toBe(true);
    });
  });

  describe('GET /api/bookings/:id', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking({}, user, location);
    });

    it('should get single booking successfully', async () => {
      const response = await request(app)
        .get(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(booking._id.toString());
      expect(response.body.data).toHaveProperty('durationHours');
      expect(response.body.data).toHaveProperty('isCurrentlyActive');
    });

    it('should return error for non-existent booking', async () => {
      const nonExistentBookingId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${nonExistentBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found');
    });

    it('should return error for other user booking', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherUserBooking = await createTestBooking({}, otherUser, location);
      
      const response = await request(app)
        .get(`/api/bookings/${otherUserBooking._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking({
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        status: 'confirmed',
        paymentStatus: 'completed',
      }, user, location);
    });

    it('should cancel booking successfully with full refund', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking cancelled successfully');
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.refund.eligible).toBe(true);
      expect(response.body.refund.percentage).toBe(100);
    });

    it('should return error for non-existent booking', async () => {
      const nonExistentBookingId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/bookings/${nonExistentBookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found');
    });

    it('should return error when trying to cancel other user booking', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser2',
        email: 'other2@example.com',
      });
      const otherUserBooking = await createTestBooking({}, otherUser, location);
      
      const response = await request(app)
        .put(`/api/bookings/${otherUserBooking._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You can only cancel your own bookings');
    });
  });

  describe('GET /api/bookings/available-slots', () => {
    it('should get available slots successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get(`/api/bookings/available-slots?locationId=${location._id}&spaceId=A1&date=${tomorrow.toISOString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.availableSlots).toBeDefined();
      expect(Array.isArray(response.body.data.availableSlots)).toBe(true);
      expect(response.body.data.spaceId).toBe('A1');
    });

    it('should return error for missing parameters', async () => {
      const response = await request(app)
        .get('/api/bookings/available-slots')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Location ID, space ID, and date are required');
    });

    it('should return error for non-existent location', async () => {
      const nonExistentLocationId = new mongoose.Types.ObjectId();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get(`/api/bookings/available-slots?locationId=${nonExistentLocationId}&spaceId=A1&date=${tomorrow.toISOString()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Location not found');
    });
  });
});