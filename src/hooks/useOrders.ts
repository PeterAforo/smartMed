import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Order, NumberGenerator, DataValidator } from '@/lib/dataContracts';
import { HealthcareWorkflows } from '@/lib/eventBus';
import { useEffect } from 'react';

export interface CreateOrderData {
  encounter_id: string;
  patient_id: string;
  order_type: 'lab' | 'imaging' | 'pharmacy' | 'service' | 'procedure';
  order_code: string;
  order_name: string;
  priority?: 'stat' | 'urgent' | 'routine';
  scheduled_at?: string;
  instructions?: string;
  clinical_notes?: string;
  charges?: Array<{
    item_code: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata?: Record<string, any>;
}

export interface UpdateOrderData {
  status?: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at?: string;
  completed_at?: string;
  instructions?: string;
  clinical_notes?: string;
  charges?: Array<{
    item_code: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata?: Record<string, any>;
}

export const useOrders = (filters?: {
  encounterId?: string;
  patientId?: string;
  orderType?: string;
  status?: string;
}) => {
  const { user, tenant: currentTenant, currentBranch } = useAuth();
  const queryClient = useQueryClient();

  // Fetch orders
  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', filters, currentTenant?.id, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number),
          encounters!inner(id, encounter_number, encounter_type),
          profiles!orders_ordered_by_fkey(id, first_name, last_name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('ordered_at', { ascending: false });

      if (filters?.encounterId) {
        query = query.eq('encounter_id', filters.encounterId);
      }

      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters?.orderType) {
        query = query.eq('order_type', filters.orderType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentTenant?.id && !!user
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!currentTenant?.id || !currentBranch?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const errors = DataValidator.validateOrder({
        ...data,
        ordered_by: user.id,
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id
      });

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }

      const orderNumber = NumberGenerator.generateOrderNumber(data.order_type, currentBranch.code);

      const order = {
        ...data,
        order_number: orderNumber,
        priority: data.priority || 'routine',
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id,
        ordered_by: user.id,
        charges: data.charges || []
      };

      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) throw error;

      // Emit event for order creation
      await HealthcareWorkflows.placeOrder(
        newOrder.id,
        data.order_type,
        data.patient_id,
        data.encounter_id,
        currentTenant.id,
        currentBranch.id,
        user.id
      );

      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderData }) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const updateData = { ...data };
      
      // Set completed_at when status changes to completed
      if (data.status === 'completed' && !data.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      return updatedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`);
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const { data: cancelledOrder, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      return cancelledOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel order: ${error.message}`);
    }
  });

  // Real-time subscription for orders
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    orders,
    isLoading,
    error,
    refetch,
    createOrder: createOrderMutation.mutate,
    updateOrder: updateOrderMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isCancelling: cancelOrderMutation.isPending
  };
};

export const useOrder = (orderId: string) => {
  const { tenant: currentTenant } = useAuth();

  return useQuery({
    queryKey: ['order', orderId, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number),
          encounters!inner(id, encounter_number, encounter_type),
          profiles!orders_ordered_by_fkey(id, first_name, last_name, employee_id)
        `)
        .eq('id', orderId)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId && !!currentTenant?.id
  });
};

// Utility hooks for specific order types
export const useLabOrders = (filters?: { patientId?: string; encounterId?: string }) => {
  return useOrders({ ...filters, orderType: 'lab' });
};

export const useImagingOrders = (filters?: { patientId?: string; encounterId?: string }) => {
  return useOrders({ ...filters, orderType: 'imaging' });
};

export const usePharmacyOrders = (filters?: { patientId?: string; encounterId?: string }) => {
  return useOrders({ ...filters, orderType: 'pharmacy' });
};

export const useServiceOrders = (filters?: { patientId?: string; encounterId?: string }) => {
  return useOrders({ ...filters, orderType: 'service' });
};

export const useProcedureOrders = (filters?: { patientId?: string; encounterId?: string }) => {
  return useOrders({ ...filters, orderType: 'procedure' });
};