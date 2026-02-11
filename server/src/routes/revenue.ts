import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const revenueSchema = z.object({
  transaction_date: z.string().optional(),
  revenue_type: z.enum(['consultation', 'procedure', 'medication', 'lab_test', 'imaging', 'bed_charges', 'other']),
  amount: z.number(),
  currency: z.string().optional(),
  patient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  payment_method: z.enum(['cash', 'card', 'insurance', 'bank_transfer', 'other']).optional(),
  payment_status: z.enum(['pending', 'paid', 'partially_paid', 'refunded', 'disputed']).optional(),
  invoice_number: z.string().optional(),
  description: z.string().optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, payment_status, limit = '50' } = req.query;
    
    let sql = 'SELECT r.*, p.first_name as patient_first_name, p.last_name as patient_last_name FROM revenue r LEFT JOIN patients p ON r.patient_id = p.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (start_date) {
      sql += ` AND r.transaction_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ` AND r.transaction_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    if (payment_status) {
      sql += ` AND r.payment_status = $${paramIndex++}`;
      params.push(payment_status);
    }
    
    sql += ` ORDER BY r.transaction_date DESC, r.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const revenue = await query(sql, params);
    res.json(revenue);
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    let sql = `
      SELECT 
        revenue_type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM revenue 
      WHERE payment_status = 'paid'
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (start_date) {
      sql += ` AND transaction_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ` AND transaction_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    sql += ' GROUP BY revenue_type ORDER BY total DESC';
    
    const summary = await query(sql, params);
    res.json(summary);
  } catch (error) {
    console.error('Get revenue summary error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = revenueSchema.parse(req.body);
    
    const revenue = await queryOne(
      `INSERT INTO revenue (transaction_date, revenue_type, amount, currency, patient_id, appointment_id, payment_method, payment_status, invoice_number, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.transaction_date || new Date().toISOString().split('T')[0],
        data.revenue_type,
        data.amount,
        data.currency || 'USD',
        data.patient_id || null,
        data.appointment_id || null,
        data.payment_method || null,
        data.payment_status || 'pending',
        data.invoice_number || null,
        data.description || null,
        req.user!.id
      ]
    );
    
    res.status(201).json(revenue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create revenue error:', error);
    res.status(500).json({ error: 'Failed to create revenue record' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = revenueSchema.partial().parse(req.body);
    
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
    
    const revenue = await queryOne(
      `UPDATE revenue SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!revenue) {
      return res.status(404).json({ error: 'Revenue record not found' });
    }
    
    res.json(revenue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update revenue error:', error);
    res.status(500).json({ error: 'Failed to update revenue record' });
  }
});

export default router;
