import React, { useState } from 'react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true,
        emailNotifications: true,
        smsNotifications: false,
        maxBookingDuration: 24,
        defaultCurrency: 'NPR'
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ System Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">General Settings</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                                    <p className="text-xs text-gray-500">Disable public access to the system</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Allow Registrations</label>
                                    <p className="text-xs text-gray-500">Enable new user registrations</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.allowRegistrations}
                                    onChange={(e) => handleSettingChange('allowRegistrations', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Booking Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxBookingDuration}
                                    onChange={(e) => handleSettingChange('maxBookingDuration', parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    min="1"
                                    max="168"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Currency
                                </label>
                                <select
                                    value={settings.defaultCurrency}
                                    onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="NPR">NPR (Nepalese Rupee)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Notification Settings</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                                    <p className="text-xs text-gray-500">Send booking confirmations via email</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                                    <p className="text-xs text-gray-500">Send booking confirmations via SMS</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.smsNotifications}
                                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Reset to Defaults
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Version</div>
                        <div className="text-lg font-semibold">1.0.0</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Environment</div>
                        <div className="text-lg font-semibold">Production</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Last Updated</div>
                        <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;