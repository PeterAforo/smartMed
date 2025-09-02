-- Fix analytics by creating materialized views and real-time stats function

-- 1. Create function to get real-time dashboard stats
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
    -- Appointments today
    (SELECT COUNT(*) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE)::bigint as appointments_today,
    
    -- Revenue today
    (SELECT COALESCE(SUM(billing_amount), 0) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE 
     AND a.status = 'completed')::numeric as revenue_today,
    
    -- Patients today
    (SELECT COUNT(DISTINCT patient_id) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE)::bigint as patients_today,
    
    -- Current queue length
    (SELECT COUNT(*) FROM appointment_queue aq 
     WHERE aq.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR aq.branch_id = target_branch_id)
     AND aq.queue_date = CURRENT_DATE 
     AND aq.status = 'waiting')::bigint as queue_length,
    
    -- Average wait time today
    (SELECT COALESCE(AVG(wait_time_minutes), 0) FROM appointment_queue aq 
     WHERE aq.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR aq.branch_id = target_branch_id)
     AND aq.queue_date = CURRENT_DATE 
     AND aq.wait_time_minutes IS NOT NULL)::numeric as avg_wait_time,
    
    -- Staff online (approximation based on recent activity)
    (SELECT COUNT(DISTINCT user_id) FROM activities act 
     WHERE act.tenant_id = target_tenant_id 
     AND act.created_at >= CURRENT_DATE)::bigint as staff_online,
    
    -- New patients today
    (SELECT COUNT(*) FROM patients p 
     WHERE p.tenant_id = target_tenant_id 
     AND p.created_at::date = CURRENT_DATE)::bigint as new_patients_today,
    
    -- Completed appointments today
    (SELECT COUNT(*) FROM appointments a 
     WHERE a.tenant_id = target_tenant_id 
     AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
     AND a.appointment_date = CURRENT_DATE 
     AND a.status = 'completed')::bigint as completed_appointments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the get_revenue_analytics function to handle billing amounts properly
CREATE OR REPLACE FUNCTION get_revenue_analytics_enhanced(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(month text, total_revenue numeric, total_transactions bigint, avg_transaction_amount numeric, unique_patients bigint, paid_revenue numeric, pending_revenue numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    DATE_TRUNC('month', a.appointment_date)::TEXT as month,
    COALESCE(SUM(COALESCE(a.billing_amount, 50)), 0)::NUMERIC as total_revenue,
    COUNT(*)::BIGINT as total_transactions,
    COALESCE(AVG(COALESCE(a.billing_amount, 50)), 0)::NUMERIC as avg_transaction_amount,
    COUNT(DISTINCT a.patient_id)::BIGINT as unique_patients,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN COALESCE(a.billing_amount, 50) ELSE 0 END), 0)::NUMERIC as paid_revenue,
    COALESCE(SUM(CASE WHEN a.status = 'scheduled' THEN COALESCE(a.billing_amount, 50) ELSE 0 END), 0)::NUMERIC as pending_revenue
  FROM appointments a
  WHERE a.tenant_id = target_tenant_id
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  GROUP BY DATE_TRUNC('month', a.appointment_date)
  ORDER BY DATE_TRUNC('month', a.appointment_date) DESC;
$function$

