import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, startOfDay, endOfDay } from 'date-fns';

export function useDashboardStats() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', currentBranch?.id, hasCrossBranchAccess],
    queryFn: async () => {
      if (!tenant) throw new Error('No tenant found');

      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      // Build branch filter
      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .match(branchFilter);

      // Get active beds
      const { data: beds } = await supabase
        .from('beds')
        .select('status')
        .eq('tenant_id', tenant.id)
        .match(branchFilter);

      const occupiedBeds = beds?.filter(bed => bed.status === 'occupied').length || 0;
      const totalBeds = beds?.length || 0;

      // Get today's appointments
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('appointment_date', todayStr)
        .neq('status', 'cancelled')
        .match(branchFilter);

      // Get active alerts
      const { count: activeAlerts } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .match(branchFilter);

      // Get staff count (profiles in this tenant)
      const { count: staffCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);

      // Get today's revenue
      const { data: todayRevenue } = await supabase
        .from('revenue')
        .select('amount')
        .eq('tenant_id', tenant.id)
        .eq('transaction_date', todayStr)
        .eq('payment_status', 'paid')
        .match(branchFilter);

      const totalRevenue = todayRevenue?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

      return {
        totalPatients: totalPatients || 0,
        activeBeds: `${occupiedBeds}/${totalBeds}`,
        bedOccupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0',
        todayAppointments: todayAppointments || 0,
        activeAlerts: activeAlerts || 0,
        staffCount: staffCount || 0,
        todayRevenue: totalRevenue
      };
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useRecentActivities() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['recent-activities', currentBranch?.id, hasCrossBranchAccess],
    queryFn: async () => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_user_id_fkey(first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .match(branchFilter)
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useAIInsights() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['ai-insights', currentBranch?.id, hasCrossBranchAccess],
    queryFn: async () => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('tenant_id', tenant.id)
        .match(branchFilter)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useActiveAlerts() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  return useQuery({
    queryKey: ['active-alerts', currentBranch?.id, hasCrossBranchAccess],
    queryFn: async () => {
      if (!tenant) throw new Error('No tenant found');

      const branchFilter = hasCrossBranchAccess 
        ? {} 
        : { branch_id: currentBranch?.id };

      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .match(branchFilter)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: !!tenant && !!currentBranch,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}