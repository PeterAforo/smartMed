-- Fix security warnings: Update functions to set search_path parameter

-- Update get_user_tenant_id function
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update get_user_branch_ids function
CREATE OR REPLACE FUNCTION public.get_user_branch_ids()
RETURNS UUID[] 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(branch_id) 
  FROM public.user_branches 
  WHERE user_id = auth.uid();
$$;

-- Update has_cross_branch_access function
CREATE OR REPLACE FUNCTION public.has_cross_branch_access()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    AND ur.tenant_id = p.tenant_id
    AND ur.branch_id IS NULL
  );
$$;

-- Update has_role function to set search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;