-- Sample data seeding for Phase 5 - Healthcare Management System
-- Note: This creates realistic test data for development and testing

-- First, create sample insurance providers
INSERT INTO public.insurance_providers (tenant_id, name, code, contact_info, coverage_types) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Blue Cross Blue Shield', 'BCBS', '{"phone": "+1-800-555-0123", "email": "provider@bcbs.com"}', '{"medical", "dental", "vision"}'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Aetna Health', 'AETNA', '{"phone": "+1-800-555-0124", "email": "info@aetna.com"}', '{"medical", "prescription"}'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'United Healthcare', 'UHC', '{"phone": "+1-800-555-0125", "email": "support@uhc.com"}', '{"medical", "mental_health"}'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'Cigna', 'CIGNA', '{"phone": "+1-800-555-0126", "email": "contact@cigna.com"}', '{"medical", "behavioral_health"}');

-- Create sample billing items
INSERT INTO public.billing_items (tenant_id, branch_id, code, name, description, category, unit_price) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'CONSULT-GEN', 'General Consultation', 'Standard consultation with general practitioner', 'consultation', 150.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'CONSULT-SPEC', 'Specialist Consultation', 'Consultation with medical specialist', 'consultation', 250.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'LAB-CBC', 'Complete Blood Count', 'Routine blood work analysis', 'laboratory', 45.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'LAB-LIPID', 'Lipid Panel', 'Cholesterol and triglyceride testing', 'laboratory', 65.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'XRAY-CHEST', 'Chest X-Ray', 'Standard chest radiography', 'imaging', 120.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-AMOXICILLIN', 'Amoxicillin 500mg', 'Antibiotic prescription', 'medication', 25.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'PROC-SUTURE', 'Wound Suturing', 'Minor surgical procedure', 'procedure', 180.00);

-- Create sample lab tests catalog
INSERT INTO public.lab_tests (tenant_id, test_code, test_name, category, description, normal_ranges, preparation_instructions, collection_method, processing_time_hours, cost) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'CBC-001', 'Complete Blood Count', 'Hematology', 'Analysis of blood cells and components', '{"WBC": "4.5-11.0 K/uL", "RBC": "4.2-5.4 M/uL", "Hemoglobin": "12.0-15.5 g/dL"}', 'No special preparation required', 'Venipuncture', 2, 45.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'LIPID-001', 'Lipid Panel', 'Chemistry', 'Cholesterol and triglyceride analysis', '{"Total Cholesterol": "<200 mg/dL", "LDL": "<100 mg/dL", "HDL": ">40 mg/dL"}', 'Fast for 12 hours before test', 'Venipuncture', 4, 65.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'GLUCOSE-001', 'Fasting Glucose', 'Chemistry', 'Blood sugar level measurement', '{"Glucose": "70-100 mg/dL"}', 'Fast for 8 hours before test', 'Venipuncture', 1, 35.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), 'TSH-001', 'Thyroid Stimulating Hormone', 'Endocrinology', 'Thyroid function assessment', '{"TSH": "0.4-4.0 mIU/L"}', 'No special preparation required', 'Venipuncture', 24, 85.00);

-- Create sample diagnostic procedures
INSERT INTO public.diagnostic_procedures (tenant_id, branch_id, procedure_code, procedure_name, category, description, preparation_instructions, duration_minutes, equipment_required, cost) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'XRAY-CHEST', 'Chest X-Ray', 'Radiology', 'Standard chest radiography for lung assessment', 'Remove all metal objects and jewelry', 15, '{"X-ray machine", "Lead aprons", "Film cassettes"}', 120.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'ECG-12LEAD', '12-Lead ECG', 'Cardiology', 'Electrocardiogram for heart rhythm analysis', 'No special preparation required', 10, '{"ECG machine", "Electrodes", "Conductive gel"}', 75.00),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'ULTRASOUND-ABD', 'Abdominal Ultrasound', 'Radiology', 'Ultrasonic imaging of abdominal organs', 'Fast for 8 hours, drink water before exam', 45, '{"Ultrasound machine", "Ultrasound gel", "Probe"}', 200.00);

-- Create sample departments
INSERT INTO public.departments (tenant_id, branch_id, name, code, description, location) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Emergency Department', 'ED', 'Emergency medical services and trauma care', 'Ground Floor, Wing A'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Internal Medicine', 'INTERNAL', 'General internal medicine services', 'Second Floor, Wing B'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Cardiology', 'CARDIO', 'Heart and cardiovascular services', 'Third Floor, Wing C'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Laboratory', 'LAB', 'Clinical laboratory services', 'Basement Level'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'Radiology', 'RAD', 'Medical imaging services', 'Ground Floor, Wing C');

-- Create sample equipment
INSERT INTO public.equipment (tenant_id, branch_id, department_id, equipment_code, name, model, manufacturer, serial_number, purchase_date, warranty_expiry, location, status) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), (SELECT id FROM public.departments WHERE code = 'ED' LIMIT 1), 'EKG-001', 'ECG Machine', 'CardioMax Pro', 'MedTech Solutions', 'ECG2024001', '2024-01-15', '2027-01-15', 'Room ED-101', 'available'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), (SELECT id FROM public.departments WHERE code = 'RAD' LIMIT 1), 'XRAY-001', 'Digital X-Ray System', 'ImagePro X500', 'RadiCorp', 'XR500024', '2023-08-10', '2028-08-10', 'Room RAD-201', 'available'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), (SELECT id FROM public.departments WHERE code = 'LAB' LIMIT 1), 'ANALYZER-001', 'Blood Analyzer', 'HemaCount 3000', 'LabEquip Inc', 'HC3000789', '2023-12-05', '2026-12-05', 'Lab Station 3', 'available'),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), (SELECT id FROM public.departments WHERE code = 'CARDIO' LIMIT 1), 'DEFIBRILLATOR-001', 'Automated Defibrillator', 'LifeSaver AED', 'CardiacCare', 'AED2023456', '2023-06-20', '2025-06-20', 'Cardiology Unit', 'available');

