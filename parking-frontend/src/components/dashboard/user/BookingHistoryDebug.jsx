import { useState } from 'react';
import { userService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';

const BookingHistoryDebug = () => {
  const { user, token } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBookingEndpoint = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('Testing booking endpoint...');
      console.log('User:', user);
      console.log('Token exists:', !!token);

      const response = await userService.getUserBookings({
        limit: 5
      });

      console.log('Booking response:', response);

      setTestResult({
        success: response.success,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Booking test error:', error);
      setTestResult({
        success: false,
        error: error.message || 'Unknown error',
        fullError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900">🔧 Booking History Debug</h3>
      
      {/* User Info */}
      <div className="bg-white p-4 rounded border">
        <h4 className="font-medium mb-2">Authentication Status</h4>
        <div className="text-sm space-y-1">
          <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
          <p><strong>Username:</strong> {user?.username || 'Not available'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
          <p><strong>Token:</strong> {token ? 'Present ✅' : 'Missing ❌'}</p>
          <p><strong>Role:</strong> {user?.role || 'Not available'}</p>
        </div>
      </div>

      {/* Test Button */}
      <button
        onClick={testBookingEndpoint}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : '🧪 Test Booking Endpoint'}
      </button>

      {/* Test Results */}
      {testResult && (
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">
            Test Results {testResult.success ? '✅' : '❌'}
          </h4>
          
          <div className="text-sm space-y-2">
            <p><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</p>
            <p><strong>Timestamp:</strong> {testResult.timestamp}</p>
            
            {testResult.success ? (
              <div>
                <p><strong>Bookings Count:</strong> {testResult.data.bookings?.length || 0}</p>
                <p><strong>Has Pagination:</strong> {testResult.data.pagination ? 'Yes' : 'No'}</p>
                
                {testResult.data.bookings?.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Sample Booking:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.data.bookings[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p><strong>Error:</strong> {testResult.error}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Full Error Details</summary>
                  <pre className="bg-red-50 p-2 rounded text-xs overflow-auto mt-1">
                    {JSON.stringify(testResult.fullError, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">🛠️ Debugging Steps</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Make sure you're logged in with a valid user account</li>
          <li>Check that the backend server is running on port 8080</li>
          <li>Verify that the user has some booking data in the database</li>
          <li>Check browser network tab for API call details</li>
          <li>Look at browser console for additional error messages</li>
        </ol>
      </div>

      {/* Quick Fixes */}
      <div className="bg-green-50 p-4 rounded border border-green-200">
        <h4 className="font-medium text-green-900 mb-2">🚀 Quick Fixes</h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Try refreshing the page to reload authentication</li>
          <li>Log out and log back in to refresh tokens</li>
          <li>Check if backend database has sample booking data</li>
          <li>Ensure API endpoints are properly configured</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingHistoryDebug;