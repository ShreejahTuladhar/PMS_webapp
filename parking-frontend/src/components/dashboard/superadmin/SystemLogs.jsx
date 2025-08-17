import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        level: 'all',
        source: 'all',
        dateRange: '24h'
    });

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters);
            const response = await api.get(`/super-admin/logs?${queryParams}`);
            setLogs(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            // Mock data for demonstration
            setLogs([
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    source: 'auth',
                    message: 'User login successful',
                    details: { userId: '507f1f77bcf86cd799439011', ip: '192.168.1.1' }
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    level: 'warning',
                    source: 'database',
                    message: 'Slow query detected',
                    details: { query: 'SELECT * FROM bookings', duration: '2.3s' }
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    level: 'error',
                    source: 'payment',
                    message: 'Payment processing failed',
                    details: { error: 'Gateway timeout', bookingId: '507f1f77bcf86cd799439012' }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level) => {
        switch (level.toLowerCase()) {
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'debug':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'error':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            case 'debug':
                return '🔍';
            default:
                return '📝';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 System Logs</h2>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                        <select
                            value={filters.level}
                            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Levels</option>
                            <option value="error">Error</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                        <select
                            value={filters.source}
                            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Sources</option>
                            <option value="auth">Authentication</option>
                            <option value="database">Database</option>
                            <option value="payment">Payment</option>
                            <option value="booking">Booking</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={fetchLogs}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            🔄 Refresh
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            💾 Export Logs
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            🗑️ Clear Old Logs
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">
                        {logs.length} log entries
                    </div>
                </div>

                {/* Logs List */}
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading logs...</span>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {logs.map((log) => (
                            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="text-xl">{getLevelIcon(log.level)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                                                    {log.level.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {log.source}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 font-medium mb-2">
                                                {log.message}
                                            </p>
                                            {log.details && (
                                                <details className="text-xs text-gray-600">
                                                    <summary className="cursor-pointer hover:text-gray-800">
                                                        View Details
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {logs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">📝</div>
                                <p>No logs found for the selected criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Log Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {logs.filter(log => log.level === 'error').length}
                    </div>
                    <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {logs.filter(log => log.level === 'warning').length}
                    </div>
                    <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {logs.filter(log => log.level === 'info').length}
                    </div>
                    <div className="text-sm text-gray-600">Info</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                        {logs.filter(log => log.level === 'debug').length}
                    </div>
                    <div className="text-sm text-gray-600">Debug</div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;