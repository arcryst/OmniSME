import React, { useState, useMemo } from 'react';
import { Users, Edit2, Trash2, Shield, UserCheck, Plus, X, Search, ArrowUpDown, DollarSign } from 'lucide-react';
import { useUsers, useUpdateUser, useDeleteUser, useUserLicenses, useAddUserLicense, useRemoveUserLicense, adminKeys } from '../../hooks/useAdmin';
import { useSoftware } from '../../hooks/useSoftware';
import { User, Software, License } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { calculateMonthlyLicenseCost } from '../../utils/license';

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  managerId: string;
  password?: string;
}

type SortField = 'name' | 'email' | 'role' | 'manager' | 'licenses' | 'cost';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState('');
  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    managerId: '',
    password: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  const { data: users, isLoading } = useUsers();
  const { data: software } = useSoftware({ limit: 100 });
  const { data: userLicenses, refetch: refetchLicenses } = useUserLicenses(selectedUser?.id || '');
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const addLicense = useAddUserLicense();
  const removeLicense = useRemoveUserLicense();
  const queryClient = useQueryClient();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
      managerId: user.manager?.id || '',
      password: '',
    });
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      await deleteUser.mutateAsync(user.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      managerId: formData.managerId || undefined,
      ...(formData.password && { password: formData.password }),
    };

    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: updateData,
      });
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'USER',
        managerId: '',
        password: '',
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'USER',
      managerId: '',
      password: '',
    });
  };

  const handleViewLicenses = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddLicense = async (softwareId: string) => {
    if (!selectedUser) return;

    try {
      await addLicense.mutateAsync({
        userId: selectedUser.id,
        softwareId,
      });
      
      // Refetch licenses after adding
      await refetchLicenses();
      
      // Close modal
      setShowLicenseModal(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleRemoveLicense = async (license: License) => {
    if (!selectedUser) return;

    try {
      await removeLicense.mutateAsync({
        userId: selectedUser.id,
        licenseId: license.id,
        softwareId: license.softwareId,
      });
      
      // Refetch licenses after removing
      await refetchLicenses();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    
    const items = [...users];
    const { field, order } = sortConfig;

    return items.sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'manager': {
          const managerA = a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : '';
          const managerB = b.manager ? `${b.manager.firstName} ${b.manager.lastName}` : '';
          comparison = managerA.localeCompare(managerB);
          break;
        }
        case 'licenses':
          comparison = (a._count?.licenses || 0) - (b._count?.licenses || 0);
          break;
        case 'cost': {
          const costA = a.licenses && a.licenses.length > 0 ? calculateMonthlyLicenseCost(a.licenses) : 0;
          const costB = b.licenses && b.licenses.length > 0 ? calculateMonthlyLicenseCost(b.licenses) : 0;
          comparison = costA - costB;
          break;
        }
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [users, sortConfig]);

  const filteredUsers = useMemo(() => {
    if (!sortedUsers) return [];

    return sortedUsers.filter(user => {
      const matchesSearch = filters.search === '' || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = filters.role === '' || user.role === filters.role;

      return matchesSearch && matchesRole;
    });
  }, [sortedUsers, filters]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'MANAGER':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return null;
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className={`w-4 h-4 ${sortConfig.field === field ? 'text-indigo-600' : 'text-gray-400'}`} />
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <span className="text-sm text-gray-500">{users?.length || 0} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="w-48">
            <select
              value={filters.role}
              onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="USER">Users</option>
              <option value="MANAGER">Managers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="name" label="Name" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="email" label="Email" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="role" label="Role" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="manager" label="Manager" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="licenses" label="Licenses" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="cost" label="Monthly Cost" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                      {getRoleIcon(user.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'MANAGER'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user._count?.licenses || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                      {user.licenses && user.licenses.length > 0 ? calculateMonthlyLicenseCost(user.licenses).toFixed(2) : '0.00'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Edit User: {editingUser.firstName} {editingUser.lastName}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'USER' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No Manager</option>
                {users?.filter((u: User) => 
                  (u.role === 'ADMIN' || u.role === 'MANAGER') && 
                  u.id !== editingUser?.id
                ).map((manager: User) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Leave blank to keep current password"
                minLength={8}
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* License Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setSelectedUser(null)}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Licenses for {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add License
                </button>
              </div>

              {userLicenses?.length ? (
                <div className="divide-y divide-gray-200">
                  {userLicenses.map((license: License) => (
                    <div key={license.id} className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{license.software?.name}</h4>
                        <p className="text-sm text-gray-500">
                          Added {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveLicense(license)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No active licenses</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowLicenseModal(false)}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add License
                </h3>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {software?.items.map((item: Software) => {
                  const hasLicense = userLicenses?.some(l => l.softwareId === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!hasLicense && !addLicense.isPending) {
                          handleAddLicense(item.id);
                        }
                      }}
                      disabled={hasLicense || addLicense.isPending}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        hasLicense
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={`${item.name} logo`}
                            className="w-8 h-8 rounded object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      {hasLicense && (
                        <p className="mt-2 text-sm text-gray-500">Already has license</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 