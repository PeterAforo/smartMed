import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  staff_id: z.string().uuid().optional(),
  appointment_date: z.string(),
  appointment_time: z.string(),
  duration_minutes: z.number().optional(),
  appointment_type: z.enum(['consultation', 'follow_up', 'emergency', 'surgery', 'lab_test', 'imaging']).optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
  treatment_plan: z.string().optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, date, patient_id, staff_id, limit = '50', offset = '0' } = req.query;
    
    let sql = `
      SELECT a.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.patient_number
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (date) {
      sql += ` AND a.appointment_date = $${paramIndex++}`;
      params.push(date);
    }
    
    if (patient_id) {
      sql += ` AND a.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (staff_id) {
      sql += ` AND a.staff_id = $${paramIndex++}`;
      params.push(staff_id);
    }
    
    sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const appointments = await query(sql, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await queryOne(
      `SELECT a.*, 
              p.first_name as patient_first_name, 
              p.last_name as patient_last_name,
              p.patient_number
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = appointmentSchema.parse(req.body);
    
    const appointment = await queryOne(
      `INSERT INTO appointments (patient_id, staff_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, chief_complaint, notes, treatment_plan, follow_up_required, follow_up_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        data.patient_id,
        data.staff_id || null,
        data.appointment_date,
        data.appointment_time,
        data.duration_minutes || 30,
        data.appointment_type || 'consultation',
        data.status || 'scheduled',
        data.chief_complaint || null,
        data.notes || null,
        data.treatment_plan || null,
        data.follow_up_required || false,
        data.follow_up_date || null,
        req.user!.id
      ]
    );
    
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = appointmentSchema.partial().parse(req.body);
    
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
    
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    
    const appointment = await queryOne(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const count = await execute('DELETE FROM appointments WHERE id = $1', [req.params.id]);
    if (count === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
