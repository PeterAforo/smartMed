import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Realtime functionality stub - polling-based instead of WebSocket
export const useRealtime = (table: string, filter?: Record<string, any>) => {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      queryClient.invalidateQueries({ queryKey: [table] });
    }, 30000);

    return () => clearInterval(interval);
  }, [table, queryClient]);

  return {
    lastUpdate,
    isConnected: true
  };
};

export const useRealtimeSubscription = <T>(
  table: string,
  callback: (data: T) => void,
  filter?: Record<string, any>
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(true);
    
    // Polling-based subscription
    const interval = setInterval(() => {
      // Callback would be triggered on data change
      // For now, this is a stub
    }, 30000);

    return () => {
      clearInterval(interval);
      setIsSubscribed(false);
    };
  }, [table, callback]);

  return { isSubscribed };
};

export const useBroadcast = (channel: string) => {
  const broadcast = useCallback((event: string, payload: any) => {
    console.log(`Broadcasting ${event} on ${channel}:`, payload);
    // Broadcast functionality not implemented without WebSocket
  }, [channel]);

  return { broadcast };
};

// Additional exports for compatibility
export const useRealtimeActivities = () => {
  const queryClient = useQueryClient();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Poll for activities every 10 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    }, 10000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { activities, isConnected: true };
};

export const useRealtimeAlerts = () => {
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Poll for alerts every 15 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
    }, 15000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { alerts, isConnected: true };
};

export const useRealtimePatients = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { isConnected: true };
};

export const useRealtimeAppointments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { isConnected: true };
};

export const useRealtimeQueue = () => {
  const queryClient = useQueryClient();
  const [queueData, setQueueData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }, 10000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { queueData, isConnected: true };
};

export const useRealtimeBeds = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { isConnected: true };
};

export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }, 15000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { notifications, isConnected: true };
};

export const useRealtimeStats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { isConnected: true };
};

export const useRealtimeRoomBookings = () => {
  const queryClient = useQueryClient();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }, 15000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return { bookings, isConnected: true };
};
