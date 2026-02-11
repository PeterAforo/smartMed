import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Medical Records
router.get('/records', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, status, encounter_type, limit = '50' } = req.query;
    
    let sql = `
      SELECT mr.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
             u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_records mr
      LEFT JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN users u ON mr.attending_doctor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (patient_id) {
      sql += ` AND mr.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    if (status) {
      sql += ` AND mr.status = $${paramIndex++}`;
      params.push(status);
    }
    if (encounter_type) {
      sql += ` AND mr.encounter_type = $${paramIndex++}`;
      params.push(encounter_type);
    }
    
    sql += ` ORDER BY mr.encounter_date DESC, mr.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const records = await query(sql, params);
    res.json(records);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

router.get('/records/:id', async (req: AuthRequest, res: Response) => {
  try {
    const record = await queryOne(`
      SELECT mr.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number, p.date_of_birth, p.gender,
             u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_records mr
      LEFT JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN users u ON mr.attending_doctor_id = u.id
      WHERE mr.id = $1
    `, [req.params.id]);
    
    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

router.post('/records', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, encounter_type, chief_complaint, history_of_present_illness, past_medical_history, 
            family_history, social_history, review_of_systems, physical_examination, assessment, plan, 
            vitals, diagnoses, procedures } = req.body;
    
    const recordNumber = `MR-${Date.now().toString(36).toUpperCase()}`;
    
    const record = await queryOne(`
      INSERT INTO medical_records (record_number, patient_id, encounter_type, chief_complaint, 
        history_of_present_illness, past_medical_history, family_history, social_history,
        review_of_systems, physical_examination, assessment, plan, vitals, diagnoses, procedures, attending_doctor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [recordNumber, patient_id, encounter_type || 'outpatient', chief_complaint, history_of_present_illness,
        past_medical_history, family_history, social_history, JSON.stringify(review_of_systems || {}),
        JSON.stringify(physical_examination || {}), assessment, plan, JSON.stringify(vitals || {}),
        JSON.stringify(diagnoses || []), JSON.stringify(procedures || []), req.user!.id]);
    
    res.status(201).json(record);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

router.put('/records/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { chief_complaint, history_of_present_illness, past_medical_history, family_history, 
            social_history, review_of_systems, physical_examination, assessment, plan, 
            vitals, diagnoses, procedures, status } = req.body;
    
    const record = await queryOne(`
      UPDATE medical_records 
      SET chief_complaint = COALESCE($1, chief_complaint),
          history_of_present_illness = COALESCE($2, history_of_present_illness),
          past_medical_history = COALESCE($3, past_medical_history),
          family_history = COALESCE($4, family_history),
          social_history = COALESCE($5, social_history),
          review_of_systems = COALESCE($6, review_of_systems),
          physical_examination = COALESCE($7, physical_examination),
          assessment = COALESCE($8, assessment),
          plan = COALESCE($9, plan),
          vitals = COALESCE($10, vitals),
          diagnoses = COALESCE($11, diagnoses),
          procedures = COALESCE($12, procedures),
          status = COALESCE($13, status),
          signed_at = CASE WHEN $13 = 'signed' THEN NOW() ELSE signed_at END,
          updated_at = NOW()
      WHERE id = $14 RETURNING *
    `, [chief_complaint, history_of_present_illness, past_medical_history, family_history, social_history,
        review_of_systems ? JSON.stringify(review_of_systems) : null,
        physical_examination ? JSON.stringify(physical_examination) : null,
        assessment, plan,
        vitals ? JSON.stringify(vitals) : null,
        diagnoses ? JSON.stringify(diagnoses) : null,
        procedures ? JSON.stringify(procedures) : null,
        status, req.params.id]);
    
    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

// Vitals
router.get('/vitals', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, limit = '20' } = req.query;
    
    let sql = `
      SELECT v.*, u.first_name as recorded_by_first_name, u.last_name as recorded_by_last_name
      FROM vitals v
      LEFT JOIN users u ON v.recorded_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (patient_id) {
      sql += ` AND v.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    sql += ` ORDER BY v.recorded_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const vitals = await query(sql, params);
    res.json(vitals);
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

router.post('/vitals', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, medical_record_id, temperature, blood_pressure_systolic, blood_pressure_diastolic,
            pulse_rate, respiratory_rate, oxygen_saturation, weight, height, pain_level, notes } = req.body;
    
    // Calculate BMI if weight and height provided
    let bmi = null;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    
    const vital = await queryOne(`
      INSERT INTO vitals (patient_id, medical_record_id, temperature, blood_pressure_systolic, blood_pressure_diastolic,
        pulse_rate, respiratory_rate, oxygen_saturation, weight, height, bmi, pain_level, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [patient_id, medical_record_id, temperature, blood_pressure_systolic, blood_pressure_diastolic,
        pulse_rate, respiratory_rate, oxygen_saturation, weight, height, bmi, pain_level, notes, req.user!.id]);
    
    res.status(201).json(vital);
  } catch (error) {
    console.error('Create vitals error:', error);
    res.status(500).json({ error: 'Failed to record vitals' });
  }
});

export default router;
