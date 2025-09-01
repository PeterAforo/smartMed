import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SmartAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  category: 'appointments' | 'revenue' | 'patients' | 'system' | 'queue';
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  acknowledged: boolean;
  autoResolve?: boolean;
  threshold?: {
    metric: string;
    value: number;
    condition: 'above' | 'below' | 'equal';
  };
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equal';
  threshold: number;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export function useSmartAlerts() {
  const { currentBranch, tenant } = useAuth();
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  // Generate smart alerts based on real-time data
  useEffect(() => {
    // Simulate smart alerts for demo
    const generateAlerts = () => {
      const currentTime = new Date();
      
      const sampleAlerts: SmartAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High Queue Wait Time',
          message: 'Average wait time has exceeded 45 minutes. Consider adding more staff.',
          timestamp: new Date(currentTime.getTime() - 5 * 60 * 1000), // 5 minutes ago
          category: 'queue',
          priority: 'high',
          actionRequired: true,
          acknowledged: false,
          threshold: {
            metric: 'queue_wait_time',
            value: 45,
            condition: 'above'
          }
        },
        {
          id: '2',
          type: 'critical',
          title: 'Bed Capacity Critical',
          message: 'ICU beds at 95% capacity. Urgent review needed.',
          timestamp: new Date(currentTime.getTime() - 2 * 60 * 1000), // 2 minutes ago
          category: 'system',
          priority: 'high',
          actionRequired: true,
          acknowledged: false,
          threshold: {
            metric: 'bed_occupancy',
            value: 95,
            condition: 'above'
          }
        },
        {
          id: '3',
          type: 'info',
          title: 'Revenue Target Achieved',
          message: 'Daily revenue target of ₵15,000 has been reached.',
          timestamp: new Date(currentTime.getTime() - 30 * 60 * 1000), // 30 minutes ago
          category: 'revenue',
          priority: 'low',
          actionRequired: false,
          acknowledged: true,
          autoResolve: true
        },
        {
          id: '4',
          type: 'warning',
          title: 'Staff Shortage Detected',
          message: 'Only 3 nurses available for night shift. Consider calling backup.',
          timestamp: new Date(currentTime.getTime() - 10 * 60 * 1000), // 10 minutes ago
          category: 'system',
          priority: 'medium',
          actionRequired: true,
          acknowledged: false
        },
        {
          id: '5',
          type: 'success',
          title: 'Appointment Target Met',
          message: 'Today\'s appointment target of 50 patients has been achieved.',
          timestamp: new Date(currentTime.getTime() - 60 * 60 * 1000), // 1 hour ago
          category: 'appointments',
          priority: 'low',
          actionRequired: false,
          acknowledged: true,
          autoResolve: true
        }
      ];

      // Filter out old alerts and add some randomness
      const activeAlerts = sampleAlerts.filter(alert => {
        const hoursSinceAlert = (currentTime.getTime() - alert.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursSinceAlert < 24; // Keep alerts for 24 hours
      });

      setAlerts(activeAlerts);
    };

    generateAlerts();
    
    // Update alerts every 30 seconds
    const interval = setInterval(generateAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Query for alert rules
  const { data: alertRules = [] } = useQuery({
    queryKey: ['alert-rules', currentBranch?.id],
    queryFn: async (): Promise<AlertRule[]> => {
      // Simulate alert rules
      return [
        {
          id: '1',
          name: 'High Queue Wait Time',
          metric: 'queue_wait_time',
          condition: 'above',
          threshold: 45,
          enabled: true,
          priority: 'high',
          category: 'queue'
        },
        {
          id: '2',
          name: 'Low Bed Availability',
          metric: 'bed_availability',
          condition: 'below',
          threshold: 10,
          enabled: true,
          priority: 'high',
          category: 'system'
        },
        {
          id: '3',
          name: 'High Revenue Day',
          metric: 'daily_revenue',
          condition: 'above',
          threshold: 15000,
          enabled: true,
          priority: 'low',
          category: 'revenue'
        },
        {
          id: '4',
          name: 'Staff Shortage',
          metric: 'available_staff',
          condition: 'below',
          threshold: 5,
          enabled: true,
          priority: 'medium',
          category: 'system'
        }
      ];
    },
    enabled: !!tenant && !!currentBranch,
  });

  // Mutation to acknowledge alert
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return alertId;
    },
    onSuccess: (alertId) => {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    },
  });

  // Mutation to dismiss alert
  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return alertId;
    },
    onSuccess: (alertId) => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    },
  });

  // Mutation to update alert rule
  const updateRuleMutation = useMutation({
    mutationFn: async (rule: Partial<AlertRule> & { id: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const acknowledgeAlert = async (alertId: string) => {
    return acknowledgeMutation.mutateAsync(alertId);
  };

  const dismissAlert = async (alertId: string) => {
    return dismissMutation.mutateAsync(alertId);
  };

  const updateAlertRule = async (rule: Partial<AlertRule> & { id: string }) => {
    return updateRuleMutation.mutateAsync(rule);
  };

  return {
    alerts,
    alertRules,
    acknowledgeAlert,
    dismissAlert,
    updateAlertRule,
    isLoading: acknowledgeMutation.isPending || dismissMutation.isPending || updateRuleMutation.isPending
  };
}