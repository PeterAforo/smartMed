-- Safe sample data seeding for Phase 5 - Healthcare Management System
-- Only inserts data if it doesn't already exist

-- Create sample insurance providers (only if they don't exist)
INSERT INTO public.insurance_providers (tenant_id, name, code, contact_info, coverage_types) 
SELECT * FROM (VALUES 
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Blue Cross Blue Shield', 'BCBS', '{"phone": "+1-800-555-0123", "email": "provider@bcbs.com"}'::jsonb, '{"medical", "dental", "vision"}'::text[]),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Aetna Health', 'AETNA', '{"phone": "+1-800-555-0124", "email": "info@aetna.com"}'::jsonb, '{"medical", "prescription"}'::text[]),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'United Healthcare', 'UHC', '{"phone": "+1-800-555-0125", "email": "support@uhc.com"}'::jsonb, '{"medical", "mental_health"}'::text[]),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Cigna', 'CIGNA', '{"phone": "+1-800-555-0126", "email": "contact@cigna.com"}'::jsonb, '{"medical", "behavioral_health"}'::text[])
) AS v(tenant_id, name, code, contact_info, coverage_types)
WHERE NOT EXISTS (
    SELECT 1 FROM public.insurance_providers ip 
    WHERE ip.tenant_id = v.tenant_id AND ip.code = v.code
);

-- Create sample billing items (only if they don't exist)
INSERT INTO public.billing_items (tenant_id, branch_id, code, name, description, category, unit_price)
SELECT * FROM (VALUES
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'CONSULT-GEN', 'General Consultation', 'Standard consultation with general practitioner', 'consultation', 150.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'CONSULT-SPEC', 'Specialist Consultation', 'Consultation with medical specialist', 'consultation', 250.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'LAB-CBC', 'Complete Blood Count', 'Routine blood work analysis', 'laboratory', 45.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'LAB-LIPID', 'Lipid Panel', 'Cholesterol and triglyceride testing', 'laboratory', 65.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'XRAY-CHEST', 'Chest X-Ray', 'Standard chest radiography', 'imaging', 120.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-AMOXICILLIN', 'Amoxicillin 500mg', 'Antibiotic prescription', 'medication', 25.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'PROC-SUTURE', 'Wound Suturing', 'Minor surgical procedure', 'procedure', 180.00)
) AS v(tenant_id, branch_id, code, name, description, category, unit_price)
WHERE NOT EXISTS (
    SELECT 1 FROM public.billing_items bi 
    WHERE bi.tenant_id = v.tenant_id AND bi.code = v.code
);

-- Create sample lab tests catalog (only if they don't exist)
INSERT INTO public.lab_tests (tenant_id, test_code, test_name, category, description, normal_ranges, preparation_instructions, collection_method, processing_time_hours, cost)
SELECT * FROM (VALUES
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'CBC-001', 'Complete Blood Count', 'Hematology', 'Analysis of blood cells and components', '{"WBC": "4.5-11.0 K/uL", "RBC": "4.2-5.4 M/uL", "Hemoglobin": "12.0-15.5 g/dL"}'::jsonb, 'No special preparation required', 'Venipuncture', 2, 45.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'LIPID-001', 'Lipid Panel', 'Chemistry', 'Cholesterol and triglyceride analysis', '{"Total Cholesterol": "<200 mg/dL", "LDL": "<100 mg/dL", "HDL": ">40 mg/dL"}'::jsonb, 'Fast for 12 hours before test', 'Venipuncture', 4, 65.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'GLUCOSE-001', 'Fasting Glucose', 'Chemistry', 'Blood sugar level measurement', '{"Glucose": "70-100 mg/dL"}'::jsonb, 'Fast for 8 hours before test', 'Venipuncture', 1, 35.00),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'TSH-001', 'Thyroid Stimulating Hormone', 'Endocrinology', 'Thyroid function assessment', '{"TSH": "0.4-4.0 mIU/L"}'::jsonb, 'No special preparation required', 'Venipuncture', 24, 85.00)
) AS v(tenant_id, test_code, test_name, category, description, normal_ranges, preparation_instructions, collection_method, processing_time_hours, cost)
WHERE NOT EXISTS (
    SELECT 1 FROM public.lab_tests lt 
    WHERE lt.tenant_id = v.tenant_id AND lt.test_code = v.test_code
);

-- Create sample departments (only if they don't exist)
INSERT INTO public.departments (tenant_id, branch_id, name, code, description, location)
SELECT * FROM (VALUES
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Emergency Department', 'ED', 'Emergency medical services and trauma care', 'Ground Floor, Wing A'),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Internal Medicine', 'INTERNAL', 'General internal medicine services', 'Second Floor, Wing B'),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Cardiology', 'CARDIO', 'Heart and cardiovascular services', 'Third Floor, Wing C'),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Laboratory', 'LAB', 'Clinical laboratory services', 'Basement Level'),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Radiology', 'RAD', 'Medical imaging services', 'Ground Floor, Wing C')
) AS v(tenant_id, branch_id, name, code, description, location)
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments d 
    WHERE d.tenant_id = v.tenant_id AND d.branch_id = v.branch_id AND d.code = v.code
);

-- Create sample inventory items (only if they don't exist)
INSERT INTO public.inventory_items (tenant_id, branch_id, item_code, name, category, description, unit_of_measure, current_stock, minimum_stock, unit_cost, location, is_controlled)
SELECT * FROM (VALUES
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-AMOX500', 'Amoxicillin 500mg', 'Medication', 'Antibiotic tablets', 'bottle', 45, 10, 12.50, 'Pharmacy Storage A-12', true),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-IBUPROFEN', 'Ibuprofen 400mg', 'Medication', 'Anti-inflammatory tablets', 'bottle', 120, 25, 8.75, 'Pharmacy Storage A-15', false),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-SYRINGE', 'Disposable Syringes 5ml', 'Medical Supply', 'Single-use sterile syringes', 'box', 15, 5, 24.00, 'Supply Room B-3', false),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-GLOVES', 'Nitrile Examination Gloves', 'Medical Supply', 'Powder-free examination gloves', 'box', 30, 10, 18.50, 'Supply Room B-1', false),
    ((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-GAUZE', 'Sterile Gauze Pads 4x4', 'Medical Supply', 'Sterile wound dressing pads', 'pack', 75, 20, 5.25, 'Supply Room B-5', false)
) AS v(tenant_id, branch_id, item_code, name, category, description, unit_of_measure, current_stock, minimum_stock, unit_cost, location, is_controlled)
WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory_items ii 
    WHERE ii.tenant_id = v.tenant_id AND ii.item_code = v.item_code
);