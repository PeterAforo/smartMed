-- Security Hardening Migration
-- This migration addresses critical security vulnerabilities identified in the security scan

-- 1. Fix Function Search Path Security Issues
-- Update all security definer functions to have immutable search_path

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role AND ur.tenant_id = rp.tenant_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
 RETURNS TABLE(permission_name text, resource text, action text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT DISTINCT p.name, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role AND ur.tenant_id = rp.tenant_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.update_webhook_success_rate(webhook_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  UPDATE public.webhook_endpoints 
  SET success_rate = (
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE response_status BETWEEN 200 AND 299)::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0.0
    END
    FROM public.webhook_deliveries 
    WHERE webhook_endpoint_id = webhook_id 
    AND created_at > now() - INTERVAL '30 days'
  ),
  last_delivery_at = (
    SELECT MAX(delivered_at) 
    FROM public.webhook_deliveries 
    WHERE webhook_endpoint_id = webhook_id 
    AND response_status BETWEEN 200 AND 299
  ),
  updated_at = now()
  WHERE id = webhook_id;
$$;

CREATE OR REPLACE FUNCTION public.get_appointment_analytics(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(date text, total_appointments bigint, completed_appointments bigint, no_show_appointments bigint, cancelled_appointments bigint, unique_patients bigint, avg_duration numeric)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    a.appointment_date::TEXT as date,
    COUNT(*)::BIGINT as total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT as completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT as no_show_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT as cancelled_appointments,
    COUNT(DISTINCT a.patient_id)::BIGINT as unique_patients,
    COALESCE(AVG(a.duration_minutes), 30)::NUMERIC as avg_duration
  FROM appointments a
  WHERE a.tenant_id = target_tenant_id
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  GROUP BY a.appointment_date
  ORDER BY a.appointment_date DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_revenue_analytics(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(month text, total_revenue numeric, total_transactions bigint, avg_transaction_amount numeric, unique_patients bigint, paid_revenue numeric, pending_revenue numeric)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    DATE_TRUNC('month', a.appointment_date)::TEXT as month,
    COALESCE(SUM(a.billing_amount), 0)::NUMERIC as total_revenue,
    COUNT(*)::BIGINT as total_transactions,
    COALESCE(AVG(a.billing_amount), 0)::NUMERIC as avg_transaction_amount,
    COUNT(DISTINCT a.patient_id)::BIGINT as unique_patients,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN a.billing_amount ELSE 0 END), 0)::NUMERIC as paid_revenue,
    COALESCE(SUM(CASE WHEN a.status = 'scheduled' THEN a.billing_amount ELSE 0 END), 0)::NUMERIC as pending_revenue
  FROM appointments a
  WHERE a.tenant_id = target_tenant_id
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  GROUP BY DATE_TRUNC('month', a.appointment_date)
  ORDER BY DATE_TRUNC('month', a.appointment_date) DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_patient_flow_analytics(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(month text, new_patients bigint, active_patients bigint, pediatric_patients bigint, senior_patients bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    DATE_TRUNC('month', p.created_at)::TEXT as month,
    COUNT(DISTINCT p.id)::BIGINT as new_patients,
    COUNT(DISTINCT CASE WHEN EXISTS(
      SELECT 1 FROM appointments a2 
      WHERE a2.patient_id = p.id 
      AND a2.appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
    ) THEN p.id END)::BIGINT as active_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(COALESCE(p.date_of_birth, CURRENT_DATE - INTERVAL '30 years'))) < 18 THEN p.id END)::BIGINT as pediatric_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(COALESCE(p.date_of_birth, CURRENT_DATE - INTERVAL '30 years'))) >= 65 THEN p.id END)::BIGINT as senior_patients
  FROM patients p
  WHERE p.tenant_id = target_tenant_id
    AND p.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY DATE_TRUNC('month', p.created_at)
  ORDER BY DATE_TRUNC('month', p.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_branch_ids()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT ARRAY_AGG(branch_id) 
  FROM public.user_branches 
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_cross_branch_access()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    AND ur.tenant_id = p.tenant_id
    AND ur.branch_id IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, employee_id, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT'))
  );
  
  -- Assign default role (admin for first user, otherwise receptionist)
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::app_role
      ELSE 'receptionist'::app_role
    END,
    COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT'))
  );
  
  -- Associate user with primary branch
  INSERT INTO public.user_branches (user_id, branch_id, is_primary)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'branch_id')::uuid,
      (SELECT id FROM public.branches WHERE tenant_id = COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT')) LIMIT 1)
    ),
    true
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  
 SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Secure Analytics Tables - Add RLS policies to prevent business intelligence theft
ALTER TABLE public.analytics_appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_patient_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_queue_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_staff_performance ENABLE ROW LEVEL SECURITY;

-- Analytics tables should only be accessible to admin users within their tenant
CREATE POLICY "Admins can view analytics_appointment_types in their tenant"
ON public.analytics_appointment_types
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view analytics_daily_appointments in their tenant"
ON public.analytics_daily_appointments
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view analytics_monthly_revenue in their tenant"
ON public.analytics_monthly_revenue
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view analytics_patient_flow in their tenant"
ON public.analytics_patient_flow
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view analytics_queue_performance in their tenant"
ON public.analytics_queue_performance
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view analytics_staff_performance in their tenant"
ON public.analytics_staff_performance
FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Secure User Roles Table - Prevent Role Escalation Attacks
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view roles in their tenant
CREATE POLICY "Users can view roles in their tenant"
ON public.user_roles
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Only admins can assign roles, and users cannot modify their own roles
CREATE POLICY "Admins can manage user roles (not their own)"
ON public.user_roles
FOR ALL
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
  AND user_id != auth.uid()  -- Critical: Prevent self-role modification
)
WITH CHECK (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
  AND user_id != auth.uid()  -- Critical: Prevent self-role modification
);

-- 4. Secure Scheduled Jobs Table - Prevent System Configuration Exposure
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  job_name text NOT NULL,
  job_type text NOT NULL,
  schedule text NOT NULL,
  is_active boolean DEFAULT true,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Only admins can access scheduled jobs configuration
CREATE POLICY "Admins can manage scheduled jobs in their tenant"
ON public.scheduled_jobs
FOR ALL
USING (
  tenant_id = get_user_tenant_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Audit Trail for Security Events
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role assignment/removal in audit trail
  INSERT INTO public.audit_events (
    tenant_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    event_id,
    actor_type,
    metadata
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    auth.uid(),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'ROLE_ASSIGNED'
      WHEN TG_OP = 'UPDATE' THEN 'ROLE_MODIFIED'
      WHEN TG_OP = 'DELETE' THEN 'ROLE_REMOVED'
    END,
    'user_role',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    gen_random_uuid()::text,
    'user',
    jsonb_build_object(
      'operation', TG_OP,
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role, OLD.role)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_roles;
CREATE TRIGGER audit_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- 6. Additional Security Measures
-- Create function to check if user is trying to escalate their own privileges
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent users from modifying their own roles
  IF NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles for security reasons';  
  END IF;
  
  -- Prevent non-admins from assigning admin roles
  IF NEW.role = 'admin'::app_role AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent privilege escalation
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.user_roles;
CREATE TRIGGER prevent_role_escalation
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_privilege_escalation();