import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateWorkflowStages() {
  console.log('🚀 Running workflow stages migration...');
  
  try {
    // Add current_stage column to patient_queue for tracking workflow stage
    await pool.query(`
      ALTER TABLE patient_queue 
      ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'waiting'
      CHECK (current_stage IN ('waiting', 'triage', 'nurse', 'doctor', 'lab', 'pharmacy', 'billing', 'completed', 'discharged'))
    `);
    console.log('✅ Added current_stage column to patient_queue');

    // Clean up duplicate active queue entries - keep only the most recent one
    await pool.query(`
      DELETE FROM patient_queue a
      USING patient_queue b
      WHERE a.patient_id = b.patient_id
        AND a.status IN ('waiting', 'called', 'in_progress')
        AND b.status IN ('waiting', 'called', 'in_progress')
        AND a.check_in_time < b.check_in_time
    `);
    console.log('✅ Cleaned up duplicate active queue entries');

    // Add unique constraint to prevent duplicate active queue entries for same patient
    // Using a partial index on patient_id where status is active
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_queue 
      ON patient_queue (patient_id)
      WHERE status IN ('waiting', 'called', 'in_progress')
    `);
    console.log('✅ Added unique constraint for active queue entries');

    // Update existing records to have proper stage
    await pool.query(`
      UPDATE patient_queue 
      SET current_stage = CASE 
        WHEN status = 'waiting' THEN 'waiting'
        WHEN status = 'called' THEN 'triage'
        WHEN status = 'in_progress' THEN 'doctor'
        WHEN status = 'completed' THEN 'completed'
        ELSE 'waiting'
      END
      WHERE current_stage IS NULL OR current_stage = 'waiting'
    `);
    console.log('✅ Updated existing queue entries with stages');

    console.log('');
    console.log('✅ Workflow stages migration completed!');
    console.log('');
    console.log('Workflow stages:');
    console.log('  1. waiting - Patient checked in, waiting to be called');
    console.log('  2. triage - Patient with nurse for vitals/triage');
    console.log('  3. doctor - Patient with doctor for consultation');
    console.log('  4. lab - Patient sent to laboratory');
    console.log('  5. pharmacy - Patient at pharmacy');
    console.log('  6. billing - Patient at billing/cashier');
    console.log('  7. completed - Visit completed');
    console.log('  8. discharged - Patient discharged');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateWorkflowStages();
