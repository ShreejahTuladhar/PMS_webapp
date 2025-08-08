import { useState, useEffect, useRef } from 'react';
import { kathmanduAreas } from '../data/kathmanduParkingData';
import kathmanduRealParkingDataExport from '../data/kathmanduRealParkingData';

const popularLocations = [
  'Thamel', 'Durbar Square', 'New Road', 'Ratna Park', 
  'Lazimpat', 'Bouddha', 'Patan', 'Swayambhunath'
];

const SearchSection = ({ onSearch, onRadiusChange, radius }) => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionRefs = useRef([]);
  const inputRef = useRef(null);

  // Generate all searchable locations
  const getAllSearchableLocations = () => {
    const locations = new Set();
    
    // Add parking location names and addresses
    kathmanduRealParkingDataExport.forEach(parking => {
      locations.add(parking.name);
      locations.add(parking.address);
      // Extract area names from addresses
      const addressParts = parking.address.split(',');
      addressParts.forEach(part => {
        const cleanPart = part.trim();
        if (cleanPart && cleanPart.length > 2) {
          locations.add(cleanPart);
        }
      });
    });
    
    // Add known area names
    Object.keys(kathmanduAreas).forEach(area => {
      locations.add(area.charAt(0).toUpperCase() + area.slice(1));
    });
    
    // Add popular locations
    popularLocations.forEach(loc => locations.add(loc));
    
    return Array.from(locations).filter(loc => loc.length > 2);
  };

  const searchableLocations = getAllSearchableLocations();

  // Generate suggestions based on input
  const generateSuggestions = (input) => {
    if (!input.trim() || input.length < 2) return [];
    
    const query = input.toLowerCase().trim();
    const matches = [];
    
    // Exact matches first
    searchableLocations.forEach(location => {
      if (location.toLowerCase().startsWith(query)) {
        matches.push({ text: location, type: 'exact' });
      }
    });
    
    // Partial matches
    searchableLocations.forEach(location => {
      if (!location.toLowerCase().startsWith(query) && 
          location.toLowerCase().includes(query)) {
        matches.push({ text: location, type: 'partial' });
      }
    });
    
    // Remove duplicates and limit to 8 suggestions
    const uniqueMatches = matches.filter((match, index, self) => 
      index === self.findIndex(m => m.text === match.text)
    );
    
    return uniqueMatches.slice(0, 8);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestion(-1);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    try {
      await onSearch(location);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSearch({ lat: latitude, lng: longitude, isCurrentLocation: true });
          setLocation('Current Location');
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text);
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

  const handleQuickSearch = (locationName) => {
    setLocation(locationName);
    setShowSuggestions(false);
    onSearch(locationName);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Dynamic Premium Background */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Find <span className="text-gradient-golden">Premium</span> Parking
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
              Experience luxury parking solutions with <span className="text-yellow-300 font-bold">real-time availability</span>, 
              smart navigation, and <span className="text-yellow-300 font-bold">competitive rates</span> across Kathmandu Valley
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto card-premium p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Premium Location Search */}
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gradient-primary rounded-full mr-2"></div>
                  Search Premium Location
                </label>
                <div className="relative" ref={inputRef}>
                  <input
                    type="text"
                    value={location}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Type 'Thamel', 'Durbar Square', 'Civil Mall'..."
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
                  
                  {/* Premium Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 card-premium border border-yellow-200/50 max-h-80 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
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
                              <svg className={`w-4 h-4 ${
                                index === activeSuggestion ? 'text-yellow-300' : 'text-white'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="font-medium">
                              {suggestion.text}
                            </span>
                            {suggestion.type === 'exact' && (
                              <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                                index === activeSuggestion 
                                  ? 'bg-yellow-300 text-blue-900' 
                                  : 'bg-gradient-primary text-white'
                              }`}>Perfect Match</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Radius Selection */}
              <div className="md:w-56">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gradient-primary rounded-full mr-2"></div>
                  Search Radius
                </label>
                <div className="relative">
                  <select 
                    value={radius}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="input-premium w-full px-6 py-4 text-lg font-medium text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value={1}>🎯 1 km - Precision</option>
                    <option value={2}>🌟 2 km - Recommended</option>
                    <option value={3}>🚀 3 km - Extended</option>
                    <option value={4}>💎 4 km - Premium</option>
                    <option value={5}>🏆 5 km - Ultimate</option>
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
                    <span>Find Premium Parking</span>
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
          
          {/* Popular Locations - Only show when not typing */}
          {!showSuggestions && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Locations in Kathmandu:</h3>
              <div className="flex flex-wrap gap-2">
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleQuickSearch(loc)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Tips */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 text-center">
                Use ↑ ↓ arrow keys to navigate • Press Enter to select • Esc to close
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;