#!/usr/bin/env node

/**
 * Automated Parking Data Sync Script
 * Orchestrates the complete process: Scrape → Validate → Import to Database
 * 
 * Usage:
 * node syncParkingData.js --token YOUR_GALLI_MAPS_TOKEN
 * 
 * Environment Variables:
 * - GALLI_MAPS_TOKEN: Your Galli Maps API access token
 * - MONGODB_URI: MongoDB connection string
 * - DB_NAME: Database name (default: parking_management)
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import GalliMapsScraper from './galliMapsScraper.js';
import DataValidator from './dataValidator.js';
import DatabaseService from './databaseService.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

class ParkingDataSyncService {
  constructor(options = {}) {
    this.config = {
      galliMapsToken: options.galliMapsToken || process.env.GALLI_MAPS_TOKEN,
      mongoUri: options.mongoUri || process.env.MONGODB_URI,
      dbName: options.dbName || process.env.DB_NAME || 'parking_management',
      collectionName: options.collectionName || 'locations',
      dryRun: options.dryRun || false,
      skipValidation: options.skipValidation || false,
      skipImport: options.skipImport || false,
      logLevel: options.logLevel || 'info'
    };
    
    this.spinner = null;
    this.results = {
      scraping: null,
      validation: null,
      import: null,
      summary: {
        startTime: new Date(),
        endTime: null,
        totalDuration: 0,
        success: false,
        errors: []
      }
    };
    
    // Validate required configuration
    this.validateConfig();
  }

  /**
   * Validate configuration before starting
   */
  validateConfig() {
    const errors = [];
    
    if (!this.config.galliMapsToken) {
      errors.push('Galli Maps API token is required. Set GALLI_MAPS_TOKEN environment variable or use --token flag.');
    }
    
    if (!this.config.skipImport && !this.config.mongoUri) {
      errors.push('MongoDB connection URI is required. Set MONGODB_URI environment variable or use --mongo-uri flag.');
    }
    
    if (errors.length > 0) {
      console.error(chalk.red('❌ Configuration errors:'));
      errors.forEach(error => console.error(chalk.red(`  • ${error}`)));
      process.exit(1);
    }
  }

  /**
   * Start spinner with message
   */
  startSpinner(message) {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora(message).start();
  }

  /**
   * Stop spinner with success message
   */
  succeedSpinner(message) {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  /**
   * Stop spinner with error message
   */
  failSpinner(message) {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  /**
   * Log message with level
   */
  log(level, message, data = null) {
    if (this.spinner) {
      this.spinner.stop();
    }
    
    const colors = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    };
    
    const color = colors[level] || 'white';
    console.log(chalk[color](message));
    
    if (data && this.config.logLevel === 'debug') {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
    
    if (this.spinner) {
      this.spinner.start();
    }
  }

  /**
   * Step 1: Scrape parking data from Galli Maps
   */
  async scrapeParkingData() {
    try {
      this.startSpinner('Scraping parking data from Galli Maps API...');
      
      const scraper = new GalliMapsScraper(this.config.galliMapsToken);
      const scrapedData = await scraper.scrapeAllParkingData();
      
      this.results.scraping = {
        success: true,
        data: scrapedData,
        summary: scrapedData.summary
      };
      
      this.succeedSpinner(
        `Scraped ${scrapedData.summary.totalParkingLocations} parking locations and ${scrapedData.summary.totalAmenityData} amenity records`
      );
      
      return scrapedData;
      
    } catch (error) {
      this.failSpinner('Failed to scrape parking data');
      this.results.scraping = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Step 2: Validate and transform scraped data
   */
  async validateData(scrapedData) {
    try {
      if (this.config.skipValidation) {
        this.log('warning', 'Skipping validation as requested');
        return { transformed: scrapedData.parkingLocations };
      }
      
      this.startSpinner('Validating and transforming scraped data...');
      
      const validator = new DataValidator();
      const validationResults = validator.validateAndTransform(scrapedData);
      
      // Save validation results
      await validator.saveValidationResults(validationResults);
      
      this.results.validation = {
        success: true,
        results: validationResults
      };
      
      this.succeedSpinner(
        `Validated data: ${validationResults.summary.transformedRecords} valid records ready for import`
      );
      
      if (validationResults.summary.invalidRecords > 0) {
        this.log('warning', 
          `Found ${validationResults.summary.invalidRecords} invalid records that will be skipped`
        );
      }
      
      return validationResults;
      
    } catch (error) {
      this.failSpinner('Data validation failed');
      this.results.validation = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Step 3: Import validated data to database
   */
  async importToDatabase(validatedData) {
    try {
      if (this.config.skipImport) {
        this.log('warning', 'Skipping database import as requested');
        return { summary: { note: 'Import skipped' } };
      }
      
      if (this.config.dryRun) {
        this.log('info', 'Dry run mode: Simulating database import...');
        return { 
          summary: { 
            note: 'Dry run - no actual import performed',
            wouldImport: validatedData.length 
          } 
        };
      }
      
      this.startSpinner('Importing validated data to MongoDB...');
      
      const dbService = new DatabaseService({
        connectionString: this.config.mongoUri,
        databaseName: this.config.dbName,
        collectionName: this.config.collectionName
      });
      
      const importResults = await dbService.importParkingData(validatedData);
      
      this.results.import = {
        success: true,
        results: importResults
      };
      
      this.succeedSpinner(
        `Import completed: ${importResults.summary.successfulInsertions} inserted, ${importResults.summary.duplicatesSkipped} duplicates skipped`
      );
      
      return importResults;
      
    } catch (error) {
      this.failSpinner('Database import failed');
      this.results.import = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Generate comprehensive sync report
   */
  generateSyncReport() {
    const report = {
      syncId: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configuration: {
        dryRun: this.config.dryRun,
        skipValidation: this.config.skipValidation,
        skipImport: this.config.skipImport,
        database: this.config.dbName,
        collection: this.config.collectionName
      },
      timing: {
        startTime: this.results.summary.startTime,
        endTime: this.results.summary.endTime,
        totalDuration: this.results.summary.totalDuration
      },
      results: {
        scraping: this.results.scraping,
        validation: this.results.validation,
        import: this.results.import
      },
      summary: {
        success: this.results.summary.success,
        errors: this.results.summary.errors,
        totalLocationsProcessed: this.results.scraping?.summary?.totalParkingLocations || 0,
        validLocations: this.results.validation?.results?.summary?.transformedRecords || 0,
        importedLocations: this.results.import?.results?.summary?.successfulInsertions || 0
      }
    };
    
    return report;
  }

  /**
   * Save sync report to file
   */
  async saveSyncReport(report) {
    try {
      const reportsDir = path.join(process.cwd(), 'sync_reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportsDir, `sync_report_${timestamp}.json`);
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.log('info', `📋 Sync report saved: ${reportPath}`);
      return reportPath;
      
    } catch (error) {
      this.log('error', 'Failed to save sync report:', error.message);
    }
  }

  /**
   * Print final summary
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold.cyan('🎯 PARKING DATA SYNC SUMMARY'));
    console.log('='.repeat(60));
    
    console.log(chalk.blue(`📊 Sync ID: ${report.syncId}`));
    console.log(chalk.blue(`⏱️ Duration: ${(report.timing.totalDuration / 1000).toFixed(1)}s`));
    console.log(chalk.blue(`📅 Completed: ${report.timing.endTime.toLocaleString()}`));
    
    console.log('\n' + chalk.bold('Results:'));
    console.log(chalk.green(`✅ Locations Scraped: ${report.summary.totalLocationsProcessed}`));
    console.log(chalk.green(`✅ Valid Locations: ${report.summary.validLocations}`));
    console.log(chalk.green(`✅ Successfully Imported: ${report.summary.importedLocations}`));
    
    if (report.summary.errors.length > 0) {
      console.log('\n' + chalk.bold.red('❌ Errors encountered:'));
      report.summary.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (report.summary.success) {
      console.log(chalk.bold.green('🎉 Sync completed successfully!'));
    } else {
      console.log(chalk.bold.red('💥 Sync completed with errors.'));
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Main sync orchestration method
   */
  async runSync() {
    try {
      this.log('info', '🚀 Starting parking data synchronization...');
      this.log('info', `📋 Configuration: DB=${this.config.dbName}, DryRun=${this.config.dryRun}`);
      
      // Step 1: Scrape data
      const scrapedData = await this.scrapeParkingData();
      
      // Step 2: Validate and transform
      const validationResults = await this.validateData(scrapedData);
      const validatedData = validationResults.transformed || [];
      
      // Step 3: Import to database
      await this.importToDatabase(validatedData);
      
      // Mark as successful
      this.results.summary.success = true;
      
    } catch (error) {
      this.results.summary.errors.push(error.message);
      this.results.summary.success = false;
      this.log('error', '❌ Sync process failed:', error.message);
      throw error;
    } finally {
      // Calculate final timing
      this.results.summary.endTime = new Date();
      this.results.summary.totalDuration = this.results.summary.endTime - this.results.summary.startTime;
      
      // Generate and save report
      const report = this.generateSyncReport();
      await this.saveSyncReport(report);
      
      // Print summary
      this.printSummary(report);
      
      // Stop any remaining spinner
      if (this.spinner) {
        this.spinner.stop();
      }
    }
  }
}

/**
 * CLI Setup
 */
const program = new Command();

program
  .name('sync-parking-data')
  .description('Scrape parking data from Galli Maps and populate MongoDB database')
  .version('1.0.0')
  .option('-t, --token <token>', 'Galli Maps API access token')
  .option('-m, --mongo-uri <uri>', 'MongoDB connection URI')
  .option('-d, --database <name>', 'Database name', 'parking_management')
  .option('-c, --collection <name>', 'Collection name', 'locations')
  .option('--dry-run', 'Perform dry run (no database changes)', false)
  .option('--skip-validation', 'Skip data validation step', false)
  .option('--skip-import', 'Skip database import step', false)
  .option('--log-level <level>', 'Log level (info|debug)', 'info')
  .action(async (options) => {
    try {
      const syncService = new ParkingDataSyncService(options);
      await syncService.runSync();
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('💥 Sync failed with error:'), error.message);
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('💥 Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught Exception:'), error);
  process.exit(1);
});

// Parse CLI arguments and run
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export default ParkingDataSyncService;