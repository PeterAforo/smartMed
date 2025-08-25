import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRealtimeActivities } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  requestPermission: () => Promise<boolean>;
  permission: {
    granted: boolean;
    denied: boolean;
    prompt: boolean;
  };
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    permission,
    requestPermission,
    showAppointmentNotification,
    showQueueNotification,
    showResourceNotification
  } = useNotifications();
  
  const { data: activities } = useRealtimeActivities();
  const { toast } = useToast();

  // Process real-time activities for notifications
  useEffect(() => {
    if (!permission.granted || !activities.length) return;

    const latestActivity = activities[0];
    if (!latestActivity || !latestActivity.created_at) return;

    // Only show notifications for very recent activities (within last 10 seconds)
    const activityTime = new Date(latestActivity.created_at);
    const now = new Date();
    const diffInSeconds = (now.getTime() - activityTime.getTime()) / 1000;
    
    if (diffInSeconds > 10) return;

    const { activity_type, description, metadata } = latestActivity;

    try {
      const metaData = metadata || {};
      
      switch (activity_type) {
        case 'appointment_created':
          showAppointmentNotification('new', metaData.patient_name || 'Unknown Patient');
          break;
          
        case 'appointment_updated':
          showAppointmentNotification('update', metaData.patient_name || 'Unknown Patient');
          break;
          
        case 'patient_checkin':
          showQueueNotification('checkin', metaData.patient_name || 'Unknown Patient', metaData.queue_position);
          break;
          
        case 'appointment_started':
          showQueueNotification('progress', metaData.patient_name || 'Unknown Patient');
          break;
          
        case 'appointment_completed':
          showQueueNotification('complete', metaData.patient_name || 'Unknown Patient');
          break;
          
        case 'room_booked':
          showResourceNotification('booked', metaData.room_name || 'Unknown Room', metaData.start_time);
          break;
          
        case 'room_in_use':
          showResourceNotification('inuse', metaData.room_name || 'Unknown Room');
          break;
          
        case 'room_available':
          showResourceNotification('available', metaData.room_name || 'Unknown Room');
          break;
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }, [activities, permission.granted, showAppointmentNotification, showQueueNotification, showResourceNotification]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationToggle() {
  const { permission, requestPermission } = useNotificationContext();
  const { toast } = useToast();

  const handleToggle = async () => {
    if (permission.granted) {
      toast({
        title: "Notifications Enabled",
        description: "Notifications are already enabled. Use browser settings to disable.",
      });
      return;
    }

    if (permission.denied) {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return;
    }

    await requestPermission();
  };

  return (
    <Button
      variant={permission.granted ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      {permission.granted ? (
        <>
          <Bell className="h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}