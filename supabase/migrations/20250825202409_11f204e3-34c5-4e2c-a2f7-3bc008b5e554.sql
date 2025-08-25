-- Enable real-time updates for appointment tables
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_queue REPLICA IDENTITY FULL;
ALTER TABLE public.room_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_reminders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_reminders;