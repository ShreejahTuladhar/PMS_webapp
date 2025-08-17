const ParkingLocation = require("../models/ParkingLocation");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

// @desc    Get all parking locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      available,
      latitude,
      longitude,
      maxDistance = 5000, // Default to 5km for area searches
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
      
      // Strategy 1: Try area name search in address field first (highest priority for area searches)
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
      
      // Strategy 4: If still no match, try matching within the placename part of name
      if (!matchingLocation) {
        const locations = await ParkingLocation.find({
          isActive: true,
          name: { $regex: searchTerm, $options: "i" }
        });
        
        // Find location where search term appears in the placename part
        matchingLocation = locations.find(location => {
          const placename = location.name.split(',')[0].trim();
          return placename.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      if (matchingLocation) {
        // Handle both GeoJSON and lat/lon coordinate formats
        let lat, lon;
        const coords = matchingLocation.get('coordinates');
        if (coords && coords.type === 'Point' && Array.isArray(coords.coordinates)) {
          // GeoJSON format: { type: 'Point', coordinates: [longitude, latitude] }
          lon = coords.coordinates[0];
          lat = coords.coordinates[1];
        } else if (coords && coords.latitude && coords.longitude) {
          // Object format: { latitude: num, longitude: num }
          lat = coords.latitude;
          lon = coords.longitude;
        } else {
          // Fallback: check for direct latitude/longitude properties
          lat = matchingLocation.latitude || matchingLocation.get('latitude');
          lon = matchingLocation.longitude || matchingLocation.get('longitude');
        }
        
        // Use the matching location as search center
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
      if (maxPrice)
        filter.hourlyRate = { ...filter.hourlyRate, $lte: maxPrice };
    }

    // Filter by amenities
    if (amenities) {
      const amenityList = amenities.split(",");
      filter.amenities = { $in: amenityList };
    }

    let query = ParkingLocation.find(filter);

    // Geolocation-based search - prioritize searchCenter from placename match
    if (searchCenter || (latitude && longitude)) {
      const searchLat = searchCenter ? searchCenter.latitude : parseFloat(latitude);
      const searchLon = searchCenter ? searchCenter.longitude : parseFloat(longitude);
      
      // For search center (placename match), we want to include similar locations in the area
      if (searchCenter && search) {
        // Strategy: First prioritize text matches, then add nearby locations if radius is large enough
        const textSearchFilter = {
          isActive: true,
          $or: [
            { address: { $regex: search.trim(), $options: "i" } },
            { name: { $regex: search.trim(), $options: "i" } },
          ]
        };
        
        // Get all matching text results first
        const allMatchingResults = await ParkingLocation.find(textSearchFilter);
        
        // Filter text matches by distance
        const maxDistanceKm = parseInt(maxDistance) / 1000; // Convert to km for calculation
        const textMatches = allMatchingResults.filter(location => {
          // Handle both GeoJSON and lat/lon coordinate formats
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
          
          const distance = calculateDistance(
            searchLat, searchLon,
            lat, lon
          ) / 1000; // calculateDistance returns meters, convert to km
          return distance <= maxDistanceKm;
        });
        
        console.log(`📝 Found ${textMatches.length} text matches within ${maxDistanceKm}km for "${search}"`);
        
        // If radius is larger than 1km, also include nearby locations that don't match text
        let allResults = textMatches;
        if (maxDistanceKm > 1.0) {
          console.log(`🔍 Large radius (${maxDistanceKm}km), including nearby locations...`);
          
          // Get all locations within radius
          const allLocations = await ParkingLocation.find({ isActive: true });
          const nearbyLocations = allLocations.filter(location => {
            // Handle both GeoJSON and lat/lon coordinate formats
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
            
            const distance = calculateDistance(
              searchLat, searchLon,
              lat, lon
            ) / 1000;
            return distance <= maxDistanceKm;
          });
          
          // Combine text matches with nearby locations (avoid duplicates)
          const textMatchIds = new Set(textMatches.map(loc => loc._id.toString()));
          const additionalNearby = nearbyLocations.filter(loc => 
            !textMatchIds.has(loc._id.toString())
          );
          
          allResults = [...textMatches, ...additionalNearby];
          console.log(`📍 Added ${additionalNearby.length} additional nearby locations`);
        }
        
        // Sort all results by distance
        const sortedResults = allResults.sort((a, b) => {
          // Handle both GeoJSON and lat/lon coordinate formats for location A
          let latA, lonA;
          const coordsA = a.toObject().coordinates;
          if (coordsA && coordsA.type === 'Point' && Array.isArray(coordsA.coordinates)) {
            lonA = coordsA.coordinates[0];
            latA = coordsA.coordinates[1];
          } else if (coordsA && coordsA.latitude && coordsA.longitude) {
            latA = coordsA.latitude;
            lonA = coordsA.longitude;
          } else {
            latA = a.latitude;
            lonA = a.longitude;
          }
          
          // Handle both GeoJSON and lat/lon coordinate formats for location B
          let latB, lonB;
          const coordsB = b.toObject().coordinates;
          if (coordsB && coordsB.type === 'Point' && Array.isArray(coordsB.coordinates)) {
            lonB = coordsB.coordinates[0];
            latB = coordsB.coordinates[1];
          } else if (coordsB && coordsB.latitude && coordsB.longitude) {
            latB = coordsB.latitude;
            lonB = coordsB.longitude;
          } else {
            latB = b.latitude;
            lonB = b.longitude;
          }
          
          const distanceA = calculateDistance(searchLat, searchLon, latA, lonA);
          const distanceB = calculateDistance(searchLat, searchLon, latB, lonB);
          return distanceA - distanceB;
        });
        
        // Create a query that matches the filtered IDs
        const resultIds = sortedResults.map(loc => loc._id);
        query = ParkingLocation.find({ _id: { $in: resultIds } });
      } else {
        // Regular geolocation search - also use manual distance calculation
        const allResults = await ParkingLocation.find({ ...filter });
        
        // Filter by distance and sort
        const maxDistanceKm = parseInt(maxDistance) / 1000; // Convert to km
        const nearbyResults = allResults.filter(location => {
          // Handle both GeoJSON and lat/lon coordinate formats
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
          
          const distance = calculateDistance(
            searchLat, searchLon,
            lat, lon
          ) / 1000; // Convert to km
          return distance <= maxDistanceKm;
        }).sort((a, b) => {
          // Handle both GeoJSON and lat/lon coordinate formats for location A
          let latA, lonA;
          const coordsA = a.toObject().coordinates;
          if (coordsA && coordsA.type === 'Point' && Array.isArray(coordsA.coordinates)) {
            lonA = coordsA.coordinates[0];
            latA = coordsA.coordinates[1];
          } else if (coordsA && coordsA.latitude && coordsA.longitude) {
            latA = coordsA.latitude;
            lonA = coordsA.longitude;
          } else {
            latA = a.latitude;
            lonA = a.longitude;
          }
          
          // Handle both GeoJSON and lat/lon coordinate formats for location B
          let latB, lonB;
          const coordsB = b.toObject().coordinates;
          if (coordsB && coordsB.type === 'Point' && Array.isArray(coordsB.coordinates)) {
            lonB = coordsB.coordinates[0];
            latB = coordsB.coordinates[1];
          } else if (coordsB && coordsB.latitude && coordsB.longitude) {
            latB = coordsB.latitude;
            lonB = coordsB.longitude;
          } else {
            latB = b.latitude;
            lonB = b.longitude;
          }
          
          const distanceA = calculateDistance(searchLat, searchLon, latA, lonA);
          const distanceB = calculateDistance(searchLat, searchLon, latB, lonB);
          return distanceA - distanceB;
        });
        
        // Create a query that matches the filtered IDs
        const nearbyIds = nearbyResults.map(loc => loc._id);
        query = ParkingLocation.find({ _id: { $in: nearbyIds } });
      }
      sort = {}; // Remove default sorting for geo queries
    }

    // Apply sorting, pagination, and select fields
    const locations = await query
      .select("-spaces") // Exclude individual spaces for list view
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parkingOwnerId", "firstName lastName email phoneNumber");

    // Get total count for pagination
    const total = await ParkingLocation.countDocuments(filter);

    // Add additional computed fields
    const searchLat = searchCenter ? searchCenter.latitude : (latitude ? parseFloat(latitude) : null);
    const searchLon = searchCenter ? searchCenter.longitude : (longitude ? parseFloat(longitude) : null);
    
    const enhancedLocations = locations.map((location) => {
      let distance = null;
      let transformedCoordinates = null;
      
      // Handle both GeoJSON and lat/lon coordinate formats
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
      
      // Transform coordinates to frontend-expected format
      if (lat && lon) {
        transformedCoordinates = {
          lat: lat,
          lng: lon
        };
        
        if (searchLat && searchLon) {
          distance = calculateDistance(searchLat, searchLon, lat, lon);
        }
      }
      
      const locationObj = location.toObject();
      return {
        ...locationObj,
        coordinates: transformedCoordinates, // Override with frontend-friendly format
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
      coordinates: transformedCoordinates, // Override with frontend-friendly format
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
    if (req.user.role === "parking_admin") {
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
    if (req.user.role === "parking_admin") {
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

    // Emit real-time updates
    const {
      emitSpaceUpdate,
      emitAvailabilityUpdate,
    } = require("../utils/socketManager");
    emitSpaceUpdate(locationId, {
      spaceId,
      newStatus: status,
      reason,
      updatedBy: req.user.id,
    });

    emitAvailabilityUpdate(locationId, {
      availableSpaces: location.availableSpaces,
      totalSpaces: location.totalSpaces,
      occupancyPercentage: location.occupancyPercentage,
    });

    res.json({
      success: true,
      message: "Space status updated successfully",
      data: {
        locationId,
        spaceId,
        newStatus: status,
        reason,
        availableSpaces: location.availableSpaces,
        updatedBy: req.user.id,
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

// @desc    Get location statistics
// @route   GET /api/locations/:id/stats
// @access  Private (Super Admin or assigned Parking Admin)
const getLocationStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, period = "7d" } = req.query;

    const location = await ParkingLocation.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Parking location not found",
      });
    }

    // Check permissions
    if (req.user.role === "parking_admin") {
      const isAssigned = req.user.assignedLocations.some(
        (locId) => locId.toString() === location._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view stats for this location",
        });
      }
    }

    // Calculate date range
    const endDateTime = endDate ? new Date(endDate) : new Date();
    const startDateTime = startDate
      ? new Date(startDate)
      : new Date(endDateTime - getPeriodInMs(period));

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          locationId: location._id,
          createdAt: { $gte: startDateTime, $lte: endDateTime },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageDuration: {
            $avg: {
              $divide: [{ $subtract: ["$endTime", "$startTime"] }, 3600000],
            },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get hourly utilization
    const hourlyStats = await Booking.aggregate([
      {
        $match: {
          locationId: location._id,
          createdAt: { $gte: startDateTime, $lte: endDateTime },
          status: { $in: ["completed", "active"] },
        },
      },
      {
        $group: {
          _id: { $hour: "$startTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      location: {
        id: location._id,
        name: location.name,
        totalSpaces: location.totalSpaces,
        availableSpaces: location.availableSpaces,
        occupancyPercentage: location.occupancyPercentage,
      },
      period: {
        startDate: startDateTime,
        endDate: endDateTime,
        days: Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24)),
      },
      bookings: bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageDuration: 0,
        completedBookings: 0,
        cancelledBookings: 0,
      },
      hourlyUtilization: hourlyStats,
      currentStatus: {
        isOpen: location.isCurrentlyOpen(),
        status: location.currentStatus,
        lastUpdated: location.updatedAt,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get location stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving location statistics",
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

const getPeriodInMs = (period) => {
  const periods = {
    "1d": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };
  return periods[period] || periods["7d"];
};

// @desc    Get popular parking locations
// @route   GET /api/locations/popular
// @access  Public
const getPopularLocations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get popular locations based on booking count and rating
    const popularLocations = await ParkingLocation.aggregate([
      {
        $match: {
          isActive: true,
          currentStatus: "open"
        }
      },
      {
        $addFields: {
          // Calculate popularity score based on stats
          popularityScore: {
            $add: [
              { $multiply: ["$stats.totalBookings", 0.6] }, // 60% weight for bookings
              { $multiply: ["$stats.averageOccupancy", 0.3] }, // 30% weight for occupancy
              { $multiply: ["$availableSpaces", 0.1] } // 10% weight for capacity
            ]
          },
          placeName: {
            $arrayElemAt: [
              { $split: ["$name", ","] },
              0
            ]
          }
        }
      },
      {
        $sort: {
          popularityScore: -1,
          "stats.totalBookings": -1,
          name: 1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          name: 1,
          placeName: 1,
          address: 1,
          coordinates: 1,
          totalSpaces: 1,
          availableSpaces: 1,
          hourlyRate: 1,
          operatingHours: 1,
          amenities: 1,
          currentStatus: 1,
          stats: 1,
          popularityScore: 1
        }
      }
    ]);

    // Add computed fields
    const enhancedPopularLocations = popularLocations.map((location) => ({
      ...location,
      occupancyPercentage: location.totalSpaces > 0 
        ? Math.round(((location.totalSpaces - location.availableSpaces) / location.totalSpaces) * 100)
        : 0,
      isCurrentlyOpen: true, // Already filtered for open status
      category: 'popular'
    }));

    res.json({
      success: true,
      message: "Popular parking locations retrieved successfully",
      count: enhancedPopularLocations.length,
      data: enhancedPopularLocations,
    });
  } catch (error) {
    console.error("Get popular locations error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving popular parking locations",
      error: error.message,
    });
  }
};

// @desc    Search locations by placename suggestions
// @route   GET /api/locations/search/suggestions
// @access  Public
const getLocationSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: "Query too short, minimum 2 characters required"
      });
    }

    const suggestions = await ParkingLocation.aggregate([
      {
        $match: {
          isActive: true,
          name: { $regex: q.trim(), $options: "i" }
        }
      },
      {
        $addFields: {
          placeName: {
            $arrayElemAt: [
              { $split: ["$name", ","] },
              0
            ]
          },
          relevanceScore: {
            $cond: {
              if: { $regexMatch: { input: "$name", regex: `^${q.trim()}`, options: "i" } },
              then: 2, // Higher score for exact prefix match
              else: 1  // Lower score for partial match
            }
          }
        }
      },
      {
        $sort: {
          relevanceScore: -1,
          "stats.totalBookings": -1,
          name: 1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          name: 1,
          placeName: 1,
          coordinates: 1,
          totalSpaces: 1,
          availableSpaces: 1,
          currentStatus: 1
        }
      }
    ]);

    res.json({
      success: true,
      query: q,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    console.error("Get location suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving location suggestions",
      error: error.message,
    });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  updateSpaceStatus,
  getLocationStats,
  deleteLocation,
  getPopularLocations,
  getLocationSuggestions,
};
