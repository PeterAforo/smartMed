-- Enable RLS on all analytics tables and add tenant-based policies

-- Enable RLS on analytics tables
ALTER TABLE analytics_daily_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_patient_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_queue_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_appointment_types ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_daily_appointments
CREATE POLICY "Users can view daily appointments analytics in their tenant"
ON analytics_daily_appointments
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for analytics_monthly_revenue
CREATE POLICY "Users can view monthly revenue analytics in their tenant"
ON analytics_monthly_revenue
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for analytics_patient_flow
CREATE POLICY "Users can view patient flow analytics in their tenant"
ON analytics_patient_flow
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for analytics_queue_performance
CREATE POLICY "Users can view queue performance analytics in their tenant"
ON analytics_queue_performance
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for analytics_staff_performance
CREATE POLICY "Users can view staff performance analytics in their tenant"
ON analytics_staff_performance
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for analytics_appointment_types
CREATE POLICY "Users can view appointment types analytics in their tenant"
ON analytics_appointment_types
FOR SELECT
USING (tenant_id = get_user_tenant_id());