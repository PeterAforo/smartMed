-- Advanced Prescription Management Tables
CREATE TABLE public.medication_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  medication_1 TEXT NOT NULL,
  medication_2 TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('major', 'moderate', 'minor', 'contraindicated')),
  severity_level INTEGER DEFAULT 3 CHECK (severity_level BETWEEN 1 AND 5),
  description TEXT NOT NULL,
  clinical_significance TEXT,
  management_recommendations TEXT,
  evidence_level TEXT DEFAULT 'B' CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(medication_1, medication_2, tenant_id)
);

CREATE TABLE public.prescription_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_prescription_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  renewal_type TEXT DEFAULT 'standard' CHECK (renewal_type IN ('standard', 'emergency', 'partial', 'modified')),
  requested_by UUID,
  approved_by UUID,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approval_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  reason_for_renewal TEXT,
  modifications JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.medication_adherence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  adherence_date DATE NOT NULL,
  doses_prescribed INTEGER NOT NULL,
  doses_taken INTEGER DEFAULT 0,
  adherence_percentage NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN doses_prescribed > 0 THEN (doses_taken::NUMERIC / doses_prescribed::NUMERIC) * 100 
      ELSE 0 
    END
  ) STORED,
  missed_doses INTEGER GENERATED ALWAYS AS (doses_prescribed - doses_taken) STORED,
  side_effects TEXT[],
  patient_reported_issues TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lab Results Enhancement Tables
CREATE TABLE public.lab_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  ordered_by UUID NOT NULL,
  ordering_physician TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  collection_date DATE,
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
  clinical_indication TEXT,
  fasting_required BOOLEAN DEFAULT false,
  patient_preparation TEXT,
  tests_ordered JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'collected', 'in_progress', 'completed', 'cancelled')),
  lab_facility TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Imaging Tables
CREATE TABLE public.imaging_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  study_uid TEXT UNIQUE,
  study_type TEXT NOT NULL CHECK (study_type IN ('x_ray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'nuclear_medicine', 'pet_scan', 'fluoroscopy')),
  body_part TEXT NOT NULL,
  study_date DATE NOT NULL,
  study_time TIME,
  modality TEXT NOT NULL,
  accession_number TEXT,
  referring_physician UUID,
  performing_physician TEXT,
  radiologist TEXT,
  indication TEXT NOT NULL,
  technique TEXT,
  findings TEXT,
  impression TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
  contrast_used BOOLEAN DEFAULT false,
  contrast_type TEXT,
  radiation_dose NUMERIC,
  image_count INTEGER DEFAULT 0,
  file_size_mb NUMERIC,
  storage_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.imaging_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  ordered_by UUID NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  scheduled_time TIME,
  study_type TEXT NOT NULL,
  body_part TEXT NOT NULL,
  clinical_indication TEXT NOT NULL,
  contrast_required BOOLEAN DEFAULT false,
  prep_instructions TEXT,
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('stat', 'urgent', 'routine')),
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  facility_name TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.imaging_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imaging_study_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  report_number TEXT NOT NULL,
  radiologist UUID,
  dictated_date DATE,
  transcribed_date DATE,
  report_status TEXT DEFAULT 'preliminary' CHECK (report_status IN ('preliminary', 'final', 'addendum', 'corrected')),
  clinical_history TEXT,
  technique TEXT,
  findings TEXT NOT NULL,
  impression TEXT NOT NULL,
  recommendations TEXT,
  critical_findings BOOLEAN DEFAULT false,
  critical_communicated_to TEXT,
  critical_communication_date TIMESTAMP WITH TIME ZONE,
  report_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.medication_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Medication Interactions
CREATE POLICY "Admins can manage medication interactions"
ON public.medication_interactions FOR ALL
USING (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Medical staff can view medication interactions"
ON public.medication_interactions FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Prescription Renewals
CREATE POLICY "Medical staff can manage prescription renewals in their branches"
ON public.prescription_renewals FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view prescription renewals in their tenant"
ON public.prescription_renewals FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Medication Adherence
CREATE POLICY "Medical staff can manage medication adherence in their tenant"
ON public.medication_adherence FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view medication adherence in their tenant"
ON public.medication_adherence FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Lab Orders
CREATE POLICY "Medical staff can manage lab orders in their branches"
ON public.lab_orders FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'lab_technician') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view lab orders in their tenant"
ON public.lab_orders FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Imaging Studies
CREATE POLICY "Medical staff can manage imaging studies in their branches"
ON public.imaging_studies FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'radiologist') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view imaging studies in their tenant"
ON public.imaging_studies FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Imaging Orders
CREATE POLICY "Medical staff can manage imaging orders in their branches"
ON public.imaging_orders FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'radiologist') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view imaging orders in their tenant"
ON public.imaging_orders FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Imaging Reports
CREATE POLICY "Medical staff can manage imaging reports in their tenant"
ON public.imaging_reports FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'radiologist') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view imaging reports in their tenant"
ON public.imaging_reports FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Add triggers for updated_at
CREATE TRIGGER update_medication_interactions_updated_at
  BEFORE UPDATE ON public.medication_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescription_renewals_updated_at
  BEFORE UPDATE ON public.prescription_renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_adherence_updated_at
  BEFORE UPDATE ON public.medication_adherence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
  BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_studies_updated_at
  BEFORE UPDATE ON public.imaging_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_orders_updated_at
  BEFORE UPDATE ON public.imaging_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_reports_updated_at
  BEFORE UPDATE ON public.imaging_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();