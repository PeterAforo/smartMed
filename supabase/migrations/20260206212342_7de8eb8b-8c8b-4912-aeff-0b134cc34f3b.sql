
-- =============================================
-- SMARTMED HOSPITAL MANAGEMENT SYSTEM
-- Complete Database Schema Migration (Fixed)
-- =============================================

-- Phase 1: Foundation - Enums and Core Tables
-- =============================================

CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'admin', 'manager', 'doctor', 'nurse', 'pharmacist',
  'radiologist', 'lab_technician', 'receptionist', 'cashier',
  'accountant', 'hr_officer', 'staff', 'viewer'
);

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  tenant_id UUID REFERENCES public.tenants(id),
  employee_id TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.user_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, branch_id)
);

-- Security Definer Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_cross_branch_access()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']::app_role[]);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    (NEW.raw_user_meta_data->>'tenant_id')::UUID
  );
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'staff', (NEW.raw_user_meta_data->>'tenant_id')::UUID);
  IF NEW.raw_user_meta_data->>'branch_id' IS NOT NULL THEN
    INSERT INTO public.user_branches (user_id, branch_id, is_primary)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'branch_id')::UUID, true);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Phase 2: Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'O')),
  phone TEXT, email TEXT, address TEXT, city TEXT, national_id TEXT, blood_type TEXT,
  allergies TEXT[], medical_conditions TEXT[],
  emergency_contact_name TEXT, emergency_contact_phone TEXT, emergency_contact_relationship TEXT,
  insurance_provider TEXT, insurance_policy_number TEXT, insurance_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
  notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, patient_number)
);

-- Phase 3: Clinical
CREATE TABLE public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  encounter_number TEXT NOT NULL,
  encounter_type TEXT NOT NULL CHECK (encounter_type IN ('OPD', 'IPD', 'ER')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  attending_staff UUID REFERENCES auth.users(id),
  location TEXT, chief_complaint TEXT, diagnoses TEXT[], notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, encounter_number)
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  encounter_id UUID REFERENCES public.encounters(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('lab', 'imaging', 'pharmacy', 'service', 'procedure')),
  order_code TEXT, order_name TEXT NOT NULL,
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'in_progress', 'completed', 'cancelled')),
  ordered_by UUID REFERENCES auth.users(id),
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  instructions TEXT, clinical_notes TEXT,
  charges JSONB DEFAULT '[]', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, order_number)
);

