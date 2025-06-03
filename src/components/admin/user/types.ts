import { User, License } from '../../../types';

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  managerId?: string;
  password?: string;
}

export type SortField = 'name' | 'email' | 'role' | 'manager' | 'licenses' | 'cost';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface FilterConfig {
  search: string;
  role: string;
}

export interface UserTableProps {
  users: User[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onNavigate: (userId: string) => void;
}

export interface UserFormProps {
  user?: User;
  managers: User[];
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface UserFiltersProps {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
}

export interface UserLicenseModalProps {
  user: User;
  licenses: License[];
  onClose: () => void;
  onAddLicense: (softwareId: string) => void;
  onRemoveLicense: (license: License) => void;
}

export interface AddLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLicense: (softwareId: string) => void;
  existingLicenses: License[];
  isSubmitting: boolean;
} 