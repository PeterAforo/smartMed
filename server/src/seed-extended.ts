import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedExtended() {
  console.log('🌱 Seeding extended sample data...');
  
  try {
    // Get admin user ID
    const adminResult = await pool.query(`SELECT id FROM users WHERE email = 'admin@crystalhealth.com'`);
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found. Run seed.ts first.');
      await pool.end();
      return;
    }
    const adminId = adminResult.rows[0].id;

    // Get patient IDs
    const patientsResult = await pool.query(`SELECT id, patient_number FROM patients LIMIT 3`);
    const patients = patientsResult.rows;

    if (patients.length === 0) {
      console.log('❌ No patients found. Run seed.ts first.');
      await pool.end();
      return;
    }

    // Create departments
    console.log('📁 Creating departments...');
    await pool.query(`
      INSERT INTO departments (code, name, description, head_id)
      VALUES 
        ('GEN', 'General Medicine', 'General medical consultations and treatments', $1),
        ('PED', 'Pediatrics', 'Child healthcare services', $1),
        ('CARD', 'Cardiology', 'Heart and cardiovascular care', $1),
        ('ORTH', 'Orthopedics', 'Bone and joint care', $1),
        ('LAB', 'Laboratory', 'Diagnostic laboratory services', $1),
        ('PHARM', 'Pharmacy', 'Medication dispensing', $1),
        ('RAD', 'Radiology', 'Medical imaging services', $1),
        ('ER', 'Emergency', 'Emergency medical services', $1)
      ON CONFLICT (code) DO NOTHING
    `, [adminId]);

    // Create sample medications
    console.log('💊 Creating medications...');
    await pool.query(`
      INSERT INTO medications (code, name, generic_name, category, form, strength, unit, manufacturer, unit_price, stock_quantity, reorder_level)
      VALUES 
        ('MED001', 'Paracetamol 500mg', 'Acetaminophen', 'Analgesics', 'Tablet', '500mg', 'tablets', 'PharmaCorp', 0.50, 1000, 100),
        ('MED002', 'Amoxicillin 250mg', 'Amoxicillin', 'Antibiotics', 'Capsule', '250mg', 'capsules', 'MediLab', 1.20, 500, 50),
        ('MED003', 'Ibuprofen 400mg', 'Ibuprofen', 'NSAIDs', 'Tablet', '400mg', 'tablets', 'PharmaCorp', 0.75, 800, 80),
        ('MED004', 'Omeprazole 20mg', 'Omeprazole', 'Antacids', 'Capsule', '20mg', 'capsules', 'GastroMed', 2.00, 300, 30),
        ('MED005', 'Metformin 500mg', 'Metformin', 'Antidiabetics', 'Tablet', '500mg', 'tablets', 'DiabeCare', 0.80, 600, 60),
        ('MED006', 'Lisinopril 10mg', 'Lisinopril', 'Antihypertensives', 'Tablet', '10mg', 'tablets', 'CardioMed', 1.50, 400, 40),
        ('MED007', 'Atorvastatin 20mg', 'Atorvastatin', 'Statins', 'Tablet', '20mg', 'tablets', 'LipidCare', 2.50, 350, 35),
        ('MED008', 'Cetirizine 10mg', 'Cetirizine', 'Antihistamines', 'Tablet', '10mg', 'tablets', 'AllergyFree', 0.60, 700, 70)
      ON CONFLICT (code) DO NOTHING
    `);

    // Create sample inventory items
    console.log('📦 Creating inventory items...');
    await pool.query(`
      INSERT INTO inventory_items (item_code, name, category, subcategory, unit, unit_cost, quantity_on_hand, reorder_level, location, supplier)
      VALUES 
        ('INV001', 'Surgical Gloves (Box)', 'Medical Supplies', 'PPE', 'box', 15.00, 200, 50, 'Store Room A', 'MedSupply Inc'),
        ('INV002', 'Syringes 5ml (Pack of 100)', 'Medical Supplies', 'Consumables', 'pack', 25.00, 150, 30, 'Store Room A', 'MedSupply Inc'),
        ('INV003', 'Bandages (Roll)', 'Medical Supplies', 'Wound Care', 'roll', 5.00, 500, 100, 'Store Room B', 'WoundCare Ltd'),
        ('INV004', 'IV Cannula 20G (Box)', 'Medical Supplies', 'IV Supplies', 'box', 45.00, 80, 20, 'Store Room A', 'IVMed Corp'),
        ('INV005', 'Face Masks N95 (Box)', 'Medical Supplies', 'PPE', 'box', 35.00, 100, 25, 'Store Room A', 'SafetyFirst'),
        ('INV006', 'Alcohol Swabs (Pack)', 'Medical Supplies', 'Consumables', 'pack', 8.00, 300, 50, 'Store Room B', 'CleanMed'),
        ('INV007', 'Blood Collection Tubes (Box)', 'Laboratory', 'Collection', 'box', 55.00, 60, 15, 'Lab Storage', 'LabSupply Co'),
        ('INV008', 'Urine Sample Cups (Pack)', 'Laboratory', 'Collection', 'pack', 12.00, 200, 40, 'Lab Storage', 'LabSupply Co')
      ON CONFLICT (item_code) DO NOTHING
    `);

    // Create sample appointments for today
    console.log('📅 Creating appointments...');
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const hour = 9 + i;
      await pool.query(`
        INSERT INTO appointments (patient_id, appointment_date, appointment_time, appointment_type, status, chief_complaint, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [patient.id, today, `${hour}:00:00`, 'consultation', 'scheduled', 'General checkup', adminId]);
    }

    // Create sample lab orders
    console.log('🧪 Creating lab orders...');
    for (const patient of patients) {
      const orderNumber = `LAB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const orderResult = await pool.query(`
        INSERT INTO lab_orders (order_number, patient_id, ordering_doctor_id, priority, status, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [orderNumber, patient.id, adminId, 'routine', 'pending', 'Routine blood work', adminId]);
      
      const orderId = orderResult.rows[0].id;
      
      // Add lab tests
      await pool.query(`
        INSERT INTO lab_tests (order_id, test_code, test_name, category, status)
        VALUES 
          ($1, 'CBC', 'Complete Blood Count', 'Hematology', 'pending'),
          ($1, 'BMP', 'Basic Metabolic Panel', 'Chemistry', 'pending'),
          ($1, 'LFT', 'Liver Function Test', 'Chemistry', 'pending')
      `, [orderId]);
    }

    // Create sample medical records
    console.log('📋 Creating medical records...');
    for (const patient of patients) {
      const recordNumber = `MR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      await pool.query(`
        INSERT INTO medical_records (record_number, patient_id, encounter_type, chief_complaint, assessment, plan, attending_doctor_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [recordNumber, patient.id, 'outpatient', 'General wellness check', 'Patient in good health', 'Continue current medications, follow up in 3 months', adminId, 'signed']);
    }

    // Create sample vitals
    console.log('❤️ Creating vitals...');
    for (const patient of patients) {
      await pool.query(`
        INSERT INTO vitals (patient_id, temperature, blood_pressure_systolic, blood_pressure_diastolic, pulse_rate, respiratory_rate, oxygen_saturation, weight, height, recorded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [patient.id, 36.8, 120, 80, 72, 16, 98.5, 70, 170, adminId]);
    }

    // Create sample prescriptions
    console.log('💉 Creating prescriptions...');
    const medsResult = await pool.query(`SELECT id FROM medications LIMIT 3`);
    const medications = medsResult.rows;
    
    if (medications.length > 0) {
      for (const patient of patients) {
        const rxNumber = `RX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const rxResult = await pool.query(`
          INSERT INTO prescriptions (prescription_number, patient_id, prescriber_id, status, notes)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [rxNumber, patient.id, adminId, 'pending', 'Take as directed']);
        
        const rxId = rxResult.rows[0].id;
        
        // Add prescription items
        for (const med of medications) {
          await pool.query(`
            INSERT INTO prescription_items (prescription_id, medication_id, dosage, frequency, duration, quantity, instructions)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [rxId, med.id, '1 tablet', 'Twice daily', '7 days', 14, 'Take with food']);
        }
      }
    }

    // Create sample revenue entries
    console.log('💰 Creating revenue entries...');
    await pool.query(`
      INSERT INTO revenue (patient_id, amount, revenue_type, payment_method, payment_status, description, created_by)
      VALUES 
        ($1, 150.00, 'consultation', 'cash', 'paid', 'General consultation fee', $2),
        ($1, 75.00, 'lab_test', 'insurance', 'paid', 'Blood work', $2),
        ($3, 200.00, 'consultation', 'card', 'paid', 'Specialist consultation', $2),
        ($3, 50.00, 'medication', 'cash', 'paid', 'Medications', $2)
    `, [patients[0].id, adminId, patients[1]?.id || patients[0].id]);

    // Create sample activities
    console.log('📊 Creating activities...');
    await pool.query(`
      INSERT INTO activities (user_id, activity_type, description, entity_type, entity_id)
      VALUES 
        ($2, 'patient_created', 'New patient registered', 'patient', $1),
        ($2, 'appointment_scheduled', 'Appointment scheduled for consultation', 'appointment', $1),
        ($2, 'revenue_recorded', 'Payment received for consultation', 'revenue', $1)
    `, [patients[0].id, adminId]);

    // Create sample alerts
    console.log('🔔 Creating alerts...');
    await pool.query(`
      INSERT INTO alerts (alert_type, priority, title, message, status)
      VALUES 
        ('warning', 2, 'Low Stock Alert', 'Surgical gloves running low', 'active'),
        ('info', 3, 'Upcoming Appointment', 'Patient appointment in 30 minutes', 'active'),
        ('warning', 2, 'Lab Results Ready', 'Lab results ready for review', 'active')
      ON CONFLICT DO NOTHING
    `);

    console.log('');
    console.log('✅ Extended sample data created successfully!');
    console.log('');
    console.log('Sample data includes:');
    console.log('  - 8 departments');
    console.log('  - 8 medications');
    console.log('  - 8 inventory items');
    console.log('  - 3 appointments');
    console.log('  - 3 lab orders with tests');
    console.log('  - 3 medical records');
    console.log('  - 3 vitals records');
    console.log('  - 3 prescriptions');
    console.log('  - 4 revenue entries');
    console.log('  - 5 activities');
    console.log('  - 3 alerts');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedExtended();
