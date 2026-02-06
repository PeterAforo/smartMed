export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          admission_date: string
          admission_number: string | null
          admitting_doctor: string | null
          bed_id: string | null
          branch_id: string
          created_at: string
          diagnosis: string | null
          discharge_date: string | null
          discharge_summary: string | null
          encounter_id: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          tenant_id: string
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          admission_date?: string
          admission_number?: string | null
          admitting_doctor?: string | null
          bed_id?: string | null
          branch_id: string
          created_at?: string
          diagnosis?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          encounter_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          admission_date?: string
          admission_number?: string | null
          admitting_doctor?: string | null
          bed_id?: string | null
          branch_id?: string
          created_at?: string
          diagnosis?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          encounter_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_templates: {
        Row: {
          appointment_type: string | null
          branch_id: string | null
          color: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string | null
          branch_id?: string | null
          color?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string | null
          branch_id?: string | null
          color?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_number: string | null
          appointment_type: string | null
          branch_id: string
          created_at: string
          doctor_id: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          reason: string | null
          recurrence_pattern: Json | null
          reminder_sent: boolean | null
          start_time: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_number?: string | null
          appointment_type?: string | null
          branch_id: string
          created_at?: string
          doctor_id?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          reason?: string | null
          recurrence_pattern?: Json | null
          reminder_sent?: boolean | null
          start_time: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_number?: string | null
          appointment_type?: string | null
          branch_id?: string
          created_at?: string
          doctor_id?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          reason?: string | null
          recurrence_pattern?: Json | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          branch_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_type: string | null
          branch_id: string
          created_at: string
          current_patient_id: string | null
          features: Json | null
          id: string
          status: string | null
          tenant_id: string
          updated_at: string
          ward_id: string
        }
        Insert: {
          bed_number: string
          bed_type?: string | null
          branch_id: string
          created_at?: string
          current_patient_id?: string | null
          features?: Json | null
          id?: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          ward_id: string
        }
        Update: {
          bed_number?: string
          bed_type?: string | null
          branch_id?: string
          created_at?: string
          current_patient_id?: string | null
          features?: Json | null
          id?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_current_patient_id_fkey"
            columns: ["current_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          settings: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          settings?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          author_id: string | null
          branch_id: string
          content: string
          created_at: string
          encounter_id: string | null
          id: string
          is_signed: boolean | null
          metadata: Json | null
          note_type: string | null
          patient_id: string
          signed_at: string | null
          subject: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          branch_id: string
          content: string
          created_at?: string
          encounter_id?: string | null
          id?: string
          is_signed?: boolean | null
          metadata?: Json | null
          note_type?: string | null
          patient_id: string
          signed_at?: string | null
          subject?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          branch_id?: string
          content?: string
          created_at?: string
          encounter_id?: string | null
          id?: string
          is_signed?: boolean | null
          metadata?: Json | null
          note_type?: string | null
          patient_id?: string
          signed_at?: string | null
          subject?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          branch_id: string | null
          code: string | null
          created_at: string
          head_id: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          code?: string | null
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          code?: string | null
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_queue: {
        Row: {
          arrival_time: string
          assigned_to: string | null
          branch_id: string
          chief_complaint: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string | null
          status: string | null
          tenant_id: string
          treatment_start: string | null
          triage_level: number | null
          triage_time: string | null
          updated_at: string
          vitals: Json | null
        }
        Insert: {
          arrival_time?: string
          assigned_to?: string | null
          branch_id: string
          chief_complaint?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string | null
          tenant_id: string
          treatment_start?: string | null
          triage_level?: number | null
          triage_time?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Update: {
          arrival_time?: string
          assigned_to?: string | null
          branch_id?: string
          chief_complaint?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string | null
          tenant_id?: string
          treatment_start?: string | null
          triage_level?: number | null
          triage_time?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_queue_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          branch_id: string
          created_at: string
          department_id: string | null
          email: string | null
          employee_number: string
          employment_type: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          metadata: Json | null
          phone: string | null
          position: string | null
          qualifications: Json | null
          salary: number | null
          status: string | null
          tenant_id: string
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          employee_number: string
          employment_type?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          metadata?: Json | null
          phone?: string | null
          position?: string | null
          qualifications?: Json | null
          salary?: number | null
          status?: string | null
          tenant_id: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          employee_number?: string
          employment_type?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          metadata?: Json | null
          phone?: string | null
          position?: string | null
          qualifications?: Json | null
          salary?: number | null
          status?: string | null
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          attending_staff: string | null
          branch_id: string
          chief_complaint: string | null
          created_at: string
          diagnoses: string[] | null
          encounter_number: string
          encounter_type: string
          end_time: string | null
          id: string
          location: string | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          start_time: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attending_staff?: string | null
          branch_id: string
          chief_complaint?: string | null
          created_at?: string
          diagnoses?: string[] | null
          encounter_number: string
          encounter_type: string
          end_time?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          start_time?: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attending_staff?: string | null
          branch_id?: string
          chief_complaint?: string | null
          created_at?: string
          diagnoses?: string[] | null
          encounter_number?: string
          encounter_type?: string
          end_time?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          start_time?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounters_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          branch_id: string | null
          category: string | null
          created_at: string
          id: string
          message: string
          patient_id: string | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          subject: string | null
          submitted_by: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message: string
          patient_id?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          submitted_by?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          patient_id?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          submitted_by?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_results: {
        Row: {
          body_part: string | null
          branch_id: string
          created_at: string
          findings: string | null
          id: string
          images: Json | null
          impression: string | null
          metadata: Json | null
          modality: string
          order_id: string | null
          patient_id: string
          performed_at: string | null
          performed_by: string | null
          reported_at: string | null
          reported_by: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_part?: string | null
          branch_id: string
          created_at?: string
          findings?: string | null
          id?: string
          images?: Json | null
          impression?: string | null
          metadata?: Json | null
          modality: string
          order_id?: string | null
          patient_id: string
          performed_at?: string | null
          performed_by?: string | null
          reported_at?: string | null
          reported_by?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_part?: string | null
          branch_id?: string
          created_at?: string
          findings?: string | null
          id?: string
          images?: Json | null
          impression?: string | null
          metadata?: Json | null
          modality?: string
          order_id?: string | null
          patient_id?: string
          performed_at?: string | null
          performed_by?: string | null
          reported_at?: string | null
          reported_by?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_results_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          branch_id: string
          claim_number: string | null
          created_at: string
          id: string
          invoice_id: string | null
          lines: Json | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          payer_id: string | null
          payer_name: string | null
          remittance: Json | null
          status: string | null
          submission_date: string | null
          tenant_id: string
          total_approved: number | null
          total_claimed: number | null
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          claim_number?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          lines?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          payer_id?: string | null
          payer_name?: string | null
          remittance?: Json | null
          status?: string | null
          submission_date?: string | null
          tenant_id: string
          total_approved?: number | null
          total_claimed?: number | null
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          claim_number?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          lines?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          payer_id?: string | null
          payer_name?: string | null
          remittance?: Json | null
          status?: string | null
          submission_date?: string | null
          tenant_id?: string
          total_approved?: number | null
          total_claimed?: number | null
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          batch_number: string | null
          branch_id: string
          category: string | null
          created_at: string
          current_stock: number | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          item_code: string
          item_name: string
          location: string | null
          maximum_stock: number | null
          metadata: Json | null
          minimum_stock: number | null
          reorder_level: number | null
          selling_price: number | null
          subcategory: string | null
          supplier_id: string | null
          tenant_id: string
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          category?: string | null
          created_at?: string
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_code: string
          item_name: string
          location?: string | null
          maximum_stock?: number | null
          metadata?: Json | null
          minimum_stock?: number | null
          reorder_level?: number | null
          selling_price?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          tenant_id: string
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          category?: string | null
          created_at?: string
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_code?: string
          item_name?: string
          location?: string | null
          maximum_stock?: number | null
          metadata?: Json | null
          minimum_stock?: number | null
          reorder_level?: number | null
          selling_price?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          tenant_id?: string
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance: number | null
          branch_id: string
          created_at: string
          discount_amount: number | null
          due_date: string | null
          encounter_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          lines: Json | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          branch_id: string
          created_at?: string
          discount_amount?: number | null
          due_date?: string | null
          encounter_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          lines?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          branch_id?: string
          created_at?: string
          discount_amount?: number | null
          due_date?: string | null
          encounter_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          lines?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          attachments: Json | null
          branch_id: string
          created_at: string
          critical_flag: boolean | null
          id: string
          notes: string | null
          order_id: string | null
          patient_id: string
          reference_ranges: Json | null
          reported_at: string | null
          reported_by: string | null
          result_data: Json | null
          result_type: string | null
          status: string | null
          tenant_id: string
          test_name: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          attachments?: Json | null
          branch_id: string
          created_at?: string
          critical_flag?: boolean | null
          id?: string
          notes?: string | null
          order_id?: string | null
          patient_id: string
          reference_ranges?: Json | null
          reported_at?: string | null
          reported_by?: string | null
          result_data?: Json | null
          result_type?: string | null
          status?: string | null
          tenant_id: string
          test_name: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          attachments?: Json | null
          branch_id?: string
          created_at?: string
          critical_flag?: boolean | null
          id?: string
          notes?: string | null
          order_id?: string | null
          patient_id?: string
          reference_ranges?: Json | null
          reported_at?: string | null
          reported_by?: string | null
          result_data?: Json | null
          result_type?: string | null
          status?: string | null
          tenant_id?: string
          test_name?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          attachments: Json | null
          branch_id: string
          created_at: string
          data: Json | null
          description: string | null
          id: string
          patient_id: string
          record_type: string
          recorded_at: string
          recorded_by: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          branch_id: string
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          patient_id: string
          record_type: string
          recorded_at?: string
          recorded_by?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          branch_id?: string
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          patient_id?: string
          record_type?: string
          recorded_at?: string
          recorded_by?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          brand_name: string | null
          category: string | null
          created_at: string
          dosage_form: string | null
          generic_name: string | null
          id: string
          is_active: boolean | null
          is_controlled: boolean | null
          metadata: Json | null
          name: string
          requires_prescription: boolean | null
          strength: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          category?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          is_controlled?: boolean | null
          metadata?: Json | null
          name: string
          requires_prescription?: boolean | null
          strength?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          category?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          is_controlled?: boolean | null
          metadata?: Json | null
          name?: string
          requires_prescription?: boolean | null
          strength?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          branch_id: string | null
          category: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          tenant_id: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          tenant_id: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          tenant_id?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string
          charges: Json | null
          clinical_notes: string | null
          completed_at: string | null
          created_at: string
          encounter_id: string | null
          id: string
          instructions: string | null
          metadata: Json | null
          order_code: string | null
          order_name: string
          order_number: string
          order_type: string
          ordered_at: string
          ordered_by: string | null
          patient_id: string
          priority: string | null
          scheduled_at: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          charges?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          order_code?: string | null
          order_name: string
          order_number: string
          order_type: string
          ordered_at?: string
          ordered_by?: string | null
          patient_id: string
          priority?: string | null
          scheduled_at?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          charges?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          order_code?: string | null
          order_name?: string
          order_number?: string
          order_type?: string
          ordered_at?: string
          ordered_by?: string | null
          patient_id?: string
          priority?: string | null
          scheduled_at?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_type: string | null
          branch_id: string
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_expiry: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_conditions: string[] | null
          metadata: Json | null
          national_id: string | null
          notes: string | null
          patient_number: string
          phone: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          branch_id: string
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_conditions?: string[] | null
          metadata?: Json | null
          national_id?: string | null
          notes?: string | null
          patient_number: string
          phone?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          branch_id?: string
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_conditions?: string[] | null
          metadata?: Json | null
          national_id?: string | null
          notes?: string | null
          patient_number?: string
          phone?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          branch_id: string
          created_at: string
          id: string
          invoice_id: string | null
          metadata: Json | null
          notes: string | null
          patient_id: string | null
          payment_date: string
          payment_method: string | null
          payment_number: string | null
          received_by: string | null
          reference_number: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_records: {
        Row: {
          antenatal_visits: Json | null
          blood_type: string | null
          branch_id: string
          complications: string[] | null
          created_at: string
          edd: string | null
          gestational_age_weeks: number | null
          gravida: number | null
          id: string
          lmp: string | null
          notes: string | null
          para: number | null
          patient_id: string
          rh_factor: string | null
          risk_level: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          antenatal_visits?: Json | null
          blood_type?: string | null
          branch_id: string
          complications?: string[] | null
          created_at?: string
          edd?: string | null
          gestational_age_weeks?: number | null
          gravida?: number | null
          id?: string
          lmp?: string | null
          notes?: string | null
          para?: number | null
          patient_id: string
          rh_factor?: string | null
          risk_level?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          antenatal_visits?: Json | null
          blood_type?: string | null
          branch_id?: string
          complications?: string[] | null
          created_at?: string
          edd?: string | null
          gestational_age_weeks?: number | null
          gravida?: number | null
          id?: string
          lmp?: string | null
          notes?: string | null
          para?: number | null
          patient_id?: string
          rh_factor?: string | null
          risk_level?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pregnancy_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pregnancy_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          branch_id: string
          created_at: string
          dispensed_at: string | null
          dispensed_by: string | null
          dosage: string | null
          duration: string | null
          encounter_id: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medication_id: string | null
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          prescription_number: string | null
          quantity: number | null
          route: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage?: string | null
          duration?: string | null
          encounter_id?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_id?: string | null
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          prescription_number?: string | null
          quantity?: number | null
          route?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage?: string | null
          duration?: string | null
          encounter_id?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_id?: string | null
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          prescription_number?: string | null
          quantity?: number | null
          route?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          employee_id: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          branch_id: string
          created_at: string
          expected_delivery: string | null
          id: string
          items: Json | null
          notes: string | null
          ordered_at: string | null
          ordered_by: string | null
          po_number: string
          received_at: string | null
          status: string | null
          supplier_id: string | null
          tenant_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          branch_id: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          ordered_at?: string | null
          ordered_by?: string | null
          po_number: string
          received_at?: string | null
          status?: string | null
          supplier_id?: string | null
          tenant_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          ordered_at?: string | null
          ordered_by?: string | null
          po_number?: string
          received_at?: string | null
          status?: string | null
          supplier_id?: string | null
          tenant_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          item_id: string
          location_from: string | null
          location_to: string | null
          move_type: string
          moved_at: string
          moved_by: string | null
          notes: string | null
          quantity_change: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          tenant_id: string
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          item_id: string
          location_from?: string | null
          location_to?: string | null
          move_type: string
          moved_at?: string
          moved_by?: string | null
          notes?: string | null
          quantity_change: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          tenant_id: string
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          item_id?: string
          location_from?: string | null
          location_to?: string | null
          move_type?: string
          moved_at?: string
          moved_by?: string | null
          notes?: string | null
          quantity_change?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          payment_terms: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      surgeries: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          anesthetist_id: string | null
          branch_id: string
          complications: string | null
          created_at: string
          encounter_id: string | null
          id: string
          metadata: Json | null
          patient_id: string
          post_op_notes: string | null
          pre_op_notes: string | null
          procedure_code: string | null
          procedure_name: string
          scheduled_date: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string | null
          surgeon_id: string | null
          surgery_number: string | null
          team_members: Json | null
          tenant_id: string
          theatre_id: string | null
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          anesthetist_id?: string | null
          branch_id: string
          complications?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          post_op_notes?: string | null
          pre_op_notes?: string | null
          procedure_code?: string | null
          procedure_name: string
          scheduled_date?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          surgeon_id?: string | null
          surgery_number?: string | null
          team_members?: Json | null
          tenant_id: string
          theatre_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          anesthetist_id?: string | null
          branch_id?: string
          complications?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          post_op_notes?: string | null
          pre_op_notes?: string | null
          procedure_code?: string | null
          procedure_name?: string
          scheduled_date?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          surgeon_id?: string | null
          surgery_number?: string | null
          team_members?: Json | null
          tenant_id?: string
          theatre_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_theatre_id_fkey"
            columns: ["theatre_id"]
            isOneToOne: false
            referencedRelation: "theatres"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          branch_id: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          tenant_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          tenant_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          tenant_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      telemedicine_sessions: {
        Row: {
          appointment_id: string | null
          branch_id: string
          created_at: string
          doctor_id: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string
          recording_url: string | null
          session_url: string | null
          start_time: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          branch_id: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          recording_url?: string | null
          session_url?: string | null
          start_time?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          recording_url?: string | null
          session_url?: string | null
          start_time?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telemedicine_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      theatres: {
        Row: {
          branch_id: string
          created_at: string
          equipment: Json | null
          id: string
          name: string
          status: string | null
          tenant_id: string
          theatre_type: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          equipment?: Json | null
          id?: string
          name: string
          status?: string | null
          tenant_id: string
          theatre_type?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          equipment?: Json | null
          id?: string
          name?: string
          status?: string | null
          tenant_id?: string
          theatre_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "theatres_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theatres_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_branches: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          bmi: number | null
          branch_id: string
          created_at: string
          diastolic_bp: number | null
          encounter_id: string | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          pain_scale: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          systolic_bp: number | null
          temperature: number | null
          tenant_id: string
          weight: number | null
        }
        Insert: {
          bmi?: number | null
          branch_id: string
          created_at?: string
          diastolic_bp?: number | null
          encounter_id?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          tenant_id: string
          weight?: number | null
        }
        Update: {
          bmi?: number | null
          branch_id?: string
          created_at?: string
          diastolic_bp?: number | null
          encounter_id?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          tenant_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          branch_id: string
          capacity: number | null
          created_at: string
          floor: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
          ward_type: string | null
        }
        Insert: {
          branch_id: string
          capacity?: number | null
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
          ward_type?: string | null
        }
        Update: {
          branch_id?: string
          capacity?: number | null
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
          ward_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_cross_branch_access: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "doctor"
        | "nurse"
        | "pharmacist"
        | "radiologist"
        | "lab_technician"
        | "receptionist"
        | "cashier"
        | "accountant"
        | "hr_officer"
        | "staff"
        | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "doctor",
        "nurse",
        "pharmacist",
        "radiologist",
        "lab_technician",
        "receptionist",
        "cashier",
        "accountant",
        "hr_officer",
        "staff",
        "viewer",
      ],
    },
  },
} as const
