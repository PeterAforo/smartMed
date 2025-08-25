import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useRealtimeActivities() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentBranch || !tenant) {
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: initialData, error } = await supabase
          .from('activities')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setData(initialData || []);
      } catch (error) {
        console.error('Error fetching activities data:', error);
        toast({
          title: "Data Load Error",
          description: "Failed to load activities data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscription 
    const channel = supabase.channel('activities-changes');
    
    channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activities',
          filter: `tenant_id=eq.${tenant.id}`
        }, 
        (payload) => {
          console.log('Real-time activity update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setData(prevData => [payload.new, ...prevData.slice(0, 9)]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => 
              prevData.map(item => 
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prevData => 
              prevData.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBranch, tenant, toast]);

  return { data, loading };
}

export function useRealtimePatients() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentBranch || !tenant) {
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: initialData, error } = await supabase
          .from('patients')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setData(initialData || []);
      } catch (error) {
        console.error('Error fetching patients data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const channel = supabase.channel('patients-changes');
    
    channel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prevData => [payload.new, ...prevData]);
            toast({
              title: "New Patient",
              description: "New patient registered",
            });
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => 
              prevData.map(item => 
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBranch, tenant, toast]);

  return { data, loading };
}

export function useRealtimeAppointments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    if (!currentBranch) return;
    
    try {
      setLoading(true);
      const { data: initialData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(
            id,
            first_name,
            last_name,
            patient_number,
            phone,
            email
          )
        `)
        .eq('branch_id', currentBranch.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      setData(initialData || []);
    } catch (error) {
      console.error('Error fetching appointments data:', error);
      toast({
        title: "Data Load Error",
        description: "Failed to load appointments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentBranch, toast]);

  useEffect(() => {
    if (!currentBranch || !tenant) {
      setLoading(false);
      return;
    }

    fetchInitialData();

    const channel = supabase.channel('appointments-changes');
    
    channel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `branch_id=eq.${currentBranch.id}`,
        },
        (payload) => {
          console.log('Real-time appointment update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Refetch to get patient data
            fetchInitialData();
            toast({
              title: "New Appointment",
              description: "New appointment scheduled",
            });
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => {
              const oldItem = prevData.find(item => item.id === payload.old?.id);
              if (oldItem && oldItem.status !== payload.new.status) {
                toast({
                  title: "Appointment Updated",
                  description: `Status changed to ${payload.new.status}`,
                });
              }
              
              return prevData.map(item => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              );
            });
          } else if (payload.eventType === 'DELETE') {
            setData(prevData => 
              prevData.filter(item => item.id !== payload.old.id)
            );
            toast({
              title: "Appointment Deleted",
              description: "Appointment has been removed",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBranch, tenant, toast, fetchInitialData]);

  return { data, loading, refetch: fetchInitialData };
}

export function useRealtimeQueue(selectedDate?: Date) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();
  const dateFilter = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const fetchInitialData = useCallback(async () => {
    if (!currentBranch) return;
    
    try {
      setLoading(true);
      const { data: initialData, error } = await supabase
        .from('appointment_queue')
        .select(`
          *,
          appointments!inner(
            id,
            appointment_time,
            appointment_type,
            duration_minutes,
            patients!inner(
              id,
              first_name,
              last_name,
              patient_number
            )
          )
        `)
        .eq('branch_id', currentBranch.id)
        .eq('queue_date', dateFilter)
        .order('queue_position');
      
      if (error) throw error;
      setData(initialData || []);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentBranch, dateFilter]);

  useEffect(() => {
    if (!currentBranch || !tenant) {
      setLoading(false);
      return;
    }

    fetchInitialData();

    const channel = supabase.channel(`queue-changes-${dateFilter}`);
    
    channel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_queue',
          filter: `branch_id=eq.${currentBranch.id}`,
        },
        (payload) => {
          console.log('Real-time queue update:', payload);
          
          if (payload.eventType === 'INSERT') {
            fetchInitialData(); // Refresh to get appointment data
            toast({
              title: "Patient Checked In",
              description: "New patient added to queue",
            });
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => 
              prevData.map(item => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
            
            // Show status change notifications
            if (payload.new.status === 'in-progress') {
              toast({
                title: "Appointment Started",
                description: "Patient appointment is now in progress",
              });
            } else if (payload.new.status === 'completed') {
              toast({
                title: "Appointment Completed",
                description: "Patient appointment has been completed",
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setData(prevData => 
              prevData.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBranch, tenant, dateFilter, toast, fetchInitialData]);

  return { data, loading, refetch: fetchInitialData };
}

export function useRealtimeRoomBookings(selectedDate?: Date) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBranch, tenant } = useAuth();
  const { toast } = useToast();
  const dateFilter = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const fetchInitialData = useCallback(async () => {
    if (!currentBranch) return;
    
    try {
      setLoading(true);
      const { data: initialData, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          appointments(
            id,
            appointment_type,
            patients(
              first_name,
              last_name,
              patient_number
            )
          )
        `)
        .eq('branch_id', currentBranch.id)
        .eq('booking_date', dateFilter)
        .order('start_time');
      
      if (error) throw error;
      setData(initialData || []);
    } catch (error) {
      console.error('Error fetching room bookings data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentBranch, dateFilter]);

  useEffect(() => {
    if (!currentBranch || !tenant) {
      setLoading(false);
      return;
    }

    fetchInitialData();

    const channel = supabase.channel(`room-bookings-changes-${dateFilter}`);
    
    channel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_bookings',
          filter: `branch_id=eq.${currentBranch.id}`,
        },
        (payload) => {
          console.log('Real-time room booking update:', payload);
          
          if (payload.eventType === 'INSERT') {
            fetchInitialData(); // Refresh to get appointment data
            toast({
              title: "Room Booked",
              description: `${payload.new.room_name} has been booked`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => 
              prevData.map(item => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
            
            // Show status change notifications
            if (payload.new.status === 'in-use') {
              toast({
                title: "Room In Use",
                description: `${payload.new.room_name} is now in use`,
              });
            } else if (payload.new.status === 'completed') {
              toast({
                title: "Room Available",
                description: `${payload.new.room_name} is now available`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setData(prevData => 
              prevData.filter(item => item.id !== payload.old.id)
            );
            toast({
              title: "Booking Cancelled",
              description: "Room booking has been cancelled",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBranch, tenant, dateFilter, toast, fetchInitialData]);

  return { data, loading, refetch: fetchInitialData };
}