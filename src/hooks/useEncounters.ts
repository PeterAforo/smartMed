import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: encounters = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['encounters', patientId],
    queryFn: async () => {
      // Encounters endpoint not implemented yet - return appointments as proxy
      const appointments = await api.getAppointments({ patient_id: patientId });
      return appointments;
    },
    enabled: !!user
  });

  const createEncounterMutation = useMutation({
    mutationFn: async (data: CreateEncounterData) => {
      // Create as appointment for now
      return api.createAppointment({
        patient_id: data.patient_id,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: new Date().toTimeString().split(' ')[0],
        appointment_type: 'consultation',
        chief_complaint: data.chief_complaint,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create encounter: ${error.message}`);
    }
  });

  const updateEncounterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEncounterData }) => {
      return api.updateAppointment(id, {
        status: data.status === 'completed' ? 'completed' : data.status,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update encounter: ${error.message}`);
    }
  });

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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: async () => {
      return api.getAppointment(encounterId);
    },
    enabled: !!encounterId && !!user
  });
};
