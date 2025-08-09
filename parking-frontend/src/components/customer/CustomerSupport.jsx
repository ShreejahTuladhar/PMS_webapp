import { useState } from 'react';

function CustomerSupport({ customerData, onClose }) {
  const [supportType, setSupportType] = useState('quick-help');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const quickHelpOptions = [
    {
      id: 'cant-find-space',
      title: "Can't find my parking space",
      icon: '🔍',
      solution: `Your parking space is: ${customerData?.ticket?.location?.spaceNumber || 'A15'} on Level ${customerData?.ticket?.location?.level || '2'}.`
    },
    {
      id: 'payment-issues', 
      title: 'Payment problems',
      icon: '💳',
      solution: 'Try different payment method or contact support for manual processing.'
    },
    {
      id: 'extend-parking',
      title: 'How to extend parking', 
      icon: '⏰',
      solution: 'Tap "Extend Parking Time" button on your digital ticket.'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">🎧 Customer Support</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💬</div>
          <h3 className="text-xl font-bold text-gray-700">How can we help?</h3>
        </div>

        <div className="space-y-4">
          {quickHelpOptions.map((option) => (
            <div key={option.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setSelectedIssue(selectedIssue === option.id ? null : option.id)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-semibold">{option.title}</span>
                </div>
                <span>{selectedIssue === option.id ? '−' : '+'}</span>
              </button>
              {selectedIssue === option.id && (
                <div className="p-4 bg-blue-50 border-t">
                  <p className="text-blue-700">{option.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="bg-blue-500 text-white p-4 rounded-xl font-semibold hover:bg-blue-600">
            📞 Call Support
          </button>
          <button className="bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600">
            💬 Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;