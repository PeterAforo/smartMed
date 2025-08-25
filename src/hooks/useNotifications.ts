import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    prompt: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        prompt: currentPermission === 'default'
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    const newPermission = {
      granted: result === 'granted',
      denied: result === 'denied',
      prompt: result === 'default'
    };
    
    setPermission(newPermission);
    
    if (result === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive real-time notifications",
      });
    }
    
    return result === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) {
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  };

  const showAppointmentNotification = (type: 'new' | 'update' | 'reminder', patient: string, time?: string) => {
    const titles = {
      new: 'New Appointment Scheduled',
      update: 'Appointment Updated',
      reminder: 'Appointment Reminder'
    };

    const messages = {
      new: `New appointment for ${patient}`,
      update: `Appointment updated for ${patient}`,
      reminder: `Upcoming appointment with ${patient}${time ? ` at ${time}` : ''}`
    };

    return showNotification(titles[type], {
      body: messages[type],
      tag: `appointment-${type}`,
    });
  };

  const showQueueNotification = (type: 'checkin' | 'progress' | 'complete', patient: string, position?: number) => {
    const titles = {
      checkin: 'Patient Checked In',
      progress: 'Appointment Started',
      complete: 'Appointment Completed'
    };

    const messages = {
      checkin: `${patient} checked in${position ? ` - Position #${position}` : ''}`,
      progress: `${patient}'s appointment is now in progress`,
      complete: `${patient}'s appointment has been completed`
    };

    return showNotification(titles[type], {
      body: messages[type],
      tag: `queue-${type}`,
    });
  };

  const showResourceNotification = (type: 'booked' | 'inuse' | 'available', room: string, time?: string) => {
    const titles = {
      booked: 'Room Booked',
      inuse: 'Room In Use',
      available: 'Room Available'
    };

    const messages = {
      booked: `${room} has been booked${time ? ` at ${time}` : ''}`,
      inuse: `${room} is now in use`,
      available: `${room} is now available`
    };

    return showNotification(titles[type], {
      body: messages[type],
      tag: `resource-${type}`,
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showAppointmentNotification,
    showQueueNotification,
    showResourceNotification
  };
}