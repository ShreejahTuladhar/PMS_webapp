import { useState, useEffect } from 'react';
import { userService } from '../../../services';
import toast from 'react-hot-toast';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('30days');
  const [showSampleData, setShowSampleData] = useState(false);

  const itemsPerPage = 10;

  // Sample transaction data for demonstration
  const sampleTransactions = [
    {
      id: 'txn_001',
      transactionId: 'TXN20240816001',
      bookingId: 'BK240001',
      amount: 150,
      type: 'payment',
      status: 'completed',
      description: 'Parking at Tribhuvan Airport - Terminal 1',
      paymentMethod: 'Credit Card (****4532)',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_002',
      transactionId: 'TXN20240815002',
      bookingId: 'BK240002',
      amount: 75,
      type: 'payment',
      status: 'completed',
      description: 'Parking at City Center Mall - Level B2',
      paymentMethod: 'PayPal',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_003',
      transactionId: 'TXN20240814003',
      bookingId: 'BK240003',
      amount: 200,
      type: 'payment',
      status: 'completed',
      description: 'Parking at Durbar Marg - Premium Spot',
      paymentMethod: 'Debit Card (****7890)',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_004',
      transactionId: 'TXN20240813004',
      bookingId: 'BK240004',
      amount: 50,
      type: 'refund',
      status: 'completed',
      description: 'Refund for cancelled booking at New Road',
      paymentMethod: 'Credit Card (****4532)',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_005',
      transactionId: 'TXN20240812005',
      bookingId: 'BK240005',
      amount: 120,
      type: 'payment',
      status: 'pending',
      description: 'Parking at Basantapur - Heritage Zone',
      paymentMethod: 'Mobile Wallet',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_006',
      transactionId: 'TXN20240811006',
      bookingId: 'BK240006',
      amount: 300,
      type: 'payment',
      status: 'completed',
      description: 'Parking at Hotel Himalaya - VIP Section',
      paymentMethod: 'Credit Card (****1234)',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_007',
      transactionId: 'TXN20240810007',
      bookingId: 'BK240007',
      amount: 85,
      type: 'payment',
      status: 'failed',
      description: 'Parking at Thamel District - Tourist Zone',
      paymentMethod: 'Credit Card (****9876)',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_008',
      transactionId: 'TXN20240809008',
      bookingId: 'BK240008',
      amount: 25,
      type: 'fee',
      status: 'completed',
      description: 'Service fee for extended parking at Patan Durbar',
      paymentMethod: 'PayPal',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_009',
      transactionId: 'TXN20240808009',
      bookingId: 'BK240009',
      amount: 175,
      type: 'payment',
      status: 'completed',
      description: 'Parking at Bhaktapur - Cultural Heritage Site',
      paymentMethod: 'Debit Card (****5678)',
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_010',
      transactionId: 'TXN20240807010',
      bookingId: 'BK240010',
      amount: 90,
      type: 'payment',
      status: 'completed',
      description: 'Parking at Lazimpat - Embassy Area',
      paymentMethod: 'Mobile Wallet',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    loadTransactions();
  }, [filter, dateRange]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await userService.getTransactionHistory({
        status: filter === 'all' ? undefined : filter,
        dateRange,
        limit: 50
      });
      
      if (response.success && response.transactions && response.transactions.length > 0) {
        setTransactions(response.transactions);
        setShowSampleData(false);
      } else {
        // Show sample data when no real transactions are available
        setTransactions(sampleTransactions);
        setShowSampleData(true);
        console.log('No real transaction data found, showing sample data');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to sample data on error
      setTransactions(sampleTransactions);
      setShowSampleData(true);
      toast.info('Showing sample transaction data for demonstration');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHistory = async () => {
    try {
      setLoading(true);
      const response = await userService.exportUserData();
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transaction-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Transaction history exported successfully!');
      } else {
        toast.error('Failed to export transaction history');
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || colors.pending;
  };

  const getTransactionTypeIcon = (type) => {
    const icons = {
      payment: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      refund: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      ),
      fee: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    };
    return icons[type] || icons.payment;
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your transaction history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction History
            {showSampleData && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Sample Data
              </span>
            )}
          </h2>
          <p className="text-gray-600">
            {showSampleData 
              ? 'Viewing sample transaction data for demonstration'
              : 'View and export your payment history'
            }
          </p>
        </div>
        <button
          onClick={handleExportHistory}
          disabled={loading}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export History
        </button>
      </div>

      {/* Sample Data Notice */}
      {showSampleData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> You're viewing sample transaction data for demonstration purposes. 
                Real transactions will appear here once you start making bookings and payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Transactions</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 3 months</option>
          <option value="1year">Last year</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by transaction ID, booking ID, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">You don't have any transactions matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTransactionTypeIcon(transaction.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description || 'Parking Payment'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Transaction ID: {transaction.transactionId || transaction.id}
                          </div>
                          {transaction.bookingId && (
                            <div className="text-sm text-gray-500">
                              Booking ID: {transaction.bookingId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(transaction.createdAt || transaction.date).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          {new Date(transaction.createdAt || transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'}`}>
                        {transaction.type === 'refund' ? '+' : '-'}Rs. {Math.abs(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.paymentMethod || 'Credit Card'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredTransactions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;