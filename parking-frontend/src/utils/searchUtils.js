// Enhanced search utilities with fuzzy matching and smart suggestions

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and spell correction
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLen - distance) / maxLen;
}

/**
 * Enhanced search with fuzzy matching, spell correction, and smart suggestions
 */
export class EnhancedSearch {
  constructor(locations = []) {
    this.locations = locations;
    this.cache = new Map(); // Cache for performance
  }

  /**
   * Update the locations database
   */
  updateLocations(locations) {
    this.locations = locations;
    this.cache.clear(); // Clear cache when locations change
  }

  /**
   * Get smart suggestions with fuzzy matching and spell correction
   */
  getSmartSuggestions(query, maxResults = 8) {
    if (!query || query.length < 1) return [];
    
    const cacheKey = `${query.toLowerCase()}_${maxResults}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const queryLower = query.toLowerCase().trim();
    const results = [];

    // 1. Exact matches (highest priority)
    this.locations.forEach(location => {
      if (location.toLowerCase() === queryLower) {
        results.push({
          text: location,
          type: 'exact',
          confidence: 1.0,
          reason: 'Exact match'
        });
      }
    });

    // 2. Starts with query (high priority)
    this.locations.forEach(location => {
      if (location.toLowerCase().startsWith(queryLower) && 
          !results.find(r => r.text === location)) {
        results.push({
          text: location,
          type: 'prefix',
          confidence: 0.9,
          reason: 'Starts with your input'
        });
      }
    });

    // 3. Contains query (medium priority)
    this.locations.forEach(location => {
      if (location.toLowerCase().includes(queryLower) && 
          !results.find(r => r.text === location)) {
        results.push({
          text: location,
          type: 'contains',
          confidence: 0.7,
          reason: 'Contains your search'
        });
      }
    });

    // 4. Fuzzy matches for potential typos (lower priority)
    if (queryLower.length >= 3) {
      this.locations.forEach(location => {
        if (!results.find(r => r.text === location)) {
          const similarity = calculateSimilarity(queryLower, location.toLowerCase());
          
          // Consider it a fuzzy match if similarity > 0.6
          if (similarity > 0.6) {
            let reason = 'Similar spelling';
            if (similarity > 0.8) reason = 'Possible typo correction';
            
            results.push({
              text: location,
              type: 'fuzzy',
              confidence: similarity,
              reason: reason
            });
          }
        }
      });
    }

    // 5. Word-based partial matches (for multi-word locations)
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length > 0) {
      this.locations.forEach(location => {
        if (!results.find(r => r.text === location)) {
          const locationWords = location.toLowerCase().split(/\s+/);
          let matchingWords = 0;
          
          queryWords.forEach(qWord => {
            if (locationWords.some(lWord => lWord.startsWith(qWord) || lWord.includes(qWord))) {
              matchingWords++;
            }
          });
          
          const wordMatchRatio = matchingWords / queryWords.length;
          if (wordMatchRatio > 0.5) {
            results.push({
              text: location,
              type: 'partial_words',
              confidence: wordMatchRatio * 0.6,
              reason: `${matchingWords}/${queryWords.length} words match`
            });
          }
        }
      });
    }

    // Sort by confidence and type priority
    const typeOrder = { exact: 5, prefix: 4, contains: 3, fuzzy: 2, partial_words: 1 };
    results.sort((a, b) => {
      const typeDiff = typeOrder[b.type] - typeOrder[a.type];
      if (typeDiff !== 0) return typeDiff;
      return b.confidence - a.confidence;
    });

    // Limit results and cache
    const finalResults = results.slice(0, maxResults);
    this.cache.set(cacheKey, finalResults);
    
    console.log(`🔍 Smart search for "${query}":`, finalResults);
    return finalResults;
  }

  /**
   * Get spelling corrections for a query
   */
  getSpellingCorrections(query, maxResults = 3) {
    if (!query || query.length < 3) return [];

    const queryLower = query.toLowerCase().trim();
    const corrections = [];

    this.locations.forEach(location => {
      const similarity = calculateSimilarity(queryLower, location.toLowerCase());
      
      // Only suggest corrections for reasonably similar strings
      if (similarity > 0.4 && similarity < 0.95) {
        corrections.push({
          suggestion: location,
          similarity: similarity,
          confidence: similarity > 0.7 ? 'high' : 'medium'
        });
      }
    });

    // Sort by similarity and return top results
    return corrections
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  /**
   * Get contextual recommendations based on popular searches and user history
   */
  getRecommendations(recentSearches = [], popularLocations = [], maxResults = 5) {
    const recommendations = [];
    const seen = new Set();

    // 1. Recent searches (personalized)
    recentSearches.slice(0, 3).forEach(search => {
      if (!seen.has(search.query)) {
        recommendations.push({
          text: search.query,
          type: 'recent',
          reason: 'You searched this recently',
          icon: '🕐'
        });
        seen.add(search.query);
      }
    });

    // 2. Popular locations (trending)
    popularLocations.slice(0, 4).forEach(location => {
      if (!seen.has(location)) {
        recommendations.push({
          text: location,
          type: 'popular',
          reason: 'Popular destination',
          icon: '🔥'
        });
        seen.add(location);
      }
    });

    // 3. Location-based suggestions (if we have user's location)
    // This could be enhanced with actual location data
    
    return recommendations.slice(0, maxResults);
  }

  /**
   * Enhanced autocomplete with smart matching
   */
  getAutocomplete(query, options = {}) {
    const {
      maxResults = 6,
      includeReasons = true,
      minQueryLength = 1,
      fuzzyThreshold = 0.6
    } = options;

    if (!query || query.length < minQueryLength) return [];

    const suggestions = this.getSmartSuggestions(query, maxResults);
    
    if (!includeReasons) {
      return suggestions.map(s => ({ text: s.text, type: s.type }));
    }

    return suggestions;
  }

  /**
   * Check if a query might have typos and suggest corrections
   */
  analyzeQuery(query) {
    if (!query || query.length < 2) return { hasTypos: false, suggestions: [] };

    const exactMatch = this.locations.find(loc => 
      loc.toLowerCase() === query.toLowerCase().trim()
    );

    if (exactMatch) {
      return { hasTypos: false, exactMatch: true };
    }

    const corrections = this.getSpellingCorrections(query, 3);
    const hasLikelyTypos = corrections.length > 0 && corrections[0].similarity > 0.7;

    return {
      hasTypos: hasLikelyTypos,
      suggestions: corrections,
      confidence: hasLikelyTypos ? corrections[0].confidence : 'none'
    };
  }
}

/**
 * Utility function to highlight matching parts of text
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Find the best matching substring
  let bestStart = -1;
  let bestLength = 0;
  
  // Try exact substring match first
  const exactIndex = textLower.indexOf(queryLower);
  if (exactIndex !== -1) {
    bestStart = exactIndex;
    bestLength = query.length;
  } else {
    // Try word boundary matches
    const words = query.toLowerCase().split(/\s+/);
    for (const word of words) {
      const wordIndex = textLower.indexOf(word);
      if (wordIndex !== -1) {
        bestStart = wordIndex;
        bestLength = word.length;
        break;
      }
    }
  }
  
  if (bestStart !== -1) {
    const before = text.substring(0, bestStart);
    const match = text.substring(bestStart, bestStart + bestLength);
    const after = text.substring(bestStart + bestLength);
    
    return {
      before,
      match,
      after,
      hasHighlight: true
    };
  }
  
  return { text, hasHighlight: false };
}

export default EnhancedSearch;