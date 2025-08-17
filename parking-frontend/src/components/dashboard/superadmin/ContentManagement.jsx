import React, { useState } from 'react';

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'System Maintenance Scheduled',
            content: 'We will be performing routine maintenance on our systems this weekend from 2 AM to 6 AM.',
            type: 'maintenance',
            isActive: true,
            createdAt: new Date('2025-01-15').toISOString()
        }
    ]);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        type: 'general'
    });

    const handleAddAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return;

        const announcement = {
            id: Date.now(),
            ...newAnnouncement,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        setAnnouncements(prev => [announcement, ...prev]);
        setNewAnnouncement({ title: '', content: '', type: 'general' });
    };

    const toggleAnnouncementStatus = (id) => {
        setAnnouncements(prev =>
            prev.map(announcement =>
                announcement.id === id
                    ? { ...announcement, isActive: !announcement.isActive }
                    : announcement
            )
        );
    };

    const deleteAnnouncement = (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
        }
    };

    const getAnnouncementTypeColor = (type) => {
        switch (type) {
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            case 'update':
                return 'bg-blue-100 text-blue-800';
            case 'promotion':
                return 'bg-green-100 text-green-800';
            case 'warning':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const AnnouncementsTab = () => (
        <div className="space-y-6">
            {/* Add New Announcement */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📢 Create New Announcement</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Enter announcement title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={newAnnouncement.type}
                                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            >
                                <option value="general">General</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="update">System Update</option>
                                <option value="promotion">Promotion</option>
                                <option value="warning">Warning</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <textarea
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter announcement content..."
                        />
                    </div>
                    <button
                        onClick={handleAddAnnouncement}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Create Announcement
                    </button>
                </div>
            </div>

            {/* Existing Announcements */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Announcements</h3>
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <h4 className="text-lg font-semibold text-gray-800">{announcement.title}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAnnouncementTypeColor(announcement.type)}`}>
                                        {announcement.type}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        announcement.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {announcement.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleAnnouncementStatus(announcement.id)}
                                        className={`px-3 py-1 text-xs rounded ${
                                            announcement.isActive
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                    >
                                        {announcement.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => deleteAnnouncement(announcement.id)}
                                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-3">{announcement.content}</p>
                            <p className="text-xs text-gray-500">
                                Created: {new Date(announcement.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                    
                    {announcements.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📢</div>
                            <p>No announcements yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const PoliciesTab = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Policy Management</h3>
                <p className="text-blue-700 mb-4">
                    Manage platform policies, terms of service, and privacy policies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Terms of Service</h4>
                        <p className="text-sm text-gray-600 mb-3">Last updated: January 1, 2025</p>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Edit Terms
                        </button>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Privacy Policy</h4>
                        <p className="text-sm text-gray-600 mb-3">Last updated: January 1, 2025</p>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Edit Policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const HelpTab = () => (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">❓ Help Documentation</h3>
                <p className="text-green-700 mb-4">
                    Manage help articles, FAQs, and user documentation.
                </p>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">User Guide</h4>
                        <p className="text-sm text-gray-600 mb-3">How to use the parking booking system</p>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Edit Guide
                        </button>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">FAQ Section</h4>
                        <p className="text-sm text-gray-600 mb-3">Frequently asked questions and answers</p>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Manage FAQs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'announcements', name: 'Announcements', icon: '📢' },
        { id: 'policies', name: 'Policies', icon: '📋' },
        { id: 'help', name: 'Help Content', icon: '❓' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 Content Management</h2>
                
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'announcements' && <AnnouncementsTab />}
                    {activeTab === 'policies' && <PoliciesTab />}
                    {activeTab === 'help' && <HelpTab />}
                </div>
            </div>
        </div>
    );
};

export default ContentManagement;