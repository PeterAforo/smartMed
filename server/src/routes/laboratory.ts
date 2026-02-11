import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Lab Orders
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { status, patient_id, limit = '50' } = req.query;
    
    let sql = `
      SELECT lo.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
             u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM lab_orders lo
      LEFT JOIN patients p ON lo.patient_id = p.id
      LEFT JOIN users u ON lo.ordering_doctor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND lo.status = $${paramIndex++}`;
      params.push(status);
    }
    if (patient_id) {
      sql += ` AND lo.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    sql += ` ORDER BY lo.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const orders = await query(sql, params);
    res.json(orders);
  } catch (error) {
    console.error('Get lab orders error:', error);
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne(`
      SELECT lo.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM lab_orders lo
      LEFT JOIN patients p ON lo.patient_id = p.id
      LEFT JOIN users u ON lo.ordering_doctor_id = u.id
      WHERE lo.id = $1
    `, [req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    const tests = await query('SELECT * FROM lab_tests WHERE order_id = $1', [req.params.id]);
    res.json({ ...order, tests });
  } catch (error) {
    console.error('Get lab order error:', error);
    res.status(500).json({ error: 'Failed to fetch lab order' });
  }
});

router.post('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, ordering_doctor_id, priority, notes, tests } = req.body;
    
    const orderNumber = `LAB-${Date.now().toString(36).toUpperCase()}`;
    
    const order = await queryOne(`
      INSERT INTO lab_orders (order_number, patient_id, ordering_doctor_id, priority, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [orderNumber, patient_id, ordering_doctor_id || req.user!.id, priority || 'routine', notes, req.user!.id]);
    
    if (tests && Array.isArray(tests)) {
      for (const test of tests) {
        await query(`
          INSERT INTO lab_tests (order_id, test_code, test_name, category)
          VALUES ($1, $2, $3, $4)
        `, [order.id, test.test_code, test.test_name, test.category]);
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create lab order error:', error);
    res.status(500).json({ error: 'Failed to create lab order' });
  }
});

router.put('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    
    const order = await queryOne(`
      UPDATE lab_orders SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [status, notes, req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Lab order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update lab order error:', error);
    res.status(500).json({ error: 'Failed to update lab order' });
  }
});

// Lab Tests / Results
router.get('/tests', async (req: AuthRequest, res: Response) => {
  try {
    const { order_id, status } = req.query;
    
    let sql = 'SELECT * FROM lab_tests WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (order_id) {
      sql += ` AND order_id = $${paramIndex++}`;
      params.push(order_id);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const tests = await query(sql, params);
    res.json(tests);
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
});

router.put('/tests/:id/result', async (req: AuthRequest, res: Response) => {
  try {
    const { result_value, result_unit, reference_range, is_abnormal } = req.body;
    
    const test = await queryOne(`
      UPDATE lab_tests 
      SET result_value = $1, result_unit = $2, reference_range = $3, is_abnormal = $4,
          status = 'completed', performed_by = $5, performed_at = NOW(), updated_at = NOW()
      WHERE id = $6 RETURNING *
    `, [result_value, result_unit, reference_range, is_abnormal || false, req.user!.id, req.params.id]);
    
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Update lab test result error:', error);
    res.status(500).json({ error: 'Failed to update lab test result' });
  }
});

export default router;
