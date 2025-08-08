import { useState, useEffect, useRef } from 'react';
import { kathmanduParkingData, kathmanduAreas } from '../data/kathmanduParkingData';

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
    kathmanduParkingData.forEach(parking => {
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
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Find Smart Parking Solutions
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Search, book, and manage parking spaces near you with real-time availability and competitive rates
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Location Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location
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
                    placeholder="Type 'Tha...' for Thamel, 'Dur...' for Durbar Square..."
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          ref={el => suggestionRefs.current[index] = el}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                            index === activeSuggestion 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setActiveSuggestion(index)}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">
                              {suggestion.text}
                            </span>
                            {suggestion.type === 'exact' && (
                              <span className="ml-auto text-xs text-blue-500 font-medium">Exact match</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Radius Selection */}
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius
                </label>
                <select 
                  value={radius}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={3}>3 km</option>
                  <option value={4}>4 km</option>
                  <option value={5}>5 km</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !location.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Parking
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={isLoading}
                className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
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