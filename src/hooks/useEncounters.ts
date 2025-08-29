import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Encounter, NumberGenerator, DataValidator } from '@/lib/dataContracts';
import { eventBus, HealthcareWorkflows } from '@/lib/eventBus';

export interface CreateEncounterData {
  patient_id: string;
  encounter_type: 'OPD' | 'IPD' | 'ER';
  attending_staff?: string;
  location?: string;
  chief_complaint?: string;
  notes?: string;
}

export interface UpdateEncounterData {
  status?: 'active' | 'completed' | 'cancelled';
  end_time?: string;
  attending_staff?: string;
  location?: string;
  chief_complaint?: string;
  diagnoses?: string[];
  notes?: string;
}

export const useEncounters = (patientId?: string) => {
  const { user, tenant: currentTenant, currentBranch } = useAuth();
  const queryClient = useQueryClient();

  // Fetch encounters
  const {
    data: encounters = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['encounters', patientId, currentTenant?.id, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('encounters')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number),
          profiles!encounters_attending_staff_fkey(id, first_name, last_name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('start_time', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
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

  // Create encounter mutation
  const createEncounterMutation = useMutation({
    mutationFn: async (data: CreateEncounterData) => {
      if (!currentTenant?.id || !currentBranch?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const errors = DataValidator.validateEncounter({
        ...data,
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id
      });

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }

      const encounterNumber = NumberGenerator.generateEncounterNumber(currentBranch.code);

      const encounter = {
        ...data,
        encounter_number: encounterNumber,
        tenant_id: currentTenant.id,
        branch_id: currentBranch.id,
        attending_staff: data.attending_staff || user.id
      };

      const { data: newEncounter, error } = await supabase
        .from('encounters')
        .insert(encounter)
        .select()
        .single();

      if (error) throw error;

      // Emit event for encounter creation
      await HealthcareWorkflows.startEncounter(
        newEncounter.id,
        data.patient_id,
        currentTenant.id,
        currentBranch.id,
        user.id
      );

      return newEncounter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create encounter: ${error.message}`);
    }
  });

  // Update encounter mutation
  const updateEncounterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEncounterData }) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const { data: updatedEncounter, error } = await supabase
        .from('encounters')
        .update(data)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      // Emit event if encounter is being completed/discharged
      if (data.status === 'completed') {
        await HealthcareWorkflows.dischargePatient(
          id,
          updatedEncounter.patient_id,
          currentTenant.id,
          updatedEncounter.branch_id,
          user.id
        );
      }

      return updatedEncounter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update encounter: ${error.message}`);
    }
  });

  // Real-time subscription for encounters
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('encounters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'encounters',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['encounters'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    encounters,
    isLoading,
    error,
    refetch,
    createEncounter: createEncounterMutation.mutate,
    updateEncounter: updateEncounterMutation.mutate,
    isCreating: createEncounterMutation.isPending,
    isUpdating: updateEncounterMutation.isPending
  };
};

export const useEncounter = (encounterId: string) => {
  const { tenant: currentTenant } = useAuth();

  return useQuery({
    queryKey: ['encounter', encounterId, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          *,
          patients!inner(id, first_name, last_name, medical_record_number, date_of_birth, gender),
          profiles!encounters_attending_staff_fkey(id, first_name, last_name, employee_id)
        `)
        .eq('id', encounterId)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!encounterId && !!currentTenant?.id
  });
};