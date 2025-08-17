const mongoose = require('mongoose');

const parkingLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  totalSpaces: {
    type: Number,
    required: true,
    min: 0
  },
  availableSpaces: {
    type: Number,
    min: 0
  },
  rates: {
    hourly: Number,
    daily: Number
  },
  operatingHours: {
    open: String,
    close: String,
    is24Hours: Boolean
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParkingLocation', parkingLocationSchema);