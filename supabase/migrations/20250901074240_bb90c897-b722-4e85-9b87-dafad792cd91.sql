-- Create workflow automation rules table
CREATE TABLE public.workflow_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow SLA configs table
CREATE TABLE public.workflow_sla_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID,
  workflow_type TEXT NOT NULL,
  sla_name TEXT NOT NULL,
  target_duration_hours INTEGER NOT NULL DEFAULT 24,
  warning_threshold_hours INTEGER NOT NULL DEFAULT 20,
  escalation_rules JSONB DEFAULT '[]',
  notification_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_sla_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_automation_rules
CREATE POLICY "Medical staff can manage automation rules in their branches" 
ON public.workflow_automation_rules 
FOR ALL 
USING (
  tenant_id = get_user_tenant_id() 
  AND (has_cross_branch_access() OR branch_id IS NULL OR branch_id = ANY(get_user_branch_ids()))
  AND (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can view automation rules in their tenant" 
ON public.workflow_automation_rules 
FOR SELECT 
USING (tenant_id = get_user_tenant_id());

-- Create RLS policies for workflow_sla_configs  
CREATE POLICY "Medical staff can manage SLA configs in their branches" 
ON public.workflow_sla_configs 
FOR ALL 
USING (
  tenant_id = get_user_tenant_id() 
  AND (has_cross_branch_access() OR branch_id IS NULL OR branch_id = ANY(get_user_branch_ids()))
  AND (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can view SLA configs in their tenant" 
ON public.workflow_sla_configs 
FOR SELECT 
USING (tenant_id = get_user_tenant_id());

-- Add triggers for updated_at
CREATE TRIGGER update_workflow_automation_rules_updated_at
  BEFORE UPDATE ON public.workflow_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_sla_configs_updated_at
  BEFORE UPDATE ON public.workflow_sla_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();