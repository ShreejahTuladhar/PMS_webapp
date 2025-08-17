const mongoose = require('mongoose');
const ParkingLocation = require('../models/ParkingLocation');
require('dotenv').config();

const popularLocations = [
  {
    name: "Kathmandu, Durbar Marg Parking Plaza",
    address: "Durbar Marg, Kathmandu 44600, Nepal",
    coordinates: {
      latitude: 27.7048,
      longitude: 85.3188
    },
    totalSpaces: 150,
    availableSpaces: 120,
    hourlyRate: 50,
    operatingHours: {
      start: "06:00",
      end: "22:00"
    },
    contactNumber: "+977-1-4444001",
    description: "Premium parking facility in the heart of Durbar Marg shopping district",
    amenities: ["cctv", "security_guard", "covered", "valet"],
    stats: {
      totalBookings: 2500,
      totalRevenue: 125000,
      averageOccupancy: 85
    },
    spaces: generateSpaces(150)
  },
  {
    name: "Lalitpur, Patan Durbar Square Parking",
    address: "Patan Durbar Square, Lalitpur, Nepal",
    coordinates: {
      latitude: 27.6722,
      longitude: 85.3257
    },
    totalSpaces: 80,
    availableSpaces: 65,
    hourlyRate: 40,
    operatingHours: {
      start: "07:00",
      end: "20:00"
    },
    contactNumber: "+977-1-5555002",
    description: "Historic parking area near UNESCO World Heritage Site",
    amenities: ["cctv", "security_guard", "bike_parking"],
    stats: {
      totalBookings: 1800,
      totalRevenue: 72000,
      averageOccupancy: 75
    },
    spaces: generateSpaces(80)
  },
  {
    name: "Bhaktapur, Pottery Square Parking Hub",
    address: "Pottery Square, Bhaktapur 44800, Nepal",
    coordinates: {
      latitude: 27.6710,
      longitude: 85.4298
    },
    totalSpaces: 60,
    availableSpaces: 45,
    hourlyRate: 35,
    operatingHours: {
      start: "08:00",
      end: "18:00"
    },
    contactNumber: "+977-1-6666003",
    description: "Cultural heritage area parking with traditional architecture",
    amenities: ["cctv", "covered", "bike_parking"],
    stats: {
      totalBookings: 1200,
      totalRevenue: 42000,
      averageOccupancy: 68
    },
    spaces: generateSpaces(60)
  },
  {
    name: "Pokhara, Lakeside Tourist Parking Center",
    address: "Lakeside, Pokhara 33700, Nepal", 
    coordinates: {
      latitude: 28.2096,
      longitude: 83.9856
    },
    totalSpaces: 200,
    availableSpaces: 150,
    hourlyRate: 45,
    operatingHours: {
      start: "05:00",
      end: "23:00"
    },
    contactNumber: "+977-61-777004",
    description: "Tourist area parking with mountain and lake views",
    amenities: ["cctv", "security_guard", "covered", "ev_charging", "car_wash"],
    stats: {
      totalBookings: 3200,
      totalRevenue: 144000,
      averageOccupancy: 78
    },
    spaces: generateSpaces(200)
  },
  {
    name: "Kathmandu, Thamel Night Market Parking",
    address: "Thamel, Kathmandu 44600, Nepal",
    coordinates: {
      latitude: 27.7151,
      longitude: 85.3120
    },
    totalSpaces: 100,
    availableSpaces: 80,
    hourlyRate: 60,
    operatingHours: {
      start: "18:00",
      end: "06:00"
    },
    contactNumber: "+977-1-8888005",
    description: "24/7 parking for Thamel's bustling nightlife district",
    amenities: ["cctv", "security_guard", "covered"],
    stats: {
      totalBookings: 2800,
      totalRevenue: 168000,
      averageOccupancy: 82
    },
    spaces: generateSpaces(100)
  },
  {
    name: "Kathmandu, New Road Shopping Complex Parking",
    address: "New Road, Kathmandu 44600, Nepal",
    coordinates: {
      latitude: 27.7047,
      longitude: 85.3206
    },
    totalSpaces: 180,
    availableSpaces: 140,
    hourlyRate: 55,
    operatingHours: {
      start: "09:00",
      end: "21:00"
    },
    contactNumber: "+977-1-9999006",
    description: "Multi-level parking for premier shopping district",
    amenities: ["cctv", "security_guard", "covered", "ev_charging", "valet"],
    stats: {
      totalBookings: 3500,
      totalRevenue: 192500,
      averageOccupancy: 88
    },
    spaces: generateSpaces(180)
  }
];

function generateSpaces(totalSpaces) {
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
      status: Math.random() > 0.3 ? "available" : "occupied", // 70% available
      level: level.toString(),
      section: section,
      sensors: {
        sensorId: `SENSOR_${section}${i}`,
        isActive: Math.random() > 0.2,
        lastUpdate: new Date()
      }
    });
  }
  return spaces;
}

const seedPopularLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parksathi');
    console.log('Connected to MongoDB');

    // Clear existing locations (optional)
    // await ParkingLocation.deleteMany({});
    // console.log('Cleared existing locations');

    // Insert popular locations
    const insertedLocations = await ParkingLocation.insertMany(popularLocations);
    console.log(`Successfully seeded ${insertedLocations.length} popular parking locations`);

    // Display created locations
    insertedLocations.forEach(location => {
      console.log(`✅ Created: ${location.name}`);
      console.log(`   Address: ${location.address}`);
      console.log(`   Coordinates: ${location.coordinates.latitude}, ${location.coordinates.longitude}`);
      console.log(`   Spaces: ${location.availableSpaces}/${location.totalSpaces} available`);
      console.log(`   Rate: Rs. ${location.hourlyRate}/hour`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding popular locations:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedPopularLocations();
}

module.exports = { seedPopularLocations, popularLocations };