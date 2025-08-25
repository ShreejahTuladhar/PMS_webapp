#!/usr/bin/env node

/**
 * Test Search Functionality for Popular Places
 * Tests the enhanced search algorithm with the places shown in the UI
 */

// Import the search utilities (simulated for Node.js environment)
class EnhancedSearch {
  constructor(locations = []) {
    this.locations = locations;
    this.cache = new Map();
  }

  updateLocations(locations) {
    this.locations = locations;
    this.cache.clear();
  }

  calculateSimilarity(str1, str2) {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return (maxLen - distance) / maxLen;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  getSmartSuggestions(query, maxResults = 8) {
    if (!query || query.length < 1) return [];
    
    const queryLower = query.toLowerCase().trim();
    const results = [];

    // 1. Exact matches
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

    // 2. Starts with query
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

    // 3. Contains query
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

    // 4. Fuzzy matches
    if (queryLower.length >= 2) {
      this.locations.forEach(location => {
        if (!results.find(r => r.text === location)) {
          const similarity = this.calculateSimilarity(queryLower, location.toLowerCase());
          
          if (similarity > 0.4) {
            let reason = 'Similar spelling';
            if (similarity > 0.8) reason = 'Possible typo correction';
            else if (similarity > 0.6) reason = 'Close match';
            
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

    // 5. Word-based partial matches
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
          if (wordMatchRatio >= 0.3) {
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

    return results.slice(0, maxResults);
  }
}

// Test the search functionality
function testSearchFunctionality() {
  console.log('🔍 Testing Enhanced Search Functionality\n');

  // Popular places from the UI + common locations
  const locations = [
    // Popular Places shown in UI
    'Durbar Square', 'Patan', 'Lagankhel', 'Kalimati Vegetable Market',
    'Koteshwor', 'New Road', 'Maharajgunj', 'Jawalakhel',
    // From kathmanduAreas
    'Ratnapark', 'Thamel', 'Putalisadak', 'Baneshwor',
    // Additional common locations
    'Kamaladi', 'Anamnagar', 'Dillibazar', 'Baluwatar',
    'Sundhara', 'Bagbazar', 'Asan', 'Indrachowk', 'Basantapur',
    'Tripureshwor', 'Kalimati', 'Thankot', 'Balaju', 'Tokha',
    'Budhanilkantha', 'Gongabu', 'Chabahil', 'Jorpati', 'Boudha',
    'Pashupatinath', 'Gaushala', 'Sinamangal', 'Tinkune',
    'Thimi', 'Bhaktapur', 'Sano Thimi', 'Katunje', 'Lokanthali',
    'Imadol', 'Satdobato', 'Pulchowk', 'Kupondole',
    'Sanepa', 'Patan Dhoka', 'Mangal Bazaar'
  ];

  const search = new EnhancedSearch(locations);
  
  console.log(`📍 Testing with ${locations.length} locations\n`);

  // Test cases - including the popular places from the UI
  const testCases = [
    'durbar',        // Popular place - should find "Durbar Square"
    'patan',         // Popular place - exact match
    'lagankhel',     // Popular place - exact match  
    'kalimati',      // Popular place - should find "Kalimati Vegetable Market"
    'koteshwor',     // Popular place - exact match
    'new road',      // Popular place - exact match
    'maharajgunj',   // Popular place - exact match
    'jawalakhel',    // Popular place - exact match
    'thamel',        // From kathmanduAreas - exact match
    'ratna',         // Should find "Ratnapark"
    'durba',         // Typo - should find "Durbar Square"
    'ptan',          // Typo - should find "Patan"
    'kalmat',        // Typo - should find "Kalimati"
    'new',           // Partial - should find "New Road"
    'market',        // Partial - should find "Kalimati Vegetable Market"
    'vegetable',     // Partial - should find "Kalimati Vegetable Market"
    'square',        // Partial - should find "Durbar Square"
    'road',          // Should find "New Road"
    'baneshwr',      // Typo - should find "Baneshwor"
    'xyz123',        // No match expected
    ''               // Empty query - no results expected
  ];

  let totalTests = 0;
  let successfulTests = 0;

  testCases.forEach((query, index) => {
    console.log(`\n${index + 1}. Testing: "${query}"`);
    console.log('─'.repeat(40));
    
    const results = search.getSmartSuggestions(query, 5);
    totalTests++;
    
    if (results.length > 0) {
      successfulTests++;
      console.log(`✅ Found ${results.length} suggestions:`);
      results.forEach((result, i) => {
        const confidence = Math.round(result.confidence * 100);
        console.log(`   ${i + 1}. "${result.text}" (${result.type}, ${confidence}% confidence)`);
        console.log(`      Reason: ${result.reason}`);
      });
    } else {
      console.log('❌ No suggestions found');
      
      // For specific expected matches, this is a problem
      const expectedMatches = [
        'durbar', 'patan', 'lagankhel', 'kalimati', 'koteshwor', 
        'new road', 'maharajgunj', 'jawalakhel', 'thamel', 'ratna'
      ];
      
      if (expectedMatches.includes(query.toLowerCase())) {
        console.log('   ⚠️  Expected to find matches for this popular location!');
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful (found suggestions): ${successfulTests}`);
  console.log(`Success Rate: ${(successfulTests / totalTests * 100).toFixed(1)}%`);
  
  const expectedSuccessful = testCases.filter(query => 
    query && !['xyz123'].includes(query.toLowerCase())
  ).length;
  
  console.log(`Expected Successful: ${expectedSuccessful}`);
  console.log(`Actual Success Rate: ${(successfulTests / expectedSuccessful * 100).toFixed(1)}%`);
  
  if (successfulTests / totalTests >= 0.8) {
    console.log('🎉 OVERALL RESULT: EXCELLENT - Search functionality is working well!');
  } else if (successfulTests / totalTests >= 0.6) {
    console.log('✅ OVERALL RESULT: GOOD - Search functionality is mostly working');
  } else {
    console.log('⚠️  OVERALL RESULT: NEEDS IMPROVEMENT - Search functionality has issues');
  }

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   - Popular places from UI should always return matches');
  console.log('   - Typos should be handled with fuzzy matching');
  console.log('   - Partial words should match locations');
  console.log('   - Empty/invalid searches should return no results');
}

// Run the test
if (require.main === module) {
  testSearchFunctionality();
}