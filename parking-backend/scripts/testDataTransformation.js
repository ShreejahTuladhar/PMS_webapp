const axios = require('axios');

const testDataTransformation = async () => {
  try {
    console.log('🧪 Testing data transformation for MapView compatibility...');
    
    const response = await axios.get('http://localhost:8080/api/locations', {
      params: {
        limit: 1,
        isActive: true
      }
    });
    
    if (response.data.success) {
      const rawSpot = response.data.data[0];
      console.log('📋 Raw database data:');
      console.log(JSON.stringify(rawSpot, null, 2));
      
      // Transform the same way frontend does
      const transformedSpot = {
        id: rawSpot.id,
        name: rawSpot.name,
        address: rawSpot.address,
        coordinates: {
          lat: rawSpot.coordinates?.latitude || rawSpot.coordinates?.lat || 0,
          lng: rawSpot.coordinates?.longitude || rawSpot.coordinates?.lng || 0
        },
        hourlyRate: rawSpot.hourlyRate,
        totalSpaces: rawSpot.totalSpaces,
        availableSpaces: rawSpot.availableSpaces,
        availability: rawSpot.availableSpaces, // MapView expects 'availability'
        occupancyPercentage: rawSpot.occupancyPercentage,
        amenities: rawSpot.amenities || [],
        operatingHours: rawSpot.operatingHours,
        isCurrentlyOpen: rawSpot.isCurrentlyOpen,
        currentStatus: rawSpot.currentStatus,
        contactNumber: rawSpot.contactNumber,
        description: rawSpot.description,
        // Add vehicle types for compatibility
        vehicleTypes: {
          car: rawSpot.hourlyRate,
          motorcycle: Math.round(rawSpot.hourlyRate * 0.7),
          bicycle: Math.round(rawSpot.hourlyRate * 0.3)
        },
        // MapView compatibility properties
        businessHours: {
          isOpen24: false,
          open: rawSpot.operatingHours?.start || '06:00',
          close: rawSpot.operatingHours?.end || '22:00'
        },
        features: rawSpot.amenities || [],
        rating: 4.2,
        operator: 'ParkSathi Network',
        zone: rawSpot.address?.split(',')[0] || 'Kathmandu',
        smartParkingEnabled: rawSpot.amenities?.includes('smart_parking') || false,
        galliMapsSupported: true,
        baatoMapsSupported: true,
        appSupport: 'ParkSathi App',
        specialOffers: null,
        status: rawSpot.currentStatus === 'maintenance' ? 'Under Maintenance' : null,
        expectedOpening: null
      };
      
      console.log('\n✅ Transformed data for MapView:');
      console.log(JSON.stringify(transformedSpot, null, 2));
      
      console.log('\n🔍 Checking MapView required properties:');
      console.log('- businessHours.isOpen24:', transformedSpot.businessHours.isOpen24);
      console.log('- features:', transformedSpot.features);
      console.log('- availability:', transformedSpot.availability);
      console.log('- rating:', transformedSpot.rating);
      console.log('- operator:', transformedSpot.operator);
      console.log('- zone:', transformedSpot.zone);
      
      console.log('\n✅ Data transformation test completed successfully!');
    } else {
      console.error('❌ API returned error:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testDataTransformation();