import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateExtended() {
  console.log('🚀 Running extended database migration...');
  
  try {
    // Laboratory tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        ordering_doctor_id UUID REFERENCES users(id),
        order_date DATE NOT NULL DEFAULT CURRENT_DATE,
        priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'processing', 'completed', 'cancelled')),
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
        test_code VARCHAR(50) NOT NULL,
        test_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
        result_value TEXT,
        result_unit VARCHAR(50),
        reference_range VARCHAR(100),
        is_abnormal BOOLEAN DEFAULT FALSE,
        performed_by UUID REFERENCES users(id),
        performed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ Laboratory tables created');

    // Pharmacy tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        generic_name VARCHAR(200),
        category VARCHAR(100),
        form VARCHAR(50),
        strength VARCHAR(50),
        unit VARCHAR(30),
        manufacturer VARCHAR(200),
        unit_price DECIMAL(10,2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        expiry_date DATE,
        is_controlled BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prescription_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        prescriber_id UUID REFERENCES users(id),
        appointment_id UUID REFERENCES appointments(id),
        prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'partially_dispensed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescription_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
        medication_id UUID REFERENCES medications(id),
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        quantity INTEGER NOT NULL,
        instructions TEXT,
        dispensed_quantity INTEGER DEFAULT 0,
        dispensed_by UUID REFERENCES users(id),
        dispensed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ Pharmacy tables created');

    // EMR (Medical Records) tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        record_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        encounter_date DATE NOT NULL DEFAULT CURRENT_DATE,
        encounter_type VARCHAR(50) CHECK (encounter_type IN ('outpatient', 'inpatient', 'emergency', 'telemedicine')),
        chief_complaint TEXT,
        history_of_present_illness TEXT,
        past_medical_history TEXT,
        family_history TEXT,
        social_history TEXT,
        review_of_systems JSONB,
        physical_examination JSONB,
        assessment TEXT,
        plan TEXT,
        vitals JSONB,
        diagnoses JSONB,
        procedures JSONB,
        attending_doctor_id UUID REFERENCES users(id),
        status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended', 'locked')),
        signed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        medical_record_id UUID REFERENCES medical_records(id),
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        temperature DECIMAL(4,1),
        temperature_unit VARCHAR(5) DEFAULT 'C',
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        pulse_rate INTEGER,
        respiratory_rate INTEGER,
        oxygen_saturation DECIMAL(4,1),
        weight DECIMAL(5,2),
        weight_unit VARCHAR(5) DEFAULT 'kg',
        height DECIMAL(5,2),
        height_unit VARCHAR(5) DEFAULT 'cm',
        bmi DECIMAL(4,1),
        pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
        notes TEXT,
        recorded_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ EMR tables created');

    // HR/Staff tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        head_id UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        schedule_date DATE NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        department_id UUID REFERENCES departments(id),
        status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked_in', 'checked_out', 'absent', 'leave')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        leave_type VARCHAR(50) CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ HR tables created');

    // Inventory tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        unit VARCHAR(30),
        unit_cost DECIMAL(10,2) DEFAULT 0,
        quantity_on_hand INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        reorder_quantity INTEGER DEFAULT 50,
        location VARCHAR(100),
        supplier VARCHAR(200),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES inventory_items(id),
        transaction_type VARCHAR(30) CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer', 'return')),
        quantity INTEGER NOT NULL,
        unit_cost DECIMAL(10,2),
        reference_number VARCHAR(100),
        reference_type VARCHAR(50),
        notes TEXT,
        performed_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier VARCHAR(200) NOT NULL,
        order_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expected_delivery_date DATE,
        status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled')),
        total_amount DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        approved_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
        item_id UUID REFERENCES inventory_items(id),
        quantity INTEGER NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        received_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ Inventory tables created');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_staff_schedules_user ON staff_schedules(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id)`);

    console.log('✅ Indexes created');
    console.log('');
    console.log('🎉 Extended migration completed successfully!');
    console.log('Tables created:');
    console.log('  - lab_orders, lab_tests');
    console.log('  - medications, prescriptions, prescription_items');
    console.log('  - medical_records, vitals');
    console.log('  - departments, staff_schedules, leave_requests');
    console.log('  - inventory_items, inventory_transactions, purchase_orders, purchase_order_items');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateExtended();
