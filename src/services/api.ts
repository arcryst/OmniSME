/// <reference types="vite/client" />

import axios from 'axios';
import { PaginatedResponse, Software, LicenseRequest, CreateLicenseRequestData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (!config.headers) {
    config.headers = {};
  }
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
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

// Software API
export const softwareApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<Software>> => {
    const { data } = await apiClient.get<PaginatedResponse<Software>>('/software', { params });
    return data;
  },

  getById: async (id: string): Promise<Software> => {
    const { data } = await apiClient.get<Software>(`/software/${id}`);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/software/meta/categories');
    return data;
  },
};

// License Request API
export const requestApi = {
  create: async (data: CreateLicenseRequestData): Promise<LicenseRequest> => {
    const { data: responseData } = await apiClient.post<LicenseRequest>('/requests', data);
    return responseData;
  },

  getMyRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LicenseRequest>> => {
    const { data } = await apiClient.get<PaginatedResponse<LicenseRequest>>('/requests/my-requests', { params });
    return data;
  },

  cancel: async (id: string): Promise<LicenseRequest> => {
    const { data } = await apiClient.put<{ request: LicenseRequest }>(`/requests/${id}/cancel`);
    return data.request;
  },
};

export default apiClient;   