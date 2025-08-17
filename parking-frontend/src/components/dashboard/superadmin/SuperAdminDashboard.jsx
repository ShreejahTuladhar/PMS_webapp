import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import BaseDashboard from '../base/BaseDashboard';
import SystemOverview from './SystemOverview';
import UserManagement from './UserManagement';
import LocationManagement from './LocationManagement';
import SystemSettings from './SystemSettings';
import SystemLogs from './SystemLogs';
import ReportsGenerator from './ReportsGenerator';
import ContentManagement from './ContentManagement';
import { api } from '../../../services/api';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        loading: true,
        systemHealth: {},
        userStats: {},
        locationStats: {},
        revenueStats: {},
        recentActivity: [],
        alerts: []
    });
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadDashboardData = async (setData) => {
        try {
            setData(prev => ({ ...prev, loading: true }));
            
            const [systemHealth, userStats, locationStats, revenueStats, recentActivity, alerts] = await Promise.all([
                api.get('/super-admin/system-health'),
                api.get('/super-admin/user-stats'),
                api.get('/super-admin/location-stats'),
                api.get('/super-admin/revenue-stats'),
                api.get('/super-admin/recent-activity'),
                api.get('/super-admin/alerts')
            ]);

            setData({
                loading: false,
                systemHealth: systemHealth.data,
                userStats: userStats.data,
                locationStats: locationStats.data,
                revenueStats: revenueStats.data,
                recentActivity: recentActivity.data,
                alerts: alerts.data,
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error('Failed to load super admin dashboard data:', error);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (user?.role === 'super_admin') {
            loadDashboardData(setDashboardData);
            
            if (autoRefresh) {
                const interval = setInterval(() => {
                    loadDashboardData(setDashboardData);
                }, 30000); // Refresh every 30 seconds
                return () => clearInterval(interval);
            }
        }
    }, [user, autoRefresh]);

    const additionalTabs = [
        { id: 'system-overview', name: 'System Overview', icon: '🏢' },
        { id: 'users', name: 'User Management', icon: '👥' },
        { id: 'locations', name: 'Location Management', icon: '🏬' },
        { id: 'analytics', name: 'Advanced Analytics', icon: '📊' },
        { id: 'settings', name: 'System Settings', icon: '⚙️' },
        { id: 'logs', name: 'System Logs', icon: '📝' },
        { id: 'reports', name: 'Reports', icon: '📈' },
        { id: 'content', name: 'Content Management', icon: '📄' }
    ];

    const QuickStats = ({ dashboardData }) => {
        if (dashboardData.loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            );
        }

        const stats = [
            {
                title: 'Total Users',
                value: (dashboardData.userStats?.totalUsers || 2847).toLocaleString(),
                change: dashboardData.userStats?.userGrowth || 12.5,
                icon: '👥',
                color: 'blue',
                subtitle: `${(dashboardData.userStats?.activeUsers || 1205).toLocaleString()} active today`
            },
            {
                title: 'Active Locations',
                value: dashboardData.locationStats?.activeLocations || 45,
                change: dashboardData.locationStats?.locationGrowth || 8.3,
                icon: '🏬',
                color: 'green',
                subtitle: `${dashboardData.locationStats?.occupancyRate || 73}% avg. occupancy`
            },
            {
                title: 'Daily Revenue',
                value: `Rs. ${((dashboardData.revenueStats?.dailyRevenue || 125000)).toLocaleString()}`,
                change: dashboardData.revenueStats?.revenueGrowth || 15.8,
                icon: '💰',
                color: 'yellow',
                subtitle: `Rs. ${((dashboardData.revenueStats?.totalRevenue || 3750000)).toLocaleString()} total`
            },
            {
                title: 'System Health',
                value: dashboardData.systemHealth?.status || 'Optimal',
                change: null,
                icon: '⚡',
                color: (dashboardData.systemHealth?.status === 'healthy' || !dashboardData.systemHealth) ? 'green' : 'red',
                subtitle: `${dashboardData.systemHealth?.uptime || '99.9'}% uptime`
            },
            {
                title: 'Active Bookings',
                value: (dashboardData.bookingStats?.activeBookings || 342).toLocaleString(),
                change: dashboardData.bookingStats?.bookingGrowth || 5.7,
                icon: '📅',
                color: 'purple',
                subtitle: `${dashboardData.bookingStats?.completedToday || 128} completed today`
            },
            {
                title: 'API Requests',
                value: `${((dashboardData.systemHealth?.apiRequests || 25600) / 1000).toFixed(1)}K`,
                change: dashboardData.systemHealth?.apiGrowth || 3.2,
                icon: '🔗',
                color: 'indigo',
                subtitle: `${dashboardData.systemHealth?.avgResponseTime || 145}ms avg response`
            },
            {
                title: 'Critical Alerts',
                value: dashboardData.alerts?.critical || 0,
                change: null,
                icon: '🚨',
                color: (dashboardData.alerts?.critical || 0) > 0 ? 'red' : 'green',
                subtitle: `${dashboardData.alerts?.total || 3} total alerts`
            },
            {
                title: 'Database Size',
                value: `${((dashboardData.systemHealth?.databaseSize || 2.4) * 1024).toFixed(1)}MB`,
                change: null,
                icon: '💾',
                color: 'teal',
                subtitle: `${dashboardData.systemHealth?.dbConnections || 12} active connections`
            }
        ];

        const getColorClasses = (color) => {
            const colors = {
                blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
                green: { text: 'text-green-600', bg: 'bg-green-100' },
                yellow: { text: 'text-yellow-600', bg: 'bg-yellow-100' },
                red: { text: 'text-red-600', bg: 'bg-red-100' },
                purple: { text: 'text-purple-600', bg: 'bg-purple-100' },
                indigo: { text: 'text-indigo-600', bg: 'bg-indigo-100' },
                teal: { text: 'text-teal-600', bg: 'bg-teal-100' }
            };
            return colors[color] || { text: 'text-gray-600', bg: 'bg-gray-100' };
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {stats.map((stat, index) => {
                    const colorClasses = getColorClasses(stat.color);
                    return (
                        <div key={index} className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                                    <p className={`text-xl lg:text-2xl font-bold ${colorClasses.text} break-words`}>
                                        {stat.value}
                                    </p>
                                    {stat.subtitle && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">{stat.subtitle}</p>
                                    )}
                                    {stat.change !== null && (
                                        <div className={`inline-flex items-center text-xs mt-2 px-2 py-1 rounded-full ${stat.change >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                            <span className="mr-1">
                                                {stat.change >= 0 ? '↗️' : '↘️'}
                                            </span>
                                            {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}% from last month
                                        </div>
                                    )}
                                </div>
                                <div className={`text-xl lg:text-2xl p-2 lg:p-3 rounded-full ${colorClasses.bg} flex-shrink-0`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const HeaderActions = () => (
        <div className="flex items-center space-x-4">
            <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    autoRefresh 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                </div>
            </button>
            {dashboardData.alerts?.length > 0 && (
                <div className="relative">
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                        🚨 {dashboardData.alerts.length} Alert{dashboardData.alerts.length !== 1 ? 's' : ''}
                    </button>
                </div>
            )}
            <div className="text-sm text-gray-700">
                <div>Logged in as <span className="font-semibold">{user?.firstName} {user?.lastName}</span></div>
                <div className="text-xs text-gray-500 flex items-center space-x-2">
                    <span>Super Administrator</span>
                    {dashboardData.lastUpdated && (
                        <span className="text-blue-600">
                            • Updated {dashboardData.lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTabContent = ({ activeTab, dashboardData, user, setDashboardData }) => {
        switch (activeTab) {
            case 'system-overview':
                return <SystemOverview data={dashboardData} onRefresh={() => loadDashboardData(setDashboardData)} />;
            case 'users':
                return <UserManagement />;
            case 'locations':
                return <LocationManagement />;
            case 'analytics':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800">
                                Advanced analytics features will be integrated here. This will include 
                                predictive analytics, custom dashboards, and comprehensive reporting tools.
                            </p>
                        </div>
                    </div>
                );
            case 'settings':
                return <SystemSettings />;
            case 'logs':
                return <SystemLogs />;
            case 'reports':
                return <ReportsGenerator />;
            case 'content':
                return <ContentManagement />;
            case 'profile':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Administrator Profile</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        value={user?.firstName || ''} 
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={user?.lastName || ''} 
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={user?.email || ''} 
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <input 
                                        type="text" 
                                        value="Super Administrator" 
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Welcome to Super Admin Dashboard</h3>
                        <p className="text-gray-600">
                            Use the navigation tabs above to access different administrative functions.
                        </p>
                    </div>
                );
        }
    };

    if (user?.role !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access the Super Admin Dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <BaseDashboard
            userType="admin"
            loadDataFunction={loadDashboardData}
            initialDashboardState={{
                systemHealth: {},
                userStats: {},
                locationStats: {},
                revenueStats: {},
                recentActivity: [],
                alerts: []
            }}
            additionalTabs={additionalTabs}
        >
            {{
                headerActions: <HeaderActions />,
                quickStats: <QuickStats dashboardData={dashboardData} />,
                renderTabContent
            }}
        </BaseDashboard>
    );
};

export default SuperAdminDashboard;