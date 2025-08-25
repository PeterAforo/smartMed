import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LiveBed {
  id: string;
  room_number: string | null;
  bed_number: string;
  bed_type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  patient_name?: string;
  patient_id?: string;
  admitted_at?: string;
}

interface LiveStaff {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  current_location?: string;
  shift_end?: string;
}

interface LiveEquipment {
  id: string;
  name: string;
  equipment_code: string;
  status: 'operational' | 'maintenance' | 'out_of_order';
  location?: string;
  last_maintenance?: string;
}

interface LiveQueue {
  id: string;
  patient_name: string;
  appointment_type: string;
  queue_position: number;
  status: 'waiting' | 'called' | 'in_progress';
  check_in_time?: string;
  estimated_start_time?: string;
  wait_time_minutes?: number;
}

interface UseLiveOperationalDataOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

export function useLiveOperationalData(options: UseLiveOperationalDataOptions = {}) {
  const { enabled = true, refreshInterval = 10000 } = options;
  const { currentBranch, tenant } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Query for live beds data
  const { data: beds = [], isLoading: bedsLoading, refetch: refetchBeds } = useQuery({
    queryKey: ['live-beds', currentBranch?.id],
    queryFn: async (): Promise<LiveBed[]> => {
      if (!tenant || !currentBranch) return [];

      const { data, error } = await supabase
        .from('beds')
        .select(`
          id,
          room_number,
          bed_number,
          bed_type,
          status,
          patient_id,
          admitted_at,
          patients!inner(
            first_name,
            last_name
          )
        `)
        .eq('tenant_id', tenant.id)
        .eq('branch_id', currentBranch.id)
        .order('room_number', { ascending: true });

      if (error) throw error;

      return (data || []).map(bed => ({
        id: bed.id,
        room_number: bed.room_number,
        bed_number: bed.bed_number,
        bed_type: bed.bed_type,
        status: bed.status as LiveBed['status'],
        patient_name: bed.patients ? `${bed.patients.first_name} ${bed.patients.last_name}` : undefined,
        patient_id: bed.patient_id || undefined,
        admitted_at: bed.admitted_at || undefined,
      }));
    },
    enabled: enabled && !!tenant && !!currentBranch,
    refetchInterval: refreshInterval,
  });

  // Query for live staff data (simulated since we don't have staff table)
  const { data: staff = [], isLoading: staffLoading, refetch: refetchStaff } = useQuery({
    queryKey: ['live-staff', currentBranch?.id],
    queryFn: async (): Promise<LiveStaff[]> => {
      if (!tenant || !currentBranch) return [];

      // Simulate staff data
      const sampleStaff: LiveStaff[] = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          role: 'Doctor',
          status: 'online',
          current_location: 'Emergency Room',
          shift_end: '18:00'
        },
        {
          id: '2',
          name: 'Nurse Mary Williams',
          role: 'Nurse',
          status: 'busy',
          current_location: 'Ward A',
          shift_end: '20:00'
        },
        {
          id: '3',
          name: 'Dr. Michael Brown',
          role: 'Doctor',
          status: 'online',
          current_location: 'Consultation Room 1',
          shift_end: '17:00'
        },
        {
          id: '4',
          name: 'Nurse Jennifer Davis',
          role: 'Nurse',
          status: 'offline',
          current_location: 'Break Room',
          shift_end: '16:00'
        },
        {
          id: '5',
          name: 'Tech John Smith',
          role: 'Lab Technician',
          status: 'online',
          current_location: 'Laboratory',
          shift_end: '19:00'
        }
      ];

      return sampleStaff;
    },
    enabled: enabled && !!tenant && !!currentBranch,
    refetchInterval: refreshInterval,
  });

  // Query for live equipment data
  const { data: equipment = [], isLoading: equipmentLoading, refetch: refetchEquipment } = useQuery({
    queryKey: ['live-equipment', currentBranch?.id],
    queryFn: async (): Promise<LiveEquipment[]> => {
      if (!tenant || !currentBranch) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          equipment_code,
          status,
          location
        `)
        .eq('tenant_id', tenant.id)
        .eq('branch_id', currentBranch.id)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        equipment_code: item.equipment_code,
        status: item.status as LiveEquipment['status'],
        location: item.location || undefined,
      }));
    },
    enabled: enabled && !!tenant && !!currentBranch,
    refetchInterval: refreshInterval,
  });

  // Query for live queue data
  const { data: queue = [], isLoading: queueLoading, refetch: refetchQueue } = useQuery({
    queryKey: ['live-queue', currentBranch?.id],
    queryFn: async (): Promise<LiveQueue[]> => {
      if (!tenant || !currentBranch) return [];

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointment_queue')
        .select(`
          id,
          queue_position,
          status,
          check_in_time,
          estimated_start_time,
          wait_time_minutes,
          appointments!inner(
            appointment_type,
            patients!inner(
              first_name,
              last_name
            )
          )
        `)
        .eq('tenant_id', tenant.id)
        .eq('branch_id', currentBranch.id)
        .eq('queue_date', today)
        .order('queue_position', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        patient_name: `${item.appointments.patients.first_name} ${item.appointments.patients.last_name}`,
        appointment_type: item.appointments.appointment_type,
        queue_position: item.queue_position,
        status: item.status as LiveQueue['status'],
        check_in_time: item.check_in_time || undefined,
        estimated_start_time: item.estimated_start_time || undefined,
        wait_time_minutes: item.wait_time_minutes || undefined,
      }));
    },
    enabled: enabled && !!tenant && !!currentBranch,
    refetchInterval: refreshInterval,
  });

  // Update last updated timestamp
  useEffect(() => {
    if (beds.length > 0 || staff.length > 0 || equipment.length > 0 || queue.length > 0) {
      setLastUpdated(new Date());
    }
  }, [beds, staff, equipment, queue]);

  const refreshData = () => {
    refetchBeds();
    refetchStaff();
    refetchEquipment();
    refetchQueue();
  };

  const isLoading = bedsLoading || staffLoading || equipmentLoading || queueLoading;

  return {
    beds,
    staff,
    equipment,
    queue,
    isLoading,
    lastUpdated,
    refreshData
  };
}