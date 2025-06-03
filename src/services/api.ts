import axios from 'axios';
import { PaginatedResponse, Software, LicenseRequest, CreateLicenseRequestData, License, User, RegisterData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    // Store token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (registerData: RegisterData): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post('/auth/register', registerData);
    // Store token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },
};

// Software API
export const softwareApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<Software>> => {
    const { data } = await apiClient.get('/software', { params });
    return data;
  },

  getById: async (id: string): Promise<Software> => {
    const { data } = await apiClient.get(`/software/${id}`);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get('/software/meta/categories');
    return data;
  },
};

// License Request API
export const requestApi = {
  create: async (data: CreateLicenseRequestData): Promise<LicenseRequest> => {
    const response = await apiClient.post('/requests', data);
    return response.data;
  },

  getMyRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LicenseRequest>> => {
    const { data } = await apiClient.get('/requests/my-requests', { params });
    return data;
  },

  cancel: async (id: string): Promise<LicenseRequest> => {
    const { data } = await apiClient.put(`/requests/${id}/cancel`);
    return data.request;
  },
};

// License API
export const licenseApi = {
  getMyLicenses: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<License>> => {
    const { data } = await apiClient.get('/licenses/my-licenses', { params });
    return data;
  },

  returnLicense: async (id: string): Promise<License> => {
    const { data } = await apiClient.put(`/licenses/${id}/return`);
    return data.license;
  },
};

// Admin API
export const adminApi = {
  getPendingApprovals: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LicenseRequest>> => {
    const { data } = await apiClient.get('/requests/pending-approvals', { params });
    return data;
  },

  getLicenseStats: async () => {
    const { data } = await apiClient.get('/licenses/stats');
    return data;
  },

  approveRequest: async (requestId: string, comments?: string) => {
    const { data } = await apiClient.put(`/requests/${requestId}/approve`, { comments });
    return data;
  },

  rejectRequest: async (requestId: string, comments: string) => {
    const { data } = await apiClient.put(`/requests/${requestId}/reject`, { comments });
    return data;
  },

  createSoftware: async (softwareData: Omit<Software, 'id' | 'userLicense' | 'hasPendingRequest' | '_count'>) => {
    const { data } = await apiClient.post('/software', softwareData);
    return data;
  },

  updateSoftware: async (id: string, softwareData: Partial<Software>) => {
    const { data } = await apiClient.put(`/software/${id}`, softwareData);
    return data;
  },

  deleteSoftware: async (id: string) => {
    const { data } = await apiClient.delete(`/software/${id}`);
    return data;
  },

  // User Management
  getUsers: async () => {
    const { data } = await apiClient.get('/users');
    return data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  // User License Management
  getUserLicenses: async (userId: string): Promise<License[]> => {
    const { data } = await apiClient.get(`/users/${userId}/licenses`);
    return data;
  },

  addUserLicense: async (userId: string, softwareId: string) => {
    const { data } = await apiClient.post(`/users/${userId}/licenses`, { softwareId });
    return data;
  },

  removeUserLicense: async (userId: string, licenseId: string) => {
    const { data } = await apiClient.delete(`/users/${userId}/licenses/${licenseId}`);
    return data;
  },
};  