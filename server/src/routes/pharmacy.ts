import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Medications
router.get('/medications', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, low_stock } = req.query;
    
    let sql = 'SELECT * FROM medications WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR generic_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (low_stock === 'true') {
      sql += ` AND stock_quantity <= reorder_level`;
    }
    
    sql += ' ORDER BY name';
    
    const medications = await query(sql, params);
    res.json(medications);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

router.post('/medications', async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, generic_name, category, form, strength, unit, manufacturer, unit_price, stock_quantity, reorder_level, is_controlled } = req.body;
    
    const medication = await queryOne(`
      INSERT INTO medications (code, name, generic_name, category, form, strength, unit, manufacturer, unit_price, stock_quantity, reorder_level, is_controlled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [code, name, generic_name, category, form, strength, unit, manufacturer, unit_price || 0, stock_quantity || 0, reorder_level || 10, is_controlled || false]);
    
    res.status(201).json(medication);
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

router.put('/medications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, generic_name, category, form, strength, unit, manufacturer, unit_price, stock_quantity, reorder_level, is_controlled, is_active } = req.body;
    
    const medication = await queryOne(`
      UPDATE medications 
      SET name = COALESCE($1, name), generic_name = COALESCE($2, generic_name), category = COALESCE($3, category),
          form = COALESCE($4, form), strength = COALESCE($5, strength), unit = COALESCE($6, unit),
          manufacturer = COALESCE($7, manufacturer), unit_price = COALESCE($8, unit_price),
          stock_quantity = COALESCE($9, stock_quantity), reorder_level = COALESCE($10, reorder_level),
          is_controlled = COALESCE($11, is_controlled), is_active = COALESCE($12, is_active), updated_at = NOW()
      WHERE id = $13 RETURNING *
    `, [name, generic_name, category, form, strength, unit, manufacturer, unit_price, stock_quantity, reorder_level, is_controlled, is_active, req.params.id]);
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// Prescriptions
router.get('/prescriptions', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, status, limit = '50' } = req.query;
    
    let sql = `
      SELECT pr.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
             u.first_name as prescriber_first_name, u.last_name as prescriber_last_name
      FROM prescriptions pr
      LEFT JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN users u ON pr.prescriber_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (patient_id) {
      sql += ` AND pr.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    if (status) {
      sql += ` AND pr.status = $${paramIndex++}`;
      params.push(status);
    }
    
    sql += ` ORDER BY pr.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const prescriptions = await query(sql, params);
    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/prescriptions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const prescription = await queryOne(`
      SELECT pr.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             u.first_name as prescriber_first_name, u.last_name as prescriber_last_name
      FROM prescriptions pr
      LEFT JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN users u ON pr.prescriber_id = u.id
      WHERE pr.id = $1
    `, [req.params.id]);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const items = await query(`
      SELECT pi.*, m.name as medication_name, m.form, m.strength
      FROM prescription_items pi
      LEFT JOIN medications m ON pi.medication_id = m.id
      WHERE pi.prescription_id = $1
    `, [req.params.id]);
    
    res.json({ ...prescription, items });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

router.post('/prescriptions', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, appointment_id, notes, items } = req.body;
    
    const prescriptionNumber = `RX-${Date.now().toString(36).toUpperCase()}`;
    
    const prescription = await queryOne(`
      INSERT INTO prescriptions (prescription_number, patient_id, prescriber_id, appointment_id, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [prescriptionNumber, patient_id, req.user!.id, appointment_id, notes]);
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          INSERT INTO prescription_items (prescription_id, medication_id, dosage, frequency, duration, quantity, instructions)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [prescription.id, item.medication_id, item.dosage, item.frequency, item.duration, item.quantity, item.instructions]);
      }
    }
    
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

router.put('/prescriptions/:id/dispense', async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          UPDATE prescription_items 
          SET dispensed_quantity = $1, dispensed_by = $2, dispensed_at = NOW()
          WHERE id = $3
        `, [item.dispensed_quantity, req.user!.id, item.id]);
        
        // Update medication stock
        if (item.medication_id && item.dispensed_quantity) {
          await query(`
            UPDATE medications SET stock_quantity = stock_quantity - $1, updated_at = NOW()
            WHERE id = $2
          `, [item.dispensed_quantity, item.medication_id]);
        }
      }
    }
    
    const prescription = await queryOne(`
      UPDATE prescriptions SET status = 'dispensed', updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [req.params.id]);
    
    res.json(prescription);
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({ error: 'Failed to dispense prescription' });
  }
});

export default router;
