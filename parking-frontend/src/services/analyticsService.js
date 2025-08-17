/**
 * Analytics Service
 * Handles all analytics API requests for business intelligence
 * Author: Claude & Shreeraj Tuladhar
 */

import axiosInstance from './axiosInstance';

class AnalyticsService {
  
  /**
   * Get dashboard summary analytics
   * @param {string} timeframe - 1d, 7d, 30d, 90d
   * @returns {Promise<Object>} Dashboard analytics data
   */
  async getDashboardSummary(timeframe = '7d') {
    try {
      const response = await axiosInstance.get(`/analytics/dashboard?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch dashboard summary');
    }
  }

  /**
   * Get revenue analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.locationId) params.append('locationId', options.locationId);
      if (options.groupBy) params.append('groupBy', options.groupBy);

      const response = await axiosInstance.get(`/analytics/revenue?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch revenue analytics');
    }
  }

  /**
   * Get real-time occupancy analytics
   * @param {string} locationId - Optional specific location ID
   * @returns {Promise<Object>} Occupancy analytics data
   */
  async getOccupancyAnalytics(locationId = null) {
    try {
      const params = locationId ? `?locationId=${locationId}` : '';
      const response = await axiosInstance.get(`/analytics/occupancy${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch occupancy analytics');
    }
  }

  /**
   * Get customer behavior analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomerAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.limit) params.append('limit', options.limit);

      const response = await axiosInstance.get(`/analytics/customers?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch customer analytics');
    }
  }

  /**
   * Get demand forecasting
   * @param {Object} options - Forecasting options
   * @returns {Promise<Object>} Demand forecast data
   */
  async getDemandForecast(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.locationId) params.append('locationId', options.locationId);
      if (options.forecastDays) params.append('forecastDays', options.forecastDays);
      if (options.historicalDays) params.append('historicalDays', options.historicalDays);

      const response = await axiosInstance.get(`/analytics/forecast?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch demand forecast');
    }
  }

  /**
   * Get database health metrics (super admin only)
   * @returns {Promise<Object>} Database health data
   */
  async getDatabaseHealth() {
    try {
      const response = await axiosInstance.get('/analytics/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch database health');
    }
  }

  /**
   * Get real-time analytics for live dashboards
   * @returns {Promise<Object>} Real-time analytics
   */
  async getRealTimeAnalytics() {
    try {
      const [occupancy, recentRevenue] = await Promise.all([
        this.getOccupancyAnalytics(),
        this.getRevenueAnalytics({
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          endDate: new Date(),
          groupBy: 'hour'
        })
      ]);

      return {
        occupancy: occupancy.data,
        recentRevenue: recentRevenue.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch real-time analytics');
    }
  }

  /**
   * Get analytics for chart data
   * @param {string} type - Chart type: 'revenue', 'occupancy', 'customers'
   * @param {Object} options - Chart options
   * @returns {Promise<Object>} Chart-ready analytics data
   */
  async getChartData(type, options = {}) {
    try {
      let data;
      
      switch (type) {
        case 'revenue':
          data = await this.getRevenueAnalytics(options);
          return this.formatRevenueChartData(data.data);
          
        case 'occupancy':
          data = await this.getOccupancyAnalytics(options.locationId);
          return this.formatOccupancyChartData(data.data);
          
        case 'customers':
          data = await this.getCustomerAnalytics(options);
          return this.formatCustomerChartData(data.data);
          
        case 'forecast':
          data = await this.getDemandForecast(options);
          return this.formatForecastChartData(data.data);
          
        default:
          throw new Error(`Unknown chart type: ${type}`);
      }
    } catch (error) {
      throw this.handleError(error, `Failed to fetch ${type} chart data`);
    }
  }

  /**
   * Format revenue data for charts
   */
  formatRevenueChartData(revenueData) {
    const { analytics, summary } = revenueData;
    
    return {
      chartData: analytics.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        revenue: item.totalRevenue,
        bookings: item.bookingCount,
        averageValue: item.averageBookingValue,
        customers: item.uniqueCustomerCount
      })),
      summary: {
        totalRevenue: summary.totalRevenue,
        totalBookings: summary.totalBookings,
        averageRevenue: summary.averageRevenue,
        maxRevenue: summary.maxRevenue,
        minRevenue: summary.minRevenue
      },
      period: revenueData.period
    };
  }

  /**
   * Format occupancy data for charts
   */
  formatOccupancyChartData(occupancyData) {
    const { locations, overallStats } = occupancyData;
    
    return {
      chartData: locations.map(location => ({
        name: location.name,
        occupancy: location.currentOccupancy,
        capacity: location.totalSpaces,
        occupancyPercentage: location.occupancyPercentage,
        hourlyRate: location.hourlyRate
      })),
      summary: overallStats,
      topLocations: locations
        .sort((a, b) => b.occupancyPercentage - a.occupancyPercentage)
        .slice(0, 10),
      timestamp: occupancyData.timestamp
    };
  }

  /**
   * Format customer data for charts
   */
  formatCustomerChartData(customerData) {
    const { customerSegmentation, segmentSummary } = customerData;
    
    return {
      chartData: customerSegmentation.map(customer => ({
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        totalSpent: customer.totalSpent,
        totalBookings: customer.totalBookings,
        avgBookingValue: customer.avgBookingValue,
        segment: customer.customerSegment,
        daysSinceLastBooking: customer.daysSinceLastBooking
      })),
      segmentData: segmentSummary.map(segment => ({
        segment: segment._id,
        count: segment.count,
        revenue: segment.totalRevenue
      })),
      topCustomers: customerSegmentation.slice(0, 10)
    };
  }

  /**
   * Format forecast data for charts
   */
  formatForecastChartData(forecastData) {
    const { forecast, metadata } = forecastData;
    
    return {
      chartData: forecast.map(day => ({
        date: day.date,
        expectedBookings: day.totalExpectedBookings,
        expectedRevenue: day.totalExpectedRevenue,
        dayOfWeek: day.dayOfWeek,
        hourlyData: day.hourlyForecast
      })),
      summary: {
        totalExpectedBookings: forecast.reduce((sum, day) => sum + day.totalExpectedBookings, 0),
        totalExpectedRevenue: forecast.reduce((sum, day) => sum + day.totalExpectedRevenue, 0),
        averageBookingsPerDay: forecast.reduce((sum, day) => sum + day.totalExpectedBookings, 0) / forecast.length,
        confidence: metadata.confidence
      },
      metadata
    };
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || defaultMessage;
      const status = error.response.status;
      return new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Error in setting up the request
      return new Error(error.message || defaultMessage);
    }
  }

  /**
   * Cache management for analytics data
   */
  static createCacheKey(endpoint, params) {
    return `analytics_${endpoint}_${JSON.stringify(params)}`;
  }

  /**
   * Get cached analytics data
   */
  getCachedData(key, maxAge = 300000) { // 5 minutes default
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Set cached analytics data
   */
  setCachedData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch {
      // Cache storage failed, continue without caching
    }
  }
}

export default new AnalyticsService();