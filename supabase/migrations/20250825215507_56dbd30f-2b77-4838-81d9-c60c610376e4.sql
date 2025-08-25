-- Add vital_signs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  temperature NUMERIC,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation NUMERIC,
  height NUMERIC,
  weight NUMERIC,
  bmi NUMERIC,
  recorded_by UUID,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS if table was created
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vital_signs' 
    AND policyname = 'Medical staff can manage vital signs in their branches'
  ) THEN
    CREATE POLICY "Medical staff can manage vital signs in their branches"
    ON public.vital_signs FOR ALL
    USING (
      tenant_id = get_user_tenant_id() AND
      (has_cross_branch_access() OR branch_id = ANY(get_user_branch_ids())) AND
      (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse') OR has_role(auth.uid(), 'admin'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vital_signs' 
    AND policyname = 'Users can view vital signs in their tenant'
  ) THEN
    CREATE POLICY "Users can view vital signs in their tenant"
    ON public.vital_signs FOR SELECT
    USING (tenant_id = get_user_tenant_id());
  END IF;
END
$$;

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_vital_signs_updated_at'
  ) THEN
    CREATE TRIGGER update_vital_signs_updated_at
      BEFORE UPDATE ON public.vital_signs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;