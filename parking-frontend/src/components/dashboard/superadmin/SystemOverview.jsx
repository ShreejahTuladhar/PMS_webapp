import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../../services/api';

const SystemOverview = ({ data, onRefresh }) => {
    const [systemMetrics, setSystemMetrics] = useState({
        realTimeStats: {},
        performanceMetrics: [],
        alertSummary: [],
        databaseMetrics: {},
        serverMetrics: {}
    });
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchRealTimeMetrics = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/super-admin/real-time-metrics');
            setSystemMetrics(response.data);
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRealTimeMetrics();
        
        if (autoRefresh) {
            const interval = setInterval(fetchRealTimeMetrics, 30000); // 30 seconds
            return () => clearInterval(interval);
        }
    }, [fetchRealTimeMetrics, autoRefresh]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy':
            case 'good':
            case 'optimal':
                return 'text-green-600 bg-green-100';
            case 'warning':
            case 'moderate':
                return 'text-yellow-600 bg-yellow-100';
            case 'critical':
            case 'high':
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const SystemHealthCard = ({ title, status, value, unit, icon, description }) => (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="text-2xl mr-3">{icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {status}
                </span>
            </div>
            <div className="mb-2">
                <span className="text-3xl font-bold text-gray-800">{value}</span>
                {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
            </div>
            {description && (
                <p className="text-sm text-gray-600">{description}</p>
            )}
        </div>
    );

    const AlertsPanel = () => (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🚨 System Alerts</h3>
                <button
                    onClick={onRefresh}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                    Refresh
                </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.alerts?.length > 0 ? (
                    data.alerts.map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                            alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                            'border-blue-500 bg-blue-50'
                        }`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-gray-800">{alert.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                    alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-blue-200 text-blue-800'
                                }`}>
                                    {alert.severity}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">✅</div>
                        <p>No active alerts</p>
                    </div>
                )}
            </div>
        </div>
    );

    const RecentActivityPanel = () => {
        // Mock recent activity data - in production this would come from API
        const recentActivities = data.recentActivity?.length > 0 ? data.recentActivity : [
            {
                id: 1,
                icon: '👤',
                action: 'New user registered',
                details: 'Ramesh Shrestha joined from Kathmandu',
                timestamp: new Date(Date.now() - 5 * 60000),
                status: 'success'
            },
            {
                id: 2,
                icon: '💰',
                action: 'Payment processed',
                details: 'Rs. 150 parking fee - Durbar Marg Location',
                timestamp: new Date(Date.now() - 12 * 60000),
                status: 'success'
            },
            {
                id: 3,
                icon: '🏬',
                action: 'New location added',
                details: 'Patan Durbar Square - 50 parking spots',
                timestamp: new Date(Date.now() - 25 * 60000),
                status: 'success'
            },
            {
                id: 4,
                icon: '⚠️',
                action: 'System alert cleared',
                details: 'High CPU usage alert resolved',
                timestamp: new Date(Date.now() - 45 * 60000),
                status: 'resolved'
            },
            {
                id: 5,
                icon: '📅',
                action: 'Booking completed',
                details: 'Parking session ended - New Road Plaza',
                timestamp: new Date(Date.now() - 60 * 60000),
                status: 'completed'
            }
        ];

        const getActivityColor = (status) => {
            if (status === 'success' || status === 'completed') return 'border-green-500 bg-green-50';
            if (status === 'resolved') return 'border-blue-500 bg-blue-50';
            if (status === 'warning') return 'border-yellow-500 bg-yellow-50';
            return 'border-gray-500 bg-gray-50';
        };

        return (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">📋 Recent System Activity</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                    </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity) => (
                        <div key={activity.id} className={`p-4 rounded-lg border-l-4 ${getActivityColor(activity.status)} hover:shadow-md transition-shadow`}>
                            <div className="flex items-start space-x-3">
                                <div className="text-lg">{activity.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                            <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                            activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                            activity.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {activity.status}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                                        <span className="mr-1">🕒</span>
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        View All Activity →
                    </button>
                </div>
            </div>
        );
    };

    const DatabaseMetricsChart = () => {
        const dbData = [
            { name: 'Users', count: data.userStats?.totalUsers || 0, color: '#3B82F6' },
            { name: 'Locations', count: data.locationStats?.activeLocations || 0, color: '#10B981' },
            { name: 'Bookings', count: systemMetrics.databaseMetrics?.totalBookings || 0, color: '#F59E0B' },
            { name: 'Transactions', count: systemMetrics.databaseMetrics?.totalTransactions || 0, color: '#8B5CF6' }
        ];

        return (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Database Records</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dbData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value.toLocaleString(), 'Records']} />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const PerformanceChart = () => {
        const performanceData = systemMetrics.performanceMetrics || [];
        
        return (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">⚡ System Performance</h3>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1 rounded-lg text-sm ${autoRefresh 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                        <Legend />
                        <Line type="monotone" dataKey="cpuUsage" stroke="#3B82F6" strokeWidth={2} dot={false} name="CPU %" />
                        <Line type="monotone" dataKey="memoryUsage" stroke="#10B981" strokeWidth={2} dot={false} name="Memory %" />
                        <Line type="monotone" dataKey="responseTime" stroke="#F59E0B" strokeWidth={2} dot={false} name="Response Time (ms)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    if (loading && !systemMetrics.realTimeStats) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* System Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SystemHealthCard
                    title="Server Status"
                    status={data.systemHealth?.status || 'Unknown'}
                    value={data.systemHealth?.uptime ? `${Math.floor(data.systemHealth.uptime / 3600)}h` : 'N/A'}
                    unit="uptime"
                    icon="🖥️"
                    description="Server operational status"
                />
                <SystemHealthCard
                    title="Database"
                    status={systemMetrics.databaseMetrics?.connectionStatus || 'Unknown'}
                    value={systemMetrics.databaseMetrics?.responseTime || 'N/A'}
                    unit="ms"
                    icon="🗄️"
                    description="Database response time"
                />
                <SystemHealthCard
                    title="Memory Usage"
                    status={systemMetrics.serverMetrics?.memoryStatus || 'Good'}
                    value={systemMetrics.serverMetrics?.memoryUsage || 'N/A'}
                    unit="%"
                    icon="💾"
                    description="RAM utilization"
                />
                <SystemHealthCard
                    title="Active Connections"
                    status="Healthy"
                    value={systemMetrics.realTimeStats?.activeConnections || 0}
                    unit=""
                    icon="🔗"
                    description="Current user connections"
                />
            </div>

            {/* Revenue Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">📈 Revenue Trends</h3>
                        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>This year</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={[
                            { name: 'Mon', revenue: 65000, bookings: 120 },
                            { name: 'Tue', revenue: 78000, bookings: 152 },
                            { name: 'Wed', revenue: 95000, bookings: 180 },
                            { name: 'Thu', revenue: 88000, bookings: 165 },
                            { name: 'Fri', revenue: 102000, bookings: 195 },
                            { name: 'Sat', revenue: 125000, bookings: 220 },
                            { name: 'Sun', revenue: 98000, bookings: 175 }
                        ]}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [
                                name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                                name === 'revenue' ? 'Revenue' : 'Bookings'
                            ]} />
                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revenueGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 User Activity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                            { name: 'Mon', activeUsers: 1200, newUsers: 45 },
                            { name: 'Tue', activeUsers: 1350, newUsers: 52 },
                            { name: 'Wed', activeUsers: 1180, newUsers: 38 },
                            { name: 'Thu', activeUsers: 1420, newUsers: 61 },
                            { name: 'Fri', activeUsers: 1650, newUsers: 78 },
                            { name: 'Sat', activeUsers: 1890, newUsers: 85 },
                            { name: 'Sun', activeUsers: 1520, newUsers: 42 }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
                            <Bar dataKey="newUsers" fill="#F59E0B" name="New Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance Chart */}
            <PerformanceChart />

            {/* Database Metrics and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DatabaseMetricsChart />
                <AlertsPanel />
            </div>

            {/* Recent Activity */}
            <RecentActivityPanel />

            {/* System Information */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {new Date(data.systemHealth?.lastRestart || Date.now()).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-600">Last Restart</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {systemMetrics.databaseMetrics?.totalQueries || 0}
                        </div>
                        <p className="text-sm text-gray-600">DB Queries Today</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {systemMetrics.serverMetrics?.diskUsage || 'N/A'}%
                        </div>
                        <p className="text-sm text-gray-600">Disk Usage</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemOverview;