-- Create security definer functions for analytics access

-- Function to get appointment type analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_appointment_type_analytics(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  month timestamp with time zone,
  appointment_type text,
  count bigint,
  completed_count bigint,
  avg_duration numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if user has admin role
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.month,
    a.appointment_type,
    a.count,
    a.completed_count,
    a.avg_duration
  FROM public.analytics_appointment_types a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;

-- Function to get daily appointments analytics (admin only)  
CREATE OR REPLACE FUNCTION public.get_daily_appointments_analytics(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  date date,
  total_appointments bigint,
  completed_appointments bigint,
  no_show_appointments bigint,
  cancelled_appointments bigint,
  unique_patients bigint,
  avg_duration numeric,
  emergency_appointments bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.date,
    a.total_appointments,
    a.completed_appointments,
    a.no_show_appointments,
    a.cancelled_appointments,
    a.unique_patients,
    a.avg_duration,
    a.emergency_appointments
  FROM public.analytics_daily_appointments a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;

-- Function to get monthly revenue analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_monthly_revenue_analytics(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  month timestamp with time zone,
  total_revenue numeric,
  total_transactions bigint,
  avg_transaction_amount numeric,
  unique_patients bigint,
  paid_revenue numeric,
  pending_revenue numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.month,
    a.total_revenue,
    a.total_transactions,
    a.avg_transaction_amount,
    a.unique_patients,
    a.paid_revenue,
    a.pending_revenue
  FROM public.analytics_monthly_revenue a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;

-- Function to get patient flow analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_patient_flow_analytics_secure(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  month timestamp with time zone,
  new_patients bigint,
  active_patients bigint,
  pediatric_patients bigint,
  senior_patients bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.month,
    a.new_patients,
    a.active_patients,
    a.pediatric_patients,
    a.senior_patients
  FROM public.analytics_patient_flow a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;

-- Function to get queue performance analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_queue_performance_analytics(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  date date,
  total_queue_entries bigint,
  completed_entries bigint,
  no_show_entries bigint,
  avg_wait_time numeric,
  max_wait_time integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.date,
    a.total_queue_entries,
    a.completed_entries,
    a.no_show_entries,
    a.avg_wait_time,
    a.max_wait_time
  FROM public.analytics_queue_performance a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;

-- Function to get staff performance analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_staff_performance_analytics(
  target_tenant_id uuid DEFAULT NULL,
  target_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  tenant_id uuid,
  branch_id uuid,
  staff_id uuid,
  staff_name text,
  month timestamp with time zone,
  total_appointments bigint,
  completed_appointments bigint,
  avg_appointment_duration numeric,
  unique_patients_served bigint,
  revenue_generated numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.staff_id,
    a.staff_name,
    a.month,
    a.total_appointments,
    a.completed_appointments,
    a.avg_appointment_duration,
    a.unique_patients_served,
    a.revenue_generated
  FROM public.analytics_staff_performance a
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND a.tenant_id = COALESCE(target_tenant_id, get_user_tenant_id())
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id);
$$;