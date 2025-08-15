import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ParkingManagement = () => {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [spaceForm, setSpaceForm] = useState({
    spaceId: '',
    level: 'Ground',
    section: 'A',
    status: 'available',
    supportedVehicles: ['car'],
    dimensions: {
      length: '',
      width: ''
    },
    specialFeatures: [],
    description: ''
  });

  useEffect(() => {
    loadParkingSpaces();
  }, []);

  const loadParkingSpaces = async () => {
    setLoading(true);
    try {
      // Simulate API call to get parking spaces for the owner
      const mockSpaces = [
        {
          id: '1',
          spaceId: 'A-01',
          level: 'Ground',
          section: 'A',
          status: 'available',
          supportedVehicles: ['car', 'suv'],
          dimensions: { length: 5.5, width: 2.5 },
          specialFeatures: ['covered', 'cctv'],
          description: 'Premium covered parking space with 24/7 CCTV monitoring',
          currentBooking: null,
          nextBooking: null,
          totalBookings: 45,
          revenue: 12500
        },
        {
          id: '2',
          spaceId: 'A-02',
          level: 'Ground',
          section: 'A',
          status: 'occupied',
          supportedVehicles: ['car'],
          dimensions: { length: 5.0, width: 2.3 },
          specialFeatures: ['cctv'],
          description: 'Standard parking space with CCTV monitoring',
          currentBooking: {
            id: 'BK123',
            customerName: 'John Doe',
            vehicle: 'Ba 1 Pa 1234',
            startTime: '2024-01-20T10:30:00Z',
            endTime: '2024-01-20T14:30:00Z',
            status: 'confirmed'
          },
          nextBooking: {
            id: 'BK124',
            customerName: 'Jane Smith',
            startTime: '2024-01-20T15:00:00Z'
          },
          totalBookings: 38,
          revenue: 9800
        },
        {
          id: '3',
          spaceId: 'B-01',
          level: '1st Floor',
          section: 'B',
          status: 'maintenance',
          supportedVehicles: ['car', 'motorcycle'],
          dimensions: { length: 5.0, width: 2.5 },
          specialFeatures: ['security'],
          description: 'Multi-vehicle parking space under maintenance',
          currentBooking: null,
          nextBooking: null,
          totalBookings: 52,
          revenue: 15600
        }
      ];
      
      setParkingSpaces(mockSpaces);
    } catch (error) {
      console.error('Error loading parking spaces:', error);
      toast.error('Failed to load parking spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSpace = {
        id: Date.now().toString(),
        ...spaceForm,
        dimensions: {
          length: parseFloat(spaceForm.dimensions.length),
          width: parseFloat(spaceForm.dimensions.width)
        },
        totalBookings: 0,
        revenue: 0,
        currentBooking: null,
        nextBooking: null
      };

      setParkingSpaces([...parkingSpaces, newSpace]);
      setShowAddModal(false);
      resetForm();
      toast.success('Parking space added successfully!');
    } catch (error) {
      console.error('Error adding space:', error);
      toast.error('Failed to add parking space');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSpace = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedSpaces = parkingSpaces.map(space =>
        space.id === selectedSpace.id
          ? {
              ...space,
              ...spaceForm,
              dimensions: {
                length: parseFloat(spaceForm.dimensions.length),
                width: parseFloat(spaceForm.dimensions.width)
              }
            }
          : space
      );

      setParkingSpaces(updatedSpaces);
      setShowEditModal(false);
      setSelectedSpace(null);
      resetForm();
      toast.success('Parking space updated successfully!');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update parking space');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm('Are you sure you want to delete this parking space?')) {
      try {
        setParkingSpaces(parkingSpaces.filter(space => space.id !== spaceId));
        toast.success('Parking space deleted successfully!');
      } catch (error) {
        console.error('Error deleting space:', error);
        toast.error('Failed to delete parking space');
      }
    }
  };

  const handleChangeStatus = async (spaceId, newStatus) => {
    try {
      const updatedSpaces = parkingSpaces.map(space =>
        space.id === spaceId ? { ...space, status: newStatus } : space
      );
      setParkingSpaces(updatedSpaces);
      toast.success('Space status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setSpaceForm({
      spaceId: '',
      level: 'Ground',
      section: 'A',
      status: 'available',
      supportedVehicles: ['car'],
      dimensions: {
        length: '',
        width: ''
      },
      specialFeatures: [],
      description: ''
    });
  };

  const openEditModal = (space) => {
    setSelectedSpace(space);
    setSpaceForm({
      spaceId: space.spaceId,
      level: space.level,
      section: space.section,
      status: space.status,
      supportedVehicles: space.supportedVehicles,
      dimensions: {
        length: space.dimensions.length.toString(),
        width: space.dimensions.width.toString()
      },
      specialFeatures: space.specialFeatures || [],
      description: space.description || ''
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      occupied: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      disabled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.available;
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: '✅',
      occupied: '',
      maintenance: '🔧',
      disabled: '❌'
    };
    return icons[status] || '❓';
  };

  const filteredSpaces = parkingSpaces.filter(space => {
    const matchesSearch = space.spaceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || space.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parking Management</h2>
          <p className="text-gray-600">Manage your parking spaces, view occupancy, and track performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Space
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Total: {filteredSpaces.length} spaces
          </div>
        </div>
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parking spaces...</p>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spaces found</h3>
          <p className="text-gray-500">Add your first parking space to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Space Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getStatusIcon(space.status)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{space.spaceId}</h3>
                      <p className="text-sm text-gray-600">{space.level} • Section {space.section}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(space.status)}`}>
                    {space.status}
                  </span>
                </div>
              </div>

              {/* Space Details */}
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Dimensions</p>
                    <p className="font-medium">{space.dimensions.length}m × {space.dimensions.width}m</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Supported Vehicles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {space.supportedVehicles.map((vehicle) => (
                        <span key={vehicle} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {vehicle}
                        </span>
                      ))}
                    </div>
                  </div>

                  {space.specialFeatures.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Features</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {space.specialFeatures.map((feature) => (
                          <span key={feature} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Booking */}
                  {space.currentBooking && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Current Booking</p>
                      <p className="text-sm text-blue-700">{space.currentBooking.customerName}</p>
                      <p className="text-xs text-blue-600">{space.currentBooking.vehicle}</p>
                    </div>
                  )}

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{space.totalBookings}</p>
                      <p className="text-xs text-gray-600">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">Rs. {space.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <select
                    value={space.status}
                    onChange={(e) => handleChangeStatus(space.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(space)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSpace(space.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showAddModal ? 'Add New Space' : 'Edit Space'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedSpace(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAddSpace : handleEditSpace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Space ID *
                  </label>
                  <input
                    type="text"
                    value={spaceForm.spaceId}
                    onChange={(e) => setSpaceForm({...spaceForm, spaceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A-01"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      value={spaceForm.level}
                      onChange={(e) => setSpaceForm({...spaceForm, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Ground">Ground</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="Basement">Basement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <select
                      value={spaceForm.section}
                      onChange={(e) => setSpaceForm({...spaceForm, section: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (m) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={spaceForm.dimensions.length}
                      onChange={(e) => setSpaceForm({
                        ...spaceForm, 
                        dimensions: {...spaceForm.dimensions, length: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (m) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={spaceForm.dimensions.width}
                      onChange={(e) => setSpaceForm({
                        ...spaceForm, 
                        dimensions: {...spaceForm.dimensions, width: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Vehicles
                  </label>
                  <div className="space-y-2">
                    {['car', 'suv', 'motorcycle', 'bicycle'].map((vehicle) => (
                      <label key={vehicle} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={spaceForm.supportedVehicles.includes(vehicle)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSpaceForm({
                                ...spaceForm,
                                supportedVehicles: [...spaceForm.supportedVehicles, vehicle]
                              });
                            } else {
                              setSpaceForm({
                                ...spaceForm,
                                supportedVehicles: spaceForm.supportedVehicles.filter(v => v !== vehicle)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{vehicle}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Features
                  </label>
                  <div className="space-y-2">
                    {['covered', 'cctv', 'security', 'electric_charging', 'handicap_accessible'].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={spaceForm.specialFeatures.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSpaceForm({
                                ...spaceForm,
                                specialFeatures: [...spaceForm.specialFeatures, feature]
                              });
                            } else {
                              setSpaceForm({
                                ...spaceForm,
                                specialFeatures: spaceForm.specialFeatures.filter(f => f !== feature)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{feature.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={spaceForm.description}
                    onChange={(e) => setSpaceForm({...spaceForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Optional description of the parking space"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedSpace(null);
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
                    {loading ? 'Saving...' : (showAddModal ? 'Add Space' : 'Update Space')}
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

export default ParkingManagement;