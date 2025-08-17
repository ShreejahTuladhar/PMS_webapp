const ParkingLocation = require('../models/ParkingLocation');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get all parking locations with advanced search
// @route   GET /api/locations
// @access  Public
const getParkingLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      available,
      latitude,
      longitude,
      maxDistance = 5000,
      spaceType,
      priceRange,
      amenities,
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { isActive: true };
    let sort = { name: 1 };
    let searchCenter = null;

    // Enhanced search functionality
    if (search) {
      const searchTerm = search.trim();
      let matchingLocation = null;
      
      // Strategy 1: Try area name search in address field first
      const addressRegex = new RegExp(`^${searchTerm}`, 'i');
      matchingLocation = await ParkingLocation.findOne({
        isActive: true,
        address: addressRegex
      });
      
      // Strategy 2: If no exact address match, try partial address matching
      if (!matchingLocation) {
        matchingLocation = await ParkingLocation.findOne({
          isActive: true,
          address: { $regex: searchTerm, $options: "i" }
        });
      }
      
      // Strategy 3: If no address match, try exact prefix match in name field
      if (!matchingLocation) {
        const prefixRegex = new RegExp(`^${searchTerm}`, 'i');
        matchingLocation = await ParkingLocation.findOne({
          isActive: true,
          name: prefixRegex
        });
      }
      
      if (matchingLocation) {
        // Handle both GeoJSON and lat/lon coordinate formats
        let lat, lon;
        const coords = matchingLocation.get('coordinates');
        if (coords && coords.type === 'Point' && Array.isArray(coords.coordinates)) {
          lon = coords.coordinates[0];
          lat = coords.coordinates[1];
        } else if (coords && coords.latitude && coords.longitude) {
          lat = coords.latitude;
          lon = coords.longitude;
        } else {
          lat = matchingLocation.latitude || matchingLocation.get('latitude');
          lon = matchingLocation.longitude || matchingLocation.get('longitude');
        }
        
        searchCenter = {
          latitude: lat,
          longitude: lon,
          foundLocation: matchingLocation
        };
        console.log(`🎯 Found search center for "${searchTerm}": ${matchingLocation.name} at ${matchingLocation.address} (${lat}, ${lon})`);
      } else {
        // Fallback to regular text search
        filter.$or = [
          { address: { $regex: searchTerm, $options: "i" } },
          { name: { $regex: searchTerm, $options: "i" } },
        ];
        console.log(`🔍 Using fallback text search for "${searchTerm}"`);
      }
    }

    // Filter by availability
    if (available === "true") {
      filter.availableSpaces = { $gt: 0 };
      filter.currentStatus = "open";
    }

    // Filter by specific space type availability
    if (spaceType) {
      filter[`spaces.type`] = spaceType;
      filter[`spaces.status`] = "available";
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (minPrice) filter.hourlyRate = { $gte: minPrice };
      if (maxPrice) filter.hourlyRate = { ...filter.hourlyRate, $lte: maxPrice };
    }

    // Filter by amenities
    if (amenities) {
      const amenityList = amenities.split(",");
      filter.amenities = { $in: amenityList };
    }

    let query = ParkingLocation.find(filter);

    // Geolocation-based search
    if (searchCenter || (latitude && longitude)) {
      const searchLat = searchCenter ? searchCenter.latitude : parseFloat(latitude);
      const searchLon = searchCenter ? searchCenter.longitude : parseFloat(longitude);
      
      const allResults = await ParkingLocation.find({ ...filter });
      const maxDistanceKm = parseInt(maxDistance) / 1000;
      
      const nearbyResults = allResults.filter(location => {
        let lat, lon;
        const coords = location.toObject().coordinates;
        if (coords && coords.type === 'Point' && Array.isArray(coords.coordinates)) {
          lon = coords.coordinates[0];
          lat = coords.coordinates[1];
        } else if (coords && coords.latitude && coords.longitude) {
          lat = coords.latitude;
          lon = coords.longitude;
        } else {
          lat = location.latitude;
          lon = location.longitude;
        }
        
        const distance = calculateDistance(searchLat, searchLon, lat, lon) / 1000;
        return distance <= maxDistanceKm;
      }).sort((a, b) => {
        let latA, lonA, latB, lonB;
        const coordsA = a.toObject().coordinates;
        const coordsB = b.toObject().coordinates;
        
        if (coordsA && coordsA.type === 'Point') {
          lonA = coordsA.coordinates[0];
          latA = coordsA.coordinates[1];
        } else {
          latA = a.latitude;
          lonA = a.longitude;
        }
        
        if (coordsB && coordsB.type === 'Point') {
          lonB = coordsB.coordinates[0];
          latB = coordsB.coordinates[1];
        } else {
          latB = b.latitude;
          lonB = b.longitude;
        }
        
        const distanceA = calculateDistance(searchLat, searchLon, latA, lonA);
        const distanceB = calculateDistance(searchLat, searchLon, latB, lonB);
        return distanceA - distanceB;
      });
      
      const nearbyIds = nearbyResults.map(loc => loc._id);
      query = ParkingLocation.find({ _id: { $in: nearbyIds } });
      sort = {};
    }

    // Apply sorting, pagination, and select fields
    const locations = await query
      .select("-spaces")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parkingOwnerId", "firstName lastName email phoneNumber");

    // Get total count for pagination
    const total = await ParkingLocation.countDocuments(filter);

    // Add computed fields
    const searchLat = searchCenter ? searchCenter.latitude : (latitude ? parseFloat(latitude) : null);
    const searchLon = searchCenter ? searchCenter.longitude : (longitude ? parseFloat(longitude) : null);
    
    const enhancedLocations = locations.map((location) => {
      let distance = null;
      let transformedCoordinates = null;
      
      let lat, lon;
      const coords = location.toObject().coordinates;
      if (coords && coords.type === 'Point' && Array.isArray(coords.coordinates)) {
        lon = coords.coordinates[0];
        lat = coords.coordinates[1];
      } else if (coords && coords.latitude && coords.longitude) {
        lat = coords.latitude;
        lon = coords.longitude;
      } else {
        lat = location.latitude;
        lon = location.longitude;
      }
      
      if (lat && lon) {
        transformedCoordinates = { lat: lat, lng: lon };
        if (searchLat && searchLon) {
          distance = calculateDistance(searchLat, searchLon, lat, lon);
        }
      }
      
      const locationObj = location.toObject();
      return {
        ...locationObj,
        coordinates: transformedCoordinates,
        distance,
        isCurrentlyOpen: location.isCurrentlyOpen(),
        occupancyPercentage: location.occupancyPercentage,
        availableSpaceTypes: location.availableSpaceTypes,
        discountedRate: location.discountedRate,
        thumbnail: location.images && location.images.length > 0 ? location.images[0] : "/images/default-parking.jpg",
      };
    });

    res.json({
      success: true,
      count: locations.length,
      searchInfo: {
        searchTerm: search,
        searchCenter: searchCenter ? {
          latitude: searchCenter.latitude,
          longitude: searchCenter.longitude,
          foundLocation: {
            id: searchCenter.foundLocation._id,
            name: searchCenter.foundLocation.name,
            address: searchCenter.foundLocation.address
          }
        } : null,
        radius: parseInt(maxDistance),
        radiusKm: (parseInt(maxDistance) / 1000).toFixed(1)
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: enhancedLocations,
    });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving parking locations",
      error: error.message,
    });
  }
};

