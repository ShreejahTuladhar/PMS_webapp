const ParkingLocation = require("../models/ParkingLocation");

class LocationService {
  static async findAllLocations(filters = {}) {
    const {
      isActive = true,
      vehicleType,
      latitude,
      longitude,
      radius = 10,
      limit = 20,
      page = 1,
    } = filters;

    const skip = (page - 1) * limit;
    let query = { isActive };

    if (vehicleType) {
      query["spaces.supportedVehicles"] = vehicleType;
    }

    let locations;
    let total;

    if (latitude && longitude) {
      const aggregationPipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            distanceField: "distance",
            maxDistance: radius * 1000, // Convert km to meters
            spherical: true,
            query,
          },
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ];

      locations = await ParkingLocation.aggregate(aggregationPipeline);
      total = await ParkingLocation.countDocuments(query);
    } else {
      locations = await ParkingLocation.find(query)
        .skip(skip)
        .limit(parseInt(limit));
      total = await ParkingLocation.countDocuments(query);
    }

    return {
      locations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  static async findLocationById(locationId, includeSpaces = true) {
    let location;
    
    if (includeSpaces) {
      location = await ParkingLocation.findById(locationId);
    } else {
      location = await ParkingLocation.findById(locationId).select("-spaces");
    }

    if (!location) {
      throw new Error("Location not found");
    }

    return location;
  }

  static async updateSpaceStatus(locationId, spaceId, newStatus) {
    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    const space = location.spaces.find((s) => s.spaceId === spaceId);
    if (!space) {
      throw new Error("Space not found");
    }

    space.status = newStatus;
    space.lastUpdated = new Date();

    await location.save();
    return location;
  }

  static async getLocationAvailability(locationId) {
    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    const availability = {
      totalSpaces: location.totalSpaces,
      availableSpaces: location.availableSpaces,
      occupiedSpaces: location.occupiedSpaces,
      reservedSpaces: location.reservedSpaces,
      outOfOrderSpaces: location.outOfOrderSpaces,
      occupancyRate: location.occupancyRate,
      isCurrentlyOpen: location.isCurrentlyOpen(),
    };

    return availability;
  }

  static formatLocationResponse(location, includeSpaces = false) {
    const formatted = {
      id: location._id,
      name: location.name,
      address: location.address,
      coordinates: location.coordinates,
      hourlyRate: location.hourlyRate,
      operatingHours: location.operatingHours,
      totalSpaces: location.totalSpaces,
      availableSpaces: location.availableSpaces,
      occupancyRate: location.occupancyRate,
      isActive: location.isActive,
      amenities: location.amenities,
      contactInfo: location.contactInfo,
    };

    if (includeSpaces) {
      formatted.spaces = location.spaces;
    }

    if (location.distance !== undefined) {
      formatted.distance = Math.round(location.distance / 1000 * 100) / 100; // Convert to km and round
    }

    return formatted;
  }
}

module.exports = LocationService;