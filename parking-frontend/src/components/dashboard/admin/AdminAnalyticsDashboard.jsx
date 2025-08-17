/**
 * Advanced Real-Time Analytics Dashboard for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Comprehensive business intelligence and monitoring interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../../hooks/useAuth';
// Analytics service removed - using static data for now
import LoadingSpinner from '../../common/LoadingSpinner';

const AdminAnalyticsDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState({
        realTime: {},
        revenue: { data: [], summary: {} },
        utilization: [],
        peakHours: [],
        userBehavior: {},
        predictive: {}
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [locations, setLocations] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Real-time data refresh - using mock data
    const fetchRealTimeData = useCallback(async () => {
        try {
            const realTimeData = {
                activeBookings: 42,
                totalRevenue: 15750,
                occupancyRate: 78,
                averageSessionTime: 125
            };
            setAnalytics(prev => ({ ...prev, realTime: realTimeData }));
        } catch (error) {
            console.error('Failed to fetch real-time data:', error);
        }
    }, []);

    // Comprehensive analytics fetch - using mock data
    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            // Mock data for analytics
            const revenueData = {
                data: [
                    { date: '2025-08-10', revenue: 2500, bookings: 45 },
                    { date: '2025-08-11', revenue: 3200, bookings: 58 },
                    { date: '2025-08-12', revenue: 2800, bookings: 52 }
                ],
                summary: { total: 8500, growth: 12.5 }
            };
            
            const utilizationData = [
                { hour: '08:00', utilization: 45 },
                { hour: '12:00', utilization: 78 },
                { hour: '18:00', utilization: 92 }
            ];
            
            const peakHoursData = [
                { hour: '08:00-09:00', bookings: 15 },
                { hour: '17:00-18:00', bookings: 25 }
            ];
            
            const userBehaviorData = {
                avgSessionTime: 125,
                returnUsers: 68,
                newUsers: 32
            };
            
            const locationsData = [
                { id: 'all', name: 'All Locations' },
                { id: '1', name: 'Ratna Park' }
            ];

            setAnalytics(prev => ({
                ...prev,
                revenue: revenueData,
                utilization: utilizationData,
                peakHours: peakHoursData,
                userBehavior: userBehaviorData
            }));
            setLocations(locationsData);
        } catch (error) {
            console.error('Analytics fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [timeRange, selectedLocation]);

    // Auto-refresh setup
    useEffect(() => {
        fetchAnalytics();
        fetchRealTimeData();

        if (autoRefresh) {
            const interval = setInterval(fetchRealTimeData, 30000); // 30 seconds
            const analyticsInterval = setInterval(fetchAnalytics, 300000); // 5 minutes
            
            return () => {
                clearInterval(interval);
                clearInterval(analyticsInterval);
            };
        }
    }, [fetchAnalytics, fetchRealTimeData, autoRefresh]);

    // Chart colors
    const colors = {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        purple: '#8B5CF6'
    };

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="12"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading && !analytics.realTime.timestamp) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        ParkSathi Analytics Dashboard
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-4 py-2 rounded-lg ${autoRefresh 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                        </button>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="year">Last Year</option>
                        </select>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">All Locations</option>
                            {locations.map(location => (
                                <option key={location._id} value={location._id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Real-time status */}
                <div className="text-sm text-gray-600">
                    Last updated: {analytics.realTime.timestamp ? 
                        new Date(analytics.realTime.timestamp).toLocaleString() : 'Loading...'}
                </div>
            </div>

            {/* Real-time KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {analytics.realTime.activeBookings || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                                Rs. {(analytics.realTime.todayRevenue || 0).toLocaleString()}
                            </p>
                            <p className={`text-sm ${analytics.realTime.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {analytics.realTime.revenueGrowth >= 0 ? '+' : ''}
                                {(analytics.realTime.revenueGrowth || 0).toFixed(1)}% vs yesterday
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {(analytics.realTime.totalUsers || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Locations</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {analytics.realTime.activeLocations || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                            <p className="text-2xl font-bold text-indigo-600">
                                {analytics.utilization.length > 0 ? 
                                    (analytics.utilization.reduce((sum, loc) => sum + loc.utilizationRate, 0) / analytics.utilization.length).toFixed(1) : 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.revenue.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => [
                                    `Rs. ${value.toLocaleString()}`, 
                                    name === 'totalRevenue' ? 'Revenue' : name
                                ]}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="totalRevenue" 
                                stroke={colors.primary} 
                                strokeWidth={3}
                                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="bookingCount" 
                                stroke={colors.secondary} 
                                strokeWidth={2}
                                yAxisId="right"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Peak Hours Analysis */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="_id" 
                                tickFormatter={(hour) => `${hour}:00`}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                                formatter={(value, name) => [
                                    value.toFixed(1), 
                                    name === 'avgBookingsPerHour' ? 'Avg Bookings' : name
                                ]}
                            />
                            <Bar 
                                dataKey="avgBookingsPerHour" 
                                fill={colors.accent}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Utilization and User Behavior */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Location Utilization */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Location Utilization Rates</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.utilization.slice(0, 10)} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis 
                                type="category" 
                                dataKey="locationName" 
                                width={120}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                formatter={(value) => [`${value.toFixed(1)}%`, 'Utilization']}
                            />
                            <Bar 
                                dataKey="utilizationRate" 
                                fill={colors.purple}
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Metrics */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">User Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium">Total Users</span>
                            <span className="font-bold text-blue-600">
                                {(analytics.userBehavior.totalUsers || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium">Active Users</span>
                            <span className="font-bold text-green-600">
                                {(analytics.userBehavior.activeUsers || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm font-medium">New Users</span>
                            <span className="font-bold text-purple-600">
                                {(analytics.userBehavior.newUsers || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium">Avg Bookings/User</span>
                            <span className="font-bold text-orange-600">
                                {(analytics.userBehavior.avgBookingsPerUser || 0).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Revenue Summary - {timeRange}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            Rs. {(analytics.revenue.summary.totalRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {(analytics.revenue.summary.totalBookings || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                            Rs. {(analytics.revenue.summary.avgBookingValue || 0).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600">Avg Booking Value</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                            {analytics.utilization.length > 0 ? 
                                (analytics.utilization.reduce((sum, loc) => sum + loc.utilizationRate, 0) / analytics.utilization.length).toFixed(1) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Avg Utilization</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
                © 2025 1Ox4Fox LLC - ParkSathi Analytics Dashboard
                <br />
                Conceptualized & Developed by Shreeraj Tuladhar
            </div>
        </div>
    );
};

export default AdminAnalyticsDashboard;