-- Phase 4: Results
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  order_id UUID REFERENCES public.orders(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  result_type TEXT DEFAULT 'lab' CHECK (result_type IN ('lab', 'imaging', 'pathology', 'other')),
  test_name TEXT NOT NULL,
  result_data JSONB DEFAULT '{}', reference_ranges JSONB DEFAULT '[]',
  status TEXT DEFAULT 'preliminary' CHECK (status IN ('preliminary', 'validated', 'amended', 'cancelled')),
  reported_by UUID REFERENCES auth.users(id),
  validated_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMPTZ DEFAULT now(), validated_at TIMESTAMPTZ,
  critical_flag BOOLEAN DEFAULT false, notes TEXT, attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.imaging_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  order_id UUID REFERENCES public.orders(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  modality TEXT NOT NULL, body_part TEXT, findings TEXT, impression TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reported')),
  performed_by UUID REFERENCES auth.users(id),
  reported_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ, reported_at TIMESTAMPTZ,
  images JSONB DEFAULT '[]', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 5: Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID REFERENCES auth.users(id),
  appointment_number TEXT,
  appointment_date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME,
  appointment_type TEXT DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'procedure', 'lab', 'imaging', 'telemedicine')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show')),
  reason TEXT, notes TEXT,
  is_recurring BOOLEAN DEFAULT false, recurrence_pattern JSONB,
  reminder_sent BOOLEAN DEFAULT false, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.appointment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  appointment_type TEXT, color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 6: Pharmacy
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL, generic_name TEXT, brand_name TEXT,
  dosage_form TEXT, strength TEXT, unit TEXT, category TEXT,
  requires_prescription BOOLEAN DEFAULT true,
  is_controlled BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  encounter_id UUID REFERENCES public.encounters(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  prescribed_by UUID REFERENCES auth.users(id),
  prescription_number TEXT,
  medication_id UUID REFERENCES public.medications(id),
  medication_name TEXT NOT NULL,
  dosage TEXT, frequency TEXT, duration TEXT, quantity INTEGER, route TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dispensed', 'cancelled', 'expired')),
  dispensed_by UUID REFERENCES auth.users(id), dispensed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 7: Inventory
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  item_code TEXT NOT NULL, item_name TEXT NOT NULL,
  category TEXT, subcategory TEXT, unit_of_measure TEXT,
  current_stock INTEGER DEFAULT 0, minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER, reorder_level INTEGER DEFAULT 10,
  unit_cost DECIMAL(12,2) DEFAULT 0, selling_price DECIMAL(12,2) DEFAULT 0,
  location TEXT, batch_number TEXT, expiry_date DATE,
  supplier_id UUID, is_active BOOLEAN DEFAULT true, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, branch_id, item_code)
);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  move_type TEXT NOT NULL CHECK (move_type IN ('in', 'out', 'transfer', 'adjustment')),
  quantity_change INTEGER NOT NULL,
  unit_cost DECIMAL(12,2), total_cost DECIMAL(12,2),
  reason TEXT, reference_type TEXT, reference_id TEXT,
  location_from TEXT, location_to TEXT,
  moved_by UUID REFERENCES auth.users(id),
  moved_at TIMESTAMPTZ NOT NULL DEFAULT now(), notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL, contact_person TEXT, phone TEXT, email TEXT, address TEXT,
  category TEXT, payment_terms TEXT, is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')),
  items JSONB DEFAULT '[]', total_amount DECIMAL(12,2) DEFAULT 0,
  ordered_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  ordered_at TIMESTAMPTZ, expected_delivery DATE, received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, po_number)
);

-- Phase 8: Finance
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  encounter_id UUID REFERENCES public.encounters(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  invoice_number TEXT NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(), due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid')),
  lines JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0, tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0, total_amount DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  invoice_id UUID REFERENCES public.invoices(id),
  patient_id UUID REFERENCES public.patients(id),
  payment_number TEXT,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'insurance', 'bank_transfer', 'cheque')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_number TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  received_by UUID REFERENCES auth.users(id), notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  invoice_id UUID REFERENCES public.invoices(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  payer_id TEXT, payer_name TEXT, claim_number TEXT,
  submission_date TIMESTAMPTZ,
  lines JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processing', 'paid', 'denied', 'partially_paid')),
  total_claimed DECIMAL(12,2) DEFAULT 0, total_approved DECIMAL(12,2), total_paid DECIMAL(12,2),
  remittance JSONB DEFAULT '[]', notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 9: Ward & Beds
CREATE TABLE public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  name TEXT NOT NULL, ward_type TEXT, capacity INTEGER DEFAULT 0,
  floor TEXT, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  ward_id UUID NOT NULL REFERENCES public.wards(id),
  bed_number TEXT NOT NULL,
  bed_type TEXT DEFAULT 'standard' CHECK (bed_type IN ('standard', 'icu', 'nicu', 'isolation', 'emergency', 'maternity')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  current_patient_id UUID REFERENCES public.patients(id),
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ward_id, bed_number)
);

CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  encounter_id UUID REFERENCES public.encounters(id),
  bed_id UUID REFERENCES public.beds(id),
  ward_id UUID REFERENCES public.wards(id),
  admission_number TEXT,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT now(), discharge_date TIMESTAMPTZ,
  admitting_doctor UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'admitted' CHECK (status IN ('admitted', 'transferred', 'discharged', 'deceased')),
  diagnosis TEXT, notes TEXT, discharge_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 10: Emergency
