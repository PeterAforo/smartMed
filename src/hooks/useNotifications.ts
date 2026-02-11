import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Get alerts as notifications
      const alerts = await api.getAlerts({ status: 'active' });
      const notifs = alerts.map((alert: any) => ({
        id: alert.id,
        type: alert.alert_type,
        title: alert.title,
        message: alert.message,
        read: alert.status !== 'active',
        created_at: alert.created_at
      }));
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      return notifs;
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const markAsRead = useCallback(async (notificationId: string) => {
    await api.acknowledgeAlert(notificationId);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  const markAllAsRead = useCallback(async () => {
    // Mark all as read
    for (const notif of notifications.filter((n: Notification) => !n.read)) {
      await api.acknowledgeAlert(notif.id);
    }
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [notifications, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead
  };
};
