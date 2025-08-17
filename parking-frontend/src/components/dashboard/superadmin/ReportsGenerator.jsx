import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsGenerator = () => {
    const [reportType, setReportType] = useState('revenue');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const reportTypes = [
        { id: 'revenue', name: 'Revenue Report', icon: '💰' },
        { id: 'users', name: 'User Analytics', icon: '👥' },
        { id: 'locations', name: 'Location Performance', icon: '🏬' },
        { id: 'bookings', name: 'Booking Trends', icon: '📅' },
        { id: 'system', name: 'System Usage', icon: '⚡' }
    ];

    const generateReport = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Mock data based on report type
            const mockData = generateMockData(reportType);
            setReportData(mockData);
            setLoading(false);
        }, 1500);
    };

    const generateMockData = (type) => {
        switch (type) {
            case 'revenue':
                return {
                    summary: {
                        totalRevenue: 1245000,
                        averageDaily: 41500,
                        growth: 12.5,
                        topLocation: 'Kathmandu Mall'
                    },
                    chartData: Array.from({ length: 30 }, (_, i) => ({
                        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        revenue: Math.floor(Math.random() * 50000) + 30000,
                        bookings: Math.floor(Math.random() * 100) + 50
                    }))
                };
            case 'users':
                return {
                    summary: {
                        totalUsers: 15420,
                        newUsers: 342,
                        activeUsers: 8245,
                        retention: 68.5
                    },
                    chartData: [
                        { name: 'Customers', value: 12500, color: '#3B82F6' },
                        { name: 'Parking Admins', value: 2820, color: '#10B981' },
                        { name: 'Super Admins', value: 100, color: '#F59E0B' }
                    ]
                };
            case 'locations':
                return {
                    summary: {
                        totalLocations: 156,
                        activeLocations: 142,
                        avgUtilization: 72.3,
                        topPerformer: 'City Center Parking'
                    },
                    chartData: Array.from({ length: 10 }, (_, i) => ({
                        name: `Location ${i + 1}`,
                        utilization: Math.floor(Math.random() * 40) + 60,
                        revenue: Math.floor(Math.random() * 100000) + 50000
                    }))
                };
            default:
                return null;
        }
    };

    const exportReport = (format) => {
        alert(`Exporting report as ${format.toUpperCase()}...`);
    };

    const ReportChart = ({ data, type }) => {
        if (!data) return null;

        switch (type) {
            case 'revenue':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [
                                name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                                name === 'revenue' ? 'Revenue' : 'Bookings'
                            ]} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                            <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'users':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data.chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'locations':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="utilization" fill="#3B82F6" name="Utilization %" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Reports Generator</h2>
                
                {/* Report Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                            {reportTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.icon} {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        <span>{loading ? 'Generating...' : '📊 Generate Report'}</span>
                    </button>
                </div>

                {/* Report Results */}
                {reportData && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(reportData.summary).map(([key, value]) => (
                                <div key={key} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {typeof value === 'number' && key.includes('revenue') || key.includes('Revenue') 
                                            ? `Rs. ${value.toLocaleString()}`
                                            : typeof value === 'number' && key.includes('percent') || key.includes('growth') || key.includes('retention')
                                            ? `${value}%`
                                            : typeof value === 'number'
                                            ? value.toLocaleString()
                                            : value
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {reportTypes.find(t => t.id === reportType)?.name} Visualization
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => exportReport('pdf')}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        📄 PDF
                                    </button>
                                    <button
                                        onClick={() => exportReport('excel')}
                                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                    >
                                        📊 Excel
                                    </button>
                                    <button
                                        onClick={() => exportReport('csv')}
                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                    >
                                        📋 CSV
                                    </button>
                                </div>
                            </div>
                            <ReportChart data={reportData} type={reportType} />
                        </div>

                        {/* Report Details */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Report Type:</strong> {reportTypes.find(t => t.id === reportType)?.name}
                                </div>
                                <div>
                                    <strong>Date Range:</strong> {dateRange.startDate} to {dateRange.endDate}
                                </div>
                                <div>
                                    <strong>Generated:</strong> {new Date().toLocaleString()}
                                </div>
                                <div>
                                    <strong>Status:</strong> <span className="text-green-600">Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scheduled Reports */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Scheduled Reports</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                        Scheduled report features will be implemented here. Users will be able to:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                        <li>Set up automatic report generation</li>
                        <li>Schedule email delivery of reports</li>
                        <li>Configure report frequency (daily, weekly, monthly)</li>
                        <li>Manage report templates and customizations</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportsGenerator;