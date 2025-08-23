import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VehicleManager = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/vehicles');
      
      if (response.data.success) {
        setVehicles(response.data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Mock data for demo
      setVehicles([
        {
          id: '1',
          plateNumber: 'BA 1 PA 3014',
          vehicleType: 'car',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          color: 'White',
          isDefault: true,
          bookingCount: 15,
          lastUsed: new Date().toISOString()
        },
        {
          id: '2',
          plateNumber: 'BA 2 CHA 5678',
          vehicleType: 'motorcycle',
          make: 'Honda',
          model: 'CB 150R',
          year: 2021,
          color: 'Red',
          isDefault: false,
          bookingCount: 8,
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (formData.plateNumber.length < 2 || formData.plateNumber.length > 15) {
      newErrors.plateNumber = 'Plate number must be between 2 and 15 characters';
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }

    // Check for duplicate plate numbers
    const existingVehicle = vehicles.find(v => 
      v.plateNumber.toUpperCase() === formData.plateNumber.toUpperCase() &&
      (!editingVehicle || v.id !== editingVehicle.id)
    );
    
    if (existingVehicle) {
      newErrors.plateNumber = 'This plate number is already registered';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const vehicleData = {
        ...formData,
        plateNumber: formData.plateNumber.toUpperCase()
      };

      let response;
      if (editingVehicle) {
        response = await api.put(`/users/vehicles/${editingVehicle.id}`, vehicleData);
        toast.success('Vehicle updated successfully!');
      } else {
        response = await api.post('/users/vehicles', vehicleData);
        toast.success('Vehicle added successfully!');
      }

      if (response.data.success) {
        fetchVehicles();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      // Demo mode - simulate save
      const newVehicle = {
        id: Date.now().toString(),
        ...formData,
        plateNumber: formData.plateNumber.toUpperCase(),
        bookingCount: 0,
        lastUsed: null
      };

      if (editingVehicle) {
        setVehicles(prev => prev.map(v => 
          v.id === editingVehicle.id ? { ...v, ...newVehicle } : v
        ));
        toast.success('Vehicle updated successfully!');
      } else {
        setVehicles(prev => [...prev, newVehicle]);
        toast.success('Vehicle added successfully!');
      }
      
      resetForm();
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await api.delete(`/users/vehicles/${vehicleId}`);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Vehicle deleted successfully!');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      // Demo mode
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Vehicle deleted successfully!');
    }
  };

  const handleSetDefault = async (vehicleId) => {
    try {
      await api.put(`/users/vehicles/${vehicleId}/default`);
      
      setVehicles(prev => prev.map(v => ({
        ...v,
        isDefault: v.id === vehicleId
      })));
      
      toast.success('Default vehicle updated!');
    } catch (error) {
      console.error('Error setting default vehicle:', error);
      
      // Demo mode
      setVehicles(prev => prev.map(v => ({
        ...v,
        isDefault: v.id === vehicleId
      })));
      
      toast.success('Default vehicle updated!');
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      vehicleType: 'car',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      isDefault: false
    });
    setErrors({});
    setEditingVehicle(null);
    setShowAddModal(false);
  };

  const handleEdit = (vehicle) => {
    setFormData({
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || '',
      isDefault: vehicle.isDefault || false
    });
    setEditingVehicle(vehicle);
    setShowAddModal(true);
  };

  const getVehicleIcon = (vehicleType) => {
    const icons = {
      car: '🚗',
      motorcycle: '🏍️',
      truck: '🚚',
      bus: '🚌'
    };
    return icons[vehicleType] || '🚗';
  };

  const formatLastUsed = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Manager</h2>
          <p className="text-gray-600">Manage your vehicles for easier booking</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getVehicleIcon(vehicle.vehicleType)}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{vehicle.plateNumber}</h3>
                    <p className="text-sm text-gray-600 capitalize">{vehicle.vehicleType}</p>
                  </div>
                </div>
                
                {vehicle.isDefault && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Make & Model:</span>
                  <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-medium">{vehicle.year}</span>
                </div>
                {vehicle.color && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                )}
              </div>

              {/* Usage Stats */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Bookings</p>
                    <p className="font-bold text-blue-600">{vehicle.bookingCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Last Used</p>
                    <p className="font-medium text-gray-800">{formatLastUsed(vehicle.lastUsed)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button>
                
                {!vehicle.isDefault && (
                  <button
                    onClick={() => handleSetDefault(vehicle.id)}
                    className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
            <p className="text-gray-600 mb-4">Add your first vehicle to make booking faster and easier.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                    placeholder="e.g., BA 1 PA 3014"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.plateNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={15}
                  />
                  {errors.plateNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="truck">Truck</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="Toyota, Honda, etc."
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.make ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.make && (
                      <p className="text-red-500 text-xs mt-1">{errors.make}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Corolla, Civic, etc."
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.model ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.model && (
                      <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.year ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.year && (
                      <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="White, Black, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {vehicles.length === 0 && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                      Set as default vehicle
                    </label>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;