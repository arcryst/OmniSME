import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Software, User } from '../types';

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
  users: () => [...adminKeys.all, 'users'] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  userLicenses: (userId: string) => [...adminKeys.user(userId), 'licenses'] as const,
  pendingApprovals: () => [...adminKeys.all, 'pending-approvals'] as const,
  pendingApproval: (params: PaginationParams) => [...adminKeys.pendingApprovals(), params] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
};

// Get users
export function useUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminApi.getUsers(),
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to update user';
      toast.error(message);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to delete user';
      toast.error(message);
    },
  });
}

// Get user licenses
export function useUserLicenses(userId: string) {
  return useQuery({
    queryKey: adminKeys.userLicenses(userId),
    queryFn: () => adminApi.getUserLicenses(userId),
    enabled: !!userId,
  });
}

// Add license to user
export function useAddUserLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, softwareId }: { userId: string; softwareId: string }) =>
      adminApi.addUserLicense(userId, softwareId),
    onSuccess: (_, { userId, softwareId }) => {
      // Invalidate specific software query to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ['software', 'detail', softwareId] });
      // Invalidate software list
      queryClient.invalidateQueries({ queryKey: ['software', 'list'] });
      // Invalidate user-specific queries
      queryClient.invalidateQueries({ queryKey: adminKeys.userLicenses(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success('License added successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to add license';
      toast.error(message);
    },
  });
}

// Remove license from user
export function useRemoveUserLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, licenseId, softwareId }: { userId: string; licenseId: string; softwareId: string }) =>
      adminApi.removeUserLicense(userId, licenseId),
    onSuccess: (_, { userId, softwareId }) => {
      // Invalidate specific software query to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ['software', 'detail', softwareId] });
      // Invalidate software list
      queryClient.invalidateQueries({ queryKey: ['software', 'list'] });
      // Invalidate user-specific queries
      queryClient.invalidateQueries({ queryKey: adminKeys.userLicenses(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success('License deactivated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || 'Failed to deactivate license';
      toast.error(message);
    },
  });
}

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
    mutationFn: (softwareData: Omit<Software, 'id' | 'userLicense' | 'hasPendingRequest' | '_count' | 'createdAt'>) => 
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Software, 'id' | 'userLicense' | 'hasPendingRequest' | '_count' | 'createdAt'>> }) =>
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