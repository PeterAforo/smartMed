import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

const queueSchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  department: z.string().min(1),
  service_type: z.string().optional(),
  priority: z.number().min(1).max(5).optional(),
  room_number: z.string().optional(),
  notes: z.string().optional()
});

// Get all queue entries (optionally filter by department/status)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { department, status, date } = req.query;
    
    let sql = `
      SELECT q.*, 
        p.first_name, p.last_name, p.patient_number, p.phone,
        u.first_name as staff_first_name, u.last_name as staff_last_name
      FROM patient_queue q
      LEFT JOIN patients p ON q.patient_id = p.id
      LEFT JOIN users u ON q.serving_staff_id = u.id
      WHERE DATE(q.check_in_time) = $1
    `;
    const params: any[] = [date || new Date().toISOString().split('T')[0]];
    let paramIndex = 2;
    
    if (department) {
      sql += ` AND q.department = $${paramIndex++}`;
      params.push(department);
    }
    
    if (status) {
      sql += ` AND q.status = $${paramIndex++}`;
      params.push(status);
    }
    
    sql += ` ORDER BY q.priority ASC, q.queue_number ASC`;
    
    const result = await query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Get queue stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await queryOne(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting,
        COUNT(*) FILTER (WHERE status = 'called') as called,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
        COUNT(*) as total,
        AVG(EXTRACT(EPOCH FROM (called_time - check_in_time))/60) FILTER (WHERE called_time IS NOT NULL) as avg_wait_minutes
      FROM patient_queue
      WHERE DATE(check_in_time) = $1
    `, [today]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({ error: 'Failed to fetch queue stats' });
  }
});

// Get current serving (for display board)
router.get('/now-serving', async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.query;
    
    let sql = `
      SELECT q.*, 
        p.first_name, p.last_name, p.patient_number
      FROM patient_queue q
      LEFT JOIN patients p ON q.patient_id = p.id
      WHERE q.status IN ('called', 'in_progress')
      AND DATE(q.check_in_time) = CURRENT_DATE
    `;
    
    if (department) {
      sql += ` AND q.department = $1`;
      const result = await query(sql, [department]);
      return res.json(result);
    }
    
    sql += ` ORDER BY q.called_time DESC`;
    const result = await query(sql);
    res.json(result);
  } catch (error) {
    console.error('Get now serving error:', error);
    res.status(500).json({ error: 'Failed to fetch now serving' });
  }
});

// Add patient to queue
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = queueSchema.parse(req.body);
    
    // Check if patient already has an active queue entry
    const existingEntry = await queryOne(`
      SELECT * FROM patient_queue 
      WHERE patient_id = $1 
      AND status IN ('waiting', 'called', 'in_progress')
    `, [data.patient_id]);
    
    if (existingEntry) {
      return res.status(409).json({ 
        error: 'Patient is already in the queue',
        existingEntry 
      });
    }
    
    // Get next queue number for today
    const queueNum = await queryOne(`
      SELECT COALESCE(MAX(queue_number), 0) + 1 as next_num
      FROM patient_queue
      WHERE DATE(check_in_time) = CURRENT_DATE
      AND department = $1
    `, [data.department]);
    
    const queueEntry = await queryOne(`
      INSERT INTO patient_queue (
        patient_id, appointment_id, queue_number, department, 
        service_type, priority, room_number, notes, current_stage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'waiting')
      RETURNING *
    `, [
      data.patient_id,
      data.appointment_id || null,
      queueNum.next_num,
      data.department,
      data.service_type || 'consultation',
      data.priority || 3,
      data.room_number || null,
      data.notes || null
    ]);
    
    res.status(201).json(queueEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Add to queue error:', error);
    res.status(500).json({ error: 'Failed to add to queue' });
  }
});

// Call next patient
router.post('/call-next', async (req: AuthRequest, res: Response) => {
  try {
    const { department, room_number } = req.body;
    
    // Find next waiting patient with highest priority
    const nextPatient = await queryOne(`
      SELECT * FROM patient_queue
      WHERE status = 'waiting'
      AND department = $1
      AND DATE(check_in_time) = CURRENT_DATE
      ORDER BY priority ASC, queue_number ASC
      LIMIT 1
    `, [department]);
    
    if (!nextPatient) {
      return res.status(404).json({ error: 'No patients waiting' });
    }
    
    // Update status to called
    const updated = await queryOne(`
      UPDATE patient_queue
      SET status = 'called', 
          called_time = NOW(),
          serving_staff_id = $1,
          room_number = $2
      WHERE id = $3
      RETURNING *
    `, [req.user!.id, room_number || null, nextPatient.id]);
    
    res.json(updated);
  } catch (error) {
    console.error('Call next error:', error);
    res.status(500).json({ error: 'Failed to call next patient' });
  }
});

// Update queue entry status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, room_number } = req.body;
    
    let updateFields = 'status = $1';
    const params: any[] = [status, id];
    let paramIndex = 3;
    
    if (status === 'called') {
      updateFields += `, called_time = NOW(), serving_staff_id = $${paramIndex++}`;
      params.splice(2, 0, req.user!.id);
    } else if (status === 'in_progress') {
      updateFields += `, start_time = NOW()`;
    } else if (status === 'completed' || status === 'no_show') {
      updateFields += `, end_time = NOW()`;
    }
    
    if (room_number) {
      updateFields += `, room_number = $${paramIndex++}`;
      params.splice(params.length - 1, 0, room_number);
    }
    
    const updated = await queryOne(`
      UPDATE patient_queue
      SET ${updateFields}
      WHERE id = $2
      RETURNING *
    `, params);
    
    if (!updated) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({ error: 'Failed to update queue status' });
  }
});

// Update queue entry stage (workflow stage)
router.patch('/:id/stage', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, room_number } = req.body;
    
    // Map stage to appropriate status
    let status = 'in_progress';
    if (stage === 'waiting') status = 'waiting';
    else if (stage === 'completed' || stage === 'discharged') status = 'completed';
    
    let sql = `
      UPDATE patient_queue
      SET current_stage = $1, status = $2, serving_staff_id = $3
    `;
    const params: any[] = [stage, status, req.user!.id, id];
    
    if (room_number) {
      sql += `, room_number = $5`;
      params.push(room_number);
    }
    
    sql += ` WHERE id = $4 RETURNING *`;
    
    const updated = await queryOne(sql, params);
    
    if (!updated) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Update queue stage error:', error);
    res.status(500).json({ error: 'Failed to update queue stage' });
  }
});

// Delete queue entry
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM patient_queue WHERE id = $1', [id]);
    res.json({ message: 'Queue entry deleted' });
  } catch (error) {
    console.error('Delete queue error:', error);
    res.status(500).json({ error: 'Failed to delete queue entry' });
  }
});

export default router;