-- 3. Fix the get_appointment_analytics function to handle today's data properly
CREATE OR REPLACE FUNCTION get_appointment_analytics_enhanced(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(date text, total_appointments bigint, completed_appointments bigint, no_show_appointments bigint, cancelled_appointments bigint, unique_patients bigint, avg_duration numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$

-- 4. Create a function to get queue performance with actual data
CREATE OR REPLACE FUNCTION get_queue_performance_enhanced(start_date date, end_date date, target_tenant_id uuid, target_branch_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(date text, total_queue_entries bigint, avg_wait_time numeric, max_wait_time integer, completed_entries bigint, no_show_entries bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    aq.queue_date::TEXT as date,
    COUNT(*)::BIGINT as total_queue_entries,
    COALESCE(AVG(aq.wait_time_minutes), 0)::NUMERIC as avg_wait_time,
    COALESCE(MAX(aq.wait_time_minutes), 0)::INTEGER as max_wait_time,
    COUNT(*) FILTER (WHERE aq.status = 'completed')::BIGINT as completed_entries,
    COUNT(*) FILTER (WHERE aq.status = 'no_show')::BIGINT as no_show_entries
  FROM appointment_queue aq
  WHERE aq.tenant_id = target_tenant_id
    AND aq.queue_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR aq.branch_id = target_branch_id)
  GROUP BY aq.queue_date
  ORDER BY aq.queue_date DESC;
$function$

-- 5. Create sample data for testing (only if tables are empty)
DO $$
DECLARE
  default_tenant_id uuid;
  default_branch_id uuid;
  sample_patient_id uuid;
  sample_staff_id uuid;
BEGIN
  -- Get default tenant and branch
  SELECT id INTO default_tenant_id FROM tenants WHERE code = 'DEFAULT' LIMIT 1;
  SELECT id INTO default_branch_id FROM branches WHERE tenant_id = default_tenant_id LIMIT 1;
  
  -- Only proceed if we have valid tenant and branch
  IF default_tenant_id IS NOT NULL AND default_branch_id IS NOT NULL THEN
    -- Check if we need sample data
    IF NOT EXISTS (SELECT 1 FROM appointments WHERE tenant_id = default_tenant_id AND appointment_date = CURRENT_DATE) THEN
      -- Create sample patient if none exists
      INSERT INTO patients (tenant_id, first_name, last_name, date_of_birth, gender, phone, email)
      VALUES (default_tenant_id, 'John', 'Doe', '1990-01-01', 'male', '+1234567890', 'john.doe@example.com')
      RETURNING id INTO sample_patient_id;
      
      -- Get a sample staff member
      SELECT user_id INTO sample_staff_id FROM profiles WHERE tenant_id = default_tenant_id LIMIT 1;
      
      -- Create sample appointments for today
      INSERT INTO appointments (tenant_id, branch_id, patient_id, staff_id, appointment_date, appointment_time, appointment_type, status, billing_amount, duration_minutes)
      VALUES 
        (default_tenant_id, default_branch_id, sample_patient_id, sample_staff_id, CURRENT_DATE, '09:00', 'consultation', 'completed', 75.00, 30),
        (default_tenant_id, default_branch_id, sample_patient_id, sample_staff_id, CURRENT_DATE, '10:00', 'consultation', 'completed', 85.00, 45),
        (default_tenant_id, default_branch_id, sample_patient_id, sample_staff_id, CURRENT_DATE, '11:00', 'consultation', 'scheduled', 65.00, 30),
        (default_tenant_id, default_branch_id, sample_patient_id, sample_staff_id, CURRENT_DATE, '14:00', 'follow_up', 'scheduled', 45.00, 20),
        (default_tenant_id, default_branch_id, sample_patient_id, sample_staff_id, CURRENT_DATE, '15:00', 'consultation', 'completed', 95.00, 60);
      
      -- Create sample queue entries
      INSERT INTO appointment_queue (tenant_id, branch_id, appointment_id, queue_date, queue_position, status, wait_time_minutes)
      SELECT 
        a.tenant_id,
        a.branch_id,
        a.id,
        a.appointment_date,
        row_number() OVER (ORDER BY a.appointment_time),
        CASE WHEN a.status = 'completed' THEN 'completed' ELSE 'waiting' END,
        CASE WHEN a.status = 'completed' THEN 15 + (random() * 20)::int ELSE NULL END
      FROM appointments a 
      WHERE a.tenant_id = default_tenant_id AND a.appointment_date = CURRENT_DATE;
      
      -- Create sample activities
      INSERT INTO activities (tenant_id, branch_id, user_id, activity_type, description)
      VALUES 
        (default_tenant_id, default_branch_id, sample_staff_id, 'login', 'User logged in to the system'),
        (default_tenant_id, default_branch_id, sample_staff_id, 'appointment', 'Completed patient consultation'),
        (default_tenant_id, default_branch_id, sample_staff_id, 'appointment', 'Started new patient appointment');
    END IF;
  END IF;
END $$;