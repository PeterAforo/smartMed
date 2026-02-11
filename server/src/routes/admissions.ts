import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const admissionSchema = z.object({
  patient_id: z.string().uuid(),
  bed_id: z.string().uuid().optional().nullable(),
  admission_type: z.enum(['emergency', 'routine', 'transfer', 'referral']).optional(),
  admission_source: z.enum(['emergency', 'outpatient', 'transfer', 'direct']).optional(),
  attending_doctor_id: z.string().uuid().optional().nullable(),
  diagnosis: z.string().optional(),
  condition_status: z.enum(['stable', 'improving', 'critical', 'declining']).optional(),
  diet: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  expected_discharge: z.string().optional().nullable(),
  status: z.enum(['pending', 'admitted', 'discharged', 'transferred']).optional()
});

// Get all admissions with filters
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, date } = req.query;
    
    let sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_number,
        p.allergies as patient_allergies,
        b.bed_number,
        b.room_number,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN beds b ON a.bed_id = b.id
      LEFT JOIN users u ON a.attending_doctor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND DATE(a.admission_date) = $${paramIndex++}`;
      params.push(date);
    }
    
    sql += ' ORDER BY a.admission_date DESC';
    
    const admissions = await query(sql, params);
    res.json(admissions);
  } catch (error) {
    console.error('Get admissions error:', error);
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
});

// Get inpatient stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM beds) as total_beds,
        (SELECT COUNT(*) FROM beds WHERE status = 'occupied') as occupied_beds,
        (SELECT COUNT(*) FROM beds WHERE status = 'available') as available_beds,
        (SELECT COUNT(*) FROM admissions WHERE DATE(admission_date) = CURRENT_DATE AND status = 'admitted') as admissions_today,
        (SELECT COUNT(*) FROM admissions WHERE DATE(actual_discharge) = CURRENT_DATE AND status = 'discharged') as discharges_today,
        (SELECT COUNT(*) FROM admissions WHERE condition_status = 'critical' AND status = 'admitted') as critical_patients
    `);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get current inpatients (admitted status)
router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    
    let sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_number,
        p.allergies as patient_allergies,
        b.bed_number,
        b.room_number,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN beds b ON a.bed_id = b.id
      LEFT JOIN users u ON a.attending_doctor_id = u.id
      WHERE a.status = 'admitted'
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      sql += ` AND (
        LOWER(p.first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(p.last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(p.patient_number) LIKE LOWER($${paramIndex}) OR
        LOWER(b.room_number) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ' ORDER BY a.admission_date DESC';
    
    const inpatients = await query(sql, params);
    res.json(inpatients);
  } catch (error) {
    console.error('Get current inpatients error:', error);
    res.status(500).json({ error: 'Failed to fetch current inpatients' });
  }
});

// Get pending admissions
router.get('/pending', async (req: AuthRequest, res: Response) => {
  try {
    const admissions = await query(`
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_number,
        b.bed_number,
        b.room_number,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN beds b ON a.bed_id = b.id
      LEFT JOIN users u ON a.attending_doctor_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.admission_date DESC
    `);
    res.json(admissions);
  } catch (error) {
    console.error('Get pending admissions error:', error);
    res.status(500).json({ error: 'Failed to fetch pending admissions' });
  }
});

// Get today's discharges
router.get('/discharges', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date || 'CURRENT_DATE';
    
    const discharges = await query(`
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_number,
        b.bed_number,
        b.room_number,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN beds b ON a.bed_id = b.id
      LEFT JOIN users u ON a.attending_doctor_id = u.id
      WHERE (a.status = 'discharged' AND DATE(a.actual_discharge) = ${date ? '$1' : 'CURRENT_DATE'})
         OR (a.status = 'admitted' AND a.discharge_status = 'pending')
      ORDER BY a.actual_discharge DESC NULLS LAST
    `, date ? [date] : []);
    res.json(discharges);
  } catch (error) {
    console.error('Get discharges error:', error);
    res.status(500).json({ error: 'Failed to fetch discharges' });
  }
});

// Get single admission
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const admission = await queryOne(`
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_number,
        p.allergies as patient_allergies,
        b.bed_number,
        b.room_number,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN beds b ON a.bed_id = b.id
      LEFT JOIN users u ON a.attending_doctor_id = u.id
      WHERE a.id = $1
    `, [req.params.id]);
    
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    res.json(admission);
  } catch (error) {
    console.error('Get admission error:', error);
    res.status(500).json({ error: 'Failed to fetch admission' });
  }
});

// Create new admission
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = admissionSchema.parse(req.body);
    
    const admission = await queryOne(
      `INSERT INTO admissions (
        patient_id, bed_id, admission_type, admission_source, attending_doctor_id,
        diagnosis, condition_status, diet, allergies, notes, expected_discharge, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        data.patient_id,
        data.bed_id || null,
        data.admission_type || 'routine',
        data.admission_source || 'direct',
        data.attending_doctor_id || null,
        data.diagnosis || null,
        data.condition_status || 'stable',
        data.diet || 'Regular',
        data.allergies || [],
        data.notes || null,
        data.expected_discharge || null,
        data.status || 'pending',
        req.user?.id || null
      ]
    );
    
    // If bed is assigned, update bed status
    if (data.bed_id) {
      await execute(
        `UPDATE beds SET status = 'occupied', patient_id = $1, admitted_at = NOW() WHERE id = $2`,
        [data.patient_id, data.bed_id]
      );
    }
    
    res.status(201).json(admission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create admission error:', error);
    res.status(500).json({ error: 'Failed to create admission' });
  }
});

