import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import searchHistory from '../utils/searchHistory';
import { analyticsService, locationService } from '../services';
import { EnhancedSearch, highlightMatch } from '../utils/searchUtils';

// Kathmandu area coordinates (moved from deleted data file)
const kathmanduAreas = {
  ratnapark: { lat: 27.7064, lng: 85.3238 },
  thamel: { lat: 27.7151, lng: 85.3107 },
  durbar: { lat: 27.7040, lng: 85.3070 },
  newroad: { lat: 27.7016, lng: 85.3197 },
  putalisadak: { lat: 27.7095, lng: 85.3269 },
  baneshwor: { lat: 27.6893, lng: 85.3436 },
  koteshwor: { lat: 27.6776, lng: 85.3470 },
  lagankhel: { lat: 27.6667, lng: 85.3247 },
  jawalakhel: { lat: 27.6701, lng: 85.3159 },
  patan: { lat: 27.6648, lng: 85.3188 },
  satdobato: { lat: 27.6587, lng: 85.3247 },
  imadol: { lat: 27.6550, lng: 85.3280 },
  swayambhunath: { lat: 27.7148, lng: 85.2906 }
};

// Debug log for kathmanduAreas
console.log('🗺️ KATHMANDU AREAS COORDINATES (defined in SearchSection.jsx):', kathmanduAreas);

