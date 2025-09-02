-- Populate analytics tables with actual data and improve real-time performance

-- 1. Create function to populate queue performance analytics
CREATE OR REPLACE FUNCTION populate_queue_performance_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_queue_performance;
  
  -- Populate with actual data from appointment_queue
  INSERT INTO analytics_queue_performance (
    tenant_id,
    branch_id,
    date,
    total_queue_entries,
    completed_entries,
    no_show_entries,
    avg_wait_time,
    max_wait_time
  )
  SELECT 
    aq.tenant_id,
    aq.branch_id,
    aq.queue_date as date,
    COUNT(*) as total_queue_entries,
    COUNT(*) FILTER (WHERE aq.status = 'completed') as completed_entries,
    COUNT(*) FILTER (WHERE aq.status = 'no_show') as no_show_entries,
    COALESCE(AVG(aq.wait_time_minutes), 0) as avg_wait_time,
    COALESCE(MAX(aq.wait_time_minutes), 0) as max_wait_time
  FROM appointment_queue aq
  WHERE aq.queue_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY aq.tenant_id, aq.branch_id, aq.queue_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to populate staff performance analytics
CREATE OR REPLACE FUNCTION populate_staff_performance_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_staff_performance;
  
  -- Populate with actual data from appointments and profiles
  INSERT INTO analytics_staff_performance (
    tenant_id,
    branch_id,
    staff_id,
    staff_name,
    month,
    total_appointments,
    completed_appointments,
    avg_appointment_duration,
    unique_patients_served,
    revenue_generated
  )
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.staff_id,
    COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Staff') as staff_name,
    DATE_TRUNC('month', a.appointment_date) as month,
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed') as completed_appointments,
    COALESCE(AVG(a.duration_minutes), 30) as avg_appointment_duration,
    COUNT(DISTINCT a.patient_id) as unique_patients_served,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN a.billing_amount ELSE 0 END), 0) as revenue_generated
  FROM appointments a
  LEFT JOIN profiles p ON a.staff_id = p.user_id
  WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '12 months'
    AND a.staff_id IS NOT NULL
  GROUP BY a.tenant_id, a.branch_id, a.staff_id, p.first_name, p.last_name, DATE_TRUNC('month', a.appointment_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to populate appointment type analytics
CREATE OR REPLACE FUNCTION populate_appointment_type_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_appointment_types;
  
  -- Populate with actual data from appointments
  INSERT INTO analytics_appointment_types (
    tenant_id,
    branch_id,
    month,
    appointment_type,
    count,
    completed_count,
    avg_duration
  )
  SELECT 
    a.tenant_id,
    a.branch_id,
    DATE_TRUNC('month', a.appointment_date) as month,
    a.appointment_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE a.status = 'completed') as completed_count,
    COALESCE(AVG(a.duration_minutes), 30) as avg_duration
  FROM appointments a
  WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY a.tenant_id, a.branch_id, DATE_TRUNC('month', a.appointment_date), a.appointment_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to populate daily appointments analytics
CREATE OR REPLACE FUNCTION populate_daily_appointments_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_daily_appointments;
  
  -- Populate with actual data from appointments
  INSERT INTO analytics_daily_appointments (
    tenant_id,
    branch_id,
    date,
    total_appointments,
    completed_appointments,
    no_show_appointments,
    cancelled_appointments,
    unique_patients,
    avg_duration,
    emergency_appointments
  )
  SELECT 
    a.tenant_id,
    a.branch_id,
    a.appointment_date as date,
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed') as completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show') as no_show_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled_appointments,
    COUNT(DISTINCT a.patient_id) as unique_patients,
    COALESCE(AVG(a.duration_minutes), 30) as avg_duration,
    COUNT(*) FILTER (WHERE a.appointment_type = 'emergency') as emergency_appointments
  FROM appointments a
  WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY a.tenant_id, a.branch_id, a.appointment_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to populate monthly revenue analytics
CREATE OR REPLACE FUNCTION populate_monthly_revenue_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_monthly_revenue;
  
  -- Populate with actual data from appointments
  INSERT INTO analytics_monthly_revenue (
    tenant_id,
    branch_id,
    month,
    total_revenue,
    total_transactions,
    avg_transaction_amount,
    unique_patients,
    paid_revenue,
    pending_revenue
  )
  SELECT 
    a.tenant_id,
    a.branch_id,
    DATE_TRUNC('month', a.appointment_date) as month,
    COALESCE(SUM(a.billing_amount), 0) as total_revenue,
    COUNT(*) as total_transactions,
    COALESCE(AVG(a.billing_amount), 0) as avg_transaction_amount,
    COUNT(DISTINCT a.patient_id) as unique_patients,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN a.billing_amount ELSE 0 END), 0) as paid_revenue,
    COALESCE(SUM(CASE WHEN a.status = 'scheduled' THEN a.billing_amount ELSE 0 END), 0) as pending_revenue
  FROM appointments a
  WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '12 months'
    AND a.billing_amount IS NOT NULL
  GROUP BY a.tenant_id, a.branch_id, DATE_TRUNC('month', a.appointment_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to populate patient flow analytics
CREATE OR REPLACE FUNCTION populate_patient_flow_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_patient_flow;
  
  -- Populate with actual data from patients
  INSERT INTO analytics_patient_flow (
    tenant_id,
    branch_id,
    month,
    new_patients,
    active_patients,
    pediatric_patients,
    senior_patients
  )
  SELECT 
    p.tenant_id,
    b.id as branch_id,
    DATE_TRUNC('month', p.created_at) as month,
    COUNT(DISTINCT p.id) as new_patients,
    COUNT(DISTINCT CASE WHEN EXISTS(
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = p.id 
      AND a.appointment_date >= DATE_TRUNC('month', p.created_at)
      AND a.appointment_date < DATE_TRUNC('month', p.created_at) + INTERVAL '1 month'
    ) THEN p.id END) as active_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(COALESCE(p.date_of_birth, CURRENT_DATE - INTERVAL '30 years'))) < 18 THEN p.id END) as pediatric_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(COALESCE(p.date_of_birth, CURRENT_DATE - INTERVAL '30 years'))) >= 65 THEN p.id END) as senior_patients
  FROM patients p
  CROSS JOIN branches b
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '12 months'
    AND b.tenant_id = p.tenant_id
  GROUP BY p.tenant_id, b.id, DATE_TRUNC('month', p.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get real-time dashboard stats
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

-- 8. Run all population functions to fill analytics tables
SELECT populate_queue_performance_analytics();
SELECT populate_staff_performance_analytics();
SELECT populate_appointment_type_analytics();
SELECT populate_daily_appointments_analytics();
SELECT populate_monthly_revenue_analytics();
SELECT populate_patient_flow_analytics();

-- 9. Create trigger to automatically update analytics when appointments change
CREATE OR REPLACE FUNCTION refresh_analytics_on_appointment_change()
RETURNS trigger AS $$
BEGIN
  -- Refresh relevant analytics tables when appointments are modified
  PERFORM populate_daily_appointments_analytics();
  PERFORM populate_monthly_revenue_analytics();
  PERFORM populate_staff_performance_analytics();
  
  -- Only refresh queue analytics if the appointment has queue data
  IF EXISTS (SELECT 1 FROM appointment_queue WHERE appointment_id = COALESCE(NEW.id, OLD.id)) THEN
    PERFORM populate_queue_performance_analytics();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS appointment_analytics_refresh ON appointments;
CREATE TRIGGER appointment_analytics_refresh
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION refresh_analytics_on_appointment_change();