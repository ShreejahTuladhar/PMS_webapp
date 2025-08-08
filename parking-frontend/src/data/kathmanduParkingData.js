export const kathmanduParkingData = [
  // Thamel Area
  {
    id: 1,
    name: "Thamel Tourist Hub Parking",
    address: "Thamel Marg, Kathmandu 44600",
    coordinates: { lat: 27.7156, lng: 85.3121 },
    distance: 0.2,
    hourlyRate: 150,
    vehicleTypes: { car: 150, motorcycle: 50, bus: 300 },
    availability: 25,
    totalSpaces: 80,
    rating: 4.5,
    businessHours: { open: "06:00", close: "23:00", isOpen24: false },
    features: ["Covered", "Security", "Tourist Friendly", "24/7 CCTV"],
    specialOffers: "Tourist discount 10% on full day parking",
    parkingType: "Multi-level",
    operator: "Thamel Development Committee"
  },
  
  {
    id: 2,
    name: "Garden of Dreams Parking",
    address: "Kaiser Mahal, Thamel, Kathmandu",
    coordinates: { lat: 27.7145, lng: 85.3156 },
    distance: 0.4,
    hourlyRate: 120,
    vehicleTypes: { car: 120, motorcycle: 40 },
    availability: 0,
    totalSpaces: 45,
    rating: 4.2,
    businessHours: { open: "07:00", close: "22:00", isOpen24: false },
    features: ["Historic Location", "Garden Access", "Security"],
    specialOffers: "Free parking with garden entry ticket",
    parkingType: "Ground level",
    operator: "Nepal Tourism Board"
  },

  // Durbar Square Area
  {
    id: 3,
    name: "Kathmandu Durbar Square Parking",
    address: "Durbar Square, Basantapur, Kathmandu",
    coordinates: { lat: 27.7047, lng: 85.3077 },
    distance: 0.8,
    hourlyRate: 100,
    vehicleTypes: { car: 100, motorcycle: 30, bus: 250 },
    availability: 15,
    totalSpaces: 60,
    rating: 4.0,
    businessHours: { open: "05:30", close: "21:00", isOpen24: false },
    features: ["Heritage Site", "Tourist Access", "Security Guard"],
    specialOffers: "Early bird discount before 8 AM",
    parkingType: "Ground level",
    operator: "Kathmandu Metropolitan City"
  },

  // New Road Area
  {
    id: 4,
    name: "New Road Shopping Center Parking",
    address: "New Road, Kathmandu 44600",
    coordinates: { lat: 27.7024, lng: 85.3150 },
    distance: 1.2,
    hourlyRate: 80,
    vehicleTypes: { car: 80, motorcycle: 25 },
    availability: 35,
    totalSpaces: 100,
    rating: 3.8,
    businessHours: { open: "08:00", close: "20:00", isOpen24: false },
    features: ["Shopping Access", "Affordable", "Central Location"],
    specialOffers: "Free parking with purchase above Rs. 5000",
    parkingType: "Underground",
    operator: "New Road Business Association"
  },

  // Ratna Park Area
  {
    id: 5,
    name: "Ratna Park Public Parking",
    address: "Ratna Park, Kathmandu",
    coordinates: { lat: 27.7089, lng: 85.3206 },
    distance: 0.6,
    hourlyRate: 60,
    vehicleTypes: { car: 60, motorcycle: 20, bus: 200 },
    availability: 40,
    totalSpaces: 120,
    rating: 3.5,
    businessHours: { isOpen24: true },
    features: ["Large Capacity", "Budget Friendly", "Bus Terminal Access"],
    specialOffers: "Monthly pass available",
    parkingType: "Ground level",
    operator: "Kathmandu Metropolitan City"
  },

  // Lazimpat Area
  {
    id: 6,
    name: "Lazimpat Embassy Parking",
    address: "Lazimpat Road, Kathmandu",
    coordinates: { lat: 27.7254, lng: 85.3289 },
    distance: 2.1,
    hourlyRate: 200,
    vehicleTypes: { car: 200, motorcycle: 60 },
    availability: 12,
    totalSpaces: 40,
    rating: 4.6,
    businessHours: { open: "07:00", close: "19:00", isOpen24: false },
    features: ["High Security", "Embassy District", "Premium Location"],
    specialOffers: null,
    parkingType: "Ground level",
    operator: "Lazimpat Development Committee"
  },

  // Maharajgunj Area
  {
    id: 7,
    name: "Tribhuvan University Teaching Hospital Parking",
    address: "Maharajgunj, Kathmandu",
    coordinates: { lat: 27.7359, lng: 85.3350 },
    distance: 3.5,
    hourlyRate: 70,
    vehicleTypes: { car: 70, motorcycle: 25, ambulance: 0 },
    availability: 50,
    totalSpaces: 200,
    rating: 3.9,
    businessHours: { isOpen24: true },
    features: ["Hospital Access", "Large Capacity", "Medical Emergency Priority"],
    specialOffers: "Patient family discount available",
    parkingType: "Multi-level",
    operator: "Tribhuvan University"
  },

  // Balaju Area
  {
    id: 8,
    name: "Balaju Industrial Area Parking",
    address: "Balaju Industrial District, Kathmandu",
    coordinates: { lat: 27.7456, lng: 85.3012 },
    distance: 4.2,
    hourlyRate: 50,
    vehicleTypes: { car: 50, motorcycle: 15, truck: 150 },
    availability: 80,
    totalSpaces: 150,
    rating: 3.6,
    businessHours: { open: "06:00", close: "22:00", isOpen24: false },
    features: ["Industrial Access", "Truck Parking", "Budget Friendly"],
    specialOffers: "Bulk parking discount for companies",
    parkingType: "Ground level",
    operator: "Balaju Industrial Committee"
  },

  // Baneshwor Area
  {
    id: 9,
    name: "Baneshwor Business Complex Parking",
    address: "Baneshwor, Kathmandu",
    coordinates: { lat: 27.6934, lng: 85.3456 },
    distance: 2.8,
    hourlyRate: 90,
    vehicleTypes: { car: 90, motorcycle: 30 },
    availability: 22,
    totalSpaces: 75,
    rating: 4.1,
    businessHours: { open: "07:30", close: "21:30", isOpen24: false },
    features: ["Business District", "Office Access", "Modern Facility"],
    specialOffers: "Corporate monthly rates available",
    parkingType: "Underground",
    operator: "Baneshwor Development Committee"
  },

  // Koteshwor Area
  {
    id: 10,
    name: "Koteshwor Temple Parking",
    address: "Koteshwor Mahadev, Kathmandu",
    coordinates: { lat: 27.6789, lng: 85.3567 },
    distance: 5.1,
    hourlyRate: 40,
    vehicleTypes: { car: 40, motorcycle: 15, bus: 120 },
    availability: 65,
    totalSpaces: 90,
    rating: 3.7,
    businessHours: { open: "05:00", close: "20:00", isOpen24: false },
    features: ["Temple Access", "Religious Site", "Festival Parking"],
    specialOffers: "Free parking during major festivals",
    parkingType: "Ground level",
    operator: "Temple Committee"
  },

  // Kalanki Area
  {
    id: 11,
    name: "Kalanki Chowk Parking Plaza",
    address: "Kalanki, Kathmandu",
    coordinates: { lat: 27.6923, lng: 85.2834 },
    distance: 3.7,
    hourlyRate: 75,
    vehicleTypes: { car: 75, motorcycle: 25, bus: 200 },
    availability: 30,
    totalSpaces: 110,
    rating: 3.9,
    businessHours: { isOpen24: true },
    features: ["Highway Access", "Bus Terminal", "Transit Hub"],
    specialOffers: "Transit passenger discount",
    parkingType: "Multi-level",
    operator: "Kalanki Transport Committee"
  },

  // Dillibazar Area
  {
    id: 12,
    name: "Dillibazar Commercial Parking",
    address: "Dillibazar, Kathmandu",
    coordinates: { lat: 27.7123, lng: 85.3356 },
    distance: 1.8,
    hourlyRate: 85,
    vehicleTypes: { car: 85, motorcycle: 30 },
    availability: 18,
    totalSpaces: 65,
    rating: 4.0,
    businessHours: { open: "08:00", close: "20:00", isOpen24: false },
    features: ["Commercial Area", "Banking District", "Central Location"],
    specialOffers: null,
    parkingType: "Ground level",
    operator: "Dillibazar Merchants Association"
  },

  // Chabahil Area
  {
    id: 13,
    name: "Chabahil Stupa Parking",
    address: "Chabahil, Kathmandu",
    coordinates: { lat: 27.7267, lng: 85.3445 },
    distance: 2.3,
    hourlyRate: 65,
    vehicleTypes: { car: 65, motorcycle: 20 },
    availability: 28,
    totalSpaces: 55,
    rating: 3.8,
    businessHours: { open: "06:00", close: "21:00", isOpen24: false },
    features: ["Buddhist Site", "Cultural Access", "Peaceful Environment"],
    specialOffers: "Meditation center visitor discount",
    parkingType: "Ground level",
    operator: "Buddhist Community"
  },

  // Gongabu Area
  {
    id: 14,
    name: "Gongabu Bus Park Parking",
    address: "Gongabu, Kathmandu",
    coordinates: { lat: 27.7445, lng: 85.3178 },
    distance: 3.2,
    hourlyRate: 45,
    vehicleTypes: { car: 45, motorcycle: 15, bus: 100 },
    availability: 95,
    totalSpaces: 180,
    rating: 3.4,
    businessHours: { isOpen24: true },
    features: ["Bus Terminal", "Long Distance Travel", "Large Capacity"],
    specialOffers: "Long-term parking rates available",
    parkingType: "Ground level",
    operator: "Nepal Transport Entrepreneurs"
  },

  // Bouddha Area
  {
    id: 15,
    name: "Bouddha Stupa Heritage Parking",
    address: "Boudhanath, Kathmandu",
    coordinates: { lat: 27.7215, lng: 85.3622 },
    distance: 4.5,
    hourlyRate: 100,
    vehicleTypes: { car: 100, motorcycle: 35, bus: 300 },
    availability: 42,
    totalSpaces: 85,
    rating: 4.3,
    businessHours: { open: "06:00", close: "22:00", isOpen24: false },
    features: ["UNESCO Heritage", "Tourist Destination", "Cultural Site"],
    specialOffers: "Tourist group discount available",
    parkingType: "Ground level",
    operator: "Boudhanath Area Development Committee"
  },

  // Patan (Lalitpur) Area
  {
    id: 16,
    name: "Patan Durbar Square Parking",
    address: "Patan Durbar Square, Lalitpur",
    coordinates: { lat: 27.6734, lng: 85.3245 },
    distance: 6.2,
    hourlyRate: 80,
    vehicleTypes: { car: 80, motorcycle: 25 },
    availability: 20,
    totalSpaces: 70,
    rating: 4.2,
    businessHours: { open: "07:00", close: "20:00", isOpen24: false },
    features: ["Heritage Site", "Art Museum Access", "Traditional Architecture"],
    specialOffers: "Museum ticket combo discount",
    parkingType: "Ground level",
    operator: "Lalitpur Metropolitan City"
  },

  // Kirtipur Area
  {
    id: 17,
    name: "Kirtipur University Campus Parking",
    address: "Tribhuvan University, Kirtipur",
    coordinates: { lat: 27.6789, lng: 85.2890 },
    distance: 7.1,
    hourlyRate: 35,
    vehicleTypes: { car: 35, motorcycle: 12, bus: 80 },
    availability: 120,
    totalSpaces: 300,
    rating: 3.6,
    businessHours: { open: "06:00", close: "22:00", isOpen24: false },
    features: ["University Access", "Student Friendly", "Academic Zone"],
    specialOffers: "Student ID discount available",
    parkingType: "Ground level",
    operator: "Tribhuvan University"
  },

  // Swayambhunath Area
  {
    id: 18,
    name: "Swayambhunath Temple Parking",
    address: "Swayambhu, Kathmandu",
    coordinates: { lat: 27.7149, lng: 85.2904 },
    distance: 2.9,
    hourlyRate: 60,
    vehicleTypes: { car: 60, motorcycle: 20 },
    availability: 25,
    totalSpaces: 50,
    rating: 3.9,
    businessHours: { open: "05:30", close: "20:30", isOpen24: false },
    features: ["Ancient Temple", "Monkey Temple", "Scenic View"],
    specialOffers: "Sunrise visit discount",
    parkingType: "Hillside parking",
    operator: "Swayambhunath Development Committee"
  },

  // Ring Road Areas
  {
    id: 19,
    name: "Kalimati Vegetable Market Parking",
    address: "Kalimati, Kathmandu",
    coordinates: { lat: 27.6956, lng: 85.2978 },
    distance: 2.5,
    hourlyRate: 40,
    vehicleTypes: { car: 40, motorcycle: 15, truck: 100 },
    availability: 75,
    totalSpaces: 140,
    rating: 3.3,
    businessHours: { open: "04:00", close: "18:00", isOpen24: false },
    features: ["Market Access", "Early Morning Hours", "Truck Parking"],
    specialOffers: "Wholesale buyer discount",
    parkingType: "Ground level",
    operator: "Kalimati Fruit & Vegetable Market"
  },

  {
    id: 20,
    name: "Naya Baneshwor IT Park Parking",
    address: "Naya Baneshwor, Kathmandu",
    coordinates: { lat: 27.6889, lng: 85.3534 },
    distance: 3.1,
    hourlyRate: 120,
    vehicleTypes: { car: 120, motorcycle: 40 },
    availability: 35,
    totalSpaces: 95,
    rating: 4.4,
    businessHours: { open: "07:00", close: "22:00", isOpen24: false },
    features: ["IT Hub", "Modern Facility", "Tech Companies"],
    specialOffers: "IT professional monthly rates",
    parkingType: "Multi-level",
    operator: "IT Park Management"
  }
];

// Helper function to get parking data within a certain radius
export const getParkingWithinRadius = (centerLat, centerLng, radiusKm) => {
  return kathmanduParkingData.filter(parking => {
    const distance = calculateDistance(centerLat, centerLng, parking.coordinates.lat, parking.coordinates.lng);
    return distance <= radiusKm;
  });
};

// Helper function to calculate distance between two coordinates
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Popular areas coordinates for quick reference
export const kathmanduAreas = {
  thamel: { lat: 27.7156, lng: 85.3121 },
  durbarSquare: { lat: 27.7047, lng: 85.3077 },
  newRoad: { lat: 27.7024, lng: 85.3150 },
  ratnapark: { lat: 27.7089, lng: 85.3206 },
  lazimpat: { lat: 27.7254, lng: 85.3289 },
  baneshwor: { lat: 27.6934, lng: 85.3456 },
  patan: { lat: 27.6734, lng: 85.3245 },
  bouddha: { lat: 27.7215, lng: 85.3622 },
  swayambhunath: { lat: 27.7149, lng: 85.2904 },
  tribhuvanAirport: { lat: 27.6966, lng: 85.3591 }
};