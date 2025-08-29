import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Patient {
  id: string;
  tenant_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: any;
  insurance_info?: any;
  created_at: string;
  updated_at: string;
}

export const usePatients = (searchTerm?: string) => {
  const { user, tenant: currentTenant, currentBranch } = useAuth();
  const queryClient = useQueryClient();

  // Fetch patients
  const {
    data: patients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', searchTerm, currentTenant?.id, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,medical_record_number.ilike.%${searchTerm}%`);
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

  // Real-time subscription for patients
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['patients'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    patients,
    isLoading,
    error,
    refetch
  };
};

export const usePatient = (patientId: string) => {
  const { tenant: currentTenant } = useAuth();

  return useQuery({
    queryKey: ['patient', patientId, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!patientId && !!currentTenant?.id
  });
};