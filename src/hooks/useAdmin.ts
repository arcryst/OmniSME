import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Software } from '../types';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface ErrorResponse {
  error: string;
}

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  pendingApprovals: () => [...adminKeys.all, 'pending-approvals'] as const,
  pendingApproval: (params: PaginationParams) => [...adminKeys.pendingApprovals(), params] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
};

// Get pending approvals
export function usePendingApprovals(params?: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.pendingApproval(params || {}),
    queryFn: () => adminApi.getPendingApprovals(params),
  });
}

// Get license statistics
export function useLicenseStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminApi.getLicenseStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Approve request
export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) =>
      adminApi.approveRequest(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Request approved successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to approve request';
      toast.error(message);
    },
  });
}

// Reject request
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments: string }) =>
      adminApi.rejectRequest(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingApprovals() });
      toast.success('Request rejected');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to reject request';
      toast.error(message);
    },
  });
}

// Create software
export function useCreateSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (softwareData: Omit<Software, 'id' | 'userLicense' | 'hasPendingRequest' | '_count'>) => 
      adminApi.createSoftware(softwareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Software created successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to create software';
      toast.error(message);
    },
  });
}

// Update software
export function useUpdateSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Software> }) =>
      adminApi.updateSoftware(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Software updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to update software';
      toast.error(message);
    },
  });
}

// Delete software
export function useDeleteSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteSoftware(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Software deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to delete software';
      toast.error(message);
    },
  });
}