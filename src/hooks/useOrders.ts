import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Order {
  id: string;
  patient_id: string;
  order_type: string;
  status: string;
  priority: string;
  notes?: string;
  created_at: string;
}

export const useOrders = (patientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', patientId],
    queryFn: async () => {
      return api.getLabOrders({ patient_id: patientId });
    },
    enabled: !!user
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: Partial<Order>) => {
      return api.createLabOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  return {
    orders,
    isLoading,
    error,
    refetch,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending
  };
};
