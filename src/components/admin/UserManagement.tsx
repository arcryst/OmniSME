import React, { useState, useMemo } from 'react';
import { Users, Edit2, Trash2, Shield, UserCheck, Plus, X, Search, ArrowUpDown, DollarSign } from 'lucide-react';
import { useUsers, useUpdateUser, useDeleteUser, useUserLicenses, useAddUserLicense, useRemoveUserLicense, useManagers } from '../../hooks/useAdmin';
import { useSoftware } from '../../hooks/useSoftware';
import { User, Software, License } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { calculateMonthlyLicenseCost } from '../../utils/license';
import { SortConfig, FilterConfig, SortField, UserFormData } from './user/types';
import UserTable from './user/UserTable';
import UserForm from './user/UserForm';
import UserFilters from './user/UserFilters';
import UserLicenseModal from './user/UserLicenseModal';
import { toast } from 'react-hot-toast';

export default function UserManagement() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    managerId: '',
    password: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({ search: '', role: '' });

  const { data: users, isLoading } = useUsers();
  const { data: managers } = useManagers();
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

  const handleSubmit = async (formData: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            managerId: formData.managerId || undefined,
            ...(formData.password && { password: formData.password }),
          },
        });
      }
      
      await refetchLicenses();
      setShowForm(false);
      setEditingUser(undefined);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(undefined);
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
      
      await refetchLicenses();
    } catch (error) {
      console.error('Failed to add license:', error);
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
      
      await refetchLicenses();
    } catch (error) {
      console.error('Failed to remove license:', error);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: User) => {
      const searchMatch = !filters.search || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      const roleMatch = !filters.role || user.role === filters.role;

      return searchMatch && roleMatch;
    });
  }, [users, filters]);

  const sortedUsers = useMemo(() => {
    const items = [...filteredUsers];
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
          const costA = a.licenses ? calculateMonthlyLicenseCost(a.licenses) : 0;
          const costB = b.licenses ? calculateMonthlyLicenseCost(b.licenses) : 0;
          comparison = costA - costB;
          break;
        }
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredUsers, sortConfig]);

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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <UserFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <UserTable
        users={sortedUsers}
        sortConfig={sortConfig}
        onSort={handleSort}
        onNavigate={(userId: string) => {
          navigate(`/admin/users/${userId}`);
        }}
      />

      {showForm && (
        <UserForm
          user={editingUser}
          managers={managers || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(undefined);
          }}
          isSubmitting={updateUser.isPending}
        />
      )}

      {selectedUser && (
        <UserLicenseModal
          user={selectedUser}
          licenses={selectedUser.licenses || []}
          onClose={() => setSelectedUser(undefined)}
          onAddLicense={handleAddLicense}
          onRemoveLicense={handleRemoveLicense}
        />
      )}
    </div>
  );
} 