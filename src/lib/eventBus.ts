import { supabase } from '@/integrations/supabase/client';

// Core healthcare events as defined in the System Flows & Interactions Spec
export type HealthcareEvent = 
  | 'PATIENT_REGISTERED'
  | 'APPOINTMENT_BOOKED' 
  | 'VISIT_OPENED'
  | 'TRIAGE_CAPTURED'
  | 'ORDER_PLACED'
  | 'SPECIMEN_COLLECTED'
  | 'RESULT_VALIDATED'
  | 'MEDICATION_DISPENSED'
  | 'INVOICE_CREATED'
  | 'PAYMENT_POSTED'
  | 'DISCHARGED'
  | 'CLAIM_SUBMITTED'
  | 'CLAIM_REMITTED'
  | 'INVENTORY_LOW'
  | 'INCIDENT_REPORTED'
  | 'BACKUP_COMPLETED'
  | 'USER_LOGIN'
  | 'SETTING_CHANGED'
  | 'CRITICAL_ALERT'
  | 'STAFF_REGISTERED'
  | 'STAFF_SCHEDULE_CHANGED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'STAFF_PERFORMANCE_UPDATED';

export interface EventPayload {
  event: HealthcareEvent;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  tenantId: string;
  branchId?: string;
  userId: string;
  timestamp: string;
  correlationId?: string;
}

export interface EventHandler {
  (payload: EventPayload): Promise<void> | void;
}

class HealthcareEventBus {
  private handlers: Map<HealthcareEvent, EventHandler[]> = new Map();
  private auditLogger: (event: EventPayload) => Promise<void>;

  constructor() {
    this.auditLogger = this.logToAuditEvents.bind(this);
  }

