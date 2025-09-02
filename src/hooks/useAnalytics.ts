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

export interface RealtimeDashboardStats {
  appointments_today: number;
  revenue_today: number;
  patients_today: number;
  queue_length: number;
  avg_wait_time: number;
  staff_online: number;
  new_patients_today: number;
  completed_appointments: number;
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

// Hook for real-time dashboard stats
export function useRealtimeDashboard() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['realtime-dashboard', currentBranch?.id, hasCrossBranchAccess],
    queryFn: async (): Promise<RealtimeDashboardStats> => {
      if (!tenant || !currentBranch) throw new Error('No tenant or branch found');

      const { data, error } = await supabase.rpc('get_realtime_dashboard_stats', {
        target_tenant_id: tenant.id,
        target_branch_id: hasCrossBranchAccess ? null : currentBranch.id,
      });

      if (error) throw error;
      return data?.[0] || {
        appointments_today: 0,
        revenue_today: 0,
        patients_today: 0,
        queue_length: 0,
        avg_wait_time: 0,
        staff_online: 0,
        new_patients_today: 0,
        completed_appointments: 0
      };
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for real-time
  });
}

// Hook for combined analytics dashboard data
export function useAnalyticsDashboard() {
  const { tenant } = useAuth();
  const appointmentData = useAppointmentAnalytics();
  const revenueData = useRevenueAnalytics();
  const patientFlowData = usePatientFlowAnalytics();
  const staffPerformance = useStaffPerformance();
  const appointmentTypes = useAppointmentTypeDistribution();
  const queuePerformance = useQueuePerformance();
  const realtimeData = useRealtimeDashboard();

  // If user is not authenticated, provide sample data for demonstration
  if (!tenant) {
    return {
      appointments: { 
        data: [{ 
          date: format(new Date(), 'yyyy-MM-dd'),
          completed_appointments: 15, 
          total_appointments: 18,
          no_show_appointments: 2,
          cancelled_appointments: 1,
          unique_patients: 14,
          avg_duration: 35
        }],
        isLoading: false,
        isError: false
      },
      revenue: { 
        data: [{ 
          month: format(new Date(), 'yyyy-MM-dd'),
          total_revenue: 12500,
          total_transactions: 24,
          avg_transaction_amount: 520,
          unique_patients: 18,
          paid_revenue: 11200,
          pending_revenue: 1300
        }],
        isLoading: false,
        isError: false
      },
      patientFlow: { 
        data: [{ 
          month: format(new Date(), 'yyyy-MM-dd'),
          new_patients: 8,
          active_patients: 156,
          pediatric_patients: 23,
          senior_patients: 34
        }],
        isLoading: false,
        isError: false
      },
      staffPerformance: {
        data: [],
        isLoading: false,
        isError: false
      },
      appointmentTypes: {
        data: [],
        isLoading: false,
        isError: false
      },
      queuePerformance: { 
        data: [{ 
          date: format(new Date(), 'yyyy-MM-dd'),
          avg_wait_time: 18,
          total_queue_entries: 22,
          max_wait_time: 36,
          completed_entries: 18,
          no_show_entries: 2
        }],
        isLoading: false,
        isError: false
      },
      realtime: {
        data: {
          appointments_today: 5,
          revenue_today: 255.00,
          patients_today: 4,
          queue_length: 2,
          avg_wait_time: 18,
          staff_online: 3,
          new_patients_today: 1,
          completed_appointments: 3
        },
        isLoading: false,
        isError: false
      },
      isLoading: false,
      isError: false,
    };
  }

  return {
    appointments: appointmentData,
    revenue: revenueData,
    patientFlow: patientFlowData,
    staffPerformance,
    appointmentTypes,
    queuePerformance,
    realtime: realtimeData,
    isLoading: appointmentData.isLoading || 
               revenueData.isLoading || 
               patientFlowData.isLoading ||
               realtimeData.isLoading,
    isError: appointmentData.isError || 
             revenueData.isError || 
             patientFlowData.isError ||
             realtimeData.isError,
  };
}