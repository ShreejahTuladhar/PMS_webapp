/**
 * Location Accuracy Checker
 * Validates and fixes location data inconsistencies
 * Author: Claude & Shreeraj Tuladhar
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ParkingLocation = require('../models/ParkingLocation');

class LocationAccuracyChecker {
  
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.stats = {
      total: 0,
      duplicates: 0,
      invalidCoordinates: 0,
      missingCity: 0,
      inconsistentNames: 0,
      fixedCount: 0
    };
  }

  async runCheck() {
    try {
      console.log('🔍 Starting Location Accuracy Check...\n');
      
      await this.connectDatabase();
      await this.loadLocations();
      await this.checkForDuplicates();
      await this.validateCoordinates();
      await this.checkCityConsistency();
      await this.validateNames();
      await this.checkSearchability();
      await this.generateReport();
      
      if (this.issues.length > 0) {
        await this.offerFixes();
      }
      
      console.log('\n✅ Location accuracy check completed!');
      process.exit(0);
      
    } catch (error) {
      console.error('\n❌ Location check failed:', error.message);
      process.exit(1);
    }
  }

  async connectDatabase() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`📡 Connected to: ${mongoose.connection.name}`);
  }

  async loadLocations() {
    this.locations = await ParkingLocation.find({}).lean();
    this.stats.total = this.locations.length;
    console.log(`📍 Loaded ${this.stats.total} parking locations\n`);
  }

  async checkForDuplicates() {
    console.log('🔍 Checking for duplicate locations...');
    
    const nameGroups = {};
    const coordinateGroups = {};
    
    this.locations.forEach(location => {
      // Group by name
      const normalizedName = location.name.toLowerCase().trim();
      if (!nameGroups[normalizedName]) nameGroups[normalizedName] = [];
      nameGroups[normalizedName].push(location);
      
      // Group by coordinates (within 50 meters)
      const coordKey = `${Math.round(location.coordinates.coordinates[0] * 1000)},${Math.round(location.coordinates.coordinates[1] * 1000)}`;
      if (!coordinateGroups[coordKey]) coordinateGroups[coordKey] = [];
      coordinateGroups[coordKey].push(location);
    });
    
    // Find duplicates by name
    Object.entries(nameGroups).forEach(([name, locations]) => {
      if (locations.length > 1) {
        this.stats.duplicates += locations.length - 1;
        this.issues.push({
          type: 'duplicate_name',
          message: `Duplicate name "${name}" found in ${locations.length} locations`,
          locations: locations.map(l => ({ id: l._id, name: l.name, address: l.address })),
          severity: 'medium'
        });
      }
    });
    
    // Find duplicates by coordinates
    Object.entries(coordinateGroups).forEach(([coords, locations]) => {
      if (locations.length > 1) {
        this.issues.push({
          type: 'duplicate_coordinates',
          message: `Same coordinates found for ${locations.length} locations`,
          locations: locations.map(l => ({ id: l._id, name: l.name, coordinates: l.coordinates.coordinates })),
          severity: 'high'
        });
      }
    });
    
    console.log(`   Found ${this.stats.duplicates} potential duplicate locations`);
  }

  async validateCoordinates() {
    console.log('🌍 Validating coordinates...');
    
    this.locations.forEach(location => {
      const [lng, lat] = location.coordinates.coordinates;
      
      // Check if coordinates are within Nepal bounds (rough approximation)
      const nepalBounds = {
        minLat: 26.3, maxLat: 30.5,
        minLng: 80.0, maxLng: 88.2
      };
      
      if (lat < nepalBounds.minLat || lat > nepalBounds.maxLat || 
          lng < nepalBounds.minLng || lng > nepalBounds.maxLng) {
        this.stats.invalidCoordinates++;
        this.issues.push({
          type: 'invalid_coordinates',
          message: `Location "${location.name}" has coordinates outside Nepal`,
          location: { id: location._id, name: location.name, coordinates: [lng, lat] },
          severity: 'high'
        });
      }
      
      // Check for zero coordinates
      if (lng === 0 || lat === 0) {
        this.stats.invalidCoordinates++;
        this.issues.push({
          type: 'zero_coordinates',
          message: `Location "${location.name}" has zero coordinates`,
          location: { id: location._id, name: location.name, coordinates: [lng, lat] },
          severity: 'critical'
        });
      }
    });
    
    console.log(`   Found ${this.stats.invalidCoordinates} locations with invalid coordinates`);
  }

  async checkCityConsistency() {
    console.log('🏙️  Checking city consistency...');
    
    const cityVariations = {};
    
    this.locations.forEach(location => {
      if (!location.city) {
        this.stats.missingCity++;
        this.issues.push({
          type: 'missing_city',
          message: `Location "${location.name}" is missing city field`,
          location: { id: location._id, name: location.name, address: location.address },
          severity: 'medium'
        });
        return;
      }
      
      const city = location.city.toLowerCase().trim();
      if (!cityVariations[city]) cityVariations[city] = [];
      cityVariations[city].push(location);
    });
    
    // Check for city name variations
    const potentialDuplicates = [];
    const cities = Object.keys(cityVariations);
    
    cities.forEach(city1 => {
      cities.forEach(city2 => {
        if (city1 !== city2 && this.isStringSimilar(city1, city2, 0.8)) {
          potentialDuplicates.push([city1, city2]);
        }
      });
    });
    
    potentialDuplicates.forEach(([city1, city2]) => {
      this.issues.push({
        type: 'city_variation',
        message: `Potential city name variations: "${city1}" and "${city2}"`,
        data: { city1, city2, count1: cityVariations[city1].length, count2: cityVariations[city2].length },
        severity: 'low'
      });
    });
    
    console.log(`   Found ${this.stats.missingCity} locations with missing city data`);
  }

  async validateNames() {
    console.log('📝 Validating location names...');
    
    this.locations.forEach(location => {
      const name = location.name;
      
      // Check for very long names
      if (name.length > 100) {
        this.stats.inconsistentNames++;
        this.issues.push({
          type: 'long_name',
          message: `Location name too long (${name.length} chars): "${name.substring(0, 50)}..."`,
          location: { id: location._id, name: name },
          severity: 'low'
        });
      }
      
      // Check for repeated words in name
      const words = name.toLowerCase().split(/\s+/);
      const duplicateWords = words.filter((word, index) => words.indexOf(word) !== index);
      if (duplicateWords.length > 0) {
        this.stats.inconsistentNames++;
        this.issues.push({
          type: 'repeated_words',
          message: `Location name has repeated words: "${name}"`,
          location: { id: location._id, name: name },
          repeatedWords: [...new Set(duplicateWords)],
          severity: 'medium'
        });
      }
      
      // Check for inconsistent formatting
      if (name !== name.trim() || /\s{2,}/.test(name)) {
        this.stats.inconsistentNames++;
        this.issues.push({
          type: 'formatting_issue',
          message: `Location name has formatting issues: "${name}"`,
          location: { id: location._id, name: name },
          severity: 'low'
        });
      }
    });
    
    console.log(`   Found ${this.stats.inconsistentNames} locations with name issues`);
  }

  async checkSearchability() {
    console.log('🔍 Checking search functionality...');
    
    // Test common search terms
    const testTerms = ['patan', 'kathmandu', 'durbar', 'thamel', 'ratna', 'parking'];
    
    for (const term of testTerms) {
      const results = await this.simulateSearch(term);
      
      if (results.length === 0) {
        // Check if there should be results
        const expectedResults = this.locations.filter(loc => 
          loc.name.toLowerCase().includes(term.toLowerCase()) ||
          loc.address.toLowerCase().includes(term.toLowerCase()) ||
          (loc.city && loc.city.toLowerCase().includes(term.toLowerCase()))
        );
        
        if (expectedResults.length > 0) {
          this.issues.push({
            type: 'search_mismatch',
            message: `Search term "${term}" returns no results but ${expectedResults.length} locations should match`,
            searchTerm: term,
            expectedCount: expectedResults.length,
            actualCount: results.length,
            severity: 'high'
          });
        }
      }
    }
  }

  async simulateSearch(term) {
    // Simulate the search logic that might be used in the frontend
    return this.locations.filter(location => {
      const searchFields = [
        location.name,
        location.address,
        location.city || ''
      ].join(' ').toLowerCase();
      
      return searchFields.includes(term.toLowerCase());
    });
  }

  async generateReport() {
    console.log('\n📊 Location Accuracy Report');
    console.log('============================');
    console.log(`Total Locations: ${this.stats.total}`);
    console.log(`Issues Found: ${this.issues.length}`);
    console.log(`  🔴 Critical: ${this.issues.filter(i => i.severity === 'critical').length}`);
    console.log(`  🟠 High: ${this.issues.filter(i => i.severity === 'high').length}`);
    console.log(`  🟡 Medium: ${this.issues.filter(i => i.severity === 'medium').length}`);
    console.log(`  🟢 Low: ${this.issues.filter(i => i.severity === 'low').length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Issues Detail:');
      this.issues.forEach((issue, index) => {
        const icon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[issue.severity];
        
        console.log(`\n${index + 1}. ${icon} ${issue.message}`);
        if (issue.locations) {
          issue.locations.slice(0, 3).forEach(loc => {
            console.log(`   - ${loc.name} (${loc.id})`);
          });
          if (issue.locations.length > 3) {
            console.log(`   ... and ${issue.locations.length - 3} more`);
          }
        }
      });
    }
  }

  async offerFixes() {
    console.log('\n🔧 Automated Fixes Available:');
    
    const fixableIssues = this.issues.filter(issue => 
      ['formatting_issue', 'repeated_words', 'missing_city'].includes(issue.type)
    );
    
    if (fixableIssues.length === 0) {
      console.log('   No automated fixes available for current issues.');
      return;
    }
    
    console.log(`   ${fixableIssues.length} issues can be automatically fixed.`);
    console.log('   Run with --fix flag to apply automated fixes.');
    
    // Show what would be fixed
    fixableIssues.forEach(issue => {
      console.log(`   - ${issue.type}: ${issue.message}`);
    });
    
    if (process.argv.includes('--fix')) {
      await this.applyFixes(fixableIssues);
    }
  }

  async applyFixes(fixableIssues) {
    console.log('\n🔧 Applying automated fixes...');
    
    for (const issue of fixableIssues) {
      try {
        if (issue.type === 'formatting_issue') {
          await ParkingLocation.updateOne(
            { _id: issue.location.id },
            { name: issue.location.name.trim().replace(/\s+/g, ' ') }
          );
          this.stats.fixedCount++;
          console.log(`   ✅ Fixed formatting for: ${issue.location.name}`);
        }
        
        if (issue.type === 'repeated_words') {
          const cleanName = this.removeRepeatedWords(issue.location.name);
          await ParkingLocation.updateOne(
            { _id: issue.location.id },
            { name: cleanName }
          );
          this.stats.fixedCount++;
          console.log(`   ✅ Fixed repeated words: ${issue.location.name} → ${cleanName}`);
        }
        
        if (issue.type === 'missing_city') {
          const inferredCity = this.inferCityFromAddress(issue.location.address);
          if (inferredCity) {
            await ParkingLocation.updateOne(
              { _id: issue.location.id },
              { city: inferredCity }
            );
            this.stats.fixedCount++;
            console.log(`   ✅ Added city "${inferredCity}" for: ${issue.location.name}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Failed to fix ${issue.type}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Applied ${this.stats.fixedCount} automated fixes!`);
  }

  removeRepeatedWords(text) {
    const words = text.split(/\s+/);
    const uniqueWords = [];
    const seen = new Set();
    
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (!seen.has(lowerWord)) {
        seen.add(lowerWord);
        uniqueWords.push(word);
      }
    });
    
    return uniqueWords.join(' ');
  }

  inferCityFromAddress(address) {
    const cityKeywords = {
      'kathmandu': ['kathmandu', 'ktm'],
      'patan': ['patan', 'lalitpur'],
      'bhaktapur': ['bhaktapur'],
      'pokhara': ['pokhara']
    };
    
    const lowerAddress = address.toLowerCase();
    
    for (const [city, keywords] of Object.entries(cityKeywords)) {
      if (keywords.some(keyword => lowerAddress.includes(keyword))) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    
    return null;
  }

  isStringSimilar(str1, str2, threshold = 0.8) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length >= threshold;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Run the checker
if (require.main === module) {
  const checker = new LocationAccuracyChecker();
  checker.runCheck();
}

module.exports = LocationAccuracyChecker;