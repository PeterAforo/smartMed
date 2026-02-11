import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Staff/Users
router.get('/staff', async (req: AuthRequest, res: Response) => {
  try {
    const { department, role, search } = req.query;
    
    let sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.employee_id, u.department, u.phone, u.avatar_url, u.created_at,
             array_agg(ur.role) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (department) {
      sql += ` AND u.department = $${paramIndex++}`;
      params.push(department);
    }
    if (search) {
      sql += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ' GROUP BY u.id ORDER BY u.last_name, u.first_name';
    
    const staff = await query(sql, params);
    
    if (role) {
      const filtered = staff.filter((s: any) => s.roles && s.roles.includes(role));
      return res.json(filtered);
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.get('/staff/:id', async (req: AuthRequest, res: Response) => {
  try {
    const staff = await queryOne(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.employee_id, u.department, u.phone, u.avatar_url, u.created_at,
             array_agg(ur.role) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.params.id]);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

router.put('/staff/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { first_name, last_name, department, phone, employee_id } = req.body;
    
    const staff = await queryOne(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
          department = COALESCE($3, department), phone = COALESCE($4, phone),
          employee_id = COALESCE($5, employee_id), updated_at = NOW()
      WHERE id = $6 RETURNING id, email, first_name, last_name, employee_id, department, phone
    `, [first_name, last_name, department, phone, employee_id, req.params.id]);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Departments
router.get('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const departments = await query(`
      SELECT d.*, u.first_name as head_first_name, u.last_name as head_last_name
      FROM departments d
      LEFT JOIN users u ON d.head_id = u.id
      WHERE d.is_active = true
      ORDER BY d.name
    `);
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, description, head_id } = req.body;
    
    const department = await queryOne(`
      INSERT INTO departments (code, name, description, head_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [code, name, description, head_id]);
    
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Schedules
router.get('/schedules', async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, department_id, start_date, end_date } = req.query;
    
    let sql = `
      SELECT ss.*, u.first_name, u.last_name, d.name as department_name
      FROM staff_schedules ss
      LEFT JOIN users u ON ss.user_id = u.id
      LEFT JOIN departments d ON ss.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (user_id) {
      sql += ` AND ss.user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (department_id) {
      sql += ` AND ss.department_id = $${paramIndex++}`;
      params.push(department_id);
    }
    if (start_date) {
      sql += ` AND ss.schedule_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      sql += ` AND ss.schedule_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    sql += ' ORDER BY ss.schedule_date, ss.shift_start';
    
    const schedules = await query(sql, params);
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/schedules', async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, schedule_date, shift_start, shift_end, department_id, notes } = req.body;
    
    const schedule = await queryOne(`
      INSERT INTO staff_schedules (user_id, schedule_date, shift_start, shift_end, department_id, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id, schedule_date, shift_start, shift_end, department_id, notes]);
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Leave Requests
router.get('/leave-requests', async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, status } = req.query;
    
    let sql = `
      SELECT lr.*, u.first_name, u.last_name, 
             a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM leave_requests lr
      LEFT JOIN users u ON lr.user_id = u.id
      LEFT JOIN users a ON lr.approved_by = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (user_id) {
      sql += ` AND lr.user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (status) {
      sql += ` AND lr.status = $${paramIndex++}`;
      params.push(status);
    }
    
    sql += ' ORDER BY lr.created_at DESC';
    
    const requests = await query(sql, params);
    res.json(requests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

router.post('/leave-requests', async (req: AuthRequest, res: Response) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    
    const request = await queryOne(`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user!.id, leave_type, start_date, end_date, reason]);
    
    res.status(201).json(request);
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

router.put('/leave-requests/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const request = await queryOne(`
      UPDATE leave_requests 
      SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [req.user!.id, req.params.id]);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

router.put('/leave-requests/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const request = await queryOne(`
      UPDATE leave_requests 
      SET status = 'rejected', approved_by = $1, approved_at = NOW(), updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [req.user!.id, req.params.id]);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Reject leave request error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
});

export default router;
