-- Enable RLS on analytics tables
ALTER TABLE public.analytics_appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_patient_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_queue_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_staff_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_appointment_types
CREATE POLICY "Admins can view appointment type analytics in their tenant" 
ON public.analytics_appointment_types 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for analytics_daily_appointments
CREATE POLICY "Admins can view daily appointment analytics in their tenant" 
ON public.analytics_daily_appointments 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for analytics_monthly_revenue
CREATE POLICY "Admins can view monthly revenue analytics in their tenant" 
ON public.analytics_monthly_revenue 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for analytics_patient_flow
CREATE POLICY "Admins can view patient flow analytics in their tenant" 
ON public.analytics_patient_flow 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for analytics_queue_performance
CREATE POLICY "Admins can view queue performance analytics in their tenant" 
ON public.analytics_queue_performance 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for analytics_staff_performance
CREATE POLICY "Admins can view staff performance analytics in their tenant" 
ON public.analytics_staff_performance 
FOR SELECT 
USING (
  (tenant_id = get_user_tenant_id()) AND 
  has_role(auth.uid(), 'admin'::app_role)
);