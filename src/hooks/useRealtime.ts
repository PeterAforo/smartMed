import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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