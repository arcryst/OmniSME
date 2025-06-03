import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Plus, X } from 'lucide-react';
import { useSoftwareById, useSoftwareCategories } from '../../hooks/useSoftware';
import { useUpdateSoftware, useAddUserLicense, useRemoveUserLicense, useUsers } from '../../hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { User } from '../../types';

interface FormData {
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

export default function SoftwareDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: software, isLoading } = useSoftwareById(id || '');
  const { data: categories = [] } = useSoftwareCategories();
  const { data: users = [] } = useUsers();
  const updateSoftware = useUpdateSoftware();
  const addLicense = useAddUserLicense();
  const removeLicense = useRemoveUserLicense();
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: software?.name || '',
    description: software?.description || '',
    category: software?.category || '',
    vendor: software?.vendor || '',
    costPerLicense: software?.costPerLicense?.toString() || '',
    billingCycle: software?.billingCycle || 'MONTHLY',
    logoUrl: software?.logoUrl || '',
    websiteUrl: software?.websiteUrl || '',
    requiresApproval: software?.requiresApproval ?? true,
    autoProvision: software?.autoProvision ?? false,
    maxLicenses: software?.maxLicenses?.toString() || '',
  });

  // Update form when software data is loaded
  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      costPerLicense: formData.costPerLicense ? parseFloat(formData.costPerLicense) : undefined,
      maxLicenses: formData.maxLicenses ? parseInt(formData.maxLicenses) : undefined,
      description: formData.description || undefined,
      vendor: formData.vendor || undefined,
      logoUrl: formData.logoUrl || undefined,
      websiteUrl: formData.websiteUrl || undefined,
    };

    try {
      await updateSoftware.mutateAsync({
        id: id!,
        data: payload,
      });
      toast.success('Software updated successfully');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleAddLicense = async () => {
    if (!selectedUserId || !id) return;

    try {
      await addLicense.mutateAsync({
        userId: selectedUserId,
        softwareId: id,
      });
      setShowAddLicense(false);
      setSelectedUserId('');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleRemoveLicense = async (licenseId: string) => {
    if (!id) return;

    if (window.confirm('Are you sure you want to remove this license?')) {
      try {
        await removeLicense.mutateAsync({
          userId: '', // Not needed for removal
          licenseId,
          softwareId: id,
        });
      } catch (error) {
        // Error handled by mutation hook
      }
    }
  };

  const activeLicenseCount = software?._count?.licenses || 0;
  const maxLicenses = software?.maxLicenses;
  const availableLicenses = maxLicenses ? maxLicenses - activeLicenseCount : undefined;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!software) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Software not found</h2>
        <button
          onClick={() => navigate('/admin', { state: { activeTab: 'software' } })}
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Software Management
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin', { state: { activeTab: 'software' } })}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Software Management
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {software.logoUrl ? (
              <img
                src={software.logoUrl}
                alt={`${software.name} logo`}
                className="w-16 h-16 rounded-lg object-contain bg-white shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-indigo-600">
                  {software.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{software.name}</h1>
              <p className="text-sm text-gray-500">
                Added {formatDistanceToNow(new Date(software.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* License Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Active Licenses</p>
                <p className="text-2xl font-semibold text-gray-900">{activeLicenseCount}</p>
              </div>
              
              {maxLicenses && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Maximum Licenses</p>
                    <p className="text-2xl font-semibold text-gray-900">{maxLicenses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Licenses</p>
                    <p className={`text-2xl font-semibold ${availableLicenses === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {availableLicenses}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active Licenses */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Licenses</h3>
              <button
                onClick={() => setShowAddLicense(true)}
                disabled={maxLicenses !== undefined && availableLicenses === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {software.licenses && software.licenses.length > 0 ? (
              <div className="space-y-3">
                {software.licenses.map(license => (
                  <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {license.user?.firstName} {license.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {license.user?.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Assigned {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLicense(license.id)}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active licenses</p>
            )}
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Software Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    rows={3}
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
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={updateSoftware.isPending}
                >
                  <Save className="w-4 h-4" />
                  {updateSoftware.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add License Modal */}
      {showAddLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add License</h2>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a user...</option>
              {users
                .filter((user: User) => !software?.licenses?.some(license => 
                  license.userId === user.id && license.status === 'ACTIVE'
                ))
                .map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))
              }
            </select>
            <button
              onClick={handleAddLicense}
              disabled={!selectedUserId || addLicense.isPending}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {addLicense.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddLicense(false);
                setSelectedUserId('');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 