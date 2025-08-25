-- Create appointment templates table
CREATE TABLE public.appointment_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  appointment_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  default_instructions TEXT,
  color_code TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment series table for recurring appointments
CREATE TABLE public.appointment_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  template_id UUID REFERENCES public.appointment_templates(id),
  series_name TEXT NOT NULL,
  recurrence_pattern TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  total_appointments INTEGER,
  appointments_created INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment queue table
CREATE TABLE public.appointment_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  queue_date DATE NOT NULL,
  queue_position INTEGER NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  estimated_start_time TIMESTAMP WITH TIME ZONE,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'in-progress', 'completed', 'no-show'
  wait_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment reminders table
CREATE TABLE public.appointment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  reminder_type TEXT NOT NULL, -- 'sms', 'email'
  reminder_time TEXT NOT NULL, -- '24h', '2h', '30m'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  message_content TEXT,
  delivery_status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room bookings table for resource scheduling
CREATE TABLE public.room_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  room_name TEXT NOT NULL,
  room_type TEXT, -- 'consultation', 'procedure', 'surgery'
  equipment_required JSONB DEFAULT '[]',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked', -- 'booked', 'in-use', 'completed', 'cancelled'
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN template_id UUID REFERENCES public.appointment_templates(id),
ADD COLUMN series_id UUID REFERENCES public.appointment_series(id),
ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN estimated_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN reminder_preferences JSONB DEFAULT '{"sms": {"enabled": true, "times": ["24h", "2h"]}, "email": {"enabled": true, "times": ["24h"]}}';

-- Add reminder preferences to patients table
ALTER TABLE public.patients 
ADD COLUMN reminder_preferences JSONB DEFAULT '{"sms": {"enabled": true, "phone": null}, "email": {"enabled": true}}';

-- Enable RLS on new tables
ALTER TABLE public.appointment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointment_templates
CREATE POLICY "Users can view templates in their tenant" 
ON public.appointment_templates FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage templates in their branches" 
ON public.appointment_templates FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for appointment_series
CREATE POLICY "Users can view series in their tenant" 
ON public.appointment_series FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage series in their branches" 
ON public.appointment_series FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for appointment_queue
CREATE POLICY "Users can view queue in their tenant" 
ON public.appointment_queue FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage queue in their branches" 
ON public.appointment_queue FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for appointment_reminders
CREATE POLICY "Users can view reminders in their tenant" 
ON public.appointment_reminders FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "System can manage reminders" 
ON public.appointment_reminders FOR ALL 
USING (tenant_id = get_user_tenant_id());

-- Create RLS policies for room_bookings
CREATE POLICY "Users can view bookings in their tenant" 
ON public.room_bookings FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage bookings in their branches" 
ON public.room_bookings FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_appointment_templates_updated_at
BEFORE UPDATE ON public.appointment_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_series_updated_at
BEFORE UPDATE ON public.appointment_series
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_queue_updated_at
BEFORE UPDATE ON public.appointment_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_reminders_updated_at
BEFORE UPDATE ON public.appointment_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at
BEFORE UPDATE ON public.room_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default appointment templates
INSERT INTO public.appointment_templates (tenant_id, branch_id, template_name, appointment_type, duration_minutes, description, color_code) 
SELECT 
  t.id as tenant_id,
  b.id as branch_id,
  'Standard Consultation' as template_name,
  'consultation' as appointment_type,
  30 as duration_minutes,
  'Standard medical consultation' as description,
  '#3B82F6' as color_code
FROM public.tenants t
CROSS JOIN public.branches b
WHERE t.id = b.tenant_id;

INSERT INTO public.appointment_templates (tenant_id, branch_id, template_name, appointment_type, duration_minutes, description, color_code) 
SELECT 
  t.id as tenant_id,
  b.id as branch_id,
  'Follow-up Visit' as template_name,
  'follow-up' as appointment_type,
  15 as duration_minutes,
  'Follow-up appointment for existing patients' as description,
  '#10B981' as color_code
FROM public.tenants t
CROSS JOIN public.branches b
WHERE t.id = b.tenant_id;

INSERT INTO public.appointment_templates (tenant_id, branch_id, template_name, appointment_type, duration_minutes, description, color_code) 
SELECT 
  t.id as tenant_id,
  b.id as branch_id,
  'Procedure' as template_name,
  'procedure' as appointment_type,
  60 as duration_minutes,
  'Medical procedure appointment' as description,
  '#F59E0B' as color_code
FROM public.tenants t
CROSS JOIN public.branches b
WHERE t.id = b.tenant_id;