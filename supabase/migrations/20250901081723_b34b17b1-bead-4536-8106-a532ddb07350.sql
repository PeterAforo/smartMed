-- Drop existing functions and recreate with correct signature
DROP FUNCTION IF EXISTS get_appointment_analytics(date, date, uuid, uuid);
DROP FUNCTION IF EXISTS get_revenue_analytics(date, date, uuid, uuid);  
DROP FUNCTION IF EXISTS get_patient_flow_analytics(date, date, uuid, uuid);

-- Insert some sample appointments and patients to show analytics data
-- First, ensure we have a branch and tenant
INSERT INTO appointments (
  tenant_id, branch_id, patient_id, staff_id, appointment_date, appointment_time,
  appointment_type, status, duration_minutes, billing_amount, created_at
) 
SELECT 
  b.tenant_id, b.id, gen_random_uuid(), gen_random_uuid(),
  CURRENT_DATE, '09:00'::time, 'consultation', 'completed', 30, 150.00, now()
FROM branches b LIMIT 1
UNION ALL
SELECT 
  b.tenant_id, b.id, gen_random_uuid(), gen_random_uuid(),
  CURRENT_DATE, '10:00'::time, 'consultation', 'completed', 45, 200.00, now()
FROM branches b LIMIT 1
UNION ALL  
SELECT 
  b.tenant_id, b.id, gen_random_uuid(), gen_random_uuid(),
  CURRENT_DATE, '11:00'::time, 'checkup', 'scheduled', 30, 100.00, now()
FROM branches b LIMIT 1;

-- Insert sample patients
INSERT INTO patients (
  tenant_id, first_name, last_name, patient_number, date_of_birth, created_at
)
SELECT 
  b.tenant_id, 'John', 'Doe', 'P001', '1990-01-01'::date, now()
FROM branches b LIMIT 1
UNION ALL
SELECT 
  b.tenant_id, 'Jane', 'Smith', 'P002', '1985-05-15'::date, now()
FROM branches b LIMIT 1
UNION ALL
SELECT 
  b.tenant_id, 'Bob', 'Johnson', 'P003', '2010-03-10'::date, now()
FROM branches b LIMIT 1;