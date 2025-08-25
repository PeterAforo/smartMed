import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Analytics data types
export interface AppointmentAnalytics {
  date: string;
  total_appointments: number;
  completed_appointments: number;
  no_show_appointments: number;
  cancelled_appointments: number;
  unique_patients: number;
  avg_duration: number;
}

export interface RevenueAnalytics {
  month: string;
  total_revenue: number;
  total_transactions: number;
  avg_transaction_amount: number;
  unique_patients: number;
  paid_revenue: number;
  pending_revenue: number;
}

export interface PatientFlowAnalytics {
  month: string;
  new_patients: number;
  active_patients: number;
  pediatric_patients: number;
  senior_patients: number;
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  total_appointments: number;
  completed_appointments: number;
  avg_appointment_duration: number;
  unique_patients_served: number;
  revenue_generated: number;
}

export interface AppointmentTypeDistribution {
  appointment_type: string;
  count: number;
  avg_duration: number;
  completed_count: number;
}

export interface QueuePerformance {
  date: string;
  total_queue_entries: number;
  avg_wait_time: number;
  max_wait_time: number;
  completed_entries: number;
  no_show_entries: number;
}

// Hook for appointment analytics
export function useAppointmentAnalytics(
  startDate: Date = subDays(new Date(), 30),
  endDate: Date = new Date()
) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['appointment-analytics', startDate, endDate, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<AppointmentAnalytics[]> => {
      if (!tenant) throw new Error('No tenant found');

      const { data, error } = await supabase.rpc('get_appointment_analytics', {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        target_tenant_id: tenant.id,
        target_branch_id: hasCrossBranchAccess ? null : currentBranch?.id,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Hook for revenue analytics
export function useRevenueAnalytics(
  startDate: Date = startOfMonth(subMonths(new Date(), 11)),
  endDate: Date = endOfMonth(new Date())
) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['revenue-analytics', startDate, endDate, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<RevenueAnalytics[]> => {
      if (!tenant) throw new Error('No tenant found');

      const { data, error } = await supabase.rpc('get_revenue_analytics', {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        target_tenant_id: tenant.id,
        target_branch_id: hasCrossBranchAccess ? null : currentBranch?.id,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for patient flow analytics
export function usePatientFlowAnalytics(
  startDate: Date = startOfMonth(subMonths(new Date(), 11)),
  endDate: Date = endOfMonth(new Date())
) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['patient-flow-analytics', startDate, endDate, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<PatientFlowAnalytics[]> => {
      if (!tenant) throw new Error('No tenant found');

      const { data, error } = await supabase.rpc('get_patient_flow_analytics', {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        target_tenant_id: tenant.id,
        target_branch_id: hasCrossBranchAccess ? null : currentBranch?.id,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for staff performance analytics
export function useStaffPerformance(month?: Date) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ['staff-performance', targetMonth, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<StaffPerformance[]> => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data, error } = await supabase
        .from('analytics_staff_performance')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('month', format(startOfMonth(targetMonth), 'yyyy-MM-dd'))
        .match(branchFilter)
        .order('total_appointments', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for appointment type distribution
export function useAppointmentTypeDistribution(month?: Date) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ['appointment-types', targetMonth, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<AppointmentTypeDistribution[]> => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data, error } = await supabase
        .from('analytics_appointment_types')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('month', format(startOfMonth(targetMonth), 'yyyy-MM-dd'))
        .match(branchFilter)
        .order('count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for queue performance analytics
export function useQueuePerformance(
  startDate: Date = subDays(new Date(), 30),
  endDate: Date = new Date()
) {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['queue-performance', startDate, endDate, currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<QueuePerformance[]> => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data, error } = await supabase
        .from('analytics_queue_performance')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .match(branchFilter)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for combined analytics dashboard data
export function useAnalyticsDashboard() {
  const appointmentData = useAppointmentAnalytics();
  const revenueData = useRevenueAnalytics();
  const patientFlowData = usePatientFlowAnalytics();
  const staffPerformance = useStaffPerformance();
  const appointmentTypes = useAppointmentTypeDistribution();
  const queuePerformance = useQueuePerformance();

  return {
    appointments: appointmentData,
    revenue: revenueData,
    patientFlow: patientFlowData,
    staffPerformance,
    appointmentTypes,
    queuePerformance,
    isLoading: appointmentData.isLoading || 
               revenueData.isLoading || 
               patientFlowData.isLoading,
    isError: appointmentData.isError || 
             revenueData.isError || 
             patientFlowData.isError,
  };
}