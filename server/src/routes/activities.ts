import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

const activitySchema = z.object({
  activity_type: z.enum(['patient_created', 'appointment_scheduled', 'appointment_completed', 'bed_assigned', 'bed_released', 'alert_created', 'alert_resolved', 'revenue_recorded', 'user_login', 'user_logout']),
  entity_type: z.enum(['patient', 'appointment', 'bed', 'alert', 'revenue', 'user']).optional(),
  entity_id: z.string().uuid().optional(),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { activity_type, entity_type, limit = '50' } = req.query;
    
    let sql = 'SELECT a.*, u.first_name, u.last_name FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (activity_type) {
      sql += ` AND a.activity_type = $${paramIndex++}`;
      params.push(activity_type);
    }
    
    if (entity_type) {
      sql += ` AND a.entity_type = $${paramIndex++}`;
      params.push(entity_type);
    }
    
    sql += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const activities = await query(sql, params);
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = activitySchema.parse(req.body);
    
    const activity = await queryOne(
      `INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user!.id,
        data.activity_type,
        data.entity_type || null,
        data.entity_id || null,
        data.description,
        JSON.stringify(data.metadata || {})
      ]
    );
    
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;
