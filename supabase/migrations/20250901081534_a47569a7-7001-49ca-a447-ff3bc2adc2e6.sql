-- Insert sample analytics data for demonstration
INSERT INTO analytics_daily_appointments (
  date, branch_id, tenant_id, total_appointments, completed_appointments, 
  no_show_appointments, cancelled_appointments, avg_duration, unique_patients, emergency_appointments
) VALUES 
  (CURRENT_DATE, (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 25, 18, 3, 2, 35.5, 16, 2),
  (CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 22, 19, 2, 1, 32.8, 18, 1),
  (CURRENT_DATE - INTERVAL '2 days', (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 28, 24, 2, 2, 38.2, 22, 3);

INSERT INTO analytics_monthly_revenue (
  month, branch_id, tenant_id, total_revenue, total_transactions, 
  avg_transaction_amount, unique_patients, paid_revenue, pending_revenue
) VALUES 
  (DATE_TRUNC('month', CURRENT_DATE), (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 45800, 156, 293.59, 124, 41200, 4600),
  (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 42300, 142, 297.89, 118, 39800, 2500);

INSERT INTO analytics_patient_flow (
  month, branch_id, tenant_id, new_patients, active_patients, pediatric_patients, senior_patients
) VALUES 
  (DATE_TRUNC('month', CURRENT_DATE), (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 28, 156, 34, 42),
  (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 24, 142, 31, 38);

INSERT INTO analytics_queue_performance (
  date, branch_id, tenant_id, total_queue_entries, avg_wait_time, 
  max_wait_time, completed_entries, no_show_entries
) VALUES 
  (CURRENT_DATE, (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 22, 1620, 3200, 18, 2),
  (CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 19, 1480, 2800, 16, 1),
  (CURRENT_DATE - INTERVAL '2 days', (SELECT id FROM branches LIMIT 1), (SELECT tenant_id FROM branches LIMIT 1), 25, 1750, 3600, 21, 3);

-- Create missing database functions for analytics
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
    ada.date::TEXT,
    ada.total_appointments,
    ada.completed_appointments,
    ada.no_show_appointments,
    ada.cancelled_appointments,
    ada.unique_patients,
    ada.avg_duration
  FROM analytics_daily_appointments ada
  WHERE ada.tenant_id = target_tenant_id
    AND ada.date BETWEEN start_date AND end_date
    AND (target_branch_id IS NULL OR ada.branch_id = target_branch_id)
  ORDER BY ada.date DESC;
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
    amr.month::TEXT,
    amr.total_revenue,
    amr.total_transactions,
    amr.avg_transaction_amount,
    amr.unique_patients,
    amr.paid_revenue,
    amr.pending_revenue
  FROM analytics_monthly_revenue amr
  WHERE amr.tenant_id = target_tenant_id
    AND amr.month BETWEEN DATE_TRUNC('month', start_date) AND DATE_TRUNC('month', end_date)
    AND (target_branch_id IS NULL OR amr.branch_id = target_branch_id)
  ORDER BY amr.month DESC;
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
    apf.month::TEXT,
    apf.new_patients,
    apf.active_patients,
    apf.pediatric_patients,
    apf.senior_patients
  FROM analytics_patient_flow apf
  WHERE apf.tenant_id = target_tenant_id
    AND apf.month BETWEEN DATE_TRUNC('month', start_date) AND DATE_TRUNC('month', end_date)
    AND (target_branch_id IS NULL OR apf.branch_id = target_branch_id)
  ORDER BY apf.month DESC;
$$;