  // Subscribe to events
  subscribe(event: HealthcareEvent, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  // Unsubscribe from events
  unsubscribe(event: HealthcareEvent, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit events
  async emit(event: HealthcareEvent, data: {
    entityType: string;
    entityId: string;
    data: Record<string, any>;
    tenantId: string;
    branchId?: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    const payload: EventPayload = {
      event,
      ...data,
      timestamp: new Date().toISOString()
    };

    // Log to audit events first
    await this.auditLogger(payload);

    // Trigger handlers
    const handlers = this.handlers.get(event) || [];
    const promises = handlers.map(handler => {
      try {
        return Promise.resolve(handler(payload));
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  // Log events to audit_events table
  private async logToAuditEvents(payload: EventPayload): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_events')
        .insert({
          event_id: `${payload.event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenant_id: payload.tenantId,
          branch_id: payload.branchId,
          actor_id: payload.userId,
          actor_type: 'user',
          action: payload.event,
          entity_type: payload.entityType,
          entity_id: payload.entityId,
          after_data: payload.data,
          event_timestamp: payload.timestamp,
          metadata: {
            correlationId: payload.correlationId,
            source: 'event_bus'
          }
        });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Real-time subscription setup
  setupRealtimeSubscriptions(): void {
    // Subscribe to activities table for cross-module notifications
    const activitiesChannel = supabase
      .channel('healthcare-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          const activityType = payload.new.activity_type as HealthcareEvent;
          if (this.isValidEvent(activityType)) {
            this.emit(activityType, {
              entityType: payload.new.entity_type || 'activity',
              entityId: payload.new.entity_id || payload.new.id,
              data: payload.new.metadata || {},
              tenantId: payload.new.tenant_id,
              branchId: payload.new.branch_id,
              userId: payload.new.user_id
            });
          }
        }
      )
      .subscribe();

    // Subscribe to encounters for visit tracking
    const encountersChannel = supabase
      .channel('healthcare-encounters')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'encounters'
        },
        (payload) => {
          this.emit('VISIT_OPENED', {
            entityType: 'encounter',
            entityId: payload.new.id,
            data: payload.new,
            tenantId: payload.new.tenant_id,
            branchId: payload.new.branch_id,
            userId: payload.new.attending_staff || payload.new.id
          });
        }
      )
      .subscribe();

    // Subscribe to orders for order tracking
    const ordersChannel = supabase
      .channel('healthcare-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          this.emit('ORDER_PLACED', {
            entityType: 'order',
            entityId: payload.new.id,
            data: payload.new,
            tenantId: payload.new.tenant_id,
            branchId: payload.new.branch_id,
            userId: payload.new.ordered_by
          });
        }
      )
      .subscribe();

    // Subscribe to results for result notifications
    const resultsChannel = supabase
      .channel('healthcare-results')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'results'
        },
        (payload) => {
          if (payload.new.status === 'validated' && payload.old.status !== 'validated') {
            this.emit('RESULT_VALIDATED', {
              entityType: 'result',
              entityId: payload.new.id,
              data: payload.new,
              tenantId: payload.new.tenant_id,
              branchId: payload.new.branch_id,
              userId: payload.new.validated_by || payload.new.reported_by
            });
          }
        }
      )
      .subscribe();
  }

  private isValidEvent(event: string): event is HealthcareEvent {
    const validEvents: HealthcareEvent[] = [
      'PATIENT_REGISTERED', 'APPOINTMENT_BOOKED', 'VISIT_OPENED', 'TRIAGE_CAPTURED',
      'ORDER_PLACED', 'SPECIMEN_COLLECTED', 'RESULT_VALIDATED', 'MEDICATION_DISPENSED',
      'INVOICE_CREATED', 'PAYMENT_POSTED', 'DISCHARGED', 'CLAIM_SUBMITTED',
      'CLAIM_REMITTED', 'INVENTORY_LOW', 'INCIDENT_REPORTED', 'BACKUP_COMPLETED',
      'USER_LOGIN', 'SETTING_CHANGED', 'CRITICAL_ALERT', 'STAFF_REGISTERED',
      'STAFF_SCHEDULE_CHANGED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'STAFF_PERFORMANCE_UPDATED'
    ];
    return validEvents.includes(event as HealthcareEvent);
  }
}

// Global event bus instance
export const eventBus = new HealthcareEventBus();

// Initialize real-time subscriptions when imported
eventBus.setupRealtimeSubscriptions();

// Utility functions for common healthcare workflows
export const HealthcareWorkflows = {
  // Start a patient encounter
  async startEncounter(encounterId: string, patientId: string, tenantId: string, branchId: string, userId: string) {
    await eventBus.emit('VISIT_OPENED', {
      entityType: 'encounter',
      entityId: encounterId,
      data: { patientId, encounterId },
      tenantId,
      branchId,
      userId
    });
  },

  // Place an order (lab/imaging/pharmacy/service)
  async placeOrder(orderId: string, orderType: string, patientId: string, encounterId: string, tenantId: string, branchId: string, userId: string) {
    await eventBus.emit('ORDER_PLACED', {
      entityType: 'order',
      entityId: orderId,
      data: { orderType, patientId, encounterId },
      tenantId,
      branchId,
      userId
    });
  },

  // Validate a result
  async validateResult(resultId: string, orderId: string, patientId: string, tenantId: string, branchId: string, userId: string) {
    await eventBus.emit('RESULT_VALIDATED', {
      entityType: 'result',
      entityId: resultId,
      data: { orderId, patientId },
      tenantId,
      branchId,
      userId
    });
  },

  // Create invoice
  async createInvoice(invoiceId: string, patientId: string, encounterId: string, tenantId: string, branchId: string, userId: string) {
    await eventBus.emit('INVOICE_CREATED', {
      entityType: 'invoice',
      entityId: invoiceId,
      data: { patientId, encounterId },
      tenantId,
      branchId,
      userId
    });
  },

  // Discharge patient
  async dischargePatient(encounterId: string, patientId: string, tenantId: string, branchId: string, userId: string) {
    await eventBus.emit('DISCHARGED', {
      entityType: 'encounter',
      entityId: encounterId,
      data: { patientId },
      tenantId,
      branchId,
      userId
    });
  }
};