CREATE TABLE public.emergency_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID REFERENCES public.patients(id),
  patient_name TEXT,
  triage_level INTEGER CHECK (triage_level BETWEEN 1 AND 5),
  chief_complaint TEXT, vitals JSONB DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'triaged', 'in_treatment', 'admitted', 'discharged', 'transferred')),
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT now(), triage_time TIMESTAMPTZ, treatment_start TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id), notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 11: Surgery
CREATE TABLE public.theatres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  name TEXT NOT NULL, theatre_type TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'cleaning')),
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.surgeries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  encounter_id UUID REFERENCES public.encounters(id),
  theatre_id UUID REFERENCES public.theatres(id),
  surgery_number TEXT, procedure_name TEXT NOT NULL, procedure_code TEXT,
  surgeon_id UUID REFERENCES auth.users(id),
  anesthetist_id UUID REFERENCES auth.users(id),
  scheduled_date DATE, scheduled_start TIME, scheduled_end TIME,
  actual_start TIMESTAMPTZ, actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
  pre_op_notes TEXT, post_op_notes TEXT, complications TEXT,
  team_members JSONB DEFAULT '[]', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 12: HR
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  name TEXT NOT NULL, code TEXT,
  head_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  user_id UUID REFERENCES auth.users(id),
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT, phone TEXT,
  department_id UUID REFERENCES public.departments(id),
  position TEXT,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  hire_date DATE, termination_date DATE,
  salary DECIMAL(12,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated')),
  qualifications JSONB DEFAULT '[]', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, employee_number)
);

-- Phase 13: Notifications & Audit
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL, message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'alert')),
  category TEXT, is_read BOOLEAN DEFAULT false,
  action_url TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT,
  before_data JSONB, after_data JSONB,
  ip_address TEXT, user_agent TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 14: Obstetrics
CREATE TABLE public.pregnancy_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  gravida INTEGER, para INTEGER,
  lmp DATE, edd DATE, gestational_age_weeks INTEGER,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  blood_type TEXT, rh_factor TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'delivered', 'miscarriage', 'abortion', 'ectopic')),
  antenatal_visits JSONB DEFAULT '[]', complications TEXT[], notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 15: Telemedicine & Additional
CREATE TABLE public.telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID REFERENCES auth.users(id),
  session_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, duration_minutes INTEGER,
  notes TEXT, recording_url TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  encounter_id UUID REFERENCES public.encounters(id),
  recorded_by UUID REFERENCES auth.users(id),
  systolic_bp INTEGER, diastolic_bp INTEGER,
  heart_rate INTEGER, respiratory_rate INTEGER,
  temperature DECIMAL(5,2), oxygen_saturation DECIMAL(5,2),
  weight DECIMAL(6,2), height DECIMAL(5,2), bmi DECIMAL(5,2),
  pain_scale INTEGER CHECK (pain_scale BETWEEN 0 AND 10),
  notes TEXT, recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  encounter_id UUID REFERENCES public.encounters(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  author_id UUID REFERENCES auth.users(id),
  note_type TEXT DEFAULT 'progress' CHECK (note_type IN ('progress', 'admission', 'discharge', 'consultation', 'procedure', 'nursing')),
  subject TEXT, content TEXT NOT NULL,
  is_signed BOOLEAN DEFAULT false, signed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  record_type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
  data JSONB DEFAULT '{}', attachments JSONB DEFAULT '[]',
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID REFERENCES public.patients(id),
  submitted_by UUID REFERENCES auth.users(id),
  category TEXT, subject TEXT, message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT, responded_by UUID REFERENCES auth.users(id), responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  branch_id UUID REFERENCES public.branches(id),
  key TEXT NOT NULL, value JSONB NOT NULL,
  category TEXT, description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index for system_settings (tenant + branch + key)
CREATE UNIQUE INDEX idx_system_settings_unique ON public.system_settings (tenant_id, key) WHERE branch_id IS NULL;
CREATE UNIQUE INDEX idx_system_settings_branch_unique ON public.system_settings (tenant_id, branch_id, key) WHERE branch_id IS NOT NULL;

-- Updated_at Triggers
CREATE TRIGGER set_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_encounters_updated_at BEFORE UPDATE ON public.encounters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_lab_results_updated_at BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_imaging_results_updated_at BEFORE UPDATE ON public.imaging_results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_appointment_templates_updated_at BEFORE UPDATE ON public.appointment_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_wards_updated_at BEFORE UPDATE ON public.wards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_beds_updated_at BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_admissions_updated_at BEFORE UPDATE ON public.admissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_emergency_queue_updated_at BEFORE UPDATE ON public.emergency_queue FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_theatres_updated_at BEFORE UPDATE ON public.theatres FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_surgeries_updated_at BEFORE UPDATE ON public.surgeries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_pregnancy_records_updated_at BEFORE UPDATE ON public.pregnancy_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_telemedicine_sessions_updated_at BEFORE UPDATE ON public.telemedicine_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT TO authenticated
  USING (id = public.get_user_tenant(auth.uid()));

CREATE POLICY "Users can view tenant branches" ON public.branches FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));

