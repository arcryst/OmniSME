import React, { useState, useMemo } from 'react';
import { Plus, Package } from 'lucide-react';
import { useSoftware, useSoftwareCategories } from '../../hooks/useSoftware';
import { useCreateSoftware, useUpdateSoftware, useDeleteSoftware, useAddUserLicense, useRemoveUserLicense } from '../../hooks/useAdmin';
import { Software } from '../../types';
import SoftwareLicenseManagement from './SoftwareLicenseManagement';
import { softwareApi } from '../../services/api';
import { SortConfig, FilterConfig, SoftwareFormData } from './software/types';
import SoftwareTable from './software/SoftwareTable';
import SoftwareForm from './software/SoftwareForm';
import SoftwareFilters from './software/SoftwareFilters';

export default function SoftwareManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | undefined>(undefined);
  const [managingLicenses, setManagingLicenses] = useState<Software | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({
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

  const handleSubmit = async (formData: SoftwareFormData) => {
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
      setShowForm(false);
      setEditingSoftware(undefined);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDelete = async (software: Software) => {
    if (window.confirm(`Are you sure you want to delete ${software.name}? This action cannot be undone.`)) {
      await deleteSoftware.mutateAsync(software.id);
    }
  };

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedAndFilteredSoftware = useMemo(() => {
    if (!data?.items) return [];
    
    const items = [...data.items];

    // Apply filters
    const filtered = items.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory = filters.category === '' || item.category === filters.category;

      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      let aAvailable: number;
      let bAvailable: number;
      
      switch (sortConfig.field) {
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

      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [data?.items, sortConfig, filters]);

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
        <SoftwareForm
          software={editingSoftware}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSoftware(undefined);
          }}
          isSubmitting={createSoftware.isPending || updateSoftware.isPending}
        />
      )}

      <SoftwareFilters
        filters={filters}
        categories={categories}
        onFilterChange={setFilters}
      />

      <SoftwareTable
        software={sortedAndFilteredSoftware}
        sortConfig={sortConfig}
        onSort={handleSort}
        onManageLicenses={setManagingLicenses}
        onDelete={handleDelete}
      />

      {/* License Management Modal */}
      {managingLicenses && (
        <SoftwareLicenseManagement
          softwareId={managingLicenses.id}
          softwareName={managingLicenses.name}
          onClose={() => setManagingLicenses(undefined)}
          licenses={managingLicenses.licenses || []}
          onAddLicense={async (userId: string) => {
            try {
              await addLicense.mutateAsync({
                userId,
                softwareId: managingLicenses.id,
              });
              const updatedSoftware = await softwareApi.getById(managingLicenses.id);
              setManagingLicenses(updatedSoftware);
            } catch (error) {
              // Error handled by mutation hook
            }
          }}
          onRemoveLicense={async (licenseId: string) => {
            try {
              await removeLicense.mutateAsync({
                userId: '', // Not needed for removal
                licenseId,
                softwareId: managingLicenses.id,
              });
              const updatedSoftware = await softwareApi.getById(managingLicenses.id);
              setManagingLicenses(updatedSoftware);
            } catch (error) {
              // Error handled by mutation hook
            }
          }}
        />
      )}
    </div>
  );
}