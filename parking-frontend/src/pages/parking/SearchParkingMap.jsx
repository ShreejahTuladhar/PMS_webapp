const SearchParkingMap = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Find Parking Near You</h2>

      {/* Search Filters - later connected to backend */}
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="City or Address" className="input" />
        <select className="input">
          <option value="">All Types</option>
          <option value="covered">Covered</option>
          <option value="open">Open</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Search
        </button>
      </div>

      {/* Placeholder Map Section */}
      <div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
        🗺️ Map will be integrated here (e.g., Leaflet, Google Maps)
      </div>
    </div>
  );
};

export default SearchParkingMap;
