import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    emergencyContact: {
      name: '',
      phoneNumber: '',
      relationship: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    currency: 'NPR',
    theme: 'light'
  });
  const [twoFactorAuth, setTwoFactorAuth] = useState({
    enabled: false,
    qrCode: '',
    secret: '',
    backupCodes: [],
    verificationToken: ''
  });
  const [show2FAModal, setShow2FAModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        emergencyContact: user.emergencyContact || {
          name: '',
          phoneNumber: '',
          relationship: ''
        }
      });
    }
  }, [user]);

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updatePreferences(preferences);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmation) {
      try {
        await userService.deleteAccount();
        toast.success('Account deleted successfully');
        // Redirect to home page or login
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await userService.enableTwoFactor();
      
      if (response.success) {
        setTwoFactorAuth({
          enabled: false,
          qrCode: response.qrCode,
          secret: response.secret,
          backupCodes: response.backupCodes,
          verificationToken: ''
        });
        setShow2FAModal(true);
      } else {
        toast.error('Failed to enable 2FA');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      const response = await userService.verifyTwoFactor(twoFactorAuth.verificationToken);
      
      if (response.success) {
        toast.success('Two-factor authentication enabled successfully!');
        setTwoFactorAuth(prev => ({ ...prev, enabled: true }));
        setShow2FAModal(false);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = window.prompt('Please enter your password to disable 2FA:');
    if (!password) return;

    try {
      setLoading(true);
      const response = await userService.disableTwoFactor(password);
      
      if (response.success) {
        toast.success('Two-factor authentication disabled successfully!');
        setTwoFactorAuth(prev => ({ ...prev, enabled: false }));
      } else {
        toast.error('Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await userService.exportUserData();
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully!');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '' },
    { id: 'security', name: 'Security', icon: '' },
    { id: 'preferences', name: 'Preferences', icon: '' },
    { id: 'privacy', name: 'Privacy', icon: '' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            {activeSection === 'personal' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, name: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyContact.phoneNumber}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, phoneNumber: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship
                        </label>
                        <select
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                
                {/* Change Password */}
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 mb-3">Change Password</h4>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        minLength="8"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${twoFactorAuth.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-sm ${twoFactorAuth.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                        {twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {twoFactorAuth.enabled ? (
                      <button 
                        onClick={handleDisable2FA}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button 
                        onClick={handleEnable2FA}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>
                </div>

                {/* Login Sessions */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Current Session</p>
                        <p className="text-sm text-gray-600">Chrome on Windows • Kathmandu, Nepal</p>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  {/* Notifications */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive booking confirmations and updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Currency Settings */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Currency</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          value={preferences.currency}
                          onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="NPR">NPR (Nepali Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Data</h3>
                
                {/* Data Export */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Export Your Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of your account data including bookings, payments, and profile information.
                  </p>
                  <button 
                    onClick={handleExportData}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {loading ? 'Exporting...' : 'Request Data Export'}
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-2 text-red-600">Delete Account</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Enable Two-Factor Authentication</h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">Step 1: Scan QR Code</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  {twoFactorAuth.qrCode && (
                    <div className="flex justify-center mb-4">
                      <img src={twoFactorAuth.qrCode} alt="2FA QR Code" className="border rounded" />
                    </div>
                  )}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Manual entry key:</p>
                    <code className="text-sm font-mono">{twoFactorAuth.secret}</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Step 2: Enter Verification Code</h4>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactorAuth.verificationToken}
                    onChange={(e) => setTwoFactorAuth(prev => ({ ...prev, verificationToken: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg"
                    maxLength="6"
                  />
                </div>

                {twoFactorAuth.backupCodes && twoFactorAuth.backupCodes.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Backup Codes</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {twoFactorAuth.backupCodes.map((code, index) => (
                        <code key={index} className="bg-white px-2 py-1 rounded text-sm font-mono border">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify2FA}
                    disabled={loading || twoFactorAuth.verificationToken.length !== 6}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;