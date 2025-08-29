// Standard data contracts for healthcare entities as defined in System Flows & Interactions Spec

export interface Encounter {
  id: string;
  patient_id: string;
  encounter_number: string;
  encounter_type: 'OPD' | 'IPD' | 'ER';
  status: 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  location?: string;
  attending_staff?: string;
  diagnoses: string[];
  linked_orders: string[];
  linked_invoices: string[];
  tenant_id: string;
  branch_id: string;
  chief_complaint?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  encounter_id: string;
  patient_id: string;
  order_number: string;
  order_type: 'lab' | 'imaging' | 'pharmacy' | 'service' | 'procedure';
  order_code: string;
  order_name: string;
  priority: 'stat' | 'urgent' | 'routine';
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  ordered_by: string;
  ordered_at: string;
  scheduled_at?: string;
  completed_at?: string;
  instructions?: string;
  clinical_notes?: string;
  charges: OrderCharge[];
  metadata: Record<string, any>;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCharge {
  item_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  scheme_discount?: number;
  payer_coverage?: number;
}

export interface Result {
  id: string;
  order_id: string;
  patient_id: string;
  result_type: 'lab' | 'imaging' | 'pathology' | 'other';
  result_data: Record<string, any>;
  reference_ranges: ReferenceRange[];
  status: 'preliminary' | 'validated' | 'amended' | 'cancelled';
  reported_by?: string;
  validated_by?: string;
  reported_at: string;
  validated_at?: string;
  critical_flag: boolean;
  notes?: string;
  attachments: ResultAttachment[];
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceRange {
  parameter: string;
  min_value?: number;
  max_value?: number;
  unit: string;
  gender?: 'M' | 'F';
  age_min?: number;
  age_max?: number;
}

export interface ResultAttachment {
  filename: string;
  file_type: string;
  file_url: string;
  file_size: number;
}

export interface Invoice {
  id: string;
  encounter_id: string;
  patient_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lines: InvoiceLine[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  balance: number;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  item_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  scheme_discount?: number;
  payer_id?: string;
  payer_coverage?: number;
}

export interface Claim {
  id: string;
  invoice_id: string;
  payer_id: string;
  claim_number: string;
  submission_date: string;
  lines: ClaimLine[];
  status: 'draft' | 'submitted' | 'processing' | 'paid' | 'denied' | 'partially_paid';
  remittance: RemittanceEntry[];
  total_claimed: number;
  total_approved?: number;
  total_paid?: number;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimLine {
  line_number: number;
  service_code: string;
  service_date: string;
  quantity: number;
  unit_price: number;
  total_charge: number;
  diagnosis_codes: string[];
}

export interface RemittanceEntry {
  line_number: number;
  approved_amount: number;
  denied_amount: number;
  denial_reason?: string;
  payment_date?: string;
}

export interface StockMove {
  id: string;
  item_id: string;
  batch_id?: string;
  move_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity_change: number;
  unit_cost?: number;
  total_cost?: number;
  reason: 'order_dispense' | 'receive' | 'transfer' | 'adjustment' | 'return' | 'expired';
  reference_type?: string;
  reference_id?: string;
  location_from?: string;
  location_to?: string;
  moved_by: string;
  moved_at: string;
  notes?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  event_id: string;
  tenant_id: string;
  branch_id?: string;
  actor_id: string;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  event_timestamp: string;
  hash_chain?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Utility types for common healthcare workflows
export interface PatientRegistrationData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: EmergencyContact;
  insurance_policies?: InsurancePolicy[];
  allergies?: string[];
  medical_conditions?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsurancePolicy {
  provider_id: string;
  policy_number: string;
  group_number?: string;
  effective_date: string;
  expiry_date?: string;
  is_primary: boolean;
}

export interface TriageData {
  vitals: VitalSigns;
  chief_complaint: string;
  pain_scale?: number;
  triage_level: 1 | 2 | 3 | 4 | 5; // ESI levels
  allergies?: string[];
  current_medications?: string[];
  symptoms: string[];
}

export interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

// Data validation utilities
export class DataValidator {
  static validateEncounter(encounter: Partial<Encounter>): string[] {
    const errors: string[] = [];
    
    if (!encounter.patient_id) errors.push('Patient ID is required');
    if (!encounter.encounter_type) errors.push('Encounter type is required');
    if (!encounter.tenant_id) errors.push('Tenant ID is required');
    if (!encounter.branch_id) errors.push('Branch ID is required');
    
    return errors;
  }

  static validateOrder(order: Partial<Order>): string[] {
    const errors: string[] = [];
    
    if (!order.encounter_id) errors.push('Encounter ID is required');
    if (!order.patient_id) errors.push('Patient ID is required');
    if (!order.order_type) errors.push('Order type is required');
    if (!order.order_code) errors.push('Order code is required');
    if (!order.ordered_by) errors.push('Ordered by is required');
    
    return errors;
  }

  static validateResult(result: Partial<Result>): string[] {
    const errors: string[] = [];
    
    if (!result.order_id) errors.push('Order ID is required');
    if (!result.patient_id) errors.push('Patient ID is required');
    if (!result.result_type) errors.push('Result type is required');
    if (!result.result_data || Object.keys(result.result_data).length === 0) {
      errors.push('Result data is required');
    }
    
    return errors;
  }

  static validateInvoice(invoice: Partial<Invoice>): string[] {
    const errors: string[] = [];
    
    if (!invoice.encounter_id) errors.push('Encounter ID is required');
    if (!invoice.patient_id) errors.push('Patient ID is required');
    if (!invoice.lines || invoice.lines.length === 0) {
      errors.push('Invoice lines are required');
    }
    
    return errors;
  }
}

// Number generation utilities
export class NumberGenerator {
  static generateEncounterNumber(branchCode: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `ENC-${branchCode}-${year}${month}${day}-${random}`;
  }

  static generateOrderNumber(orderType: string, branchCode: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const typePrefix = orderType.substring(0, 3).toUpperCase();
    return `${typePrefix}-${branchCode}-${year}${month}${day}-${random}`;
  }

  static generateInvoiceNumber(branchCode: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${branchCode}-${year}${month}${day}-${random}`;
  }

  static generateClaimNumber(payerCode: string, branchCode: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `CLM-${payerCode}-${branchCode}-${year}${month}${day}-${random}`;
  }
}