// @desc    Get single parking location by ID
// @route   GET /api/locations/:id
// @access  Public
const getLocationById = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id).populate(
      "parkingOwnerId",
      "firstName lastName email phoneNumber"
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    if (!location.isActive) {
      return res.status(404).json({
        success: false,
        message: "Parking location is currently unavailable",
      });
    }

    // Get current active bookings for this location
    const activeBookings = await Booking.find({
      locationId: location._id,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    }).select("spaceId startTime endTime");

    // Mark spaces as occupied if they have active bookings
    const enhancedSpaces = location.spaces.map((space) => {
      const hasActiveBooking = activeBookings.some(
        (booking) => booking.spaceId === space.spaceId
      );
      return {
        ...space.toObject(),
        hasActiveBooking,
        actualStatus: hasActiveBooking ? "occupied" : space.status,
      };
    });

    // Transform coordinates to frontend-expected format
    let transformedCoordinates = null;
    const coords = location.toObject().coordinates;
    if (coords && coords.type === 'Point' && Array.isArray(coords.coordinates)) {
      transformedCoordinates = {
        lat: coords.coordinates[1],
        lng: coords.coordinates[0]
      };
    } else if (coords && coords.latitude && coords.longitude) {
      transformedCoordinates = {
        lat: coords.latitude,
        lng: coords.longitude
      };
    } else if (location.latitude && location.longitude) {
      transformedCoordinates = {
        lat: location.latitude,
        lng: location.longitude
      };
    }

    const locationObj = location.toObject();
    const enhancedLocation = {
      ...locationObj,
      coordinates: transformedCoordinates,
      spaces: enhancedSpaces,
      isCurrentlyOpen: location.isCurrentlyOpen(),
      occupancyPercentage: location.occupancyPercentage,
      availableSpaceTypes: location.availableSpaceTypes,
      activeBookingsCount: activeBookings.length,
      discountedRate: location.discountedRate,
      thumbnail: location.images && location.images.length > 0 ? location.images[0] : "/images/default-parking.jpg",
    };

    res.json({
      success: true,
      data: enhancedLocation,
    });
  } catch (error) {
    console.error("Get location by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error retrieving parking location",
      error: error.message,
    });
  }
};

