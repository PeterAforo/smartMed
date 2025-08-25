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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          branch_id: string | null
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          branch_id?: string | null
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          branch_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_taken: boolean | null
          action_taken_at: string | null
          action_taken_by: string | null
          branch_id: string | null
          confidence_score: number | null
          created_at: string
          data_sources: string[] | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          is_actionable: boolean | null
          metrics: Json | null
          priority: string
          recommendations: Json | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action_taken?: boolean | null
          action_taken_at?: string | null
          action_taken_by?: string | null
          branch_id?: string | null
          confidence_score?: number | null
          created_at?: string
          data_sources?: string[] | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_actionable?: boolean | null
          metrics?: Json | null
          priority?: string
          recommendations?: Json | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action_taken?: boolean | null
          action_taken_at?: string | null
          action_taken_by?: string | null
          branch_id?: string | null
          confidence_score?: number | null
          created_at?: string
          data_sources?: string[] | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_actionable?: boolean | null
          metrics?: Json | null
          priority?: string
          recommendations?: Json | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_resolve_at: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          escalation_level: number | null
          id: string
          message: string
          metadata: Json | null
          priority: number
          resolved_at: string | null
          resolved_by: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_resolve_at?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          escalation_level?: number | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_resolve_at?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          escalation_level?: number | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
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
          appointment_time: string
          appointment_type: string
          billing_amount: number | null
          branch_id: string
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          diagnosis: Json | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          insurance_claim_id: string | null
          notes: string | null
          patient_id: string
          staff_id: string | null
          status: string
          tenant_id: string
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string
          billing_amount?: number | null
          branch_id: string
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_claim_id?: string | null
          notes?: string | null
          patient_id: string
          staff_id?: string | null
          status?: string
          tenant_id: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          billing_amount?: number | null
          branch_id?: string
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_claim_id?: string | null
          notes?: string | null
          patient_id?: string
          staff_id?: string | null
          status?: string
          tenant_id?: string
          treatment_plan?: string | null
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
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      beds: {
        Row: {
          admitted_at: string | null
          bed_number: string
          bed_type: string
          branch_id: string
          created_at: string
          daily_rate: number | null
          department: string | null
          expected_discharge: string | null
          features: Json | null
          id: string
          patient_id: string | null
          room_number: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          admitted_at?: string | null
          bed_number: string
          bed_type?: string
          branch_id: string
          created_at?: string
          daily_rate?: number | null
          department?: string | null
          expected_discharge?: string | null
          features?: Json | null
          id?: string
          patient_id?: string | null
          room_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          admitted_at?: string | null
          bed_number?: string
          bed_type?: string
          branch_id?: string
          created_at?: string
          daily_rate?: number | null
          department?: string | null
          expected_discharge?: string | null
          features?: Json | null
          id?: string
          patient_id?: string | null
          room_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
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
            foreignKeyName: "beds_patient_id_fkey"
            columns: ["patient_id"]
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
        ]
      }
      billing_items: {
        Row: {
          branch_id: string
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_taxable: boolean | null
          name: string
          tenant_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          category: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          name: string
          tenant_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          name?: string
          tenant_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
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
          is_active?: boolean
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
          is_active?: boolean
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
      departments: {
        Row: {
          branch_id: string
          code: string
          contact_info: Json | null
          created_at: string
          description: string | null
          head_of_department: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          code: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          head_of_department?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          code?: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          head_of_department?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnostic_procedures: {
        Row: {
          branch_id: string
          category: string
          cost: number | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          equipment_required: string[] | null
          id: string
          is_active: boolean | null
          preparation_instructions: string | null
          procedure_code: string
          procedure_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          category: string
          cost?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          equipment_required?: string[] | null
          id?: string
          is_active?: boolean | null
          preparation_instructions?: string | null
          procedure_code: string
          procedure_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          category?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          equipment_required?: string[] | null
          id?: string
          is_active?: boolean | null
          preparation_instructions?: string | null
          procedure_code?: string
          procedure_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          branch_id: string
          created_at: string
          department_id: string | null
          equipment_code: string
          id: string
          is_critical: boolean | null
          location: string | null
          maintenance_schedule: Json | null
          manufacturer: string | null
          model: string | null
          name: string
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          department_id?: string | null
          equipment_code: string
          id?: string
          is_critical?: boolean | null
          location?: string | null
          maintenance_schedule?: Json | null
          manufacturer?: string | null
          model?: string | null
          name: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          department_id?: string | null
          equipment_code?: string
          id?: string
          is_critical?: boolean | null
          location?: string | null
          maintenance_schedule?: Json | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          branch_id: string
          claim_amount: number
          claim_number: string
          created_at: string
          denial_reason: string | null
          id: string
          insurance_policy_id: string
          invoice_id: string | null
          notes: string | null
          patient_id: string
          service_date: string
          status: string | null
          submission_date: string
          submitted_by: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          branch_id: string
          claim_amount: number
          claim_number: string
          created_at?: string
          denial_reason?: string | null
          id?: string
          insurance_policy_id: string
          invoice_id?: string | null
          notes?: string | null
          patient_id: string
          service_date: string
          status?: string | null
          submission_date?: string
          submitted_by?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          branch_id?: string
          claim_amount?: number
          claim_number?: string
          created_at?: string
          denial_reason?: string | null
          id?: string
          insurance_policy_id?: string
          invoice_id?: string | null
          notes?: string | null
          patient_id?: string
          service_date?: string
          status?: string | null
          submission_date?: string
          submitted_by?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          copay_amount: number | null
          coverage_details: Json | null
          created_at: string
          deductible_amount: number | null
          effective_date: string
          expiry_date: string | null
          group_number: string | null
          id: string
          is_primary: boolean | null
          patient_id: string
          policy_number: string
          provider_id: string
          status: string | null
          subscriber_name: string
          subscriber_relationship: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          copay_amount?: number | null
          coverage_details?: Json | null
          created_at?: string
          deductible_amount?: number | null
          effective_date: string
          expiry_date?: string | null
          group_number?: string | null
          id?: string
          is_primary?: boolean | null
          patient_id: string
          policy_number: string
          provider_id: string
          status?: string | null
          subscriber_name: string
          subscriber_relationship?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          copay_amount?: number | null
          coverage_details?: Json | null
          created_at?: string
          deductible_amount?: number | null
          effective_date?: string
          expiry_date?: string | null
          group_number?: string | null
          id?: string
          is_primary?: boolean | null
          patient_id?: string
          policy_number?: string
          provider_id?: string
          status?: string | null
          subscriber_name?: string
          subscriber_relationship?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_providers: {
        Row: {
          code: string
          contact_info: Json | null
          coverage_types: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          contact_info?: Json | null
          coverage_types?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          contact_info?: Json | null
          coverage_types?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          batch_number: string | null
          branch_id: string
          category: string
          created_at: string
          current_stock: number
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_controlled: boolean | null
          item_code: string
          location: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          supplier_info: Json | null
          tenant_id: string
          unit_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          category: string
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_controlled?: boolean | null
          item_code: string
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          supplier_info?: Json | null
          tenant_id: string
          unit_cost?: number | null
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          category?: string
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_controlled?: boolean | null
          item_code?: string
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          supplier_info?: Json | null
          tenant_id?: string
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          billing_item_id: string
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          tenant_id: string
          unit_price: number
        }
        Insert: {
          billing_item_id: string
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          tenant_id: string
          unit_price: number
        }
        Update: {
          billing_item_id?: string
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          tenant_id?: string
          unit_price?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          appointment_id: string | null
          balance_due: number
          branch_id: string
          created_at: string
          created_by: string | null
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          patient_id: string
          payment_terms: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          appointment_id?: string | null
          balance_due?: number
          branch_id: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          patient_id: string
          payment_terms?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          appointment_id?: string | null
          balance_due?: number
          branch_id?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          patient_id?: string
          payment_terms?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          appointment_id: string | null
          branch_id: string
          completed_at: string | null
          created_at: string
          critical_values: boolean | null
          id: string
          notes: string | null
          ordered_at: string
          ordered_by: string
          patient_id: string
          performed_by: string | null
          reference_ranges: Json | null
          report_url: string | null
          results: Json
          reviewed_by: string | null
          status: string | null
          tenant_id: string
          test_name: string
          test_type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          branch_id: string
          completed_at?: string | null
          created_at?: string
          critical_values?: boolean | null
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by: string
          patient_id: string
          performed_by?: string | null
          reference_ranges?: Json | null
          report_url?: string | null
          results?: Json
          reviewed_by?: string | null
          status?: string | null
          tenant_id: string
          test_name: string
          test_type: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string
          completed_at?: string | null
          created_at?: string
          critical_values?: boolean | null
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by?: string
          patient_id?: string
          performed_by?: string | null
          reference_ranges?: Json | null
          report_url?: string | null
          results?: Json
          reviewed_by?: string | null
          status?: string | null
          tenant_id?: string
          test_name?: string
          test_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          category: string
          collection_method: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          normal_ranges: Json | null
          preparation_instructions: string | null
          processing_time_hours: number | null
          tenant_id: string
          test_code: string
          test_name: string
          updated_at: string
        }
        Insert: {
          category: string
          collection_method?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          normal_ranges?: Json | null
          preparation_instructions?: string | null
          processing_time_hours?: number | null
          tenant_id: string
          test_code: string
          test_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          collection_method?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          normal_ranges?: Json | null
          preparation_instructions?: string | null
          processing_time_hours?: number | null
          tenant_id?: string
          test_code?: string
          test_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          branch_id: string
          created_at: string
          description: string | null
          diagnosis_codes: Json | null
          follow_up_notes: string | null
          id: string
          patient_id: string
          record_type: string
          recorded_by: string | null
          severity: string | null
          status: string | null
          tenant_id: string
          title: string
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          description?: string | null
          diagnosis_codes?: Json | null
          follow_up_notes?: string | null
          id?: string
          patient_id: string
          record_type?: string
          recorded_by?: string | null
          severity?: string | null
          status?: string | null
          tenant_id: string
          title: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          description?: string | null
          diagnosis_codes?: Json | null
          follow_up_notes?: string | null
          id?: string
          patient_id?: string
          record_type?: string
          recorded_by?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_allergies: {
        Row: {
          allergen: string
          allergy_type: string
          created_at: string
          id: string
          notes: string | null
          onset_date: string | null
          patient_id: string
          reaction_symptoms: string[] | null
          severity: string
          status: string | null
          tenant_id: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          allergen: string
          allergy_type: string
          created_at?: string
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id: string
          reaction_symptoms?: string[] | null
          severity: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          allergen?: string
          allergy_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id?: string
          reaction_symptoms?: string[] | null
          severity?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          branch_id: string
          created_at: string
          created_by: string | null
          current_medications: Json | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_info: Json | null
          last_name: string
          medical_history: Json | null
          patient_number: string
          phone: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          current_medications?: Json | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          last_name: string
          medical_history?: Json | null
          patient_number: string
          phone?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          current_medications?: Json | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          last_name?: string
          medical_history?: Json | null
          patient_number?: string
          phone?: string | null
          status?: string
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
          invoice_id: string
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: string
          processed_by: string | null
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
          invoice_id: string
          notes?: string | null
          patient_id: string
          payment_date?: string
          payment_method: string
          processed_by?: string | null
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
          invoice_id?: string
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: string
          processed_by?: string | null
          reference_number?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          branch_id: string
          created_at: string
          dosage: string
          duration_days: number | null
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          medical_record_id: string | null
          medication_name: string
          patient_id: string
          pharmacy_info: Json | null
          prescribed_by: string
          refills_remaining: number | null
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          branch_id: string
          created_at?: string
          dosage: string
          duration_days?: number | null
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medical_record_id?: string | null
          medication_name: string
          patient_id: string
          pharmacy_info?: Json | null
          prescribed_by: string
          refills_remaining?: number | null
          start_date?: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string
          created_at?: string
          dosage?: string
          duration_days?: number | null
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medical_record_id?: string | null
          medication_name?: string
          patient_id?: string
          pharmacy_info?: Json | null
          prescribed_by?: string
          refills_remaining?: number | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
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
          first_name: string
          id?: string
          last_name: string
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
      revenue: {
        Row: {
          amount: number
          appointment_id: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          invoice_number: string | null
          metadata: Json | null
          patient_id: string | null
          payment_method: string | null
          payment_status: string
          revenue_type: string
          tenant_id: string
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string
          revenue_type: string
          tenant_id: string
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string
          revenue_type?: string
          tenant_id?: string
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          branch_id: string
          created_at: string
          created_by: string | null
          department_id: string | null
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          shift_type: string | null
          staff_id: string
          start_time: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          shift_type?: string | null
          staff_id: string
          start_time: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string | null
          staff_id?: string
          start_time?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_branches: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_primary: boolean
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
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
          branch_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
          appointment_id: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          bmi: number | null
          branch_id: string
          created_at: string
          heart_rate: number | null
          height_cm: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          respiratory_rate: number | null
          temperature: number | null
          tenant_id: string
          weight_kg: number | null
        }
        Insert: {
          appointment_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          branch_id: string
          created_at?: string
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id: string
          weight_kg?: number | null
        }
        Update: {
          appointment_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          branch_id?: string
          created_at?: string
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_branch_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_cross_branch_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
        | "admin"
        | "doctor"
        | "nurse"
        | "lab_tech"
        | "pharmacist"
        | "receptionist"
        | "cashier"
        | "radiologist"
        | "manager"
        | "lab_technician"
        | "billing"
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
        "admin",
        "doctor",
        "nurse",
        "lab_tech",
        "pharmacist",
        "receptionist",
        "cashier",
        "radiologist",
        "manager",
        "lab_technician",
        "billing",
      ],
    },
  },
} as const
