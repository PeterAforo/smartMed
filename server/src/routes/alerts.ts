import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const alertSchema = z.object({
  alert_type: z.enum(['critical', 'warning', 'info', 'emergency']),
  priority: z.number().min(1).max(5).optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  entity_type: z.enum(['patient', 'bed', 'staff', 'equipment', 'system']).optional(),
  entity_id: z.string().uuid().optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority } = req.query;
    
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (priority) {
      sql += ` AND priority = $${paramIndex++}`;
      params.push(parseInt(priority as string));
    }
    
    sql += ' ORDER BY priority ASC, created_at DESC LIMIT 50';
    
    const alerts = await query(sql, params);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = alertSchema.parse(req.body);
    
    const alert = await queryOne(
      `INSERT INTO alerts (alert_type, priority, title, message, entity_type, entity_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.alert_type,
        data.priority || 3,
        data.title,
        data.message,
        data.entity_type || null,
        data.entity_id || null,
        req.user!.id
      ]
    );
    
    res.status(201).json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.put('/:id/acknowledge', async (req: AuthRequest, res: Response) => {
  try {
    const alert = await queryOne(
      `UPDATE alerts SET status = 'acknowledged', acknowledged_by = $1, acknowledged_at = NOW(), updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [req.user!.id, req.params.id]
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

router.put('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const alert = await queryOne(
      `UPDATE alerts SET status = 'resolved', resolved_by = $1, resolved_at = NOW(), updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [req.user!.id, req.params.id]
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export default router;
