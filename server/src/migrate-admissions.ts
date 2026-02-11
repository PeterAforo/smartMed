import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = `
-- Create admissions table for inpatient tracking
CREATE TABLE IF NOT EXISTS admissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  admission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admission_type TEXT NOT NULL DEFAULT 'routine' CHECK (admission_type IN ('emergency', 'routine', 'transfer', 'referral')),
  admission_source TEXT CHECK (admission_source IN ('emergency', 'outpatient', 'transfer', 'direct')),
  attending_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT,
  condition_status TEXT NOT NULL DEFAULT 'stable' CHECK (condition_status IN ('stable', 'improving', 'critical', 'declining')),
  diet TEXT DEFAULT 'Regular',
  allergies TEXT[] DEFAULT '{}',
  notes TEXT,
  expected_discharge TIMESTAMP WITH TIME ZONE,
  actual_discharge TIMESTAMP WITH TIME ZONE,
  discharge_status TEXT CHECK (discharge_status IN ('pending', 'completed', 'delayed', 'cancelled')),
  discharge_notes TEXT,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN ('pending', 'admitted', 'discharged', 'transferred')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Create indexes for admissions
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions(attending_doctor_id);

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_admissions_updated_at ON admissions;
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  console.log('🚀 Starting admissions table migration...');
  
  try {
    await pool.query(migrations);
    console.log('✅ Admissions table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
