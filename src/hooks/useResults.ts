import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Result, DataValidator, ReferenceRange, ResultAttachment } from '@/lib/dataContracts';
import { HealthcareWorkflows } from '@/lib/eventBus';
import { useEffect } from 'react';

export interface CreateResultData {
  order_id: string;
  patient_id: string;
  result_type: 'lab' | 'imaging' | 'pathology' | 'other';
  result_data: Record<string, any>;
  reference_ranges?: ReferenceRange[];
  critical_flag?: boolean;
  notes?: string;
  attachments?: ResultAttachment[];
}

export interface UpdateResultData {
  result_data?: Record<string, any>;
  reference_ranges?: ReferenceRange[];
  status?: 'preliminary' | 'validated' | 'amended' | 'cancelled';
  critical_flag?: boolean;
  notes?: string;
  attachments?: ResultAttachment[];
}

export const useResults = (filters?: {
  orderId?: string;
  patientId?: string;
  resultType?: string;
  status?: string;
}) => {
  const { user, tenant: currentTenant, currentBranch } = useAuth();
  const queryClient = useQueryClient();

  // Fetch results
  const {
    data: results = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['results', filters, currentTenant?.id, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('results')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number),
          orders!inner(id, order_number, order_type, order_name),
          reported_profile:profiles!results_reported_by_fkey(id, first_name, last_name),
          validated_profile:profiles!results_validated_by_fkey(id, first_name, last_name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('reported_at', { ascending: false });

      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId);
      }

      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters?.resultType) {
        query = query.eq('result_type', filters.resultType);
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

  // Create result mutation
  const createResultMutation = useMutation({
    mutationFn: async (data: CreateResultData) => {
      if (!currentTenant?.id || !currentBranch?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const errors = DataValidator.validateResult({
        ...data,
        reported_by: user.id,
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id
      });

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }

      const result = {
        ...data,
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id,
        reported_by: user.id,
        reference_ranges: data.reference_ranges || [] as any,
        attachments: data.attachments || [] as any
      };

      const { data: newResult, error } = await supabase
        .from('results')
        .insert(result)
        .select()
        .single();

      if (error) throw error;

      return newResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Result created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create result: ${error.message}`);
    }
  });

  // Update result mutation
  const updateResultMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateResultData }) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const { data: updatedResult, error } = await supabase
        .from('results')
        .update(data as any)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      return updatedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Result updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update result: ${error.message}`);
    }
  });

  // Validate result mutation
  const validateResultMutation = useMutation({
    mutationFn: async (resultId: string) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const { data: validatedResult, error } = await supabase
        .from('results')
        .update({ 
          status: 'validated',
          validated_by: user.id,
          validated_at: new Date().toISOString()
        })
        .eq('id', resultId)
        .eq('tenant_id', currentTenant.id)
        .select(`
          *,
          orders!inner(patient_id, encounter_id)
        `)
        .single();

      if (error) throw error;

      // Emit event for result validation
      await HealthcareWorkflows.validateResult(
        resultId,
        validatedResult.order_id,
        validatedResult.patient_id,
        currentTenant.id,
        validatedResult.branch_id,
        user.id
      );

      return validatedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Result validated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to validate result: ${error.message}`);
    }
  });

  // Amend result mutation
  const amendResultMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateResultData }) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const amendData = {
        ...data,
        status: 'amended' as const,
        validated_by: user.id,
        validated_at: new Date().toISOString()
      } as any;

      const { data: amendedResult, error } = await supabase
        .from('results')
        .update(amendData)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      return amendedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Result amended successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to amend result: ${error.message}`);
    }
  });

  // Real-time subscription for results
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('results-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'results',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['results'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    results,
    isLoading,
    error,
    refetch,
    createResult: createResultMutation.mutate,
    updateResult: updateResultMutation.mutate,
    validateResult: validateResultMutation.mutate,
    amendResult: amendResultMutation.mutate,
    isCreating: createResultMutation.isPending,
    isUpdating: updateResultMutation.isPending,
    isValidating: validateResultMutation.isPending,
    isAmending: amendResultMutation.isPending
  };
};

export const useResult = (resultId: string) => {
  const { tenant: currentTenant } = useAuth();

  return useQuery({
    queryKey: ['result', resultId, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number),
          orders!inner(id, order_number, order_type, order_name, encounter_id),
          reported_profile:profiles!results_reported_by_fkey(id, first_name, last_name, employee_id),
          validated_profile:profiles!results_validated_by_fkey(id, first_name, last_name, employee_id)
        `)
        .eq('id', resultId)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!resultId && !!currentTenant?.id
  });
};

// Utility hooks for specific result types
export const useLabResults = (filters?: { patientId?: string; orderId?: string }) => {
  return useResults({ ...filters, resultType: 'lab' });
};

export const useImagingResults = (filters?: { patientId?: string; orderId?: string }) => {
  return useResults({ ...filters, resultType: 'imaging' });
};

export const usePathologyResults = (filters?: { patientId?: string; orderId?: string }) => {
  return useResults({ ...filters, resultType: 'pathology' });
};

// Hook for critical results that need immediate attention
export const useCriticalResults = () => {
  const { tenant: currentTenant, currentBranch } = useAuth();

  return useQuery({
    queryKey: ['critical-results', currentTenant?.id, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('results')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number, phone),
          orders!inner(id, order_number, order_type, order_name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .eq('critical_flag', true)
        .in('status', ['preliminary', 'validated'])
        .order('reported_at', { ascending: false });

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
    refetchInterval: 30000 // Refetch every 30 seconds for critical results
  });
};