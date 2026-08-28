'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProfileAction } from '../actions/update-profile.action';
import type { ProfileDetailsResponse, UpdateProfileInput } from '../types/profile.types';

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    success: boolean;
    data: ProfileDetailsResponse;
  }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        throw new Error('Failed to load profile');
      }
      return res.json();
    },
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const res = await updateProfileAction(input);
      if (!res.success) {
        throw new Error(res.error.message || 'Failed to update profile');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });

  return {
    profile: data?.data?.user ?? null,
    stats: data?.data?.stats ?? null,
    achievements: data?.data?.achievements ?? [],
    isLoading,
    isError,
    error,
    refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
