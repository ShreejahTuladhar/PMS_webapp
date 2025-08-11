import { apiHelpers } from './api';

class AnalyticsService {
  constructor() {
    this.BATCH_SIZE = 10;
    this.FLUSH_INTERVAL = 30000; // 30 seconds
    this.pendingEvents = [];
    this.isOnline = navigator.onLine;
    this.setupOnlineListeners();
    this.startBatchFlushTimer();
  }

  setupOnlineListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushPendingEvents();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  startBatchFlushTimer() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.flushPendingEvents();
      }, this.FLUSH_INTERVAL);
    }
  }

  // Track search events
  async trackSearch(searchData) {
    const event = {
      type: 'search',
      data: {
        query: searchData.query,
        location: searchData.location,
        radius: searchData.radius,
        resultsCount: searchData.resultsCount || 0,
        searchType: searchData.searchType || 'manual', // manual, current_location, recent, popular
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: searchData.userId || null
      },
      id: this.generateEventId()
    };

    this.addEvent(event);
    return event.id;
  }

  // Track popular search clicks
  async trackPopularSearchClick(searchQuery, position) {
    const event = {
      type: 'popular_search_click',
      data: {
        query: searchQuery,
        position: position, // Position in the popular searches list
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      },
      id: this.generateEventId()
    };

    this.addEvent(event);
    return event.id;
  }

  // Track recent search clicks
  async trackRecentSearchClick(searchQuery, age) {
    const event = {
      type: 'recent_search_click',
      data: {
        query: searchQuery,
        age: age, // How old the search is in days
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      },
      id: this.generateEventId()
    };

    this.addEvent(event);
    return event.id;
  }

  // Track parking spot interactions
  async trackSpotInteraction(interactionData) {
    const event = {
      type: 'spot_interaction',
      data: {
        spotId: interactionData.spotId,
        spotName: interactionData.spotName,
        interactionType: interactionData.type, // view, book, favorite, directions
        searchQuery: interactionData.searchQuery,
        searchResultPosition: interactionData.position,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: interactionData.userId || null
      },
      id: this.generateEventId()
    };

    this.addEvent(event);
    return event.id;
  }

  // Track search performance metrics
  async trackSearchPerformance(performanceData) {
    const event = {
      type: 'search_performance',
      data: {
        query: performanceData.query,
        searchDuration: performanceData.duration, // in milliseconds
        resultsCount: performanceData.resultsCount,
        apiEndpoint: performanceData.endpoint,
        success: performanceData.success,
        errorMessage: performanceData.error || null,
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      },
      id: this.generateEventId()
    };

    this.addEvent(event);
    return event.id;
  }

  // Get popular search trends from backend
  async getPopularSearchTrends(period = '7d') {
    try {
      const result = await apiHelpers.get('/analytics/popular-searches', {
        params: { period }
      });
      
      if (result.success) {
        return {
          success: true,
          trends: result.data.trends,
          period: result.data.period,
          totalSearches: result.data.totalSearches,
          updatedAt: result.data.updatedAt
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch popular search trends'
      };
    }
  }

  // Get search analytics from backend
  async getSearchAnalytics(params = {}) {
    try {
      const result = await apiHelpers.get('/analytics/search-metrics', {
        params: {
          period: params.period || '30d',
          userId: params.userId || null,
          includeGeographic: params.includeGeographic || true,
          includeTrends: params.includeTrends || true,
          ...params
        }
      });
      
      if (result.success) {
        return {
          success: true,
          analytics: result.data.analytics,
          period: result.data.period,
          lastUpdated: result.data.lastUpdated
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch search analytics'
      };
    }
  }

  // Internal methods
  addEvent(event) {
    this.pendingEvents.push(event);
    
    // Auto-flush if batch is full
    if (this.pendingEvents.length >= this.BATCH_SIZE) {
      this.flushPendingEvents();
    }
  }

  async flushPendingEvents() {
    if (!this.isOnline || this.pendingEvents.length === 0) {
      return;
    }

    const eventsToSend = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      const result = await apiHelpers.post('/analytics/events', {
        events: eventsToSend,
        batchId: this.generateBatchId(),
        timestamp: Date.now()
      });

      if (!result.success) {
        console.warn('Failed to send analytics events:', result.error);
        // Re-add failed events to pending (up to a limit to avoid memory issues)
        if (this.pendingEvents.length < 50) {
          this.pendingEvents.unshift(...eventsToSend);
        }
      }
    } catch (error) {
      console.warn('Error sending analytics events:', error);
      // Re-add failed events to pending (up to a limit)
      if (this.pendingEvents.length < 50) {
        this.pendingEvents.unshift(...eventsToSend);
      }
    }
  }

  getSessionId() {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('parkingSathi_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('parkingSathi_session_id', sessionId);
    }
    return sessionId;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for client-side analytics aggregation
  aggregateLocalSearchData(searchHistory) {
    try {
      const analytics = searchHistory.getSearchAnalytics();
      const recent = searchHistory.getRecentSearches();
      const popular = searchHistory.getPopularSearches();

      // Geographic distribution
      const locationCounts = {};
      recent.forEach(search => {
        if (search.location && search.location.address) {
          const area = search.location.address.split(',')[0] || 'Unknown';
          locationCounts[area] = (locationCounts[area] || 0) + 1;
        }
      });

      // Search timing patterns
      const hourlyDistribution = {};
      recent.forEach(search => {
        const hour = new Date(search.timestamp).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      });

      // Search frequency trends
      const dailySearches = {};
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      recent
        .filter(search => search.timestamp > sevenDaysAgo)
        .forEach(search => {
          const day = new Date(search.timestamp).toDateString();
          dailySearches[day] = (dailySearches[day] || 0) + 1;
        });

      return {
        ...analytics,
        locationDistribution: Object.entries(locationCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        hourlyDistribution,
        dailySearchTrends: dailySearches,
        popularQueries: popular.slice(0, 10),
        searchPatterns: this.analyzeSearchPatterns(recent)
      };
    } catch (error) {
      console.error('Error aggregating local search data:', error);
      return null;
    }
  }

  analyzeSearchPatterns(searches) {
    try {
      // Analyze search patterns
      const patterns = {
        repeatSearches: 0,
        locationBasedSearches: 0,
        currentLocationSearches: 0,
        averageTimeBetweenSearches: 0
      };

      const queryCount = {};
      let totalTimeDiff = 0;
      let timeDiffCount = 0;

      searches.forEach((search, index) => {
        // Count repeat searches
        queryCount[search.query] = (queryCount[search.query] || 0) + 1;

        // Count location types
        if (search.location) {
          if (search.location.isCurrentLocation) {
            patterns.currentLocationSearches++;
          } else {
            patterns.locationBasedSearches++;
          }
        }

        // Calculate time between searches
        if (index > 0) {
          const timeDiff = search.timestamp - searches[index - 1].timestamp;
          totalTimeDiff += timeDiff;
          timeDiffCount++;
        }
      });

      patterns.repeatSearches = Object.values(queryCount)
        .filter(count => count > 1).length;
      
      if (timeDiffCount > 0) {
        patterns.averageTimeBetweenSearches = Math.round(totalTimeDiff / timeDiffCount / 1000 / 60); // in minutes
      }

      return patterns;
    } catch (error) {
      console.error('Error analyzing search patterns:', error);
      return {
        repeatSearches: 0,
        locationBasedSearches: 0,
        currentLocationSearches: 0,
        averageTimeBetweenSearches: 0
      };
    }
  }

  // Method to get insights for users
  async getSearchInsights() {
    try {
      const result = await apiHelpers.get('/analytics/search-insights');
      
      if (result.success) {
        return {
          success: true,
          insights: result.data.insights,
          recommendations: result.data.recommendations,
          trends: result.data.trends
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch search insights'
      };
    }
  }

  // Cleanup method for when component unmounts
  destroy() {
    this.flushPendingEvents();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;