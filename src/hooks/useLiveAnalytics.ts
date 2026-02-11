import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export const useLiveAnalytics = () => {
  const { user } = useAuth();

  const {
    data: liveData = null,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['live-analytics'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        ...stats,
        timestamp: new Date().toISOString(),
        activeUsers: 12,
        pendingTasks: 5
      };
    },
    enabled: !!user,
    refetchInterval: 5000
  });

  return {
    liveData,
    isLoading,
    error,
    refetch
  };
};
