-- Enhanced Medical History & Records Tables
CREATE TABLE public.medical_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('lab_report', 'imaging', 'discharge_summary', 'consultation_note', 'insurance_document', 'consent_form', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  document_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.family_medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('mother', 'father', 'sibling', 'maternal_grandmother', 'maternal_grandfather', 'paternal_grandmother', 'paternal_grandfather', 'child', 'other')),
  condition_name TEXT NOT NULL,
  diagnosis_codes JSONB DEFAULT '[]',
  age_of_onset INTEGER,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'suspected', 'ruled_out')),
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.surgical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  procedure_name TEXT NOT NULL,
  procedure_code TEXT,
  surgery_date DATE NOT NULL,
  surgeon_name TEXT,
  hospital_name TEXT,
  complications TEXT,
  outcome TEXT DEFAULT 'successful' CHECK (outcome IN ('successful', 'complications', 'failed')),
  anesthesia_type TEXT,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.hospitalization_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE,
  hospital_name TEXT NOT NULL,
  department TEXT,
  attending_physician TEXT,
  primary_diagnosis TEXT NOT NULL,
  secondary_diagnoses JSONB DEFAULT '[]',
  admission_reason TEXT NOT NULL,
  discharge_summary TEXT,
  length_of_stay INTEGER,
  status TEXT DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'transferred')),
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clinical Workflow Tables
CREATE TABLE public.clinical_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID,
  workflow_name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('admission', 'discharge', 'consultation', 'follow_up', 'emergency', 'preventive_care', 'chronic_care', 'post_operative')),
  steps JSONB NOT NULL DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.workflow_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.clinical_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  protocol_name TEXT NOT NULL,
  specialty TEXT,
  condition_codes JSONB DEFAULT '[]',
  protocol_steps JSONB NOT NULL DEFAULT '[]',
  evidence_level TEXT DEFAULT 'B' CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  approved_by UUID,
  approval_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.workflow_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_instance_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'manual' CHECK (task_type IN ('manual', 'automatic', 'scheduled')),
  assigned_to UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  dependencies JSONB DEFAULT '[]',
  completion_notes TEXT,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.follow_up_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  appointment_id UUID,
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('routine', 'post_operative', 'chronic_care', 'test_results', 'medication_review', 'emergency')),
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Medical Documents
CREATE POLICY "Medical staff can manage medical documents in their branches"
ON public.medical_documents FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view medical documents in their tenant"
ON public.medical_documents FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Family Medical History
CREATE POLICY "Medical staff can manage family medical history"
ON public.family_medical_history FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view family medical history in their tenant"
ON public.family_medical_history FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Surgical History
CREATE POLICY "Medical staff can manage surgical history in their branches"
ON public.surgical_history FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view surgical history in their tenant"
ON public.surgical_history FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Hospitalization Records
CREATE POLICY "Medical staff can manage hospitalization records in their branches"
ON public.hospitalization_records FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view hospitalization records in their tenant"
ON public.hospitalization_records FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Clinical Workflows
CREATE POLICY "Medical staff can manage clinical workflows in their branches"
ON public.clinical_workflows FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id IS NULL OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view clinical workflows in their tenant"
ON public.clinical_workflows FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Workflow Instances
CREATE POLICY "Staff can manage workflow instances in their branches"
ON public.workflow_instances FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

CREATE POLICY "Users can view workflow instances in their tenant"
ON public.workflow_instances FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Clinical Protocols
CREATE POLICY "Medical staff can manage clinical protocols"
ON public.clinical_protocols FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view clinical protocols in their tenant"
ON public.clinical_protocols FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Workflow Tasks
CREATE POLICY "Staff can manage workflow tasks in their branches"
ON public.workflow_tasks FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

CREATE POLICY "Users can view workflow tasks in their tenant"
ON public.workflow_tasks FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- RLS Policies for Follow-up Schedules
CREATE POLICY "Staff can manage follow-up schedules in their branches"
ON public.follow_up_schedules FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

CREATE POLICY "Users can view follow-up schedules in their tenant"
ON public.follow_up_schedules FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Add triggers for updated_at
CREATE TRIGGER update_medical_documents_updated_at
  BEFORE UPDATE ON public.medical_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_medical_history_updated_at
  BEFORE UPDATE ON public.family_medical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgical_history_updated_at
  BEFORE UPDATE ON public.surgical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospitalization_records_updated_at
  BEFORE UPDATE ON public.hospitalization_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_workflows_updated_at
  BEFORE UPDATE ON public.clinical_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON public.workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_protocols_updated_at
  BEFORE UPDATE ON public.clinical_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_tasks_updated_at
  BEFORE UPDATE ON public.workflow_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_up_schedules_updated_at
  BEFORE UPDATE ON public.follow_up_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();