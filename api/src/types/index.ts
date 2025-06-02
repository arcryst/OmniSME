import { User, Organization, Software, License, Request } from '@prisma/client';

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// User types
export type SafeUser = Omit<User, 'passwordHash'>;

export interface UserWithOrganization extends SafeUser {
  organization: Organization;
}

export interface UserWithLicenses extends SafeUser {
  licenses: (License & { software: Software })[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  organizationName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: SafeUser;
  organization?: Organization;
}

// Request types
export interface CreateSoftwareRequest {
  name: string;
  description?: string;
  category: string;
  vendor?: string;
  costPerLicense?: number;
  billingCycle?: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  logoUrl?: string;
  websiteUrl?: string;
  requiresApproval?: boolean;
  autoProvision?: boolean;
}

export interface CreateLicenseRequest {
  softwareId: string;
  justification: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}