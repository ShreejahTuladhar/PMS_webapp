const axios = require('axios');

const testFrontendAPI = async () => {
  try {
    console.log('🧪 Testing frontend API integration...');
    
    // Test the same call that frontend makes
    const response = await axios.get('http://localhost:8080/api/locations', {
      params: {
        limit: 50,
        isActive: true
      }
    });
    
    if (response.data.success) {
      const parkingSpots = response.data.data;
      console.log(`✅ Successfully fetched ${parkingSpots.length} parking spots`);
      
      // Test data transformation (like frontend does)
      const transformedSpots = parkingSpots.map(spot => ({
        id: spot.id,
        name: spot.name,
        coordinates: {
          lat: spot.coordinates?.latitude || spot.coordinates?.lat || 0,
          lng: spot.coordinates?.longitude || spot.coordinates?.lng || 0
        },
        hourlyRate: spot.hourlyRate,
        totalSpaces: spot.totalSpaces,
        availableSpaces: spot.availableSpaces,
        occupancyPercentage: spot.occupancyPercentage
      }));
      
      console.log('📊 Sample transformed data:');
      console.log(JSON.stringify(transformedSpots.slice(0, 2), null, 2));
      
      // Test distance calculation simulation
      const searchLat = 27.717245; // Ratna Park coordinates
      const searchLng = 85.314027;
      
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      const spotsWithDistance = transformedSpots.map(spot => ({
        ...spot,
        distance: calculateDistance(searchLat, searchLng, spot.coordinates.lat, spot.coordinates.lng)
      }));
      
      const nearbySpots = spotsWithDistance
        .filter(spot => spot.distance <= 5) // Within 5km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      
      console.log(`🎯 Found ${nearbySpots.length} spots within 5km of Ratna Park`);
      console.log('📍 Nearest spots:');
      nearbySpots.forEach(spot => {
        console.log(`- ${spot.name}: ${spot.distance.toFixed(2)}km away, Rs.${spot.hourlyRate}/hr, ${spot.availableSpaces}/${spot.totalSpaces} available`);
      });
      
      console.log('✅ Database integration test completed successfully!');
    } else {
      console.error('❌ API returned error:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testFrontendAPI();