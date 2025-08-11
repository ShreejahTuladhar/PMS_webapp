/**
 * Data Validation and Transformation Service
 * Validates and transforms scraped parking data before database insertion
 */

import fs from 'fs';
import path from 'path';

class DataValidator {
  constructor() {
    this.validationRules = {
      required: ['name', 'coordinates', 'address'],
      coordinates: {
        latitude: { min: 27.6, max: 27.8 }, // Kathmandu Valley bounds
        longitude: { min: 85.2, max: 85.5 }
      },
      hourlyRate: { min: 5, max: 500 },
      totalSpaces: { min: 1, max: 1000 },
      availableSpaces: { min: 0, max: 1000 }
    };
    
    this.validationErrors = [];
    this.transformedData = [];
  }

  /**
   * Validate a single parking location record
   */
  validateParkingLocation(location) {
    const errors = [];
    
    // Required fields validation
    for (const field of this.validationRules.required) {
      if (!location[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Coordinates validation
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;
      
      if (typeof latitude !== 'number' || isNaN(latitude)) {
        errors.push('Invalid latitude: must be a number');
      } else if (latitude < this.validationRules.coordinates.latitude.min || 
                 latitude > this.validationRules.coordinates.latitude.max) {
        errors.push(`Latitude out of bounds: ${latitude} (should be between ${this.validationRules.coordinates.latitude.min} and ${this.validationRules.coordinates.latitude.max})`);
      }
      
      if (typeof longitude !== 'number' || isNaN(longitude)) {
        errors.push('Invalid longitude: must be a number');
      } else if (longitude < this.validationRules.coordinates.longitude.min || 
                 longitude > this.validationRules.coordinates.longitude.max) {
        errors.push(`Longitude out of bounds: ${longitude} (should be between ${this.validationRules.coordinates.longitude.min} and ${this.validationRules.coordinates.longitude.max})`);
      }
    }
    
    // Hourly rate validation
    if (location.hourlyRate !== undefined) {
      if (typeof location.hourlyRate !== 'number' || isNaN(location.hourlyRate)) {
        errors.push('Invalid hourlyRate: must be a number');
      } else if (location.hourlyRate < this.validationRules.hourlyRate.min || 
                 location.hourlyRate > this.validationRules.hourlyRate.max) {
        errors.push(`Hourly rate out of bounds: ${location.hourlyRate}`);
      }
    }
    
    // Spaces validation
    if (location.totalSpaces !== undefined) {
      if (!Number.isInteger(location.totalSpaces) || location.totalSpaces < this.validationRules.totalSpaces.min) {
        errors.push(`Invalid totalSpaces: ${location.totalSpaces}`);
      }
    }
    
    if (location.availableSpaces !== undefined) {
      if (!Number.isInteger(location.availableSpaces) || location.availableSpaces < 0) {
        errors.push(`Invalid availableSpaces: ${location.availableSpaces}`);
      }
      
      if (location.totalSpaces && location.availableSpaces > location.totalSpaces) {
        errors.push(`Available spaces (${location.availableSpaces}) cannot exceed total spaces (${location.totalSpaces})`);
      }
    }
    
    // Name validation
    if (location.name && typeof location.name !== 'string') {
      errors.push('Invalid name: must be a string');
    }
    
    // Address validation
    if (location.address && typeof location.address !== 'string') {
      errors.push('Invalid address: must be a string');
    }
    
    return errors;
  }

  /**
   * Transform parking location data to match database schema
   */
  transformParkingLocation(location) {
    try {
      // Calculate occupancy percentage
      let occupancyPercentage = 0;
      if (location.totalSpaces && location.availableSpaces !== undefined) {
        occupancyPercentage = Math.round(
          ((location.totalSpaces - location.availableSpaces) / location.totalSpaces) * 100
        );
      }
      
      return {
        // Basic information
        name: this.sanitizeString(location.name),
        address: this.sanitizeString(location.address),
        description: this.generateDescription(location),
        
        // Location
        coordinates: {
          latitude: parseFloat(location.coordinates.latitude.toFixed(6)),
          longitude: parseFloat(location.coordinates.longitude.toFixed(6))
        },
        
        // Capacity and availability
        totalSpaces: parseInt(location.totalSpaces) || 10,
        availableSpaces: parseInt(location.availableSpaces) || Math.floor(location.totalSpaces * 0.7),
        occupancyPercentage: Math.max(0, Math.min(100, occupancyPercentage)),
        
        // Pricing
        hourlyRate: parseFloat(location.hourlyRate) || 15,
        dailyRate: location.hourlyRate ? Math.floor(location.hourlyRate * 8) : 120,
        monthlyRate: location.hourlyRate ? Math.floor(location.hourlyRate * 200) : 3000,
        
        // Operating hours
        operatingHours: this.transformOperatingHours(location.operatingHours),
        isCurrentlyOpen: this.determineCurrentStatus(location.operatingHours),
        
        // Status
        currentStatus: location.currentStatus || 'active',
        isActive: true,
        
        // Amenities
        amenities: this.validateAmenities(location.amenities || []),
        
        // Contact information
        contactNumber: this.sanitizePhone(location.contactNumber),
        
        // Vehicle types support
        vehicleTypes: {
          car: true,
          motorcycle: true,
          bicycle: location.amenities?.includes('bicycle_parking') || false,
          truck: false // Default to false for scraped data
        },
        
        // Additional metadata
        source: 'galli_maps',
        dataQuality: this.assessDataQuality(location),
        verificationStatus: 'pending', // All scraped data needs verification
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Original scraped data for reference
        originalScrapedData: {
          source: location.source,
          searchKeyword: location.searchKeyword,
          searchCenter: location.searchCenter,
          confidence: location.metadata?.confidence || 0.5,
          scrapedAt: location.metadata?.scrapedAt,
          needsVerification: true
        }
      };
    } catch (error) {
      throw new Error(`Transformation failed: ${error.message}`);
    }
  }

  /**
   * Sanitize string inputs
   */
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ').substring(0, 255);
  }

  /**
   * Sanitize phone number
   */
  sanitizePhone(phone) {
    if (!phone) return null;
    
    // Remove non-numeric characters except +
    const cleaned = phone.toString().replace(/[^\d+]/g, '');
    
    // Validate Nepali phone number patterns
    if (cleaned.match(/^(\+977)?[0-9]{10}$/)) {
      return cleaned.startsWith('+977') ? cleaned : `+977${cleaned}`;
    }
    
    return null; // Invalid phone number
  }

  /**
   * Transform operating hours to consistent format
   */
  transformOperatingHours(operatingHours) {
    if (!operatingHours) {
      return {
        start: '06:00',
        end: '22:00',
        is24Hours: false
      };
    }
    
    return {
      start: operatingHours.start || '06:00',
      end: operatingHours.end || '22:00',
      is24Hours: operatingHours.is24Hours || false
    };
  }

  /**
   * Determine if currently open based on operating hours
   */
  determineCurrentStatus(operatingHours) {
    if (!operatingHours || operatingHours.is24Hours) {
      return true;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(operatingHours.start?.split(':')[0] || '6');
    const endHour = parseInt(operatingHours.end?.split(':')[0] || '22');
    
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Validate and standardize amenities
   */
  validateAmenities(amenities) {
    const validAmenities = [
      'security', 'cctv', 'covered_parking', 'car_wash', 'ev_charging',
      'restroom', 'lighting', 'disabled_access', 'bicycle_parking',
      'valet_parking', 'online_booking', 'mobile_payment'
    ];
    
    if (!Array.isArray(amenities)) return [];
    
    return amenities.filter(amenity => 
      validAmenities.includes(amenity) && typeof amenity === 'string'
    );
  }

  /**
   * Generate description based on location data
   */
  generateDescription(location) {
    let description = `Parking facility`;
    
    if (location.searchCenter) {
      description += ` near ${location.searchCenter}`;
    }
    
    if (location.totalSpaces) {
      description += ` with ${location.totalSpaces} parking spaces`;
    }
    
    if (location.amenities && location.amenities.length > 0) {
      description += `. Features: ${location.amenities.join(', ')}`;
    }
    
    description += '. Data sourced from Galli Maps and requires field verification.';
    
    return description;
  }

  /**
   * Assess data quality score
   */
  assessDataQuality(location) {
    let score = 0;
    let maxScore = 0;
    
    // Required fields check
    const requiredFields = ['name', 'address', 'coordinates'];
    requiredFields.forEach(field => {
      maxScore += 20;
      if (location[field]) score += 20;
    });
    
    // Optional but valuable fields
    const valuableFields = ['contactNumber', 'amenities', 'hourlyRate'];
    valuableFields.forEach(field => {
      maxScore += 10;
      if (location[field]) score += 10;
    });
    
    // Confidence from scraping
    maxScore += 20;
    if (location.metadata?.confidence) {
      score += Math.floor(location.metadata.confidence * 20);
    }
    
    return {
      score: Math.round((score / maxScore) * 100),
      level: score > 80 ? 'high' : score > 50 ? 'medium' : 'low',
      needsVerification: true
    };
  }

  /**
   * Remove duplicate locations based on coordinates and name
   */
  removeDuplicates(locations) {
    const unique = [];
    const seen = new Set();
    
    for (const location of locations) {
      const key = `${location.name.toLowerCase()}_${location.coordinates.latitude.toFixed(4)}_${location.coordinates.longitude.toFixed(4)}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(location);
      }
    }
    
    console.log(`🧹 Removed ${locations.length - unique.length} duplicate locations`);
    return unique;
  }

  /**
   * Validate and transform array of parking locations
   */
  validateAndTransform(scrapedData) {
    console.log('🔍 Starting data validation and transformation...');
    
    const results = {
      valid: [],
      invalid: [],
      transformed: [],
      summary: {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        transformedRecords: 0,
        duplicatesRemoved: 0
      }
    };
    
    try {
      const parkingLocations = scrapedData.parkingLocations || [];
      results.summary.totalRecords = parkingLocations.length;
      
      // Validate each location
      for (const location of parkingLocations) {
        const errors = this.validateParkingLocation(location);
        
        if (errors.length === 0) {
          results.valid.push(location);
        } else {
          results.invalid.push({
            data: location,
            errors: errors
          });
          console.warn(`❌ Invalid location: ${location.name} - ${errors.join(', ')}`);
        }
      }
      
      results.summary.validRecords = results.valid.length;
      results.summary.invalidRecords = results.invalid.length;
      
      // Transform valid locations
      for (const location of results.valid) {
        try {
          const transformed = this.transformParkingLocation(location);
          results.transformed.push(transformed);
        } catch (error) {
          console.error(`❌ Transformation error for ${location.name}:`, error.message);
          results.invalid.push({
            data: location,
            errors: [`Transformation failed: ${error.message}`]
          });
        }
      }
      
      // Remove duplicates
      const originalCount = results.transformed.length;
      results.transformed = this.removeDuplicates(results.transformed);
      results.summary.duplicatesRemoved = originalCount - results.transformed.length;
      results.summary.transformedRecords = results.transformed.length;
      
      console.log('✅ Validation and transformation completed');
      console.log(`📊 Summary: ${results.summary.transformedRecords} valid, ${results.summary.invalidRecords} invalid, ${results.summary.duplicatesRemoved} duplicates removed`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Validation process failed:', error);
      throw error;
    }
  }

  /**
   * Save validation results
   */
  async saveValidationResults(results) {
    try {
      const dataDir = path.join(process.cwd(), 'validated_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Save transformed data
      const transformedPath = path.join(dataDir, `transformed_parking_data_${timestamp}.json`);
      fs.writeFileSync(transformedPath, JSON.stringify({
        data: results.transformed,
        summary: results.summary,
        validatedAt: new Date().toISOString()
      }, null, 2));
      
      // Save validation report
      const reportPath = path.join(dataDir, `validation_report_${timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify({
        summary: results.summary,
        invalidRecords: results.invalid,
        validatedAt: new Date().toISOString()
      }, null, 2));
      
      console.log(`💾 Transformed data saved to: ${transformedPath}`);
      console.log(`📋 Validation report saved to: ${reportPath}`);
      
      return { transformedPath, reportPath };
      
    } catch (error) {
      console.error('Error saving validation results:', error);
      throw error;
    }
  }
}

export default DataValidator;