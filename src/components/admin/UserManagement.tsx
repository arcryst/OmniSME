import React, { useState } from 'react';
import { Users, Edit2, Trash2, Shield, UserCheck, Plus, X } from 'lucide-react';
import { useUsers, useUpdateUser, useDeleteUser, useUserLicenses, useAddUserLicense, useRemoveUserLicense, adminKeys } from '../../hooks/useAdmin';
import { useSoftware } from '../../hooks/useSoftware';
import { User, Software, License } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  managerId: string;
  password?: string;
}

export default function UserManagement() {
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

    if (window.confirm('Are you sure you want to deactivate this license?')) {
      try {
        await removeLicense.mutateAsync({
          userId: selectedUser.id,
          licenseId: license.id,
        });
        
        // Refetch licenses after removal
        await refetchLicenses();
        // Also refetch users to update license count
        await queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      } catch (error) {
        // Error handled by mutation hook
      }
    }
  };

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

      <div className="divide-y divide-gray-200">
        {!users?.length ? (
          <div className="p-6 text-center text-gray-500">
            <p>No users found.</p>
          </div>
        ) : (
          users.map((user: User) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    {getRoleIcon(user.role)}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <p>{user.email}</p>
                    {user.manager && (
                      <p className="text-xs mt-0.5">
                        Reports to: {user.manager.firstName} {user.manager.lastName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                    <span>
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                    <button
                      onClick={() => handleViewLicenses(user)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {user._count?.licenses || 0} active licenses
                    </button>
                    {user._count?.managedUsers && user._count.managedUsers > 0 && (
                      <span>{user._count.managedUsers} direct reports</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={updateUser.isPending || deleteUser.isPending}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={updateUser.isPending || deleteUser.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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