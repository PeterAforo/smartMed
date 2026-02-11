import { Router, Response } from 'express';
import { query } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Get all regions
router.get('/regions', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM ghana_regions ORDER BY name');
    res.json(result);
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// Get constituencies by region
router.get('/constituencies', async (req: AuthRequest, res: Response) => {
  try {
    const { region_id, region_name } = req.query;
    
    let sql = `
      SELECT c.*, r.name as region_name 
      FROM ghana_constituencies c
      LEFT JOIN ghana_regions r ON c.region_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (region_id) {
      sql += ` AND c.region_id = $${paramIndex++}`;
      params.push(region_id);
    }
    
    if (region_name) {
      sql += ` AND r.name = $${paramIndex++}`;
      params.push(region_name);
    }
    
    sql += ' ORDER BY c.name';
    
    const result = await query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Get constituencies error:', error);
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
});

// Get districts by constituency or region
router.get('/districts', async (req: AuthRequest, res: Response) => {
  try {
    const { constituency_id, region_id, region_name } = req.query;
    
    let sql = `
      SELECT d.*, c.name as constituency_name, r.name as region_name 
      FROM ghana_districts d
      LEFT JOIN ghana_constituencies c ON d.constituency_id = c.id
      LEFT JOIN ghana_regions r ON d.region_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (constituency_id) {
      sql += ` AND d.constituency_id = $${paramIndex++}`;
      params.push(constituency_id);
    }
    
    if (region_id) {
      sql += ` AND d.region_id = $${paramIndex++}`;
      params.push(region_id);
    }
    
    if (region_name) {
      sql += ` AND r.name = $${paramIndex++}`;
      params.push(region_name);
    }
    
    sql += ' ORDER BY d.name';
    
    const result = await query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

export default router;