-- Create sample inventory items
INSERT INTO public.inventory_items (tenant_id, branch_id, item_code, name, category, description, unit_of_measure, current_stock, minimum_stock, unit_cost, location, is_controlled) VALUES
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-AMOX500', 'Amoxicillin 500mg', 'Medication', 'Antibiotic tablets', 'bottle', 45, 10, 12.50, 'Pharmacy Storage A-12', true),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'MED-IBUPROFEN', 'Ibuprofen 400mg', 'Medication', 'Anti-inflammatory tablets', 'bottle', 120, 25, 8.75, 'Pharmacy Storage A-15', false),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-SYRINGE', 'Disposable Syringes 5ml', 'Medical Supply', 'Single-use sterile syringes', 'box', 15, 5, 24.00, 'Supply Room B-3', false),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-GLOVES', 'Nitrile Examination Gloves', 'Medical Supply', 'Powder-free examination gloves', 'box', 30, 10, 18.50, 'Supply Room B-1', false),
((SELECT id FROM public.tenants WHERE code = 'DEFAULT'), (SELECT id FROM public.branches WHERE tenant_id = (SELECT id FROM public.tenants WHERE code = 'DEFAULT') LIMIT 1), 'SUPPLY-GAUZE', 'Sterile Gauze Pads 4x4', 'Medical Supply', 'Sterile wound dressing pads', 'pack', 75, 20, 5.25, 'Supply Room B-5', false);

-- Sample medical records (using existing patients if any)
DO $$
DECLARE
    sample_patient_id UUID;
    sample_branch_id UUID;
    sample_tenant_id UUID;
BEGIN
    -- Get sample IDs
    SELECT id INTO sample_tenant_id FROM public.tenants WHERE code = 'DEFAULT';
    SELECT id INTO sample_branch_id FROM public.branches WHERE tenant_id = sample_tenant_id LIMIT 1;
    
    -- Try to get an existing patient, or skip if none exist
    SELECT id INTO sample_patient_id FROM public.patients WHERE tenant_id = sample_tenant_id LIMIT 1;
    
    IF sample_patient_id IS NOT NULL THEN
        -- Insert sample medical records
        INSERT INTO public.medical_records (patient_id, tenant_id, branch_id, record_type, title, description, diagnosis_codes, treatment_plan, severity, status) VALUES
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'consultation', 'Annual Physical Examination', 'Routine annual check-up with comprehensive evaluation', '["Z00.00"]', 'Continue current medications, follow-up in 1 year', 'low', 'active'),
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'acute', 'Upper Respiratory Infection', 'Patient presents with cough, sore throat, and congestion', '["J06.9"]', 'Prescribed antibiotics, rest, and fluids', 'medium', 'resolved');
        
        -- Insert sample prescriptions
        INSERT INTO public.prescriptions (patient_id, tenant_id, branch_id, medication_name, dosage, frequency, duration_days, instructions, prescribed_by, status) VALUES
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'Amoxicillin', '500mg', 'Three times daily', 10, 'Take with food to avoid stomach upset', (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), 'active'),
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'Ibuprofen', '400mg', 'As needed for pain', 7, 'Do not exceed 3 doses per day', (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), 'active');
        
        -- Insert sample vital signs
        INSERT INTO public.vital_signs (patient_id, tenant_id, branch_id, recorded_by, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, respiratory_rate, oxygen_saturation, weight_kg, height_cm) VALUES
        (sample_patient_id, sample_tenant_id, sample_branch_id, (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), 98.6, 120, 80, 72, 16, 98.5, 70.0, 175.0),
        (sample_patient_id, sample_tenant_id, sample_branch_id, (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), 99.1, 125, 82, 78, 18, 97.8, 70.2, 175.0);
        
        -- Insert sample patient allergies
        INSERT INTO public.patient_allergies (patient_id, tenant_id, allergen, allergy_type, severity, reaction_symptoms, status) VALUES
        (sample_patient_id, sample_tenant_id, 'Penicillin', 'medication', 'severe', '{"rash", "swelling", "difficulty breathing"}', 'active'),
        (sample_patient_id, sample_tenant_id, 'Shellfish', 'food', 'moderate', '{"hives", "nausea"}', 'active');
        
        -- Insert sample lab results
        INSERT INTO public.lab_results (patient_id, tenant_id, branch_id, test_name, test_type, results, status, ordered_by, performed_by) VALUES
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'Complete Blood Count', 'CBC-001', '{"WBC": "7.2", "RBC": "4.8", "Hemoglobin": "14.2", "Hematocrit": "42.1"}', 'completed', (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1)),
        (sample_patient_id, sample_tenant_id, sample_branch_id, 'Lipid Panel', 'LIPID-001', '{"Total Cholesterol": "185", "LDL": "95", "HDL": "55", "Triglycerides": "120"}', 'completed', (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1), (SELECT user_id FROM public.profiles WHERE tenant_id = sample_tenant_id LIMIT 1));
    END IF;
END $$;