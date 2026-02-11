import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const patientSchema = z.object({
  patient_number: z.string().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  insurance_info: z.any().optional(),
  allergies: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'deceased']).optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;
    
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (search) {
      sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR patient_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const patients = await query(sql, params);
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const patient = await queryOne('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = patientSchema.parse(req.body);
    
    // Auto-generate patient number if not provided
    const patientNumber = data.patient_number || `P-${Date.now().toString(36).toUpperCase()}`;
    
    const patient = await queryOne(
      `INSERT INTO patients (patient_number, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, insurance_info, allergies, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        patientNumber,
        data.first_name,
        data.last_name,
        data.date_of_birth || null,
        data.gender || null,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.emergency_contact_name || null,
        data.emergency_contact_phone || null,
        JSON.stringify(data.insurance_info || {}),
        data.allergies || [],
        data.status || 'active',
        req.user!.id
      ]
    );
    
    res.status(201).json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: errorMessages });
    }
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = patientSchema.partial().parse(req.body);
    
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
    
    const patient = await queryOne(
      `UPDATE patients SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const count = await execute('DELETE FROM patients WHERE id = $1', [req.params.id]);
    if (count === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
