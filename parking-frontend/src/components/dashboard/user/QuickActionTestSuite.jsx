import { useState } from 'react';
import SmartQuickActions from './SmartQuickActions';
import DigitalTicketModal from './DigitalTicketModal';
import SupportModal from './SupportModal';
import toast from 'react-hot-toast';

const QuickActionTestSuite = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDigitalTicket, setShowDigitalTicket] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [testResults, setTestResults] = useState([]);

  // Handle modal opening from quick actions
  const handleModalOpen = (modalType, params = {}) => {
    const result = {
      action: 'modal_open',
      modalType,
      params,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (modalType) {
      case 'digital_ticket':
        setSelectedBookingId(params.bookingId || null);
        setShowDigitalTicket(true);
        toast.success('✅ Digital ticket modal opened successfully');
        break;
      case 'support':
        setShowSupport(true);
        toast.success('✅ Support modal opened successfully');
        break;
      default:
        result.status = 'error';
        result.error = 'Unknown modal type';
        toast.error('❌ Unknown modal type: ' + modalType);
    }

    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  // Handle tab changes from quick actions
  const handleTabChange = (tabId) => {
    const result = {
      action: 'tab_change',
      tabId,
      previousTab: activeTab,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    setActiveTab(tabId);
    toast.success(`✅ Switched to ${tabId} tab`);
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  // Test cases for natural language processing
  const testCases = [
    {
      name: 'Find Parking',
      inputs: [
        'find parking',
        'search for a parking spot',
        'locate nearby parking',
        'park my car',
        'find parking near airport'
      ]
    },
    {
      name: 'Add Payment',
      inputs: [
        'add payment method',
        'manage my cards',
        'add credit card',
        'payment settings',
        'add billing info'
      ]
    },
    {
      name: 'Digital Ticket',
      inputs: [
        'show my ticket',
        'digital ticket',
        'parking pass',
        'show QR code',
        'my booking ticket'
      ]
    },
    {
      name: 'Get Support',
      inputs: [
        'get help',
        'contact support',
        'need assistance',
        'customer service',
        'report problem'
      ]
    },
    {
      name: 'View Bookings',
      inputs: [
        'view my bookings',
        'booking history',
        'past reservations',
        'see my bookings'
      ]
    },
    {
      name: 'Manage Vehicles',
      inputs: [
        'manage vehicles',
        'add vehicle',
        'my cars',
        'vehicle settings'
      ]
    }
  ];

  const runAutomatedTests = () => {
    toast.info('🧪 Running automated NLP tests...');
    
    testCases.forEach((testCase, caseIndex) => {
      testCase.inputs.forEach((input, inputIndex) => {
        setTimeout(() => {
          // Simulate NLP processing
          const mockEvent = {
            preventDefault: () => {},
            target: { value: input }
          };
          
          // This would normally trigger the NLP service
          toast(`Testing: "${input}"`);
          
          const result = {
            action: 'nlp_test',
            input,
            testCase: testCase.name,
            timestamp: new Date().toISOString(),
            status: 'tested'
          };
          
          setTestResults(prev => [result, ...prev.slice(0, 19)]);
        }, (caseIndex * testCase.inputs.length + inputIndex) * 500);
      });
    });
  };

  const clearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Test Header */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Quick Actions Test Suite
        </h2>
        <p className="text-gray-700 mb-4">
          Test the natural language processing and seamless UI interactions
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={runAutomatedTests}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            🚀 Run Automated Tests
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Current State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Active Tab:</span> 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{activeTab}</span>
          </div>
          <div>
            <span className="font-medium">Digital Ticket:</span>
            <span className={`ml-2 px-2 py-1 rounded ${showDigitalTicket ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {showDigitalTicket ? 'Open' : 'Closed'}
            </span>
          </div>
          <div>
            <span className="font-medium">Support:</span>
            <span className={`ml-2 px-2 py-1 rounded ${showSupport ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {showSupport ? 'Open' : 'Closed'}
            </span>
          </div>
          <div>
            <span className="font-medium">Selected Booking:</span>
            <span className="ml-2 text-gray-600">{selectedBookingId || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Smart Quick Actions Component */}
      <SmartQuickActions 
        onTabChange={handleTabChange}
        onModalOpen={handleModalOpen}
      />

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            📊 Test Results ({testResults.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.status === 'success' ? 'border-green-500 bg-green-50' :
                  result.status === 'error' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">
                      {result.action === 'modal_open' ? '🔲 Modal' :
                       result.action === 'tab_change' ? '📑 Tab' :
                       result.action === 'nlp_test' ? '🧠 NLP' : '❓ Unknown'}
                    </span>
                    {result.action === 'modal_open' && (
                      <span className="ml-2 text-sm text-gray-600">
                        {result.modalType}
                      </span>
                    )}
                    {result.action === 'tab_change' && (
                      <span className="ml-2 text-sm text-gray-600">
                        {result.previousTab} → {result.tabId}
                      </span>
                    )}
                    {result.action === 'nlp_test' && (
                      <span className="ml-2 text-sm text-gray-600">
                        "{result.input}" → {result.testCase}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {result.error && (
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Cases Reference */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">
          📝 Test Cases Reference
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testCases.map((testCase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">{testCase.name}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {testCase.inputs.map((input, inputIndex) => (
                  <li key={inputIndex} className="truncate">
                    "{ input }"
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <DigitalTicketModal
        isOpen={showDigitalTicket}
        onClose={() => {
          setShowDigitalTicket(false);
          toast.info('Digital ticket modal closed');
        }}
        bookingId={selectedBookingId}
      />
      
      <SupportModal
        isOpen={showSupport}
        onClose={() => {
          setShowSupport(false);
          toast.info('Support modal closed');
        }}
      />
    </div>
  );
};

export default QuickActionTestSuite;