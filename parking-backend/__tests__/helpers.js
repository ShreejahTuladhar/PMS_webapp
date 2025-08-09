const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
const Booking = require('../models/Booking');

const createTestUser = async (userData = {}) => {
  const defaultData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+1234567890',
    role: 'customer',
  };

  return await User.create({ ...defaultData, ...userData });
};

const createTestLocation = async (locationData = {}) => {
  const defaultData = {
    name: 'Test Parking Location',
    address: '123 Test St, Test City, Test State',
    coordinates: {
      latitude: 27.7172,
      longitude: 85.3240,
    },
    totalSpaces: 2,
    availableSpaces: 2,
    hourlyRate: 100,
    operatingHours: {
      start: '06:00',
      end: '22:00',
    },
    spaces: [
      {
        spaceId: 'A1',
        level: 'Ground',
        section: 'A',
        status: 'available',
        supportedVehicles: ['car'],
        dimensions: { length: 5, width: 2.5 },
      },
      {
        spaceId: 'A2',
        level: 'Ground',
        section: 'A',
        status: 'available',
        supportedVehicles: ['car'],
        dimensions: { length: 5, width: 2.5 },
      },
    ],
    amenities: ['cctv', 'security_guard'],
    contactInfo: {
      phone: '+1234567890',
      email: 'test@parking.com',
    }
  };

  return await ParkingLocation.create({ ...defaultData, ...locationData });
};

const createTestBooking = async (bookingData = {}, user = null, location = null) => {
  if (!user) {
    user = await createTestUser();
  }
  if (!location) {
    location = await createTestLocation();
  }

  const defaultData = {
    userId: user._id,
    locationId: location._id,
    spaceId: 'A1',
    vehicleInfo: {
      plateNumber: 'ABC123',
      vehicleType: 'car',
      make: 'Toyota',
      model: 'Camry',
    },
    startTime: new Date(Date.now() + 60000), // 1 minute from now
    endTime: new Date(Date.now() + 3660000), // 1 hour 1 minute from now
    totalAmount: 100,
    paymentMethod: 'cash',
    status: 'confirmed',
    paymentStatus: 'completed',
  };

  return await Booking.create({ ...defaultData, ...bookingData });
};

const generateJWT = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1d' });
};

module.exports = {
  createTestUser,
  createTestLocation,
  createTestBooking,
  generateJWT,
};