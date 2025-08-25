import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

interface LiveMetric {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: {
    value: number;
    percentage: number;
    positive: boolean;
  };
  status?: 'normal' | 'warning' | 'critical' | 'success';
  icon: any;
  color: string;
  unit?: string;
  description?: string;
  onClick?: () => void;
}

interface RealtimeData {
  appointments: Array<{ timestamp: string; count: number }>;
  revenue: Array<{ timestamp: string; amount: number }>;
  patientFlow: Array<{ timestamp: string; patients: number }>;
  queue: Array<{ timestamp: string; waitTime: number }>;
}

interface UseLiveAnalyticsOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
}

export function useLiveAnalytics(options: UseLiveAnalyticsOptions = {}) {
  const { enabled = true, interval = 5000 } = options;
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    appointments: [],
    revenue: [],
    patientFlow: [],
    queue: []
  });

  // Query for fetching live dashboard data (simplified with mock data)
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['live-dashboard', currentBranch?.id],
    queryFn: async () => {
      if (!tenant || !currentBranch) return null;

      // Simulate live data with some randomness
      const baseData = {
        appointmentsToday: Math.floor(Math.random() * 20) + 15,
        revenueToday: Math.floor(Math.random() * 5000) + 10000,
        patientsToday: Math.floor(Math.random() * 15) + 12,
        bedOccupancy: Math.floor(Math.random() * 30) + 70,
        staffOnline: Math.floor(Math.random() * 5) + 8,
        queueLength: Math.floor(Math.random() * 8) + 2
      };

      return baseData;
    },
    enabled: enabled && !!tenant && !!currentBranch,
    refetchInterval: interval,
  });

  // Transform dashboard data into live metrics
  useEffect(() => {
    if (!dashboardData) return;

    const newMetrics: LiveMetric[] = [
      {
        id: 'appointments-today',
        title: 'Today\'s Appointments',
        value: dashboardData.appointmentsToday,
        icon: 'Calendar',
        color: 'bg-primary',
        status: dashboardData.appointmentsToday > 20 ? 'success' : 'normal',
        description: 'Scheduled for today',
        change: {
          value: 3,
          percentage: 12.5,
          positive: true
        }
      },
      {
        id: 'revenue-today',
        title: 'Today\'s Revenue',
        value: dashboardData.revenueToday,
        unit: '',
        icon: 'DollarSign',
        color: 'bg-success',
        status: 'success',
        description: 'Revenue generated today',
        change: {
          value: 850,
          percentage: 8.3,
          positive: true
        }
      },
      {
        id: 'patients-today',
        title: 'Patients Today',
        value: dashboardData.patientsToday,
        icon: 'Users',
        color: 'bg-info',
        status: 'normal',
        description: 'Patients seen today'
      },
      {
        id: 'bed-occupancy',
        title: 'Bed Occupancy',
        value: `${dashboardData.bedOccupancy}%`,
        icon: 'Bed',
        color: 'bg-warning',
        status: dashboardData.bedOccupancy > 90 ? 'warning' : 'normal',
        description: 'Current bed utilization'
      },
      {
        id: 'staff-online',
        title: 'Staff Online',
        value: dashboardData.staffOnline,
        icon: 'UserCheck',
        color: 'bg-secondary',
        status: 'success',
        description: 'Staff currently available'
      },
      {
        id: 'queue-length',
        title: 'Queue Length',
        value: dashboardData.queueLength,
        icon: 'Clock',
        color: 'bg-muted',
        status: dashboardData.queueLength > 10 ? 'warning' : 'normal',
        description: 'Patients waiting'
      }
    ];

    setLiveMetrics(newMetrics);
  }, [dashboardData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enabled || !tenant || !currentBranch) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    // Subscribe to real-time changes
    const appointmentChannel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `branch_id=eq.${currentBranch.id}`
        },
        (payload) => {
          console.log('Appointment change:', payload);
          // Refetch dashboard data when appointments change
          refetchDashboard();
          
          // Update realtime data
          setRealtimeData(prev => ({
            ...prev,
            appointments: [
              ...prev.appointments.slice(-19), // Keep last 19 items
              {
                timestamp: new Date().toISOString(),
                count: (dashboardData?.appointmentsToday as number) || 0
              }
            ]
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_queue',
          filter: `branch_id=eq.${currentBranch.id}`
        },
        (payload) => {
          console.log('Queue change:', payload);
          refetchDashboard();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          toast({
            title: "Real-time Connected",
            description: "Live updates are now active",
          });
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
          toast({
            title: "Connection Error",
            description: "Failed to establish real-time connection",
            variant: "destructive",
          });
        }
      });

    return () => {
      appointmentChannel.unsubscribe();
      setConnectionStatus('disconnected');
    };
  }, [enabled, tenant, currentBranch, refetchDashboard, dashboardData?.appointmentsToday, toast]);

  // Generate sample realtime data for charts
  useEffect(() => {
    if (!enabled || !dashboardData) return;

    const dataInterval = setInterval(() => {
      const now = new Date().toISOString();
      
      setRealtimeData(prev => ({
        appointments: [
          ...prev.appointments.slice(-19),
          {
            timestamp: now,
            count: (dashboardData.appointmentsToday as number) + Math.floor(Math.random() * 3)
          }
        ],
        revenue: [
          ...prev.revenue.slice(-19),
          {
            timestamp: now,
            amount: (dashboardData.revenueToday as number) + Math.floor(Math.random() * 1000)
          }
        ],
        patientFlow: [
          ...prev.patientFlow.slice(-19),
          {
            timestamp: now,
            patients: (dashboardData.patientsToday as number) + Math.floor(Math.random() * 2)
          }
        ],
        queue: [
          ...prev.queue.slice(-19),
          {
            timestamp: now,
            waitTime: Math.floor(Math.random() * 30) + 5
          }
        ]
      }));
    }, interval);

    return () => clearInterval(dataInterval);
  }, [enabled, dashboardData, interval]);

  const toggleLiveUpdates = useCallback((enable: boolean) => {
    setConnectionStatus(enable ? 'connecting' : 'disconnected');
  }, []);

  const refreshData = useCallback(() => {
    refetchDashboard();
  }, [refetchDashboard]);

  return {
    liveMetrics,
    realtimeData,
    connectionStatus,
    toggleLiveUpdates,
    refreshData
  };
}