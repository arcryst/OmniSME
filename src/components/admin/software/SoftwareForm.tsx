import React, { useState, useEffect } from 'react';
import { SoftwareFormProps, SoftwareFormData } from './types';

const defaultFormData: SoftwareFormData = {
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
};

export default function SoftwareForm({ software, categories, onSubmit, onCancel, isSubmitting }: SoftwareFormProps) {
  const [formData, setFormData] = useState<SoftwareFormData>(defaultFormData);

  useEffect(() => {
    if (software) {
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
    }
  }, [software]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <h3 className="text-md font-semibold text-gray-900 mb-4">
        {software ? 'Edit Software' : 'Add New Software'}
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
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : software
              ? 'Update Software'
              : 'Add Software'}
          </button>
        </div>
      </form>
    </div>
  );
} 