import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { softwareApi, requestApi } from '../services/api';
import { CreateLicenseRequestData } from '../types';
import { toast } from 'react-hot-toast';

// Query keys
interface SoftwareParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const softwareKeys = {
  all: ['software'] as const,
  lists: () => [...softwareKeys.all, 'list'] as const,
  list: (params: SoftwareParams | undefined) => [...softwareKeys.lists(), params] as const,
  details: () => [...softwareKeys.all, 'detail'] as const,
  detail: (id: string) => [...softwareKeys.details(), id] as const,
  categories: () => [...softwareKeys.all, 'categories'] as const,
};
    
// Get software list
export function useSoftware(params?: SoftwareParams) {
  return useQuery({
    queryKey: softwareKeys.list(params),
    queryFn: () => softwareApi.getAll(params),
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Get software by ID
export function useSoftwareById(id: string) {
  return useQuery({
    queryKey: softwareKeys.detail(id),
    queryFn: () => softwareApi.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Get software categories
export function useSoftwareCategories() {
  return useQuery({
    queryKey: softwareKeys.categories(),
    queryFn: () => softwareApi.getCategories(),
    staleTime: 10 * 60 * 1000, // Categories can be cached longer
  });
}

// Create license request
export function useCreateLicenseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLicenseRequestData) => requestApi.create(data),
    onSuccess: (data) => {
      // Invalidate all software-related queries
      queryClient.invalidateQueries({ queryKey: softwareKeys.all });
      // Show success message
      toast.success(
        data.status === 'APPROVED' 
          ? 'License granted immediately!' 
          : 'License request submitted successfully'
      );
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || 'Failed to submit request';
      toast.error(message);
    },
  });
}