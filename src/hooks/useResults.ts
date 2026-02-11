import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Result {
  id: string;
  order_id: string;
  result_type: string;
  status: string;
  values?: any;
  notes?: string;
  created_at: string;
}

export const useResults = (orderId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: results = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['results', orderId],
    queryFn: async () => {
      return api.getLabTests({ order_id: orderId });
    },
    enabled: !!user
  });

  const createResultMutation = useMutation({
    mutationFn: async (data: Partial<Result>) => {
      return api.updateLabTestResult(data.id || '', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Result recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record result: ${error.message}`);
    }
  });

  return {
    results,
    isLoading,
    error,
    refetch,
    createResult: createResultMutation.mutate,
    isCreating: createResultMutation.isPending
  };
};
