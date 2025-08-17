import { useState, useEffect } from 'react';
import { userService } from '../../../services';
import toast from 'react-hot-toast';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    color: '',
    vehicleType: 'car',
    isDefault: false
  });

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'truck', label: 'Truck', icon: '🚚' },
    { value: 'van', label: 'Van', icon: '🚐' }
  ];

  const colors = [
    { value: 'white', label: 'White' },
    { value: 'black', label: 'Black' },
    { value: 'silver', label: 'Silver' },
    { value: 'gray', label: 'Gray' },
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'brown', label: 'Brown' },
    { value: 'orange', label: 'Orange' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserVehicles();
      
      if (response.success) {
        setVehicles(response.vehicles || []);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.addVehicle(vehicleForm);
      
      if (response.success) {
        toast.success('Vehicle added successfully!');
        loadVehicles();
        setShowAddModal(false);
        resetForm();
      } else {
        toast.error(response.error || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.updateVehicle(selectedVehicle.id, vehicleForm);
      
      if (response.success) {
        toast.success('Vehicle updated successfully!');
        loadVehicles();
        setShowEditModal(false);
        resetForm();
        setSelectedVehicle(null);
      } else {
        toast.error(response.error || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await userService.deleteVehicle(vehicleId);
      
      if (response.success) {
        toast.success('Vehicle deleted successfully!');
        loadVehicles();
      } else {
        toast.error(response.error || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleSetDefault = async (vehicleId) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const response = await userService.updateVehicle(vehicleId, { ...vehicle, isDefault: true });
      
      if (response.success) {
        toast.success('Default vehicle updated!');
        loadVehicles();
      } else {
        toast.error('Failed to set default vehicle');
      }
    } catch (error) {
      console.error('Error setting default vehicle:', error);
      toast.error('Failed to set default vehicle');
    }
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      plateNumber: vehicle.plateNumber || '',
      color: vehicle.color || '',
      vehicleType: vehicle.vehicleType || 'car',
      isDefault: vehicle.isDefault || false
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setVehicleForm({
      make: '',
      model: '',
      year: '',
      plateNumber: '',
      color: '',
      vehicleType: 'car',
      isDefault: false
    });
  };

  const getVehicleIcon = (type) => {
    const typeInfo = vehicleTypes.find(vt => vt.value === type);
    return typeInfo ? typeInfo.icon : '🚗';
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your vehicles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
          <p className="text-gray-600">Manage your registered vehicles for parking</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
          <p className="text-gray-500 mb-4">Add your first vehicle to start parking</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{getVehicleIcon(vehicle.vehicleType)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">{vehicle.year}</p>
                  </div>
                </div>
                {vehicle.isDefault && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plate Number:</span>
                  <span className="font-mono font-semibold">{vehicle.plateNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Color:</span>
                  <span className="capitalize">{vehicle.color}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{vehicle.vehicleType}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(vehicle)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {!vehicle.isDefault && (
                    <button
                      onClick={() => handleSetDefault(vehicle.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Set Default
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Vehicle</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Toyota, Honda..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Camry, Civic..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({...vehicleForm, plateNumber: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="BA 1 PA 1234"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({...vehicleForm, vehicleType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={vehicleForm.isDefault}
                    onChange={(e) => setVehicleForm({...vehicleForm, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default vehicle
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Vehicle</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({...vehicleForm, plateNumber: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({...vehicleForm, vehicleType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefaultEdit"
                    checked={vehicleForm.isDefault}
                    onChange={(e) => setVehicleForm({...vehicleForm, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefaultEdit" className="ml-2 block text-sm text-gray-900">
                    Set as default vehicle
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedVehicle(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Vehicle'}
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

export default VehicleManagement;