// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
}

export interface Organization {
    id: string;
    name: string;
    domain: string;
}

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
    user: User;
    organization?: Organization;
}

// API Response types
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

// Software types
export interface Software {
    id: string;
    name: string;
    description?: string;
    category: string;
    vendor?: string;
    costPerLicense?: number;
    billingCycle?: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
    logoUrl?: string;
    websiteUrl?: string;
    requiresApproval: boolean;
    autoProvision: boolean;
    organizationId: string;
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
    organizationId: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';
    assignedAt: string;
    expiresAt?: string;
    lastUsedAt?: string;
    notes?: string;
    software?: Software;
}

export interface LicenseRequest {
    id: string;
    userId: string;
    softwareId: string;
    organizationId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    justification: string;
    createdAt: string;
    software?: Software;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        manager?: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
    approvals?: Approval[];
}

export interface Approval {
    id: string;
    requestId: string;
    approverId: string;
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
    createdAt: string;
    approver?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateLicenseRequestData {
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

// API types
export interface ApiError {
    error: string;
    message?: string;
}