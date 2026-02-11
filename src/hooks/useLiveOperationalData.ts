import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export const useLiveOperationalData = () => {
  const { user } = useAuth();

  const {
    data: operationalData = null,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['live-operational'],
    queryFn: async () => {
      const [stats, alerts] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardAlerts()
      ]);
      
      return {
        ...stats,
        alerts,
        queueLength: 8,
        avgWaitTime: 15,
        timestamp: new Date().toISOString()
      };
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  return {
    operationalData,
    isLoading,
    error,
    refetch
  };
};
