// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    organization?: Organization;
  }
  
  export interface Organization {
    id: string;
    name: string;
    domain: string | null;
  }
  
  // Software types
  export interface Software {
    id: string;
    name: string;
    description: string | null;
    category: string;
    vendor: string | null;
    costPerLicense: number | null;
    billingCycle: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
    logoUrl: string | null;
    websiteUrl: string | null;
    requiresApproval: boolean;
    autoProvision: boolean;
    createdAt: string;
    updatedAt: string;
    // Added by API
    userLicense?: License | null;
    hasPendingRequest?: boolean;
    _count?: {
      licenses: number;
      requests: number;
    };
  }
  
  export interface License {
    id: string;
    userId: string;
    softwareId: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';
    assignedAt: string;
    expiresAt: string | null;
    lastUsedAt: string | null;
    software?: Software;
  }
  
  export interface LicenseRequest {
    id: string;
    userId: string;
    softwareId: string;
    justification: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    software?: Software;
    user?: User;
    approvals?: Approval[];
  }
  
  export interface Approval {
    id: string;
    requestId: string;
    approverId: string;
    status: 'APPROVED' | 'REJECTED';
    comments: string | null;
    createdAt: string;
    approver?: User;
  }
  
  // API types
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ApiError {
    error: string;
    message?: string;
  }
  
  // Request types
  export interface CreateLicenseRequestData {
    softwareId: string;
    justification: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }