-- Fix function search path security warning
CREATE OR REPLACE FUNCTION get_realtime_dashboard_stats(target_tenant_id uuid, target_branch_id uuid DEFAULT NULL)
RETURNS TABLE(
  appointments_today bigint,
  revenue_today numeric,
  patients_today bigint,
  queue_length bigint,
  avg_wait_time numeric,
  staff_online bigint,
  new_patients_today bigint,
  completed_appointments bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE)::bigint,
    
    (SELECT COALESCE(SUM(billing_amount), 0) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE 
     AND a.status = 'completed')::numeric,
    
    (SELECT COUNT(DISTINCT patient_id) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE)::bigint,
    
    (SELECT COUNT(*) FROM appointment_queue aq 
     WHERE aq.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR aq.branch_id = target_branch_id)
     AND aq.queue_date = CURRENT_DATE 
     AND aq.status = 'waiting')::bigint,
    
    (SELECT COALESCE(AVG(wait_time_minutes), 0) FROM appointment_queue aq 
     WHERE aq.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR aq.branch_id = target_branch_id)
     AND aq.queue_date = CURRENT_DATE 
     AND aq.wait_time_minutes IS NOT NULL)::numeric,
    
    (SELECT COUNT(DISTINCT user_id) FROM activities act 
     WHERE act.tenant_id = target_tenant_id 
     AND act.created_at >= CURRENT_DATE)::bigint,
    
    (SELECT COUNT(*) FROM patients p 
     WHERE p.tenant_id = target_tenant_id 
     AND p.created_at::date = CURRENT_DATE)::bigint,
    
    (SELECT COUNT(*) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE 
     AND a.status = 'completed')::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;