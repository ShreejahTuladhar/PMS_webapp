const ParkingLocation = require('../models/ParkingLocation');
const catchAsync = require('../utils/catchAsync');

exports.getParkingLocations = catchAsync(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  const locations = await ParkingLocation.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radius
      }
    },
    status: 'active'
  });

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});