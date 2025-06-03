import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { licenseApi, requestApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

interface QueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

// Query keys
export const licenseKeys = {
  all: ['licenses'] as const,
  lists: () => [...licenseKeys.all, 'list'] as const,
  list: (params: QueryParams | undefined) => [...licenseKeys.lists(), params] as const,
};

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (params: QueryParams | undefined) => [...requestKeys.lists(), params] as const,
};

// Get user's licenses
export function useMyLicenses(params?: QueryParams) {
  return useQuery({
    queryKey: licenseKeys.list(params),
    queryFn: () => licenseApi.getMyLicenses(params),
  });
}

// Get user's requests
export function useMyRequests(params?: QueryParams) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: () => requestApi.getMyRequests(params),
  });
}

// Return a license
export function useReturnLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (licenseId: string) => licenseApi.returnLicense(licenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      toast.success('License returned successfully');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const message = error.response?.data?.error || 'Failed to return license';
      toast.error(message);
    },
  });
}

// Cancel a request
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => requestApi.cancel(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      toast.success('Request cancelled successfully');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const message = error.response?.data?.error || 'Failed to cancel request';
      toast.error(message);
    },
  });
}