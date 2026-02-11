import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

const invoiceItemSchema = z.object({
  item_type: z.enum(['consultation', 'procedure', 'laboratory', 'radiology', 'pharmacy', 'bed_charges', 'supplies', 'other']),
  item_code: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().min(1).default(1),
  unit_price: z.number().min(0),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_percent: z.number().min(0).max(100).default(0),
  reference_id: z.string().uuid().optional(),
  notes: z.string().optional()
});

const invoiceSchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  discount_amount: z.number().min(0).default(0),
  insurance_claim_id: z.string().optional(),
  insurance_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1)
});

// Get all invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, status, from_date, to_date, limit = '50', offset = '0' } = req.query;
    
    let sql = `
      SELECT i.*, 
        p.first_name, p.last_name, p.patient_number,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM invoices i
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (patient_id) {
      sql += ` AND i.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (status) {
      sql += ` AND i.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (from_date) {
      sql += ` AND i.invoice_date >= $${paramIndex++}`;
      params.push(from_date);
    }
    
    if (to_date) {
      sql += ` AND i.invoice_date <= $${paramIndex++}`;
      params.push(to_date);
    }
    
    sql += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const result = await query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { from_date, to_date } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_count,
        COALESCE(SUM(total_amount), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(balance_due), 0) as total_outstanding
      FROM invoices
      WHERE invoice_date >= $1 AND invoice_date <= $2
    `, [from_date || today, to_date || today]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice stats' });
  }
});

// Get invoice by ID with items
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await queryOne(`
      SELECT i.*, 
        p.first_name, p.last_name, p.patient_number, p.phone, p.email, p.address
      FROM invoices i
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE i.id = $1
    `, [req.params.id]);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const items = await query(`
      SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at
    `, [req.params.id]);
    
    const payments = await query(`
      SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC
    `, [req.params.id]);
    
    res.json({ ...invoice, items, payments });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = invoiceSchema.parse(req.body);
    
    // Generate invoice number
    const invoiceNum = `INV-${Date.now().toString(36).toUpperCase()}`;
    
    // Calculate totals from items
    let subtotal = 0;
    let taxTotal = 0;
    
    const itemsWithTotals = data.items.map(item => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discountAmount = itemSubtotal * (item.discount_percent / 100);
      const afterDiscount = itemSubtotal - discountAmount;
      const taxAmount = afterDiscount * (item.tax_percent / 100);
      const totalPrice = afterDiscount + taxAmount;
      
      subtotal += afterDiscount;
      taxTotal += taxAmount;
      
      return { ...item, total_price: totalPrice };
    });
    
    const totalAmount = subtotal + taxTotal - data.discount_amount;
    const balanceDue = totalAmount - data.insurance_amount;
    
    // Create invoice
    const invoice = await queryOne(`
      INSERT INTO invoices (
        invoice_number, patient_id, appointment_id, due_date,
        subtotal, tax_amount, discount_amount, total_amount,
        paid_amount, balance_due, insurance_claim_id, insurance_amount,
        notes, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      invoiceNum,
      data.patient_id,
      data.appointment_id || null,
      data.due_date || null,
      subtotal,
      taxTotal,
      data.discount_amount,
      totalAmount,
      0,
      balanceDue,
      data.insurance_claim_id || null,
      data.insurance_amount,
      data.notes || null,
      'pending',
      req.user!.id
    ]);
    
    // Create invoice items
    for (const item of itemsWithTotals) {
      await query(`
        INSERT INTO invoice_items (
          invoice_id, item_type, item_code, description, quantity,
          unit_price, discount_percent, tax_percent, total_price,
          reference_id, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        invoice.id,
        item.item_type,
        item.item_code || null,
        item.description,
        item.quantity,
        item.unit_price,
        item.discount_percent,
        item.tax_percent,
        item.total_price,
        item.reference_id || null,
        item.notes || null
      ]);
    }
    
    res.status(201).json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Record payment
router.post('/:id/payments', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, payment_method, reference_number, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Get current invoice
    const invoice = await queryOne('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Generate payment number
    const paymentNum = `PAY-${Date.now().toString(36).toUpperCase()}`;
    
    // Create payment record
    const payment = await queryOne(`
      INSERT INTO payments (
        invoice_id, payment_number, amount, payment_method,
        reference_number, notes, received_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      req.params.id,
      paymentNum,
      amount,
      payment_method || 'cash',
      reference_number || null,
      notes || null,
      req.user!.id
    ]);
    
    // Update invoice paid amount and status
    const newPaidAmount = parseFloat(invoice.paid_amount) + amount;
    const newBalance = parseFloat(invoice.total_amount) - newPaidAmount;
    let newStatus = invoice.status;
    
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }
    
    await query(`
      UPDATE invoices
      SET paid_amount = $1, balance_due = $2, status = $3, payment_method = $4
      WHERE id = $5
    `, [newPaidAmount, Math.max(0, newBalance), newStatus, payment_method, req.params.id]);
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Update invoice status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const invoice = await queryOne(`
      UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *
    `, [status, req.params.id]);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Delete invoice
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if invoice has payments
    const payments = await query('SELECT COUNT(*) as count FROM payments WHERE invoice_id = $1', [req.params.id]);
    if (payments[0]?.count > 0) {
      return res.status(400).json({ error: 'Cannot delete invoice with payments. Cancel instead.' });
    }
    
    await query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
