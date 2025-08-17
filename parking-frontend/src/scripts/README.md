# ParkSathi Data Scraper

A comprehensive tool to scrape parking location data from Galli Maps API and populate your MongoDB database cluster.

## 🌟 Features

- **Smart Data Scraping**: Searches for parking-related locations using multiple keywords in English and Nepali
- **Intelligent Validation**: Validates coordinates, removes duplicates, and transforms data to match your schema
- **Robust Database Import**: Handles batch insertions, duplicate detection, and error recovery
- **Comprehensive Reporting**: Detailed logs, progress tracking, and summary reports
- **Rate Limiting**: Respects API rate limits with configurable delays
- **Geospatial Indexing**: Creates optimized MongoDB indexes for location-based queries

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+ 
- MongoDB Atlas cluster or local MongoDB instance
- Galli Maps API access token

### 2. Get Galli Maps API Token

1. Visit [https://dashboard-init.gallimap.com/signup](https://dashboard-init.gallimap.com/signup)
2. Create an account and verify your email
3. Generate an access token from the dashboard
4. Copy the token for use in the scraper

### 3. Install Dependencies

```bash
cd src/scripts
npm install
```

### 4. Environment Setup

Create a `.env` file in the scripts directory:

```env
# Required: Galli Maps API Token
GALLI_MAPS_TOKEN=your_galli_maps_token_here

# Required: MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Optional: Database Configuration
DB_NAME=parking_management
COLLECTION_NAME=locations
```

### 5. Run the Scraper

```bash
# Full sync (scrape → validate → import)
npm run scrape

# Test run (no database changes)
npm run test-scrape

# Only scrape and validate (no import)
npm run validate-only

# Only scrape (no validation or import)
npm run scrape-only
```

## 📋 Command Line Usage

```bash
node syncParkingData.js [options]

Options:
  -t, --token <token>        Galli Maps API access token
  -m, --mongo-uri <uri>      MongoDB connection URI
  -d, --database <name>      Database name (default: parking_management)
  -c, --collection <name>    Collection name (default: locations)
  --dry-run                  Perform dry run (no database changes)
  --skip-validation          Skip data validation step
  --skip-import              Skip database import step
  --log-level <level>        Log level: info|debug (default: info)
  -h, --help                 Display help information
```

### Examples

```bash
# Basic usage with token
node syncParkingData.js --token your_token_here

# Dry run to test without database changes
node syncParkingData.js --token your_token --dry-run

# Custom database and collection
node syncParkingData.js --token your_token --database my_parking_db --collection parking_spots

# Debug mode with detailed logging
node syncParkingData.js --token your_token --log-level debug
```

## 🔧 Configuration

### Search Areas

The scraper searches around these Kathmandu Valley locations:
- Kathmandu Center (Ratna Park)
- Patan
- Bhaktapur  
- Thamel
- New Road
- Baneshwor
- Koteshwor
- Lagankhel
- Jawalakhel

### Search Keywords

English: parking, car parking, bike parking, parking area, parking space, parking lot

Nepali: गाडी राख्ने ठाउँ, गाडी पार्किङ, मोटरसाइकल पार्किङ

### Data Fields

The scraper collects and transforms:
- **Location**: name, address, coordinates
- **Capacity**: total spaces, available spaces, occupancy percentage
- **Pricing**: hourly, daily, monthly rates (estimated)
- **Operations**: hours, current status
- **Amenities**: security, CCTV, covered parking, etc.
- **Contact**: phone numbers (when available)

## 📊 Output Files

### Scraped Data
`scraped_data/galli_maps_parking_data_[timestamp].json`

### Validated Data  
`validated_data/transformed_parking_data_[timestamp].json`

### Validation Report
`validated_data/validation_report_[timestamp].json`

### Import Results
`insertion_results/insertion_results_[timestamp].json`

### Sync Report
`sync_reports/sync_report_[timestamp].json`

## 🗄️ Database Schema

```javascript
{
  _id: ObjectId,
  name: String,                    // Parking location name
  address: String,                 // Full address
  description: String,             // Generated description
  coordinates: {                   // GeoJSON Point
    type: "Point",
    coordinates: [longitude, latitude]
  },
  latitude: Number,                // For backward compatibility  
  longitude: Number,
  totalSpaces: Number,
  availableSpaces: Number,
  occupancyPercentage: Number,
  hourlyRate: Number,
  dailyRate: Number,
  monthlyRate: Number,
  operatingHours: {
    start: String,                 // "HH:MM"
    end: String,                   // "HH:MM"  
    is24Hours: Boolean
  },
  isCurrentlyOpen: Boolean,
  currentStatus: String,           // "active", "maintenance", etc.
  isActive: Boolean,
  amenities: [String],             // Array of amenity codes
  contactNumber: String,           // Formatted phone number
  vehicleTypes: {
    car: Boolean,
    motorcycle: Boolean,
    bicycle: Boolean,
    truck: Boolean
  },
  source: String,                  // "galli_maps"
  dataQuality: {
    score: Number,                 // 0-100
    level: String,                 // "high", "medium", "low"
    needsVerification: Boolean
  },
  verificationStatus: String,      // "pending", "verified", "rejected"
  createdAt: Date,
  updatedAt: Date,
  importMetadata: {
    importedAt: Date,
    importSource: String,
    batchId: String,
    version: String
  },
  originalScrapedData: {           // Original data from API
    source: String,
    searchKeyword: String,
    searchCenter: String,
    confidence: Number,
    scrapedAt: Date,
    needsVerification: Boolean
  }
}
```

## 🔍 Database Indexes

Automatically created indexes:
- **Geospatial**: `coordinates` (2dsphere) - for location queries
- **Text Search**: `name`, `address`, `description` - for search functionality  
- **Status**: `currentStatus`, `isActive`, `verificationStatus` - for filtering
- **Source Tracking**: `source`, `originalScrapedData.scrapedAt` - for data management
- **Unique Constraint**: `coordinates` + `name` - prevents exact duplicates

## ⚠️ Important Notes

### Data Verification Required

All scraped data has `needsVerification: true` and `verificationStatus: "pending"`. This is because:

1. **Estimated Values**: Pricing, capacity, and amenities are estimated based on location type and area
2. **Inference-Based**: Some amenities are inferred from location names and descriptions
3. **API Limitations**: Galli Maps doesn't have dedicated parking endpoints

### Recommended Next Steps

1. **Field Verification**: Visit locations to verify capacity, pricing, and amenities
2. **Owner Contact**: Reach out to parking operators for accurate information
3. **Regular Updates**: Re-run scraper periodically to catch new locations
4. **Data Quality**: Update `verificationStatus` to "verified" after confirmation

### Rate Limiting

- Default: 1 second delay between requests
- Batch processing: 50 records per batch
- Auto-retry: Up to 3 attempts for failed requests
- Exponential backoff on errors

## 🐛 Troubleshooting

### Common Issues

**"MongoDB connection string not provided"**
- Set `MONGODB_URI` environment variable
- Or use `--mongo-uri` flag

**"Galli Maps API token is required"**  
- Set `GALLI_MAPS_TOKEN` environment variable
- Or use `--token` flag
- Verify token is valid and active

**"Insert operation failed"**
- Check MongoDB cluster connectivity
- Verify database permissions
- Ensure sufficient storage quota

**Rate limit errors**
- Increase delay in `galliMapsScraper.js`
- Check Galli Maps API usage limits
- Use smaller batch sizes

### Debug Mode

```bash
node syncParkingData.js --token your_token --log-level debug
```

Provides detailed logs for:
- API requests and responses
- Validation errors  
- Database operations
- Timing information

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Create an issue on GitHub
3. Contact the development team

---

**Made with ❤️ for ParkSathi - Making parking easier in Nepal! 🇳🇵**