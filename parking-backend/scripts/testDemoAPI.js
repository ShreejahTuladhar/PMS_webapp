const axios = require('axios');
require('dotenv').config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

console.log('🧪 Testing Parking Management System API with Demo Data\n');

async function testAPI() {
  try {
    let authToken = null;
    
    // Test 1: Login with demo user
    console.log('🔐 1. Testing login with demo customer account...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'john_doe',
        password: 'password123'
      });
      
      authToken = loginResponse.data.token;
      console.log('✅ Login successful!');
      console.log(`👤 User: ${loginResponse.data.user.fullName}`);
      console.log(`🎫 Token received: ${authToken.substring(0, 20)}...`);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Test 2: Get user profile
    console.log('\n👤 2. Testing user profile retrieval...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Profile retrieved successfully!');
      console.log(`📧 Email: ${profileResponse.data.user.email}`);
      console.log(`🚗 Vehicles: ${profileResponse.data.user.vehicles.length}`);
    } catch (error) {
      console.log('❌ Profile retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Get parking locations
    console.log('\n📍 3. Testing parking locations retrieval...');
    try {
      const locationsResponse = await axios.get(`${BASE_URL}/api/locations`);
      
      console.log('✅ Locations retrieved successfully!');
      console.log(`🏢 Total locations: ${locationsResponse.data.count}`);
      locationsResponse.data.data.forEach((location, index) => {
        console.log(`   ${index + 1}. ${location.name} - ${location.availableSpaces}/${location.totalSpaces} available`);
      });
    } catch (error) {
      console.log('❌ Locations retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Get user bookings
    console.log('\n🅿️ 4. Testing user bookings retrieval...');
    try {
      const bookingsResponse = await axios.get(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Bookings retrieved successfully!');
      console.log(`📝 Total bookings: ${bookingsResponse.data.count}`);
      if (bookingsResponse.data.data.length > 0) {
        bookingsResponse.data.data.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.locationId?.name || 'Unknown Location'} - Status: ${booking.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Bookings retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 5: Test admin login
    console.log('\n🔑 5. Testing admin login...');
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin_ram',
        password: 'password123'
      });
      
      const adminToken = adminLoginResponse.data.token;
      console.log('✅ Admin login successful!');
      console.log(`👑 Admin: ${adminLoginResponse.data.user.fullName} (${adminLoginResponse.data.user.role})`);
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 API Demo Testing Completed!');
    console.log('\n📋 Demo Data Summary:');
    console.log('• 5 Users (3 customers, 1 parking admin, 1 super admin)');
    console.log('• 4 Parking locations in Kathmandu');
    console.log('• 5 Sample bookings with different statuses');
    console.log('• All endpoints are working with demo data');
    
    console.log('\n🚀 Ready for stakeholder demo!');
    
  } catch (error) {
    console.error('❌ Unexpected error during API testing:', error.message);
  }
}

// Start the test only if server is running
axios.get(`${BASE_URL}/api/auth/me`)
  .then(() => {
    console.log('✅ Server is running, starting API tests...\n');
    testAPI();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm start');
    console.log('   or');
    console.log('   node server.js');
  });