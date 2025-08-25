-- Create multi-tenant, multi-branch architecture

-- Create tenants table (hospitals/organizations)
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Create user-branch associations table
CREATE TABLE public.user_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, branch_id)
);

-- Add tenant_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Update user_roles to include tenant and branch context
ALTER TABLE public.user_roles 
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_branches ENABLE ROW LEVEL SECURITY;

-- Create helper functions for tenant/branch access

-- Get current user's tenant ID
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get current user's accessible branch IDs
CREATE OR REPLACE FUNCTION public.get_user_branch_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(branch_id) 
  FROM public.user_branches 
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has cross-branch access (admin role at tenant level)
CREATE OR REPLACE FUNCTION public.has_cross_branch_access()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    AND ur.tenant_id = p.tenant_id
    AND ur.branch_id IS NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS Policies for tenants
CREATE POLICY "Users can view their tenant" 
ON public.tenants FOR SELECT 
USING (id = public.get_user_tenant_id());

-- RLS Policies for branches
CREATE POLICY "Users can view branches in their tenant" 
ON public.branches FOR SELECT 
USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for user_branches
CREATE POLICY "Users can view their own branch associations" 
ON public.user_branches FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage branch associations in their tenant" 
ON public.user_branches FOR ALL 
USING (
  branch_id IN (
    SELECT id FROM public.branches 
    WHERE tenant_id = public.get_user_tenant_id()
  ) 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Update profiles RLS to include tenant filtering
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles FOR SELECT 
USING (tenant_id = public.get_user_tenant_id());

-- Update user_roles RLS to include tenant filtering
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles in their tenant" 
ON public.user_roles FOR ALL 
USING (
  tenant_id = public.get_user_tenant_id() 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view roles in their tenant" 
ON public.user_roles FOR SELECT 
USING (
  user_id = auth.uid() 
  OR (tenant_id = public.get_user_tenant_id() AND public.has_role(auth.uid(), 'admin'::app_role))
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default tenant and branch for existing data migration
INSERT INTO public.tenants (name, code, description) 
VALUES ('Default Hospital', 'DEFAULT', 'Default tenant for existing users');

INSERT INTO public.branches (tenant_id, name, code, address) 
VALUES (
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT'),
  'Main Branch',
  'MAIN',
  'Main Hospital Campus'
);

-- Update existing profiles to belong to default tenant
UPDATE public.profiles 
SET tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT')
WHERE tenant_id IS NULL;

-- Associate existing users with default branch
INSERT INTO public.user_branches (user_id, branch_id, is_primary)
SELECT p.user_id, b.id, true
FROM public.profiles p
CROSS JOIN public.branches b
WHERE b.code = 'MAIN'
AND p.user_id IS NOT NULL
ON CONFLICT (user_id, branch_id) DO NOTHING;

-- Update existing user roles to include tenant context
UPDATE public.user_roles 
SET tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT')
WHERE tenant_id IS NULL;