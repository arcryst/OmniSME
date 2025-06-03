import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { User } from '../types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  licenses: () => [...userKeys.all, 'licenses'] as const,
  userLicenses: (userId: string) => [...userKeys.licenses(), userId] as const,
};

// Get users list
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => adminApi.getUsers(),
  });
}

// Get user licenses
export function useUserLicenses(userId: string) {
  return useQuery({
    queryKey: userKeys.userLicenses(userId),
    queryFn: () => adminApi.getUserLicenses(userId),
    enabled: !!userId,
  });
}

// Add user license
export function useAddUserLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, softwareId }: { userId: string; softwareId: string }) =>
      adminApi.addUserLicense(userId, softwareId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.userLicenses(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      toast.success('License added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add license');
    },
  });
}

// Remove user license
export function useRemoveUserLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, licenseId }: { userId: string; licenseId: string }) =>
      adminApi.removeUserLicense(userId, licenseId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.userLicenses(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      toast.success('License removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove license');
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
} 