CREATE POLICY "Users can view tenant profiles" ON public.profiles FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::app_role[]));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Users can view own branches" ON public.user_branches FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::app_role[]));
CREATE POLICY "Admins can manage user branches" ON public.user_branches FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Tenant access patients" ON public.patients FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access encounters" ON public.encounters FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access orders" ON public.orders FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access lab_results" ON public.lab_results FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access imaging_results" ON public.imaging_results FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access appointments" ON public.appointments FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access appointment_templates" ON public.appointment_templates FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access medications" ON public.medications FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access prescriptions" ON public.prescriptions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access inventory_items" ON public.inventory_items FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access stock_movements" ON public.stock_movements FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access purchase_orders" ON public.purchase_orders FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access invoices" ON public.invoices FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access payments" ON public.payments FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access insurance_claims" ON public.insurance_claims FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access wards" ON public.wards FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access beds" ON public.beds FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access admissions" ON public.admissions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access emergency_queue" ON public.emergency_queue FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access theatres" ON public.theatres FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access surgeries" ON public.surgeries FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access departments" ON public.departments FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access employees" ON public.employees FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access pregnancy_records" ON public.pregnancy_records FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access telemedicine_sessions" ON public.telemedicine_sessions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access vital_signs" ON public.vital_signs FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access clinical_notes" ON public.clinical_notes FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access medical_records" ON public.medical_records FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access feedback" ON public.feedback FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Tenant access system_settings" ON public.system_settings FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()));

CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant(auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::app_role[]));
CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant(auth.uid()));

-- Performance Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_branches_user_id ON public.user_branches(user_id);
CREATE INDEX idx_patients_tenant_branch ON public.patients(tenant_id, branch_id);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_patients_patient_number ON public.patients(patient_number);
CREATE INDEX idx_encounters_patient ON public.encounters(patient_id);
CREATE INDEX idx_encounters_tenant_branch ON public.encounters(tenant_id, branch_id);
CREATE INDEX idx_encounters_status ON public.encounters(status);
CREATE INDEX idx_orders_encounter ON public.orders(encounter_id);
CREATE INDEX idx_orders_patient ON public.orders(patient_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_type ON public.orders(order_type);
CREATE INDEX idx_lab_results_order ON public.lab_results(order_id);
CREATE INDEX idx_lab_results_patient ON public.lab_results(patient_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_encounter ON public.prescriptions(encounter_id);
CREATE INDEX idx_inventory_items_code ON public.inventory_items(item_code);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_invoices_encounter ON public.invoices(encounter_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_beds_ward ON public.beds(ward_id);
CREATE INDEX idx_beds_status ON public.beds(status);
CREATE INDEX idx_admissions_patient ON public.admissions(patient_id);
CREATE INDEX idx_emergency_queue_triage ON public.emergency_queue(triage_level);
CREATE INDEX idx_emergency_queue_status ON public.emergency_queue(status);
CREATE INDEX idx_surgeries_patient ON public.surgeries(patient_id);
CREATE INDEX idx_surgeries_date ON public.surgeries(scheduled_date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_vital_signs_patient ON public.vital_signs(patient_id);
CREATE INDEX idx_clinical_notes_encounter ON public.clinical_notes(encounter_id);
CREATE INDEX idx_clinical_notes_patient ON public.clinical_notes(patient_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
