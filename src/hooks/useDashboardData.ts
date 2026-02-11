import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      return api.getDashboardStats();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function useRecentActivities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      return api.getDashboardActivities();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });
}

export function useAIInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      // AI insights not implemented yet - return empty array
      return [];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useActiveAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      return api.getDashboardAlerts();
    },
    enabled: !!user,
    refetchInterval: 15000,
  });
}

export function useTakeActionOnInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      // AI insights not implemented yet
      return { id: insightId, action_taken: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    }
  });
}
