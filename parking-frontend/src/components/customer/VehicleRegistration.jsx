import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function VehicleRegistration({ onComplete, onBack }) {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    type: 'car' // car, motorcycle, truck, van
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular car makes for quick selection
  const popularMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus'
  ];

  const vehicleTypes = [
    { value: 'car', icon: '🚗', label: 'Car' },
    { value: 'suv', icon: '🚙', label: 'SUV' },
    { value: 'motorcycle', icon: '🏍️', label: 'Motorcycle' },
    { value: 'truck', icon: '🚚', label: 'Truck' },
    { value: 'van', icon: '🚐', label: 'Van' }
  ];

  const colors = [
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'silver', label: 'Silver', hex: '#C0C0C0' },
    { value: 'red', label: 'Red', hex: '#FF0000' },
    { value: 'blue', label: 'Blue', hex: '#0000FF' },
    { value: 'gray', label: 'Gray', hex: '#808080' },
    { value: 'green', label: 'Green', hex: '#008000' },
    { value: 'yellow', label: 'Yellow', hex: '#FFFF00' }
  ];

  useEffect(() => {
    // Load saved vehicles from localStorage
    const saved = localStorage.getItem('savedVehicles');
    if (saved) {
      setSavedVehicles(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save vehicle to localStorage for future use
    const updatedVehicles = [vehicle, ...savedVehicles.filter(v => v.licensePlate !== vehicle.licensePlate)];
    localStorage.setItem('savedVehicles', JSON.stringify(updatedVehicles.slice(0, 3))); // Keep only 3 recent vehicles

    setIsLoading(false);
    onComplete(vehicle);
  };

  const selectSavedVehicle = (savedVehicle) => {
    setVehicle(savedVehicle);
    setShowSuggestions(false);
  };

  const isFormValid = vehicle.licensePlate && vehicle.make && vehicle.color && vehicle.type;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
      >
        ← Back to Welcome
      </button>

      <div className="bg-white/95 rounded-3xl p-8 shadow-xl border border-blue-200 relative overflow-hidden">
        {/* Magical background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-blue-100 rounded-full blur-2xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🚗</div>
            <h2 className="text-3xl font-bold text-gray-700 mb-2">
              Register Your Vehicle
            </h2>
            <p className="text-gray-600">Quick and easy - we'll remember it for next time!</p>
          </div>

          {/* Saved Vehicles */}
          {savedVehicles.length > 0 && !showSuggestions && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Your Recent Vehicles</h3>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showSuggestions ? 'Hide' : 'Show All'}
                </button>
              </div>
              <div className="grid gap-3">
                {savedVehicles.slice(0, showSuggestions ? savedVehicles.length : 2).map((savedVehicle, index) => (
                  <div
                    key={index}
                    onClick={() => selectSavedVehicle(savedVehicle)}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-200 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-102"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{vehicleTypes.find(t => t.value === savedVehicle.type)?.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-700">
                          {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                        </div>
                        <div className="text-sm text-gray-600">
                          {savedVehicle.licensePlate} • {savedVehicle.color}
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-600">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Vehicle Type</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      vehicle.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Plate *
              </label>
              <input
                type="text"
                value={vehicle.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full px-6 py-4 text-lg font-mono font-bold text-center tracking-wider border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white uppercase"
                maxLength={10}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Make */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Make *</label>
                <select
                  value={vehicle.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select Make</option>
                  {popularMakes.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={vehicle.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Camry, Civic, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <select
                  value={vehicle.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color *</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color', color.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        vehicle.color === color.value
                          ? 'border-blue-500 ring-2 ring-blue-200 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1 border"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div className="text-xs font-medium">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering Vehicle...
                    </>
                  ) : (
                    <>
                      🎫 Generate Digital Ticket
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VehicleRegistration;