const SearchSection = ({ onSearch, onRadiusChange, radius }) => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [popularLocations, setPopularLocations] = useState([]);
  const [extractedLocationData, setExtractedLocationData] = useState([]); // Store full location data with coordinates
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [spellingSuggestions, setSpellingSuggestions] = useState([]);
  const [showSpellingSuggestions, setShowSpellingSuggestions] = useState(false);
  const suggestionRefs = useRef([]);
  const inputRef = useRef(null);
  const enhancedSearchRef = useRef(null);

  // Generate all searchable locations using dynamic and static data
  const getAllSearchableLocations = useCallback(() => {
    const locations = new Set();
    
    console.log('🏛️ === SEARCH LOCATION SOURCES DEBUG ===');
    
    // Add known area names from kathmanduAreas
    const kathmanduAreaNames = Object.keys(kathmanduAreas).map(area => 
      area.charAt(0).toUpperCase() + area.slice(1)
    );
    console.log('📍 Kathmandu Areas (from kathmanduAreas object):', kathmanduAreaNames);
    kathmanduAreaNames.forEach(area => locations.add(area));
    
    // Add extracted location names from parking spot addresses (primary source)
    if (extractedLocationData.length > 0) {
      console.log('🏗️ Extracted Location Data (from parking spot addresses):', extractedLocationData.map(loc => loc.name));
      extractedLocationData.forEach(locData => {
        if (locData.name) {
          console.log(`  ➤ Adding extracted location: "${locData.name}" (${locData.spotCount} spots)`);
          locations.add(locData.name);
        }
      });
    }
    
    // Add popular locations from database/fallback
    console.log('🔥 Popular Locations (from database/fallback):', popularLocations);
    popularLocations.forEach(loc => {
      if (typeof loc === 'string') {
        console.log(`  ➤ Adding popular location: "${loc}"`);
        locations.add(loc);
      } else if (loc.name) {
        console.log(`  ➤ Adding popular location from object: "${loc.name}"`);
        locations.add(loc.name);
      }
    });
    
    // Add fallback common locations only if we have limited extracted data
    if (extractedLocationData.length < 10) {
      const commonLocations = [
        'Kamaladi', 'Anamnagar', 'Dillibazar', 'Maharajgunj', 'Baluwatar',
        'Sundhara', 'Bagbazar', 'Ason', 'Indrachowk', 'Basantapur',
        'Tripureshwor', 'Kalimati', 'Thankot', 'Balaju', 'Tokha',
        'Budhanilkantha', 'Gongabu', 'Chabahil', 'Jorpati', 'Boudha',
        'Pashupatinath', 'Gaushala', 'Sinamangal', 'Tinkune', 'Koteshwor',
        'Thimi', 'Bhaktapur', 'Sano Thimi', 'Katunje', 'Lokanthali',
        'Imadol', 'Satdobato', 'Lagankhel', 'Pulchowk', 'Kupondole',
        'Sanepa', 'Jawalakhel', 'Patan Dhoka', 'Mangal Bazaar'
      ];
      
      console.log(`🏙️ Adding fallback common locations (extracted data count: ${extractedLocationData.length}):`, commonLocations.slice(0, 5), '...');
      commonLocations.forEach(loc => locations.add(loc));
    } else {
      console.log(`✨ Skipping fallback locations - sufficient extracted data (${extractedLocationData.length} locations)`);
    }
    
    const finalLocations = Array.from(locations).filter(loc => loc.length > 2);
    console.log(`🎯 FINAL SEARCHABLE LOCATIONS (${finalLocations.length} total):`, finalLocations.slice(0, 10), '...');
    console.log('🏛️ === END SEARCH LOCATION SOURCES DEBUG ===');
    
    return finalLocations;
  }, [extractedLocationData, popularLocations]);

  // Generate searchable locations based on popular locations and extracted data (memoized)
  const searchableLocations = useMemo(() => getAllSearchableLocations(), [getAllSearchableLocations]);

  // Initialize enhanced search when locations change
  useEffect(() => {
    if (searchableLocations.length > 0) {
      enhancedSearchRef.current = new EnhancedSearch(searchableLocations);
      console.log('🚀 Enhanced search initialized with', searchableLocations.length, 'locations');
    }
  }, [searchableLocations]);

  // Load recent searches and popular locations on component mount
  useEffect(() => {
    const recent = searchHistory.getRecentSearches();
    setRecentSearches(recent.slice(0, 5)); // Show only top 5 recent searches
  }, []);

  // Fetch popular locations from database using address extraction
  useEffect(() => {
    const fetchPopularLocations = async () => {
      try {
        setLoadingPopular(true);
        
        // Only fetch if we're in a browser environment
        if (typeof window === 'undefined') {
          setLoadingPopular(false);
          return;
        }
        
        console.log('🏗️ Fetching location names from parking spot addresses...');
        const response = await locationService.getLocationNamesFromAddresses({
          limit: 200 // Get comprehensive data for location extraction
        });
        
        if (response.success && response.locations) {
          // Store full location data for coordinate mapping
          const topLocations = response.locations.slice(0, 8); // Top 8 most popular locations
          setExtractedLocationData(topLocations);
          
          // Extract just the location names for display
          const locationNames = topLocations.map(loc => loc.name);
          
          console.log('✅ Successfully extracted location names from addresses:', locationNames);
          console.log('📊 Location data with coordinates:', topLocations);
          setPopularLocations(locationNames);
        } else {
          console.warn('❌ Failed to extract location names from addresses:', response.error);
          
          // Fallback to static popular locations
          const fallbackLocations = [
            'Thamel', 'Durbar Square', 'New Road', 'Ratna Park',
            'Lazimpat', 'Bouddha', 'Patan', 'Swayambhunath'
          ];
          console.log('📋 Using static fallback popular locations:', fallbackLocations);
          setPopularLocations(fallbackLocations);
        }
      } catch (error) {
        console.error('❌ Error extracting location names:', error);
        // Fallback to static locations
        const errorFallbackLocations = [
          'Thamel', 'Durbar Square', 'New Road', 'Ratna Park',
          'Lazimpat', 'Bouddha', 'Patan', 'Swayambhunath'
        ];
        console.log('🚨 Using error fallback popular locations:', errorFallbackLocations);
        setPopularLocations(errorFallbackLocations);
      } finally {
        setLoadingPopular(false);
      }
    };

    // Use a slight delay to prevent immediate API calls on page load
    const timeoutId = setTimeout(fetchPopularLocations, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Enhanced suggestion generation with fuzzy matching and spell correction
  const generateSuggestions = (input) => {
    if (!input.trim() || input.length < 1) return [];
    
    if (!enhancedSearchRef.current) {
      console.warn('Enhanced search not initialized yet');
      return [];
    }
    
    const smartSuggestions = enhancedSearchRef.current.getSmartSuggestions(input, 8);
    console.log(`🎯 Generated ${smartSuggestions.length} smart suggestions for "${input}"`);
    
    // Check for spelling suggestions
    if (input.length >= 3) {
      const analysis = enhancedSearchRef.current.analyzeQuery(input);
      if (analysis.hasTypos && analysis.suggestions.length > 0) {
        setSpellingSuggestions(analysis.suggestions);
        setShowSpellingSuggestions(true);
      } else {
        setShowSpellingSuggestions(false);
      }
    }
    
    return smartSuggestions;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.trim() === '') {
      // Show recent searches when input is empty
      setShowRecentSearches(recentSearches.length > 0);
      setShowSuggestions(false);
      setShowSpellingSuggestions(false);
    } else {
      // Show suggestions based on input
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setShowRecentSearches(false);
    }
    
    setActiveSuggestion(-1);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    try {
      await onSearch(location, 'manual');
      // Update recent searches after successful search
      const updatedRecent = searchHistory.getRecentSearches();
      setRecentSearches(updatedRecent.slice(0, 5));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setShowSuggestions(false);
      setShowRecentSearches(false);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await onSearch({ 
              lat: latitude, 
              lng: longitude, 
              address: 'Current Location',
              isCurrentLocation: true 
            }, 'current_location');
            setLocation('Current Location');
            
            // Update recent searches after successful search
            const updatedRecent = searchHistory.getRecentSearches();
            setRecentSearches(updatedRecent.slice(0, 5));
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setLocation(suggestion.text);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    try {
      await onSearch(suggestion.text, 'suggestion');
      // Update recent searches after successful search
      const updatedRecent = searchHistory.getRecentSearches();
      setRecentSearches(updatedRecent.slice(0, 5));
    } catch (error) {
      console.error('Error during suggestion search:', error);
    }
  };

  const handleRecentSearchClick = async (recentSearch) => {
    // Track recent search click analytics
    const daysDiff = Math.floor((Date.now() - recentSearch.timestamp) / (1000 * 60 * 60 * 24));
    analyticsService.trackRecentSearchClick(recentSearch.query, daysDiff);
    
    setLocation(recentSearch.query);
    setShowRecentSearches(false);
    setShowSuggestions(false);
    
    try {
      if (recentSearch.location) {
        await onSearch(recentSearch.location, 'recent');
      } else {
        await onSearch(recentSearch.query, 'recent');
      }
      // Update recent searches after successful search
      const updatedRecent = searchHistory.getRecentSearches();
      setRecentSearches(updatedRecent.slice(0, 5));
    } catch (error) {
      console.error('Error during recent search:', error);
    }
  };

  const handleRemoveRecentSearch = (searchId, e) => {
    e.stopPropagation();
    const updatedRecent = searchHistory.removeRecentSearch(searchId);
    setRecentSearches(updatedRecent.slice(0, 5));
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (activeSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleQuickSearch = async (locationName, index) => {
    // Track popular search click analytics
    analyticsService.trackPopularSearchClick(locationName, index);
    
    setLocation(locationName);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    
    try {
      await onSearch(locationName, 'popular');
      // Update recent searches after successful search
      const updatedRecent = searchHistory.getRecentSearches();
      setRecentSearches(updatedRecent.slice(0, 5));
    } catch (error) {
      console.error('Error during popular search:', error);
    }
  };

  // Click outside to close suggestions and recent searches
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowRecentSearches(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Balanced Evening Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"></div>
      
      {/* Warm street lighting ambience */}
      <div className="absolute inset-0 opacity-35">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 left-1/6 w-28 h-28 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Moving car headlights */}
      <div className="absolute inset-0">
        {/* Left to right traffic */}
        <div className="absolute top-1/3 left-0 w-16 h-4 bg-gradient-to-r from-transparent via-white to-blue-100 blur-sm animate-car-lights-lr opacity-80"></div>
        <div className="absolute top-1/3 left-0 w-12 h-3 bg-gradient-to-r from-transparent via-yellow-200 to-blue-200 blur-md animate-car-lights-lr-delay opacity-60" style={{animationDelay: '3s'}}></div>
        
        {/* Right to left traffic */}
        <div className="absolute bottom-1/4 right-0 w-16 h-4 bg-gradient-to-l from-transparent via-red-400 to-orange-500 blur-sm animate-car-lights-rl opacity-70"></div>
        <div className="absolute bottom-1/4 right-0 w-14 h-3 bg-gradient-to-l from-transparent via-red-300 to-yellow-400 blur-md animate-car-lights-rl-delay opacity-50" style={{animationDelay: '4s'}}></div>

        {/* Diagonal traffic flow */}
        <div className="absolute top-1/2 left-0 w-20 h-3 bg-gradient-to-r from-transparent via-cyan-200 to-white blur-sm animate-car-lights-diagonal opacity-60"></div>
        
        {/* Occasional bright headlight flashes */}
        <div className="absolute top-2/3 left-1/4 w-6 h-2 bg-white blur-sm animate-headlight-flash opacity-90"></div>
        <div className="absolute top-1/4 right-1/3 w-4 h-2 bg-blue-100 blur-sm animate-headlight-flash-delay opacity-80"></div>
      </div>

      {/* Urban glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-transparent to-blue-900/30"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="text-green-300"></span> Find Parking in Your <span className="text-orange-300">Neighborhood</span>
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Built by locals, for locals! Our community-driven parking system helps you find 
              <span className="text-yellow-300 font-semibold"> affordable spots</span> with 
              <span className="text-yellow-300 font-semibold"> friendly service</span> across Kathmandu Valley
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto card-premium p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Premium Location Search */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                   Find Parking Near You
                </label>
                <div className="relative" ref={inputRef}>
                  <input
                    type="text"
                    value={location}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (location.trim() === '' && recentSearches.length > 0) {
                        setShowRecentSearches(true);
                      } else if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Where are you going?"
                    className="input-premium w-full px-6 py-4 pl-14 text-lg font-medium placeholder-gray-400 text-gray-800"
                    autoComplete="off"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <div className="p-1 rounded-lg bg-gradient-primary">
                      <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Premium Recent Searches Dropdown */}
                  {showRecentSearches && recentSearches.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 card-premium border border-blue-200/50 max-h-80 overflow-y-auto">
                      <div className="px-6 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-800 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                             Recent Searches
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              searchHistory.clearRecentSearches();
                              setRecentSearches([]);
                              setShowRecentSearches(false);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-white/50"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      {recentSearches.map((recentSearch, index) => (
                        <div
                          key={recentSearch.id}
                          className="px-6 py-4 cursor-pointer transition-all duration-300 border-b border-gray-100/50 last:border-b-0 hover:bg-blue-50 group"
                          onClick={() => handleRecentSearchClick(recentSearch, index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className="p-1.5 rounded-lg mr-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {recentSearch.location?.isCurrentLocation ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  )}
                                </svg>
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-gray-800 group-hover:text-gray-900">
                                  {recentSearch.query}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(recentSearch.timestamp).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleRemoveRecentSearch(recentSearch.id, e)}
                              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              title="Remove from recent searches"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Spelling Corrections */}
                  {showSpellingSuggestions && spellingSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 card-premium border border-orange-200/50">
                      <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                        <span className="text-sm text-orange-700 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Did you mean?
                        </span>
                      </div>
                      {spellingSuggestions.map((spelling, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 cursor-pointer hover:bg-orange-50 border-b border-orange-100/50 last:border-b-0"
                          onClick={() => {
                            setLocation(spelling.suggestion);
                            setShowSpellingSuggestions(false);
                            handleSuggestionClick({ text: spelling.suggestion, type: 'correction' });
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{spelling.suggestion}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              spelling.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {spelling.confidence} confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Premium Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 card-premium border border-yellow-200/50 max-h-80 overflow-y-auto">
                      {suggestions.map((suggestion, index) => {
                        const highlight = highlightMatch(suggestion.text, location);
                        return (
                          <div
                            key={index}
                            ref={el => suggestionRefs.current[index] = el}
                            className={`px-6 py-4 cursor-pointer transition-all duration-300 border-b border-gray-100/50 last:border-b-0 ${
                              index === activeSuggestion 
                                ? 'bg-gradient-primary text-white transform scale-[1.02]' 
                                : 'hover:bg-yellow-50 text-gray-700 hover:text-gray-900'
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setActiveSuggestion(index)}
                          >
                            <div className="flex items-center">
                              <div className={`p-1.5 rounded-lg mr-4 ${
                                index === activeSuggestion ? 'bg-white/20' : 'bg-gradient-primary'
                              }`}>
                                {suggestion.type === 'fuzzy' ? (
                                  <svg className={`w-4 h-4 ${
                                    index === activeSuggestion ? 'text-yellow-300' : 'text-white'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                ) : (
                                  <svg className={`w-4 h-4 ${
                                    index === activeSuggestion ? 'text-yellow-300' : 'text-white'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {highlight.hasHighlight ? (
                                    <>
                                      {highlight.before}
                                      <span className={`${
                                        index === activeSuggestion ? 'bg-yellow-300/30' : 'bg-yellow-200'
                                      } px-1 rounded`}>
                                        {highlight.match}
                                      </span>
                                      {highlight.after}
                                    </>
                                  ) : (
                                    suggestion.text
                                  )}
                                </div>
                                {suggestion.reason && (
                                  <div className={`text-xs mt-1 ${
                                    index === activeSuggestion ? 'text-white/70' : 'text-gray-500'
                                  }`}>
                                    {suggestion.reason}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {suggestion.confidence && (
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    index === activeSuggestion 
                                      ? 'bg-white/20 text-yellow-100' 
                                      : suggestion.confidence > 0.8 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {Math.round(suggestion.confidence * 100)}%
                                  </div>
                                )}
                                {suggestion.type === 'exact' && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    index === activeSuggestion 
                                      ? 'bg-yellow-300 text-blue-900' 
                                      : 'bg-gradient-primary text-white'
                                  }`}>Perfect Match</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Radius Selection */}
              <div className="md:w-56">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                   Distance Range
                </label>
                <div className="relative">
                  <select 
                    value={radius}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="input-premium w-full px-6 py-4 text-lg font-medium text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 km - Nearby</option>
                    <option value={2}>2 km - Normal</option>
                    <option value={3}>3 km - Wide</option>
                    <option value={4}>4 km - Far</option>
                    <option value={5}>5 km - Anywhere</option>
                  </select>
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="p-1 rounded-lg bg-gradient-primary">
                      <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading || !location.trim()}
                className="btn-primary flex-1 py-4 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg font-bold relative overflow-hidden group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Discovering Premium Spots...</span>
                  </>
                ) : (
                  <>
                    <div className="p-1 bg-white/20 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span> Find Local Parking</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={isLoading}
                className="sm:w-auto glass-dark border-2 border-white/20 text-white py-4 px-8 rounded-2xl hover:bg-white/10 hover:border-yellow-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-bold group"
              >
                <div className="p-1 bg-yellow-300/20 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Use My Location</span>
              </button>
            </div>
          </form>
          
          {/* Premium Popular Locations */}
          {!showSuggestions && !showRecentSearches && (
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-gradient-primary rounded-full mr-2"></div>
                 Popular Places in Kathmandu
              </h3>
              
              {loadingPopular ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 glass-dark border border-white/10 rounded-xl animate-pulse"
                    >
                      <div className="h-5 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : popularLocations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {popularLocations.map((loc, index) => (
                    <button
                      key={loc}
                      onClick={() => handleQuickSearch(loc, index)}
                      className="relative group px-4 py-3 glass-dark border border-white/10 rounded-xl hover:border-yellow-300/50 transition-all duration-300 hover:transform hover:scale-105"
                    >
                      <span className="text-gray-700 font-semibold group-hover:text-gray-900 transition-colors duration-300">{loc}</span>
                      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    No popular locations available
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Enhanced Search Tips */}
          {(showSuggestions && suggestions.length > 0) || showSpellingSuggestions ? (
            <div className="mt-6 p-4 glass-dark border border-yellow-300/30 rounded-xl">
              <p className="text-sm text-gray-700 text-center font-medium">
                <span className="text-yellow-600 font-bold">Smart Search:</span> Detects typos, suggests corrections, and finds partial matches • Use ↑ ↓ arrow keys to navigate
              </p>
            </div>
          ) : location.length >= 2 && suggestions.length === 0 && enhancedSearchRef.current && (
            <div className="mt-6 p-4 glass-dark border border-red-300/30 rounded-xl">
              <p className="text-sm text-gray-700 text-center font-medium">
                <span className="text-red-600 font-bold">No matches found:</span> Try checking spelling or use a shorter search term
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;