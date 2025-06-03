import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Key, Shield, UserCheck, Package, DollarSign } from 'lucide-react';
import { useUsers, useUpdateUser, useUserLicenses, useRemoveUserLicense } from '../../hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { User, License } from '../../types';
import { calculateMonthlyLicenseCost } from '../../utils/license';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  managerId: string;
  password?: string;
}

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const { data: licenses } = useUserLicenses(id || '');
  const updateUser = useUpdateUser();
  const removeLicense = useRemoveUserLicense();

  const user = users?.find((u: User) => u.id === id);
  const managers = users?.filter((u: User) => u.role === 'MANAGER' && u.id !== id) || [];

  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'USER',
    managerId: user?.managerId || '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        managerId: user.managerId || '',
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      ...formData,
      managerId: formData.managerId || undefined,
      password: formData.password || undefined,
    };

    try {
      await updateUser.mutateAsync({
        id: id!,
        data: updateData,
      });
      toast.success('User updated successfully');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleRemoveLicense = async (licenseId: string, softwareId: string) => {
    if (!id) return;

    if (window.confirm('Are you sure you want to remove this license?')) {
      try {
        await removeLicense.mutateAsync({
          userId: id,
          licenseId,
          softwareId,
        });
      } catch (error) {
        // Error handled by mutation hook
      }
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">User not found</h2>
        <button
          onClick={() => navigate('/admin', { state: { activeTab: 'users' } })}
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Management
        </button>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'MANAGER':
        return <UserCheck className="w-5 h-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin', { state: { activeTab: 'users' } })}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Management
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              {getRoleIcon(user.role)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Added {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
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
                    Last Name <span className="text-red-500">*</span>
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
                    Email <span className="text-red-500">*</span>
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
                    Role <span className="text-red-500">*</span>
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
                    {managers.map((manager: User) => (
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
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={updateUser.isPending}
                >
                  <Save className="w-4 h-4" />
                  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* License Information */}
        <div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Active Licenses</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{licenses?.length || 0} total</span>
                  {licenses && licenses.length > 0 && (
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      {calculateMonthlyLicenseCost(licenses).toFixed(2)}/month
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {licenses?.map((license) => (
                <div key={license.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {license.software?.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs text-gray-400">
                          Assigned {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                        </div>
                        {license.software?.costPerLicense && (
                          <div className="text-xs text-gray-500">
                            <DollarSign className="w-3 h-3 inline-block" />
                            {license.software.costPerLicense}
                            {license.software.billingCycle === 'YEARLY' ? '/year' : 
                             license.software.billingCycle === 'ONE_TIME' ? ' one-time' : '/month'}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLicense(license.id, license.softwareId)}
                      disabled={removeLicense.isPending}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!licenses?.length && (
                <div className="p-6 text-center text-gray-500">
                  No active licenses
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 