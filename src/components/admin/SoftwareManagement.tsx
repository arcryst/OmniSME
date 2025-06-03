import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, Users, ArrowUpDown, Search, Filter } from 'lucide-react';
import { useSoftware, useSoftwareCategories } from '../../hooks/useSoftware';
import { useCreateSoftware, useUpdateSoftware, useDeleteSoftware, useAddUserLicense, useRemoveUserLicense } from '../../hooks/useAdmin';
import { Software } from '../../types';
import SoftwareLicenseManagement from './SoftwareLicenseManagement';
import { softwareApi } from '../../services/api';
import { Link } from 'react-router-dom';

interface SoftwareFormData {
  name: string;
  description: string;
  category: string;
  vendor: string;
  costPerLicense: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  logoUrl: string;
  websiteUrl: string;
  requiresApproval: boolean;
  autoProvision: boolean;
  maxLicenses: string;
}

type SortField = 'name' | 'category' | 'vendor' | 'costPerLicense' | 'licenses' | 'maxLicenses' | 'availableLicenses';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function SoftwareManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [managingLicenses, setManagingLicenses] = useState<Software | null>(null);
  const [formData, setFormData] = useState<SoftwareFormData>({
    name: '',
    description: '',
    category: '',
    vendor: '',
    costPerLicense: '',
    billingCycle: 'MONTHLY',
    logoUrl: '',
    websiteUrl: '',
    requiresApproval: true,
    autoProvision: false,
    maxLicenses: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });

  const { data, isLoading } = useSoftware({ limit: 100 });
  const { data: categories = [] } = useSoftwareCategories();
  const createSoftware = useCreateSoftware();
  const updateSoftware = useUpdateSoftware();
  const deleteSoftware = useDeleteSoftware();
  const addLicense = useAddUserLicense();
  const removeLicense = useRemoveUserLicense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      vendor: formData.vendor || undefined,
      costPerLicense: formData.costPerLicense ? parseFloat(formData.costPerLicense) : undefined,
      billingCycle: formData.billingCycle,
      logoUrl: formData.logoUrl || undefined,
      websiteUrl: formData.websiteUrl || undefined,
      requiresApproval: formData.requiresApproval,
      autoProvision: formData.autoProvision,
      maxLicenses: formData.maxLicenses ? parseInt(formData.maxLicenses) : undefined,
      organizationId: JSON.parse(localStorage.getItem('user') || '{}').organizationId,
    };

    try {
      if (editingSoftware) {
        await updateSoftware.mutateAsync({
          id: editingSoftware.id,
          data: payload,
        });
      } else {
        await createSoftware.mutateAsync(payload);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        vendor: '',
        costPerLicense: '',
        billingCycle: 'MONTHLY',
        logoUrl: '',
        websiteUrl: '',
        requiresApproval: true,
        autoProvision: false,
        maxLicenses: '',
      });
      setShowForm(false);
      setEditingSoftware(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleEdit = (software: Software) => {
    setEditingSoftware(software);
    setFormData({
      name: software.name,
      description: software.description || '',
      category: software.category,
      vendor: software.vendor || '',
      costPerLicense: software.costPerLicense?.toString() || '',
      billingCycle: software.billingCycle || 'MONTHLY',
      logoUrl: software.logoUrl || '',
      websiteUrl: software.websiteUrl || '',
      requiresApproval: software.requiresApproval,
      autoProvision: software.autoProvision,
      maxLicenses: software.maxLicenses?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (software: Software) => {
    if (window.confirm(`Are you sure you want to delete ${software.name}? This action cannot be undone.`)) {
      await deleteSoftware.mutateAsync(software.id);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      vendor: '',
      costPerLicense: '',
      billingCycle: 'MONTHLY',
      logoUrl: '',
      websiteUrl: '',
      requiresApproval: true,
      autoProvision: false,
      maxLicenses: '',
    });
    setShowForm(false);
    setEditingSoftware(null);
  };

  const handleManageLicenses = async (software: Software) => {
    setManagingLicenses(software);
  };

  const handleAddLicense = async (userId: string) => {
    if (!managingLicenses) return;
    
    try {
      await addLicense.mutateAsync({
        userId,
        softwareId: managingLicenses.id,
      });
      
      // Refetch the software details to update the licenses list
      const updatedSoftware = await softwareApi.getById(managingLicenses.id);
      setManagingLicenses(updatedSoftware);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleRemoveLicense = async (licenseId: string) => {
    if (!managingLicenses) return;
    
    try {
      await removeLicense.mutateAsync({
        userId: '', // Not needed for removal
        licenseId,
        softwareId: managingLicenses.id,
      });
      
      // Refetch the software details to update the licenses list
      const updatedSoftware = await softwareApi.getById(managingLicenses.id);
      setManagingLicenses(updatedSoftware);
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

  const sortedSoftware = useMemo(() => {
    if (!data?.items) return [];
    
    const items = [...data.items];
    const { field, order } = sortConfig;

    return items.sort((a, b) => {
      let comparison = 0;
      let aAvailable: number;
      let bAvailable: number;
      
      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'vendor':
          comparison = (a.vendor || '').localeCompare(b.vendor || '');
          break;
        case 'costPerLicense':
          comparison = (a.costPerLicense || 0) - (b.costPerLicense || 0);
          break;
        case 'licenses':
          comparison = (a._count?.licenses || 0) - (b._count?.licenses || 0);
          break;
        case 'maxLicenses':
          comparison = (a.maxLicenses || Infinity) - (b.maxLicenses || Infinity);
          break;
        case 'availableLicenses':
          aAvailable = a.maxLicenses ? a.maxLicenses - (a._count?.licenses || 0) : Infinity;
          bAvailable = b.maxLicenses ? b.maxLicenses - (b._count?.licenses || 0) : Infinity;
          comparison = aAvailable - bAvailable;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [data?.items, sortConfig]);

  const filteredSoftware = useMemo(() => {
    if (!sortedSoftware) return [];

    return sortedSoftware.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory = filters.category === '' || item.category === filters.category;

      return matchesSearch && matchesCategory;
    });
  }, [sortedSoftware, filters]);

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
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Software Management</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Software
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            {editingSoftware ? 'Edit Software' : 'Add New Software'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                list="categories"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Productivity, Development, Communication"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost per License
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerLicense}
                onChange={(e) => setFormData({ ...formData, costPerLicense: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'MONTHLY' | 'YEARLY' | 'ONE_TIME' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONE_TIME">One-time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Requires Approval</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoProvision}
                  onChange={(e) => setFormData({ ...formData, autoProvision: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Auto-provision</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Licenses
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxLicenses}
                onChange={(e) => setFormData({ ...formData, maxLicenses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Leave blank for unlimited"
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
                disabled={createSoftware.isPending || updateSoftware.isPending}
              >
                {createSoftware.isPending || updateSoftware.isPending
                  ? 'Saving...'
                  : editingSoftware
                  ? 'Update Software'
                  : 'Add Software'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search software..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="w-48">
            <select
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
                <SortButton field="name" label="Software" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="category" label="Category" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="vendor" label="Vendor" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="costPerLicense" label="Cost" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="licenses" label="Active Licenses" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="maxLicenses" label="Max Licenses" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="availableLicenses" label="Available" />
              </th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSoftware.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No software found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredSoftware.map((item) => {
                const activeLicenses = item._count?.licenses || 0;
                const maxLicenses = item.maxLicenses;
                const availableLicenses = maxLicenses ? maxLicenses - activeLicenses : undefined;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={`${item.name} logo`}
                            className="w-8 h-8 rounded-lg object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <Link 
                            to={`/admin/software/${item.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {item.name}
                          </Link>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.vendor || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.costPerLicense ? (
                        <span>
                          ${item.costPerLicense}
                          <span className="text-xs text-gray-400">
                            /{item.billingCycle?.toLowerCase() || 'month'}
                          </span>
                        </span>
                      ) : (
                        'Free'
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {activeLicenses}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {maxLicenses || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      {availableLicenses !== undefined ? (
                        <span className={availableLicenses === 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {availableLicenses}
                        </span>
                      ) : (
                        <span className="text-gray-500">∞</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleManageLicenses(item)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Manage</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={deleteSoftware.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* License Management Modal */}
      {managingLicenses && (
        <SoftwareLicenseManagement
          softwareId={managingLicenses.id}
          softwareName={managingLicenses.name}
          onClose={() => setManagingLicenses(null)}
          licenses={managingLicenses.licenses || []}
          onAddLicense={handleAddLicense}
          onRemoveLicense={handleRemoveLicense}
        />
      )}
    </div>
  );
}