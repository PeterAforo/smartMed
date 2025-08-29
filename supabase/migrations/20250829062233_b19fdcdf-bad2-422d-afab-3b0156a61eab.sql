-- Create encounters table - central entity for visit/episode tracking
CREATE TABLE public.encounters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_number TEXT NOT NULL,
  encounter_type TEXT NOT NULL CHECK (encounter_type IN ('OPD', 'IPD', 'ER')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  attending_staff UUID,
  location TEXT,
  chief_complaint TEXT,
  diagnoses JSONB DEFAULT '[]'::jsonb,
  linked_orders UUID[],
  linked_invoices UUID[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table - unified ordering system for lab/imaging/pharmacy/services
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('lab', 'imaging', 'pharmacy', 'service', 'procedure')),
  order_code TEXT NOT NULL,
  order_name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
  status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'in_progress', 'completed', 'cancelled')),
  ordered_by UUID NOT NULL,
  ordered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  clinical_notes TEXT,
  charges JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create results table - unified results system linking back to orders
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  order_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  result_type TEXT NOT NULL CHECK (result_type IN ('lab', 'imaging', 'pathology', 'other')),
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  reference_ranges JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'preliminary' CHECK (status IN ('preliminary', 'validated', 'amended', 'cancelled')),
  reported_by UUID,
  validated_by UUID,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  critical_flag BOOLEAN DEFAULT false,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_moves table - inventory transaction tracking
CREATE TABLE public.stock_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  item_id UUID NOT NULL,
  batch_id UUID,
  move_type TEXT NOT NULL CHECK (move_type IN ('in', 'out', 'transfer', 'adjustment')),
  quantity_change INTEGER NOT NULL,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  reason TEXT NOT NULL CHECK (reason IN ('order_dispense', 'receive', 'transfer', 'adjustment', 'return', 'expired')),
  reference_type TEXT,
  reference_id UUID,
  location_from TEXT,
  location_to TEXT,
  moved_by UUID NOT NULL,
  moved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_events table - immutable event store with tamper-evident hashing
CREATE TABLE public.audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID,
  event_id TEXT NOT NULL UNIQUE,
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hash_chain TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_encounters_patient_id ON public.encounters(patient_id);
CREATE INDEX idx_encounters_tenant_branch ON public.encounters(tenant_id, branch_id);
CREATE INDEX idx_encounters_status_type ON public.encounters(status, encounter_type);

CREATE INDEX idx_orders_encounter_id ON public.orders(encounter_id);
CREATE INDEX idx_orders_patient_id ON public.orders(patient_id);
CREATE INDEX idx_orders_tenant_branch ON public.orders(tenant_id, branch_id);
CREATE INDEX idx_orders_type_status ON public.orders(order_type, status);

CREATE INDEX idx_results_order_id ON public.results(order_id);
CREATE INDEX idx_results_patient_id ON public.results(patient_id);
CREATE INDEX idx_results_tenant_branch ON public.results(tenant_id, branch_id);
CREATE INDEX idx_results_status ON public.results(status);

CREATE INDEX idx_stock_moves_item_id ON public.stock_moves(item_id);
CREATE INDEX idx_stock_moves_tenant_branch ON public.stock_moves(tenant_id, branch_id);
CREATE INDEX idx_stock_moves_reference ON public.stock_moves(reference_type, reference_id);

CREATE INDEX idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_actor ON public.audit_events(actor_id);
CREATE INDEX idx_audit_events_tenant ON public.audit_events(tenant_id);
CREATE INDEX idx_audit_events_timestamp ON public.audit_events(event_timestamp);

-- Enable Row Level Security
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for encounters
CREATE POLICY "Users can view encounters in their tenant" 
ON public.encounters FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage encounters in their branches" 
ON public.encounters FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create RLS policies for orders
CREATE POLICY "Users can view orders in their tenant" 
ON public.orders FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage orders in their branches" 
ON public.orders FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create RLS policies for results
CREATE POLICY "Users can view results in their tenant" 
ON public.results FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Medical staff can manage results in their branches" 
ON public.results FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
  (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'lab_tech'::app_role) OR has_role(auth.uid(), 'radiologist'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create RLS policies for stock_moves
CREATE POLICY "Users can view stock moves in their tenant" 
ON public.stock_moves FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage stock moves in their branches" 
ON public.stock_moves FOR ALL 
USING (
  tenant_id = get_user_tenant_id() AND 
  (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids()))
);

-- Create RLS policies for audit_events (read-only for most users)
CREATE POLICY "Users can view audit events in their tenant" 
ON public.audit_events FOR SELECT 
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "System can insert audit events" 
ON public.audit_events FOR INSERT 
WITH CHECK (tenant_id = get_user_tenant_id());

-- Create triggers for updated_at columns
CREATE TRIGGER update_encounters_updated_at
BEFORE UPDATE ON public.encounters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
BEFORE UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_moves_updated_at
BEFORE UPDATE ON public.stock_moves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();