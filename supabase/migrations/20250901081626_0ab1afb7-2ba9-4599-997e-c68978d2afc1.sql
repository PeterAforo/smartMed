-- Create the missing analytics functions that the useAnalytics hook expects
CREATE OR REPLACE FUNCTION get_appointment_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
) RETURNS TABLE (
  date TEXT,
  total_appointments BIGINT,
  completed_appointments BIGINT,
  no_show_appointments BIGINT,
  cancelled_appointments BIGINT,
  unique_patients BIGINT,
  avg_duration NUMERIC
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    a.appointment_date::TEXT as date,
    COUNT(*)::BIGINT as total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT as completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT as no_show_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT as cancelled_appointments,
    COUNT(DISTINCT a.patient_id)::BIGINT as unique_patients,
    AVG(a.duration_minutes)::NUMERIC as avg_duration
  FROM appointments a
  WHERE a.tenant_id = target_tenant_id
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  GROUP BY a.appointment_date
  ORDER BY a.appointment_date DESC;
$$;

CREATE OR REPLACE FUNCTION get_revenue_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
) RETURNS TABLE (
  month TEXT,
  total_revenue NUMERIC,
  total_transactions BIGINT,
  avg_transaction_amount NUMERIC,
  unique_patients BIGINT,
  paid_revenue NUMERIC,
  pending_revenue NUMERIC
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    DATE_TRUNC('month', a.appointment_date)::TEXT as month,
    SUM(COALESCE(a.billing_amount, 0))::NUMERIC as total_revenue,
    COUNT(*)::BIGINT as total_transactions,
    AVG(COALESCE(a.billing_amount, 0))::NUMERIC as avg_transaction_amount,
    COUNT(DISTINCT a.patient_id)::BIGINT as unique_patients,
    SUM(CASE WHEN a.status = 'completed' THEN COALESCE(a.billing_amount, 0) ELSE 0 END)::NUMERIC as paid_revenue,
    SUM(CASE WHEN a.status = 'scheduled' THEN COALESCE(a.billing_amount, 0) ELSE 0 END)::NUMERIC as pending_revenue
  FROM appointments a
  WHERE a.tenant_id = target_tenant_id
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  GROUP BY DATE_TRUNC('month', a.appointment_date)
  ORDER BY DATE_TRUNC('month', a.appointment_date) DESC;
$$;

CREATE OR REPLACE FUNCTION get_patient_flow_analytics(
  start_date DATE,
  end_date DATE,
  target_tenant_id UUID,
  target_branch_id UUID DEFAULT NULL
) RETURNS TABLE (
  month TEXT,
  new_patients BIGINT,
  active_patients BIGINT,
  pediatric_patients BIGINT,
  senior_patients BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    DATE_TRUNC('month', p.created_at)::TEXT as month,
    COUNT(DISTINCT p.id)::BIGINT as new_patients,
    COUNT(DISTINCT CASE WHEN a.appointment_date >= DATE_TRUNC('month', CURRENT_DATE) THEN p.id END)::BIGINT as active_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(p.date_of_birth)) < 18 THEN p.id END)::BIGINT as pediatric_patients,
    COUNT(DISTINCT CASE WHEN EXTRACT(year FROM age(p.date_of_birth)) >= 65 THEN p.id END)::BIGINT as senior_patients
  FROM patients p
  LEFT JOIN appointments a ON p.id = a.patient_id 
    AND a.appointment_date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR a.branch_id = target_branch_id)
  WHERE p.tenant_id = target_tenant_id
    AND p.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY DATE_TRUNC('month', p.created_at)
  ORDER BY DATE_TRUNC('month', p.created_at) DESC;
$$;