-- Fix security issues from analytics infrastructure
-- Convert views to SECURITY INVOKER and add search_path to functions

-- Recreate analytics views with SECURITY INVOKER
DROP VIEW IF EXISTS analytics_daily_appointments;
CREATE VIEW analytics_daily_appointments WITH (security_invoker = true) AS
SELECT 
  DATE(appointment_date) as date,
  branch_id,
  tenant_id,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_appointments,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
  AVG(duration_minutes) as avg_duration,
  COUNT(DISTINCT patient_id) as unique_patients,
  COUNT(CASE WHEN appointment_type = 'emergency' THEN 1 END) as emergency_appointments
FROM appointments
GROUP BY DATE(appointment_date), branch_id, tenant_id;

DROP VIEW IF EXISTS analytics_monthly_revenue;
CREATE VIEW analytics_monthly_revenue WITH (security_invoker = true) AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  branch_id,
  tenant_id,
  SUM(amount) as total_revenue,
  COUNT(*) as total_transactions,
  AVG(amount) as avg_transaction_amount,
  COUNT(DISTINCT patient_id) as unique_patients,
  SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_revenue,
  SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_revenue
FROM revenue
GROUP BY DATE_TRUNC('month', transaction_date), branch_id, tenant_id;

DROP VIEW IF EXISTS analytics_patient_flow;
CREATE VIEW analytics_patient_flow WITH (security_invoker = true) AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  branch_id,
  tenant_id,
  COUNT(*) as new_patients,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
  COUNT(CASE WHEN date_of_birth IS NOT NULL 
    AND DATE_PART('year', AGE(date_of_birth)) < 18 THEN 1 END) as pediatric_patients,
  COUNT(CASE WHEN date_of_birth IS NOT NULL 
    AND DATE_PART('year', AGE(date_of_birth)) >= 65 THEN 1 END) as senior_patients
FROM patients
GROUP BY DATE_TRUNC('month', created_at), branch_id, tenant_id;

DROP VIEW IF EXISTS analytics_staff_performance;
CREATE VIEW analytics_staff_performance WITH (security_invoker = true) AS
SELECT 
  a.staff_id,
  p.first_name || ' ' || p.last_name as staff_name,
  a.branch_id,
  a.tenant_id,
  DATE_TRUNC('month', a.appointment_date) as month,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  AVG(a.duration_minutes) as avg_appointment_duration,
  COUNT(DISTINCT a.patient_id) as unique_patients_served,
  COALESCE(SUM(r.amount), 0) as revenue_generated
FROM appointments a
LEFT JOIN profiles p ON p.user_id = a.staff_id
LEFT JOIN revenue r ON r.appointment_id = a.id
WHERE a.staff_id IS NOT NULL
GROUP BY a.staff_id, p.first_name, p.last_name, a.branch_id, a.tenant_id, DATE_TRUNC('month', a.appointment_date);

DROP VIEW IF EXISTS analytics_appointment_types;
CREATE VIEW analytics_appointment_types WITH (security_invoker = true) AS
SELECT 
  appointment_type,
  branch_id,
  tenant_id,
  DATE_TRUNC('month', appointment_date) as month,
  COUNT(*) as count,
  AVG(duration_minutes) as avg_duration,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM appointments
GROUP BY appointment_type, branch_id, tenant_id, DATE_TRUNC('month', appointment_date);

DROP VIEW IF EXISTS analytics_queue_performance;
CREATE VIEW analytics_queue_performance WITH (security_invoker = true) AS
SELECT 
  DATE(queue_date) as date,
  branch_id,
  tenant_id,
  COUNT(*) as total_queue_entries,
  AVG(wait_time_minutes) as avg_wait_time,
  MAX(wait_time_minutes) as max_wait_time,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_entries,
  COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_entries
FROM appointment_queue
WHERE wait_time_minutes IS NOT NULL
GROUP BY DATE(queue_date), branch_id, tenant_id;

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION get_appointment_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_appointments BIGINT,
  completed_appointments BIGINT,
  no_show_appointments BIGINT,
  cancelled_appointments BIGINT,
  unique_patients BIGINT,
  avg_duration NUMERIC
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    ada.date,
    ada.total_appointments,
    ada.completed_appointments,
    ada.no_show_appointments,
    ada.cancelled_appointments,
    ada.unique_patients,
    ada.avg_duration
  FROM analytics_daily_appointments ada
  WHERE ada.date BETWEEN start_date AND end_date
    AND ada.tenant_id = target_tenant_id
    AND (target_branch_id IS NULL OR ada.branch_id = target_branch_id)
  ORDER BY ada.date;
$$;

CREATE OR REPLACE FUNCTION get_revenue_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  month DATE,
  total_revenue NUMERIC,
  total_transactions BIGINT,
  avg_transaction_amount NUMERIC,
  unique_patients BIGINT,
  paid_revenue NUMERIC,
  pending_revenue NUMERIC
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    amr.month::DATE,
    amr.total_revenue,
    amr.total_transactions,
    amr.avg_transaction_amount,
    amr.unique_patients,
    amr.paid_revenue,
    amr.pending_revenue
  FROM analytics_monthly_revenue amr
  WHERE amr.month BETWEEN DATE_TRUNC('month', start_date) AND DATE_TRUNC('month', end_date)
    AND amr.tenant_id = target_tenant_id
    AND (target_branch_id IS NULL OR amr.branch_id = target_branch_id)
  ORDER BY amr.month;
$$;

CREATE OR REPLACE FUNCTION get_patient_flow_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  month DATE,
  new_patients BIGINT,
  active_patients BIGINT,
  pediatric_patients BIGINT,
  senior_patients BIGINT
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    apf.month::DATE,
    apf.new_patients,
    apf.active_patients,
    apf.pediatric_patients,
    apf.senior_patients
  FROM analytics_patient_flow apf
  WHERE apf.month BETWEEN DATE_TRUNC('month', start_date) AND DATE_TRUNC('month', end_date)
    AND apf.tenant_id = target_tenant_id
    AND (target_branch_id IS NULL OR apf.branch_id = target_branch_id)
  ORDER BY apf.month;
$$;