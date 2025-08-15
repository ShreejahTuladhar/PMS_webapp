import { useState } from 'react';
import toast from 'react-hot-toast';

const RatesManagement = () => {
  const [rates, setRates] = useState({
    car: { hourly: 100, daily: 800, monthly: 20000 },
    motorcycle: { hourly: 50, daily: 400, monthly: 10000 },
    bicycle: { hourly: 20, daily: 150, monthly: 4000 },
    suv: { hourly: 120, daily: 950, monthly: 25000 }
  });

  const [discounts, setDiscounts] = useState([
    { id: 1, name: 'Early Bird', description: 'Park before 8 AM', discount: 20, type: 'percentage', active: true },
    { id: 2, name: 'Weekend Special', description: 'Saturday & Sunday', discount: 15, type: 'percentage', active: true },
    { id: 3, name: 'Monthly Subscriber', description: 'Fixed monthly fee', discount: 30, type: 'percentage', active: false }
  ]);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    discount: '',
    type: 'percentage',
    active: true
  });

  const handleRateChange = (vehicle, period, value) => {
    setRates(prev => ({
      ...prev,
      [vehicle]: {
        ...prev[vehicle],
        [period]: parseFloat(value) || 0
      }
    }));
  };

  const handleSaveRates = () => {
    // Simulate API call
    toast.success('Parking rates updated successfully!');
  };

  const handleAddDiscount = (e) => {
    e.preventDefault();
    const newDiscount = {
      id: Date.now(),
      ...discountForm,
      discount: parseFloat(discountForm.discount)
    };

    if (editingDiscount) {
      setDiscounts(discounts.map(d => d.id === editingDiscount.id ? newDiscount : d));
      toast.success('Discount updated successfully!');
    } else {
      setDiscounts([...discounts, newDiscount]);
      toast.success('Discount added successfully!');
    }

    setShowDiscountModal(false);
    setEditingDiscount(null);
    setDiscountForm({ name: '', description: '', discount: '', type: 'percentage', active: true });
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      name: discount.name,
      description: discount.description,
      discount: discount.discount.toString(),
      type: discount.type,
      active: discount.active
    });
    setShowDiscountModal(true);
  };

  const handleDeleteDiscount = (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setDiscounts(discounts.filter(d => d.id !== id));
      toast.success('Discount deleted successfully!');
    }
  };

  const toggleDiscountStatus = (id) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, active: !d.active } : d
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rates Management</h2>
        <p className="text-gray-600">Set parking rates and manage discounts for your facility</p>
      </div>

      {/* Base Rates */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Base Parking Rates (NPR)</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(rates).map(([vehicle, vehicleRates]) => (
                <tr key={vehicle} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {vehicle === 'car' ? '' : 
                         vehicle === 'motorcycle' ? '' : 
                         vehicle === 'bicycle' ? '🚲' : ''}
                      </span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {vehicle}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Rs.</span>
                      <input
                        type="number"
                        value={vehicleRates.hourly}
                        onChange={(e) => handleRateChange(vehicle, 'hourly', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Rs.</span>
                      <input
                        type="number"
                        value={vehicleRates.daily}
                        onChange={(e) => handleRateChange(vehicle, 'daily', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Rs.</span>
                      <input
                        type="number"
                        value={vehicleRates.monthly}
                        onChange={(e) => handleRateChange(vehicle, 'monthly', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveRates}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Rates
          </button>
        </div>
      </div>

      {/* Discounts & Offers */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Discounts & Special Offers</h3>
          <button
            onClick={() => setShowDiscountModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Discount
          </button>
        </div>

        {discounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No discounts configured yet. Add your first discount to attract more customers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discounts.map((discount) => (
              <div key={discount.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{discount.name}</h4>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        discount.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {discount.discount}{discount.type === 'percentage' ? '% off' : ' NPR off'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleDiscountStatus(discount.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        discount.active
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {discount.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditDiscount(discount)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(discount.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                </h3>
                <button
                  onClick={() => {
                    setShowDiscountModal(false);
                    setEditingDiscount(null);
                    setDiscountForm({ name: '', description: '', discount: '', type: 'percentage', active: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddDiscount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    value={discountForm.name}
                    onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Early Bird Special"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Brief description of the discount"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={discountForm.discount}
                      onChange={(e) => setDiscountForm({...discountForm, discount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={discountForm.type}
                      onChange={(e) => setDiscountForm({...discountForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (NPR)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={discountForm.active}
                    onChange={(e) => setDiscountForm({...discountForm, active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Active immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiscountModal(false);
                      setEditingDiscount(null);
                      setDiscountForm({ name: '', description: '', discount: '', type: 'percentage', active: true });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {editingDiscount ? 'Update Discount' : 'Add Discount'}
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

export default RatesManagement;