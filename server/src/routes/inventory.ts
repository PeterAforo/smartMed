import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Inventory Items
router.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, low_stock } = req.query;
    
    let sql = 'SELECT * FROM inventory_items WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR item_code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (low_stock === 'true') {
      sql += ` AND quantity_on_hand <= reorder_level`;
    }
    
    sql += ' ORDER BY name';
    
    const items = await query(sql, params);
    res.json(items);
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

router.get('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await queryOne('SELECT * FROM inventory_items WHERE id = $1', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const { item_code, name, category, subcategory, unit, unit_cost, quantity_on_hand, reorder_level, reorder_quantity, location, supplier } = req.body;
    
    const item = await queryOne(`
      INSERT INTO inventory_items (item_code, name, category, subcategory, unit, unit_cost, quantity_on_hand, reorder_level, reorder_quantity, location, supplier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [item_code, name, category, subcategory, unit, unit_cost || 0, quantity_on_hand || 0, reorder_level || 10, reorder_quantity || 50, location, supplier]);
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, subcategory, unit, unit_cost, quantity_on_hand, reorder_level, reorder_quantity, location, supplier, is_active } = req.body;
    
    const item = await queryOne(`
      UPDATE inventory_items 
      SET name = COALESCE($1, name), category = COALESCE($2, category), subcategory = COALESCE($3, subcategory),
          unit = COALESCE($4, unit), unit_cost = COALESCE($5, unit_cost), quantity_on_hand = COALESCE($6, quantity_on_hand),
          reorder_level = COALESCE($7, reorder_level), reorder_quantity = COALESCE($8, reorder_quantity),
          location = COALESCE($9, location), supplier = COALESCE($10, supplier), is_active = COALESCE($11, is_active),
          updated_at = NOW()
      WHERE id = $12 RETURNING *
    `, [name, category, subcategory, unit, unit_cost, quantity_on_hand, reorder_level, reorder_quantity, location, supplier, is_active, req.params.id]);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Inventory Transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { item_id, transaction_type, limit = '50' } = req.query;
    
    let sql = `
      SELECT it.*, ii.name as item_name, ii.item_code, u.first_name, u.last_name
      FROM inventory_transactions it
      LEFT JOIN inventory_items ii ON it.item_id = ii.id
      LEFT JOIN users u ON it.performed_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (item_id) {
      sql += ` AND it.item_id = $${paramIndex++}`;
      params.push(item_id);
    }
    if (transaction_type) {
      sql += ` AND it.transaction_type = $${paramIndex++}`;
      params.push(transaction_type);
    }
    
    sql += ` ORDER BY it.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const transactions = await query(sql, params);
    res.json(transactions);
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory transactions' });
  }
});

router.post('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { item_id, transaction_type, quantity, unit_cost, reference_number, reference_type, notes } = req.body;
    
    // Create transaction
    const transaction = await queryOne(`
      INSERT INTO inventory_transactions (item_id, transaction_type, quantity, unit_cost, reference_number, reference_type, notes, performed_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [item_id, transaction_type, quantity, unit_cost, reference_number, reference_type, notes, req.user!.id]);
    
    // Update item quantity
    let quantityChange = quantity;
    if (transaction_type === 'issue') {
      quantityChange = -quantity;
    }
    
    await query(`
      UPDATE inventory_items SET quantity_on_hand = quantity_on_hand + $1, updated_at = NOW()
      WHERE id = $2
    `, [quantityChange, item_id]);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create inventory transaction error:', error);
    res.status(500).json({ error: 'Failed to create inventory transaction' });
  }
});

// Purchase Orders
router.get('/purchase-orders', async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '50' } = req.query;
    
    let sql = `
      SELECT po.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM purchase_orders po
      LEFT JOIN users u ON po.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND po.status = $${paramIndex++}`;
      params.push(status);
    }
    
    sql += ` ORDER BY po.created_at DESC LIMIT $${paramIndex++}`;
    params.push(parseInt(limit as string));
    
    const orders = await query(sql, params);
    res.json(orders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

router.get('/purchase-orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne(`
      SELECT po.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM purchase_orders po
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.id = $1
    `, [req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    const items = await query(`
      SELECT poi.*, ii.name as item_name, ii.item_code
      FROM purchase_order_items poi
      LEFT JOIN inventory_items ii ON poi.item_id = ii.id
      WHERE poi.po_id = $1
    `, [req.params.id]);
    
    res.json({ ...order, items });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

router.post('/purchase-orders', async (req: AuthRequest, res: Response) => {
  try {
    const { supplier, expected_delivery_date, notes, items } = req.body;
    
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
    
    let totalAmount = 0;
    if (items && Array.isArray(items)) {
      totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_cost), 0);
    }
    
    const order = await queryOne(`
      INSERT INTO purchase_orders (po_number, supplier, expected_delivery_date, total_amount, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [poNumber, supplier, expected_delivery_date, totalAmount, notes, req.user!.id]);
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_cost)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.item_id, item.quantity, item.unit_cost]);
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

router.put('/purchase-orders/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const order = await queryOne(`
      UPDATE purchase_orders SET status = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [status, req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update purchase order status error:', error);
    res.status(500).json({ error: 'Failed to update purchase order status' });
  }
});

export default router;
