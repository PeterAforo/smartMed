-- Fix remaining security warning: Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, employee_id, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT'))
  );
  
  -- Assign default role (admin for first user, otherwise receptionist)
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::app_role
      ELSE 'receptionist'::app_role
    END,
    COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT'))
  );
  
  -- Associate user with primary branch
  INSERT INTO public.user_branches (user_id, branch_id, is_primary)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'branch_id')::uuid,
      (SELECT id FROM public.branches WHERE tenant_id = COALESCE((NEW.raw_user_meta_data ->> 'tenant_id')::uuid, (SELECT id FROM public.tenants WHERE code = 'DEFAULT')) LIMIT 1)
    ),
    true
  );
  
  RETURN NEW;
END;
$$;