import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SmartAlert {
  id: string;
  alert_type: string;
  priority: number;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

export const useSmartAlerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: alerts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['smart-alerts'],
    queryFn: async () => {
      return api.getAlerts({ status: 'active' });
    },
    enabled: !!user,
    refetchInterval: 15000
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return api.acknowledgeAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error: Error) => {
      toast.error(`Failed to acknowledge alert: ${error.message}`);
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return api.resolveAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve alert: ${error.message}`);
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: Partial<SmartAlert>) => {
      return api.createAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
      toast.success('Alert created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create alert: ${error.message}`);
    }
  });

  return {
    alerts,
    isLoading,
    error,
    refetch,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    resolveAlert: resolveAlertMutation.mutate,
    createAlert: createAlertMutation.mutate
  };
};
