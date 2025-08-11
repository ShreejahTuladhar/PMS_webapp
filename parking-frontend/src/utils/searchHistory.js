class SearchHistory {
  constructor() {
    this.STORAGE_KEY = 'parkingSathi_search_history';
    this.MAX_RECENT_SEARCHES = 10;
    this.MAX_POPULAR_SEARCHES = 20;
  }

  getRecentSearches() {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      if (!history) return [];
      
      const data = JSON.parse(history);
      return data.recent || [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  addRecentSearch(searchQuery, location = null) {
    try {
      if (!searchQuery || !searchQuery.trim()) return;

      const history = this.getStoredHistory();
      const searchEntry = {
        query: searchQuery.trim(),
        location: location ? {
          lat: location.lat,
          lng: location.lng,
          address: location.address || searchQuery,
          isCurrentLocation: location.isCurrentLocation || false
        } : null,
        timestamp: Date.now(),
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Remove duplicate searches (same query)
      const filteredRecent = history.recent.filter(
        search => search.query.toLowerCase() !== searchQuery.toLowerCase()
      );

      // Add new search to the beginning
      const updatedRecent = [searchEntry, ...filteredRecent]
        .slice(0, this.MAX_RECENT_SEARCHES);

      // Update analytics for popular searches
      this.updatePopularSearches(searchQuery);

      // Save updated history
      const updatedHistory = {
        ...history,
        recent: updatedRecent,
        lastUpdated: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      
      return searchEntry;
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  }

  removeRecentSearch(searchId) {
    try {
      const history = this.getStoredHistory();
      const updatedRecent = history.recent.filter(search => search.id !== searchId);
      
      const updatedHistory = {
        ...history,
        recent: updatedRecent,
        lastUpdated: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedRecent;
    } catch (error) {
      console.error('Error removing recent search:', error);
      return this.getRecentSearches();
    }
  }

  clearRecentSearches() {
    try {
      const history = this.getStoredHistory();
      const clearedHistory = {
        ...history,
        recent: [],
        lastUpdated: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clearedHistory));
      return true;
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      return false;
    }
  }

  getPopularSearches() {
    try {
      const history = this.getStoredHistory();
      return history.popular
        .sort((a, b) => b.count - a.count)
        .slice(0, this.MAX_POPULAR_SEARCHES);
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  updatePopularSearches(searchQuery) {
    try {
      const history = this.getStoredHistory();
      const queryLower = searchQuery.toLowerCase().trim();
      
      const existingPopular = history.popular.find(
        search => search.query.toLowerCase() === queryLower
      );

      if (existingPopular) {
        existingPopular.count += 1;
        existingPopular.lastSearched = Date.now();
      } else {
        history.popular.push({
          query: searchQuery.trim(),
          count: 1,
          firstSearched: Date.now(),
          lastSearched: Date.now(),
          id: `popular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }

      // Keep only top searches
      history.popular = history.popular
        .sort((a, b) => b.count - a.count)
        .slice(0, this.MAX_POPULAR_SEARCHES);

      return history.popular;
    } catch (error) {
      console.error('Error updating popular searches:', error);
      return [];
    }
  }

  getSearchAnalytics() {
    try {
      const history = this.getStoredHistory();
      const recent = history.recent;
      const popular = history.popular;

      // Calculate analytics
      const totalSearches = popular.reduce((sum, search) => sum + search.count, 0);
      const uniqueSearches = popular.length;
      const recentSearches = recent.length;
      
      // Most searched locations
      const topSearches = popular
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Search frequency over time (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentActivity = recent.filter(search => search.timestamp > sevenDaysAgo);

      return {
        totalSearches,
        uniqueSearches,
        recentSearches,
        topSearches,
        recentActivity: recentActivity.length,
        averageSearchesPerDay: Math.round(recentActivity.length / 7),
        lastUpdated: history.lastUpdated || Date.now()
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        totalSearches: 0,
        uniqueSearches: 0,
        recentSearches: 0,
        topSearches: [],
        recentActivity: 0,
        averageSearchesPerDay: 0,
        lastUpdated: Date.now()
      };
    }
  }

  getStoredHistory() {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      if (!history) {
        return this.getDefaultHistory();
      }
      
      const data = JSON.parse(history);
      
      // Ensure structure integrity
      return {
        recent: data.recent || [],
        popular: data.popular || [],
        lastUpdated: data.lastUpdated || Date.now(),
        version: data.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error getting stored history:', error);
      return this.getDefaultHistory();
    }
  }

  getDefaultHistory() {
    return {
      recent: [],
      popular: [],
      lastUpdated: Date.now(),
      version: '1.0.0'
    };
  }

  exportHistory() {
    try {
      const history = this.getStoredHistory();
      const analytics = this.getSearchAnalytics();
      
      return {
        ...history,
        analytics,
        exportedAt: Date.now(),
        exportVersion: '1.0.0'
      };
    } catch (error) {
      console.error('Error exporting history:', error);
      return null;
    }
  }

  importHistory(historyData) {
    try {
      if (!historyData || typeof historyData !== 'object') {
        throw new Error('Invalid history data');
      }

      const validatedHistory = {
        recent: Array.isArray(historyData.recent) ? historyData.recent : [],
        popular: Array.isArray(historyData.popular) ? historyData.popular : [],
        lastUpdated: Date.now(),
        version: '1.0.0'
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedHistory));
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  // Clean old entries (older than 30 days)
  cleanup() {
    try {
      const history = this.getStoredHistory();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // Clean recent searches
      const cleanedRecent = history.recent.filter(
        search => search.timestamp > thirtyDaysAgo
      );

      // Clean popular searches that haven't been searched recently
      const cleanedPopular = history.popular.filter(
        search => search.lastSearched > thirtyDaysAgo
      );

      const cleanedHistory = {
        ...history,
        recent: cleanedRecent,
        popular: cleanedPopular,
        lastUpdated: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedHistory));
      
      console.log(`Search history cleanup completed. Removed ${history.recent.length - cleanedRecent.length} recent and ${history.popular.length - cleanedPopular.length} popular searches.`);
      
      return {
        removedRecent: history.recent.length - cleanedRecent.length,
        removedPopular: history.popular.length - cleanedPopular.length
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return { removedRecent: 0, removedPopular: 0 };
    }
  }
}

// Create singleton instance
const searchHistory = new SearchHistory();

// Auto cleanup on initialization
if (typeof window !== 'undefined') {
  // Run cleanup occasionally
  const lastCleanup = localStorage.getItem('parkingSathi_last_cleanup');
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  if (!lastCleanup || parseInt(lastCleanup) < oneDayAgo) {
    searchHistory.cleanup();
    localStorage.setItem('parkingSathi_last_cleanup', Date.now().toString());
  }
}

export default searchHistory;