// @desc    Create new parking location
// @route   POST /api/locations
// @access  Private (Super Admin only)
const createLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const locationData = {
      ...req.body,
      parkingOwnerId: req.body.parkingOwnerId || req.user.id,
    };

    // Generate spaces if not provided
    if (!locationData.spaces || locationData.spaces.length === 0) {
      locationData.spaces = generateSpaces(locationData.totalSpaces);
    }

    // Set initial available spaces
    locationData.availableSpaces = locationData.spaces.filter(
      (s) => s.status === "available"
    ).length;

    const location = new ParkingLocation(locationData);
    await location.save();

    res.status(201).json({
      success: true,
      message: "Parking location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Create location error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A location with similar details already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating parking location",
      error: error.message,
    });
  }
};

// @desc    Update parking location
// @route   PUT /api/locations/:id
// @access  Private (Super Admin or assigned Parking Admin)
const updateLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const location = await ParkingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions
    if (req.user && req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this location",
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        location[key] = req.body[key];
      }
    });

    await location.save();

    res.json({
      success: true,
      message: "Parking location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating parking location",
      error: error.message,
    });
  }
};

// @desc    Delete parking location (soft delete)
// @route   DELETE /api/locations/:id
// @access  Private (Super Admin only)
const deleteLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      locationId: location._id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete location - ${activeBookings} active bookings exist`,
      });
    }

    // Soft delete
    location.isActive = false;
    location.currentStatus = "closed";
    await location.save();

    res.json({
      success: true,
      message: "Parking location deactivated successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting parking location",
      error: error.message,
    });
  }
};

// @desc    Update space status
// @route   PUT /api/locations/:id/spaces/:spaceId/status
// @access  Private (Super Admin or assigned Parking Admin)
const updateSpaceStatus = async (req, res) => {
  try {
    const { id: locationId, spaceId } = req.params;
    const { status, reason } = req.body;

    const location = await ParkingLocation.findById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions for parking admin
    if (req.user && req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update spaces in this location",
        });
      }
    }

    // Check if space has active booking
    const activeBooking = await Booking.findOne({
      locationId,
      spaceId,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    });

    if (activeBooking && status === "maintenance") {
      return res.status(400).json({
        success: false,
        message: "Cannot set space to maintenance - active booking exists",
        booking: activeBooking._id,
      });
    }

    // Update space status
    await location.updateSpaceStatus(spaceId, status);

    res.json({
      success: true,
      message: "Space status updated successfully",
      data: {
        locationId,
        spaceId,
        newStatus: status,
        reason,
        availableSpaces: location.availableSpaces,
        updatedBy: req.user ? req.user.id : 'system',
      },
    });
  } catch (error) {
    console.error("Update space status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating space status",
      error: error.message,
    });
  }
};

// Helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000); // Distance in meters
};

const generateSpaces = (totalSpaces) => {
  const spaces = [];
  for (let i = 1; i <= totalSpaces; i++) {
    const level = Math.ceil(i / 20);
    const section = String.fromCharCode(65 + Math.floor((i - 1) / 20));

    let spaceType = "regular";
    if (i <= Math.floor(totalSpaces * 0.05)) spaceType = "handicapped";
    else if (i <= Math.floor(totalSpaces * 0.15)) spaceType = "ev-charging";
    else if (i <= Math.floor(totalSpaces * 0.2)) spaceType = "reserved";

    spaces.push({
      spaceId: `${section}${String(i).padStart(3, "0")}`,
      type: spaceType,
      status: "available",
      level: level.toString(),
      section: section,
    });
  }
  return spaces;
};

module.exports = {
  getParkingLocations,
  getLocationById,
  createLocation,
  updateLocation,
  updateSpaceStatus,
  deleteLocation,
};