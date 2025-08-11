import { useState } from 'react';
import toast from 'react-hot-toast';

const BusinessHours = () => {
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '06:00', close: '22:00', closed: false },
    tuesday: { open: '06:00', close: '22:00', closed: false },
    wednesday: { open: '06:00', close: '22:00', closed: false },
    thursday: { open: '06:00', close: '22:00', closed: false },
    friday: { open: '06:00', close: '22:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '08:00', close: '20:00', closed: false }
  });

  const [specialHours, setSpecialHours] = useState([
    {
      id: 1,
      date: '2024-12-25',
      name: 'Christmas Day',
      open: '10:00',
      close: '18:00',
      closed: false
    }
  ]);

  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [specialForm, setSpecialForm] = useState({
    date: '',
    name: '',
    open: '06:00',
    close: '22:00',
    closed: false
  });

  const daysOfWeek = [
    { key: 'monday', name: 'Monday' },
    { key: 'tuesday', name: 'Tuesday' },
    { key: 'wednesday', name: 'Wednesday' },
    { key: 'thursday', name: 'Thursday' },
    { key: 'friday', name: 'Friday' },
    { key: 'saturday', name: 'Saturday' },
    { key: 'sunday', name: 'Sunday' }
  ];

  const handleHourChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleToggleClosed = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed
      }
    }));
  };

  const handleSaveHours = () => {
    // Simulate API call
    toast.success('Business hours updated successfully!');
  };

  const handleAddSpecialHours = (e) => {
    e.preventDefault();
    const newSpecialHours = {
      id: Date.now(),
      ...specialForm
    };

    setSpecialHours([...specialHours, newSpecialHours]);
    setShowSpecialModal(false);
    setSpecialForm({
      date: '',
      name: '',
      open: '06:00',
      close: '22:00',
      closed: false
    });
    toast.success('Special hours added successfully!');
  };

  const handleDeleteSpecialHours = (id) => {
    if (window.confirm('Are you sure you want to delete these special hours?')) {
      setSpecialHours(specialHours.filter(h => h.id !== id));
      toast.success('Special hours deleted successfully!');
    }
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
        <p className="text-gray-600">Set your regular operating hours and special occasion schedules</p>
      </div>

      {/* Regular Hours */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Regular Operating Hours</h3>
        
        <div className="space-y-4">
          {daysOfWeek.map(({ key, name }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`closed-${key}`}
                  checked={businessHours[key].closed}
                  onChange={() => handleToggleClosed(key)}
                  className="mr-3 rounded"
                />
                <label htmlFor={`closed-${key}`} className="text-sm text-gray-500 mr-4 w-16">
                  Closed
                </label>
                <span className="text-sm font-medium text-gray-900 w-20">{name}</span>
              </div>
              
              {!businessHours[key].closed && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <label className="text-sm text-gray-600 mr-2">Open:</label>
                    <input
                      type="time"
                      value={businessHours[key].open}
                      onChange={(e) => handleHourChange(key, 'open', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm text-gray-600 mr-2">Close:</label>
                    <input
                      type="time"
                      value={businessHours[key].close}
                      onChange={(e) => handleHourChange(key, 'close', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    {formatTime12Hour(businessHours[key].open)} - {formatTime12Hour(businessHours[key].close)}
                  </div>
                </div>
              )}
              
              {businessHours[key].closed && (
                <div className="text-sm text-red-600 font-medium">
                  Closed
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveHours}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Hours
          </button>
        </div>
      </div>

      {/* Special Hours */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Special Hours & Holidays</h3>
          <button
            onClick={() => setShowSpecialModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Special Hours
          </button>
        </div>

        {specialHours.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p>No special hours set. Add special operating hours for holidays or events.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {specialHours.map((special) => (
              <div key={special.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{special.name}</span>
                    <span className="ml-3 text-sm text-gray-500">
                      {new Date(special.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {special.closed ? (
                      <span className="text-red-600 font-medium">Closed</span>
                    ) : (
                      <span>
                        {formatTime12Hour(special.open)} - {formatTime12Hour(special.close)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSpecialHours(special.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hours Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">📅 Current Week Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {daysOfWeek.slice(0, 4).map(({ key, name }) => (
            <div key={key} className="text-center">
              <p className="font-medium text-blue-800">{name}</p>
              <p className="text-sm text-blue-600">
                {businessHours[key].closed ? (
                  <span className="text-red-600">Closed</span>
                ) : (
                  `${formatTime12Hour(businessHours[key].open)} - ${formatTime12Hour(businessHours[key].close)}`
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Special Hours Modal */}
      {showSpecialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Special Hours</h3>
                <button
                  onClick={() => setShowSpecialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddSpecialHours} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={specialForm.date}
                    onChange={(e) => setSpecialForm({...specialForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name/Description *
                  </label>
                  <input
                    type="text"
                    value={specialForm.name}
                    onChange={(e) => setSpecialForm({...specialForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Christmas Day, New Year"
                    required
                  />
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="special-closed"
                    checked={specialForm.closed}
                    onChange={(e) => setSpecialForm({...specialForm, closed: e.target.checked})}
                    className="mr-2 rounded"
                  />
                  <label htmlFor="special-closed" className="text-sm text-gray-700">
                    Closed on this date
                  </label>
                </div>

                {!specialForm.closed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={specialForm.open}
                        onChange={(e) => setSpecialForm({...specialForm, open: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={specialForm.close}
                        onChange={(e) => setSpecialForm({...specialForm, close: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSpecialModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Add Special Hours
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

export default BusinessHours;