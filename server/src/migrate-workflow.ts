import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateWorkflow() {
  console.log('🚀 Running workflow database migration...');
  
  try {
    // Patient Queue Management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        queue_number INTEGER NOT NULL,
        department VARCHAR(100) NOT NULL,
        service_type VARCHAR(100) DEFAULT 'consultation',
        priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
        status VARCHAR(30) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_progress', 'completed', 'no_show', 'cancelled')),
        check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        called_time TIMESTAMP WITH TIME ZONE,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        serving_staff_id UUID REFERENCES users(id),
        room_number VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ patient_queue table created');

    // Triage Assessments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS triage_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        queue_id UUID REFERENCES patient_queue(id) ON DELETE SET NULL,
        triage_level INTEGER NOT NULL CHECK (triage_level >= 1 AND triage_level <= 5),
        triage_category VARCHAR(50) NOT NULL CHECK (triage_category IN ('resuscitation', 'emergency', 'urgent', 'less_urgent', 'non_urgent')),
        chief_complaint TEXT NOT NULL,
        presenting_symptoms TEXT[],
        pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
        temperature DECIMAL(4,1),
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        pulse_rate INTEGER,
        respiratory_rate INTEGER,
        oxygen_saturation DECIMAL(4,1),
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        blood_glucose DECIMAL(5,1),
        allergies TEXT[],
        current_medications TEXT[],
        notes TEXT,
        assessed_by UUID REFERENCES users(id),
        assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ triage_assessments table created');

    // Invoices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE,
        subtotal DECIMAL(12,2) DEFAULT 0,
        tax_amount DECIMAL(12,2) DEFAULT 0,
        discount_amount DECIMAL(12,2) DEFAULT 0,
        total_amount DECIMAL(12,2) DEFAULT 0,
        paid_amount DECIMAL(12,2) DEFAULT 0,
        balance_due DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded')),
        payment_method VARCHAR(50),
        payment_reference VARCHAR(100),
        insurance_claim_id VARCHAR(100),
        insurance_amount DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ invoices table created');

    // Invoice Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('consultation', 'procedure', 'laboratory', 'radiology', 'pharmacy', 'bed_charges', 'supplies', 'other')),
        item_code VARCHAR(50),
        description TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        tax_percent DECIMAL(5,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        reference_id UUID,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ invoice_items table created');

    // Payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        payment_number VARCHAR(50) UNIQUE NOT NULL,
        payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        amount DECIMAL(12,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mobile_money', 'insurance', 'cheque', 'other')),
        reference_number VARCHAR(100),
        status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        notes TEXT,
        received_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ payments table created');

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_queue_status ON patient_queue(status);
      CREATE INDEX IF NOT EXISTS idx_queue_department ON patient_queue(department);
      CREATE INDEX IF NOT EXISTS idx_queue_checkin ON patient_queue(check_in_time);
      CREATE INDEX IF NOT EXISTS idx_triage_patient ON triage_assessments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_triage_level ON triage_assessments(triage_level);
      CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
    `);
    console.log('✅ Indexes created');

    // Create triggers for automatic timestamp updates
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_queue_updated_at ON patient_queue;
      CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON patient_queue
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_triage_updated_at ON triage_assessments;
      CREATE TRIGGER update_triage_updated_at BEFORE UPDATE ON triage_assessments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
      CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Triggers created');

    console.log('');
    console.log('✅ Workflow migration completed successfully!');
    console.log('');
    console.log('New tables created:');
    console.log('  - patient_queue (Queue management)');
    console.log('  - triage_assessments (Triage/priority tracking)');
    console.log('  - invoices (Billing invoices)');
    console.log('  - invoice_items (Invoice line items)');
    console.log('  - payments (Payment records)');

  } catch (error) {
    console.error('❌ Workflow migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateWorkflow();
