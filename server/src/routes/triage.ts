import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

const triageSchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional().nullable(),
  queue_id: z.string().uuid().optional().nullable(),
  triage_level: z.number().min(1).max(5),
  triage_category: z.enum(['resuscitation', 'emergency', 'urgent', 'less_urgent', 'non_urgent']),
  chief_complaint: z.string().min(1),
  presenting_symptoms: z.array(z.string()).optional().nullable(),
  pain_level: z.number().min(0).max(10).optional().nullable(),
  temperature: z.number().optional().nullable(),
  blood_pressure_systolic: z.number().optional().nullable(),
  blood_pressure_diastolic: z.number().optional().nullable(),
  pulse_rate: z.number().optional().nullable(),
  respiratory_rate: z.number().optional().nullable(),
  oxygen_saturation: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  blood_glucose: z.number().optional().nullable(),
  allergies: z.array(z.string()).optional().nullable(),
  current_medications: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable()
});

// Get all triage assessments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, date, limit = '50' } = req.query;
    
    let sql = `
      SELECT t.*, 
        p.first_name, p.last_name, p.patient_number,
        u.first_name as assessor_first_name, u.last_name as assessor_last_name
      FROM triage_assessments t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN users u ON t.assessed_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (patient_id) {
      sql += ` AND t.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (date) {
      sql += ` AND DATE(t.assessed_at) = $${paramIndex++}`;
      params.push(date);
    }
    
    sql += ` ORDER BY t.assessed_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const result = await query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Get triage error:', error);
    res.status(500).json({ error: 'Failed to fetch triage assessments' });
  }
});

// Get triage by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const triage = await queryOne(`
      SELECT t.*, 
        p.first_name, p.last_name, p.patient_number,
        u.first_name as assessor_first_name, u.last_name as assessor_last_name
      FROM triage_assessments t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN users u ON t.assessed_by = u.id
      WHERE t.id = $1
    `, [req.params.id]);
    
    if (!triage) {
      return res.status(404).json({ error: 'Triage assessment not found' });
    }
    res.json(triage);
  } catch (error) {
    console.error('Get triage error:', error);
    res.status(500).json({ error: 'Failed to fetch triage assessment' });
  }
});

// Create triage assessment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = triageSchema.parse(req.body);
    
    const triage = await queryOne(`
      INSERT INTO triage_assessments (
        patient_id, appointment_id, queue_id, triage_level, triage_category,
        chief_complaint, presenting_symptoms, pain_level, temperature,
        blood_pressure_systolic, blood_pressure_diastolic, pulse_rate,
        respiratory_rate, oxygen_saturation, weight, height, blood_glucose,
        allergies, current_medications, notes, assessed_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      data.patient_id,
      data.appointment_id || null,
      data.queue_id || null,
      data.triage_level,
      data.triage_category,
      data.chief_complaint,
      data.presenting_symptoms || [],
      data.pain_level || null,
      data.temperature || null,
      data.blood_pressure_systolic || null,
      data.blood_pressure_diastolic || null,
      data.pulse_rate || null,
      data.respiratory_rate || null,
      data.oxygen_saturation || null,
      data.weight || null,
      data.height || null,
      data.blood_glucose || null,
      data.allergies || [],
      data.current_medications || [],
      data.notes || null,
      req.user!.id
    ]);
    
    // If queue_id provided, update queue priority based on triage level
    if (data.queue_id) {
      await query(`
        UPDATE patient_queue SET priority = $1 WHERE id = $2
      `, [data.triage_level, data.queue_id]);
    }
    
    res.status(201).json(triage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create triage error:', error);
    res.status(500).json({ error: 'Failed to create triage assessment' });
  }
});

// Update triage assessment
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = triageSchema.partial().parse(req.body);
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(Array.isArray(value) ? value : value);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(req.params.id);
    
    const triage = await queryOne(`
      UPDATE triage_assessments
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (!triage) {
      return res.status(404).json({ error: 'Triage assessment not found' });
    }
    
    res.json(triage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update triage error:', error);
    res.status(500).json({ error: 'Failed to update triage assessment' });
  }
});

// Delete triage assessment
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM triage_assessments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Triage assessment deleted' });
  } catch (error) {
    console.error('Delete triage error:', error);
    res.status(500).json({ error: 'Failed to delete triage assessment' });
  }
});

export default router;
