-- Create patients table
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history JSONB DEFAULT '{}',
    allergies TEXT[],
    current_medications JSONB DEFAULT '[]',
    insurance_info JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(tenant_id, patient_number)
);

-- Create beds table
CREATE TABLE public.beds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    room_number TEXT,
    department TEXT,
    bed_type TEXT NOT NULL DEFAULT 'standard' CHECK (bed_type IN ('standard', 'icu', 'emergency', 'surgery', 'maternity')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    admitted_at TIMESTAMP WITH TIME ZONE,
    expected_discharge TIMESTAMP WITH TIME ZONE,
    daily_rate DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, branch_id, bed_number)
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT NOT NULL DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'surgery', 'lab_test', 'imaging')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT,
    notes TEXT,
    diagnosis JSONB DEFAULT '[]',
    treatment_plan TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    billing_amount DECIMAL(10,2) DEFAULT 0,
    insurance_claim_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create activities table for system logging
CREATE TABLE public.activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('patient_created', 'appointment_scheduled', 'appointment_completed', 'bed_assigned', 'bed_released', 'alert_created', 'alert_resolved', 'revenue_recorded', 'user_login', 'user_logout')),
    entity_type TEXT CHECK (entity_type IN ('patient', 'appointment', 'bed', 'alert', 'revenue', 'user')),
    entity_id UUID,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('critical', 'warning', 'info', 'emergency')),
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('patient', 'bed', 'staff', 'equipment', 'system')),
    entity_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    auto_resolve_at TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create revenue table
CREATE TABLE public.revenue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revenue_type TEXT NOT NULL CHECK (revenue_type IN ('consultation', 'procedure', 'medication', 'lab_test', 'imaging', 'bed_charges', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'insurance', 'bank_transfer', 'other')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'disputed')),
    invoice_number TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create AI insights table
CREATE TABLE public.ai_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('operational', 'financial', 'clinical', 'predictive', 'recommendation')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metrics JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_sources TEXT[] DEFAULT '{}',
    is_actionable BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    action_taken_by UUID REFERENCES auth.users(id),
    action_taken_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Users can view patients in their tenant" ON public.patients
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create patients in their branches" ON public.patients
FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() 
    AND branch_id = ANY(get_user_branch_ids())
);

CREATE POLICY "Users can update patients in their branches" ON public.patients
FOR UPDATE USING (
    tenant_id = get_user_tenant_id() 
    AND (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for beds
CREATE POLICY "Users can view beds in their tenant" ON public.beds
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage beds in their branches" ON public.beds
FOR ALL USING (
    tenant_id = get_user_tenant_id() 
    AND (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
    AND (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create RLS policies for appointments
CREATE POLICY "Users can view appointments in their tenant" ON public.appointments
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create appointments in their branches" ON public.appointments
FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() 
    AND branch_id = ANY(get_user_branch_ids())
);

CREATE POLICY "Users can update appointments in their branches" ON public.appointments
FOR UPDATE USING (
    tenant_id = get_user_tenant_id() 
    AND (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for activities
CREATE POLICY "Users can view activities in their tenant" ON public.activities
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "System can create activities" ON public.activities
FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

-- Create RLS policies for alerts
CREATE POLICY "Users can view alerts in their tenant" ON public.alerts
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage alerts in their branches" ON public.alerts
FOR ALL USING (
    tenant_id = get_user_tenant_id() 
    AND (has_cross_branch_access() OR branch_id IS NULL OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for revenue
CREATE POLICY "Users can view revenue in their tenant" ON public.revenue
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create revenue in their branches" ON public.revenue
FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() 
    AND branch_id = ANY(get_user_branch_ids())
);

-- Create RLS policies for AI insights
CREATE POLICY "Users can view AI insights in their tenant" ON public.ai_insights
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "System can manage AI insights" ON public.ai_insights
FOR ALL USING (tenant_id = get_user_tenant_id());

-- Add indexes for performance
CREATE INDEX idx_patients_tenant_branch ON public.patients(tenant_id, branch_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_beds_tenant_branch ON public.beds(tenant_id, branch_id);
CREATE INDEX idx_beds_status ON public.beds(status);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_staff ON public.appointments(staff_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_priority ON public.alerts(priority);
CREATE INDEX idx_revenue_date ON public.revenue(transaction_date);
CREATE INDEX idx_ai_insights_priority ON public.ai_insights(priority);

-- Add triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON public.beds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON public.revenue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON public.ai_insights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();