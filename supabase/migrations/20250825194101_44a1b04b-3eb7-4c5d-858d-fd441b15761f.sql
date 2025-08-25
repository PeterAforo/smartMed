-- Phase 5: Complete Database & Data Structure Implementation
-- Medical Records & Clinical Data Tables

-- Medical records table for patient medical history
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  record_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  diagnosis_codes JSONB DEFAULT '[]'::jsonb,
  treatment_plan TEXT,
  follow_up_notes TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'inactive')),
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescriptions for medication management
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  appointment_id UUID,
  medical_record_id UUID,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER,
  instructions TEXT,
  prescribed_by UUID NOT NULL,
  pharmacy_info JSONB DEFAULT '{}'::jsonb,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  refills_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lab results for diagnostic testing
CREATE TABLE public.lab_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  appointment_id UUID,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  reference_ranges JSONB DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  ordered_by UUID NOT NULL,
  performed_by UUID,
  reviewed_by UUID,
  report_url TEXT,
  notes TEXT,
  critical_values BOOLEAN DEFAULT false,
  ordered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vital signs tracking
CREATE TABLE public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  appointment_id UUID,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  recorded_by UUID NOT NULL,
  temperature DECIMAL(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  bmi DECIMAL(4,1),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient allergies
CREATE TABLE public.patient_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  allergen TEXT NOT NULL,
  allergy_type TEXT NOT NULL CHECK (allergy_type IN ('medication', 'food', 'environmental', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
  reaction_symptoms TEXT[],
  onset_date DATE,
  notes TEXT,
  verified_by UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Billing & Insurance System
CREATE TABLE public.insurance_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}'::jsonb,
  coverage_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  subscriber_name TEXT NOT NULL,
  subscriber_relationship TEXT DEFAULT 'self',
  effective_date DATE NOT NULL,
  expiry_date DATE,
  copay_amount DECIMAL(10,2) DEFAULT 0,
  deductible_amount DECIMAL(10,2) DEFAULT 0,
  coverage_details JSONB DEFAULT '{}'::jsonb,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.billing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  appointment_id UUID,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_terms TEXT DEFAULT '30_days',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  billing_item_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'check', 'bank_transfer', 'insurance', 'other')),
  amount DECIMAL(10,2) NOT 

NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  processed_by UUID,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  insurance_policy_id UUID NOT NULL,
  invoice_id UUID,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  claim_number TEXT NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_date DATE NOT NULL,
  claim_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'denied', 'paid')),
  denial_reason TEXT,
  notes TEXT,
  submitted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, claim_number)
);

-- Laboratory & Diagnostic Management
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  test_code TEXT NOT NULL,
  test_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  normal_ranges JSONB DEFAULT '{}'::jsonb,
  preparation_instructions TEXT,
  collection_method TEXT,
  processing_time_hours INTEGER DEFAULT 24,
  cost DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, test_code)
);

CREATE TABLE public.diagnostic_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  procedure_code TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preparation_instructions TEXT,
  duration_minutes INTEGER DEFAULT 30,
  equipment_required TEXT[],
  cost DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, procedure_code)
);

-- Staff & Resource Management
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  head_of_department UUID,
  location TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, branch_id, code)
);

CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  department_id UUID,
  equipment_code TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  maintenance_schedule JSONB DEFAULT '{}'::jsonb,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, equipment_code)
);

CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit_of_measure TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  maximum_stock INTEGER,
  unit_cost DECIMAL(10,2),
  supplier_info JSONB DEFAULT '{}'::jsonb,
  expiry_date DATE,
  batch_number TEXT,
  location TEXT,
  is_controlled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, item_code)
);

CREATE TABLE public.staff_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  department_id UUID,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT DEFAULT 'regular' CHECK (shift_type IN ('regular', 'overtime', 'on_call', 'holiday')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant-based access
CREATE POLICY "Users can view medical records in their tenant" ON public.medical_records
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage medical records in their branches" ON public.medical_records
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view prescriptions in their tenant" ON public.prescriptions
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage prescriptions in their branches" ON public.prescriptions
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view lab results in their tenant" ON public.lab_results
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage lab results in their branches" ON public.lab_results
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'lab_technician'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view vital signs in their tenant" ON public.vital_signs
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage vital signs in their branches" ON public.vital_signs
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view patient allergies in their tenant" ON public.patient_allergies
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage patient allergies" ON public.patient_allergies
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view insurance providers in their tenant" ON public.insurance_providers
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage insurance providers" ON public.insurance_providers
  FOR ALL USING (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view insurance policies in their tenant" ON public.insurance_policies
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage insurance policies in their tenant" ON public.insurance_policies
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can view billing items in their tenant" ON public.billing_items
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins and billing staff can manage billing items" ON public.billing_items
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'billing'::app_role))
  );

