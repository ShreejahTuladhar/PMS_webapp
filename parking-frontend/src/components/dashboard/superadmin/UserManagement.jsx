import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [filters, setFilters] = useState({
        role: 'all',
        isActive: 'all',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pages: 1,
        total: 0,
        limit: 20
    });
    const [editingUser, setEditingUser] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...filters,
                page: pagination.current,
                limit: pagination.limit
            });

            const response = await api.get(`/admin/users?${queryParams}`);
            setUsers(response.data.data);
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination
            }));
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.current, pagination.limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user._id));
        }
    };

    const handleUpdateUser = async (userId, updateData) => {
        try {
            await api.put(`/api/admin/users/${userId}`, updateData);
            await fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.length === 0) return;

        const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
        if (!window.confirm(confirmMessage)) return;

        try {
            const updateData = {};
            switch (action) {
                case 'activate':
                    updateData.isActive = true;
                    break;
                case 'deactivate':
                    updateData.isActive = false;
                    break;
                case 'make_admin':
                    updateData.role = 'parking_admin';
                    break;
                case 'make_customer':
                    updateData.role = 'customer';
                    break;
                default:
                    return;
            }

            await Promise.all(
                selectedUsers.map(userId => 
                    api.put(`/api/admin/users/${userId}`, updateData)
                )
            );

            await fetchUsers();
            setSelectedUsers([]);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Failed to perform bulk action:', error);
            alert('Failed to perform bulk action. Please try again.');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'super_admin':
                return 'bg-red-100 text-red-800';
            case 'parking_admin':
                return 'bg-blue-100 text-blue-800';
            case 'customer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const UserEditModal = ({ user, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            role: user.role,
            isActive: user.isActive,
            assignedLocations: user.assignedLocations || []
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(user._id, formData);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Edit User: {user.firstName} {user.lastName}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="customer">Customer</option>
                                <option value="parking_admin">Parking Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Active Account</span>
                            </label>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-gray-800">👥 User Management</h2>
                
                {selectedUsers.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {selectedUsers.length} selected
                        </span>
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Bulk Actions
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && selectedUsers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-3">
                        Bulk Actions for {selectedUsers.length} user(s)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                            Activate
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                            Deactivate
                        </button>
                        <button
                            onClick={() => handleBulkAction('make_admin')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Make Admin
                        </button>
                        <button
                            onClick={() => handleBulkAction('make_customer')}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                            Make Customer
                        </button>
                        <button
                            onClick={() => setShowBulkActions(false)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search by name, email, username..."
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="parking_admin">Parking Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="firstName-asc">Name A-Z</option>
                            <option value="firstName-desc">Name Z-A</option>
                            <option value="lastLogin-desc">Last Login</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => handleUserSelect(user._id)}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                <div className="text-xs text-gray-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.lastLogin 
                                            ? new Date(user.lastLogin).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleUpdateUser(user._id, { isActive: !user.isActive })}
                                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                            disabled={pagination.current === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                            disabled={pagination.current === pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.current * pagination.limit, pagination.total)}
                                </span>{' '}
                                of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                                    disabled={pagination.current === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                                    disabled={pagination.current === pagination.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                />
            )}
        </div>
    );
};

export default UserManagement;