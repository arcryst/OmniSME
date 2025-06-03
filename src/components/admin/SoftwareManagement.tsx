import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useSoftware, useSoftwareCategories } from '../../hooks/useSoftware';
import { useCreateSoftware, useUpdateSoftware, useDeleteSoftware } from '../../hooks/useAdmin';
import { Software } from '../../types';

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
}

export default function SoftwareManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
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
  });

  const { data, isLoading } = useSoftware({ limit: 100 });
  const { data: categories = [] } = useSoftwareCategories();
  const createSoftware = useCreateSoftware();
  const updateSoftware = useUpdateSoftware();
  const deleteSoftware = useDeleteSoftware();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      organizationId: JSON.parse(localStorage.getItem('user') || '{}').organizationId,
      costPerLicense: formData.costPerLicense ? parseFloat(formData.costPerLicense) : undefined,
      description: formData.description || undefined,
      vendor: formData.vendor || undefined,
      logoUrl: formData.logoUrl || undefined,
      websiteUrl: formData.websiteUrl || undefined,
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
    });
    setShowForm(false);
    setEditingSoftware(null);
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

  const software = data?.items || [];

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

      <div className="divide-y divide-gray-200">
        {software.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No software added yet.</p>
          </div>
        ) : (
          software.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={`${item.name} logo`}
                      className="w-10 h-10 rounded-lg object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.category} • {item.vendor || 'No vendor'} • 
                      {item.costPerLicense ? ` $${item.costPerLicense}/${(item.billingCycle || 'MONTHLY').toLowerCase()}` : ' Free'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {item._count?.licenses || 0} licenses
                  </span>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={deleteSoftware.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}