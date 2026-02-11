import { Router, Response } from 'express';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';
import { format } from 'date-fns';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get total patients
    const patientsResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM patients WHERE status = 'active'`
    );

    // Get beds stats
    const bedsResult = await query<{ status: string }>(
      `SELECT status FROM beds`
    );
    const occupiedBeds = bedsResult.filter(b => b.status === 'occupied').length;
    const totalBeds = bedsResult.length;

    // Get today's appointments
    const appointmentsResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM appointments WHERE appointment_date = $1 AND status != 'cancelled'`,
      [today]
    );

    // Get active alerts
    const alertsResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM alerts WHERE status = 'active'`
    );

    // Get staff count
    const staffResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users`
    );

    // Get today's revenue
    const revenueResult = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE transaction_date = $1 AND payment_status = 'paid'`,
      [today]
    );

    res.json({
      totalPatients: parseInt(patientsResult?.count || '0'),
      activeBeds: `${occupiedBeds}/${totalBeds}`,
      bedOccupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0',
      todayAppointments: parseInt(appointmentsResult?.count || '0'),
      activeAlerts: parseInt(alertsResult?.count || '0'),
      staffCount: parseInt(staffResult?.count || '0'),
      todayRevenue: parseFloat(revenueResult?.total || '0')
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/activities', async (req: AuthRequest, res: Response) => {
  try {
    const activities = await query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM activities a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC 
       LIMIT 10`
    );
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/alerts', async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await query(
      `SELECT * FROM alerts WHERE status = 'active' ORDER BY priority ASC, created_at DESC LIMIT 10`
    );
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
