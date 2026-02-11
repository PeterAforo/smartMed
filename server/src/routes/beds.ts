import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const bedSchema = z.object({
  bed_number: z.string().min(1),
  room_number: z.string().optional(),
  department: z.string().optional(),
  bed_type: z.enum(['standard', 'icu', 'emergency', 'surgery', 'maternity']).optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']).optional(),
  patient_id: z.string().uuid().optional().nullable(),
  daily_rate: z.number().optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, department } = req.query;
    
    let sql = 'SELECT b.*, p.first_name as patient_first_name, p.last_name as patient_last_name FROM beds b LEFT JOIN patients p ON b.patient_id = p.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (department) {
      sql += ` AND b.department = $${paramIndex++}`;
      params.push(department);
    }
    
    sql += ' ORDER BY b.bed_number';
    
    const beds = await query(sql, params);
    res.json(beds);
  } catch (error) {
    console.error('Get beds error:', error);
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const bed = await queryOne(
      'SELECT b.*, p.first_name as patient_first_name, p.last_name as patient_last_name FROM beds b LEFT JOIN patients p ON b.patient_id = p.id WHERE b.id = $1',
      [req.params.id]
    );
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    res.json(bed);
  } catch (error) {
    console.error('Get bed error:', error);
    res.status(500).json({ error: 'Failed to fetch bed' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = bedSchema.parse(req.body);
    
    const bed = await queryOne(
      `INSERT INTO beds (bed_number, room_number, department, bed_type, status, patient_id, daily_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.bed_number,
        data.room_number || null,
        data.department || null,
        data.bed_type || 'standard',
        data.status || 'available',
        data.patient_id || null,
        data.daily_rate || 0
      ]
    );
    
    res.status(201).json(bed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create bed error:', error);
    res.status(500).json({ error: 'Failed to create bed' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = bedSchema.partial().parse(req.body);
    
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
    
    const bed = await queryOne(
      `UPDATE beds SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    
    res.json(bed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update bed error:', error);
    res.status(500).json({ error: 'Failed to update bed' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const count = await execute('DELETE FROM beds WHERE id = $1', [req.params.id]);
    if (count === 0) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete bed error:', error);
    res.status(500).json({ error: 'Failed to delete bed' });
  }
});

export default router;
