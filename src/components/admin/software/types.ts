import { Software } from '../../../types';

export interface SoftwareFormData {
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

export type SortField = 'name' | 'category' | 'vendor' | 'costPerLicense' | 'licenses' | 'maxLicenses' | 'availableLicenses';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface FilterConfig {
  search: string;
  category: string;
}

export interface SoftwareTableProps {
  software: Software[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onManageLicenses: (software: Software) => void;
  onDelete: (software: Software) => void;
}

export interface SoftwareFormProps {
  software?: Software;
  categories: string[];
  onSubmit: (data: SoftwareFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface SoftwareFiltersProps {
  filters: FilterConfig;
  categories: string[];
  onFilterChange: (filters: FilterConfig) => void;
} 