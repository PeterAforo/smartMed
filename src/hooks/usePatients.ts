import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string[];
  status: 'active' | 'inactive' | 'deceased';
  created_at: string;
  updated_at: string;
}

export const usePatients = (searchTerm?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: patients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      return api.getPatients({ search: searchTerm });
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      return api.createPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create patient: ${error.message}`);
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
      return api.updatePatient(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update patient: ${error.message}`);
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deletePatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete patient: ${error.message}`);
    }
  });

  return {
    patients,
    isLoading,
    error,
    refetch,
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending
  };
};

export const usePatient = (patientId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      return api.getPatient(patientId);
    },
    enabled: !!patientId && !!user
  });
};