// Update admission
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = admissionSchema.partial().parse(req.body);
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(req.params.id);
    
    const admission = await queryOne(
      `UPDATE admissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    res.json(admission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update admission error:', error);
    res.status(500).json({ error: 'Failed to update admission' });
  }
});

// Assign room/bed to admission
router.post('/:id/assign-bed', async (req: AuthRequest, res: Response) => {
  try {
    const { bed_id } = req.body;
    
    if (!bed_id) {
      return res.status(400).json({ error: 'bed_id is required' });
    }
    
    // Get admission
    const admission = await queryOne('SELECT * FROM admissions WHERE id = $1', [req.params.id]);
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    // Check if bed is available
    const bed = await queryOne('SELECT * FROM beds WHERE id = $1', [bed_id]);
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    if (bed.status !== 'available') {
      return res.status(400).json({ error: 'Bed is not available' });
    }
    
    // Update admission with bed
    await execute(
      `UPDATE admissions SET bed_id = $1, status = 'admitted', updated_at = NOW() WHERE id = $2`,
      [bed_id, req.params.id]
    );
    
    // Update bed status
    await execute(
      `UPDATE beds SET status = 'occupied', patient_id = $1, admitted_at = NOW() WHERE id = $2`,
      [admission.patient_id, bed_id]
    );
    
    const updatedAdmission = await queryOne(`
      SELECT a.*, b.bed_number, b.room_number
      FROM admissions a
      LEFT JOIN beds b ON a.bed_id = b.id
      WHERE a.id = $1
    `, [req.params.id]);
    
    res.json(updatedAdmission);
  } catch (error) {
    console.error('Assign bed error:', error);
    res.status(500).json({ error: 'Failed to assign bed' });
  }
});

// Discharge patient
router.post('/:id/discharge', async (req: AuthRequest, res: Response) => {
  try {
    const { discharge_notes, follow_up_date } = req.body;
    
    const admission = await queryOne('SELECT * FROM admissions WHERE id = $1', [req.params.id]);
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    // Update admission
    await execute(
      `UPDATE admissions SET 
        status = 'discharged', 
        discharge_status = 'completed',
        actual_discharge = NOW(),
        discharge_notes = $1,
        follow_up_date = $2,
        updated_at = NOW()
      WHERE id = $3`,
      [discharge_notes || null, follow_up_date || null, req.params.id]
    );
    
    // Release bed if assigned
    if (admission.bed_id) {
      await execute(
        `UPDATE beds SET status = 'available', patient_id = NULL, admitted_at = NULL WHERE id = $1`,
        [admission.bed_id]
      );
    }
    
    const updatedAdmission = await queryOne('SELECT * FROM admissions WHERE id = $1', [req.params.id]);
    res.json(updatedAdmission);
  } catch (error) {
    console.error('Discharge error:', error);
    res.status(500).json({ error: 'Failed to discharge patient' });
  }
});

// Delete admission
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const admission = await queryOne('SELECT * FROM admissions WHERE id = $1', [req.params.id]);
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    // Release bed if assigned
    if (admission.bed_id) {
      await execute(
        `UPDATE beds SET status = 'available', patient_id = NULL, admitted_at = NULL WHERE id = $1`,
        [admission.bed_id]
      );
    }
    
    await execute('DELETE FROM admissions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete admission error:', error);
    res.status(500).json({ error: 'Failed to delete admission' });
  }
});

export default router;