CREATE POLICY "Users can view invoices in their tenant" ON public.invoices
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage invoices in their branches" ON public.invoices
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

CREATE POLICY "Users can view invoice items in their tenant" ON public.invoice_items
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage invoice items in their tenant" ON public.invoice_items
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can view payments in their tenant" ON public.payments
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage payments in their branches" ON public.payments
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

CREATE POLICY "Users can view insurance claims in their tenant" ON public.insurance_claims
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage insurance claims in their branches" ON public.insurance_claims
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

CREATE POLICY "Users can view lab tests in their tenant" ON public.lab_tests
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage lab tests" ON public.lab_tests
  FOR ALL USING (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view diagnostic procedures in their tenant" ON public.diagnostic_procedures
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage diagnostic procedures in their branches" ON public.diagnostic_procedures
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can view departments in their tenant" ON public.departments
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage departments in their branches" ON public.departments
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can view equipment in their tenant" ON public.equipment
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage equipment in their branches" ON public.equipment
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

CREATE POLICY "Users can view inventory items in their tenant" ON public.inventory_items
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage inventory items in their branches" ON public.inventory_items
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

CREATE POLICY "Users can view staff schedules in their tenant" ON public.staff_schedules
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage schedules in their branches" ON public.staff_schedules
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
  );

-- Create indexes for performance optimization
CREATE INDEX idx_medical_records_patient_tenant ON public.medical_records(patient_id, tenant_id);
CREATE INDEX idx_medical_records_branch_status ON public.medical_records(branch_id, status);
CREATE INDEX idx_medical_records_record_type ON public.medical_records(record_type, created_at DESC);

CREATE INDEX idx_prescriptions_patient_tenant ON public.prescriptions(patient_id, tenant_id);
CREATE INDEX idx_prescriptions_status_dates ON public.prescriptions(status, start_date, end_date);
CREATE INDEX idx_prescriptions_prescribed_by ON public.prescriptions(prescribed_by, created_at DESC);

CREATE INDEX idx_lab_results_patient_tenant ON public.lab_results(patient_id, tenant_id);
CREATE INDEX idx_lab_results_status_dates ON public.lab_results(status, ordered_at DESC);
CREATE INDEX idx_lab_results_test_type ON public.lab_results(test_type, completed_at DESC);

CREATE INDEX idx_vital_signs_patient_recorded ON public.vital_signs(patient_id, recorded_at DESC);
CREATE INDEX idx_vital_signs_appointment ON public.vital_signs(appointment_id);

CREATE INDEX idx_invoices_patient_tenant ON public.invoices(patient_id, tenant_id);
CREATE INDEX idx_invoices_status_dates ON public.invoices(status, issue_date DESC);
CREATE INDEX idx_invoices_branch_status ON public.invoices(branch_id, status);
CREATE INDEX idx_payments_invoice_date ON public.payments(invoice_id, payment_date DESC);
CREATE INDEX idx_insurance_claims_patient_status ON public.insurance_claims(patient_id, status);

CREATE INDEX idx_staff_schedules_staff_date ON public.staff_schedules(staff_id, shift_date);
CREATE INDEX idx_staff_schedules_branch_date ON public.staff_schedules(branch_id, shift_date);
CREATE INDEX idx_equipment_branch_status ON public.equipment(branch_id, status);
CREATE INDEX idx_inventory_branch_stock ON public.inventory_items(branch_id, current_stock);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON public.lab_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_allergies_updated_at
  BEFORE UPDATE ON public.patient_allergies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_providers_updated_at
  BEFORE UPDATE ON public.insurance_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_items_updated_at
  BEFORE UPDATE ON public.billing_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_tests_updated_at
  BEFORE UPDATE ON public.lab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostic_procedures_updated_at
  BEFORE UPDATE ON public.diagnostic_procedures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_schedules_updated_at
  BEFORE UPDATE ON public.staff_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();