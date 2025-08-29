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
      api_monitoring: {
        Row: {
          created_at: string
          endpoint_path: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_status: number
          response_time_ms: number
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint_path: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_status: number
          response_time_ms: number
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint_path?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_status?: number
          response_time_ms?: number
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_queue: {
        Row: {
          actual_start_time: string | null
          appointment_id: string
          branch_id: string
          check_in_time: string | null
          created_at: string
          estimated_start_time: string | null
          id: string
          queue_date: string
          queue_position: number
          status: string
          tenant_id: string
          updated_at: string
          wait_time_minutes: number | null
        }
        Insert: {
          actual_start_time?: string | null
          appointment_id: string
          branch_id: string
          check_in_time?: string | null
          created_at?: string
          estimated_start_time?: string | null
          id?: string
          queue_date: string
          queue_position: number
          status?: string
          tenant_id: string
          updated_at?: string
          wait_time_minutes?: number | null
        }
        Update: {
          actual_start_time?: string | null
          appointment_id?: string
          branch_id?: string
          check_in_time?: string | null
          created_at?: string
          estimated_start_time?: string | null
          id?: string
          queue_date?: string
          queue_position?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          wait_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          delivery_status: string | null
          error_message: string | null
          id: string
          message_content: string | null
          reminder_time: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          reminder_time: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          reminder_time?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_series: {
        Row: {
          appointments_created: number
          branch_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          patient_id: string
          recurrence_interval: number
          recurrence_pattern: string
          series_name: string
          start_date: string
          status: string
          template_id: string | null
          tenant_id: string
          total_appointments: number | null
          updated_at: string
        }
        Insert: {
          appointments_created?: number
          branch_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          patient_id: string
          recurrence_interval?: number
          recurrence_pattern: string
          series_name: string
          start_date: string
          status?: string
          template_id?: string | null
          tenant_id: string
          total_appointments?: number | null
          updated_at?: string
        }
        Update: {
          appointments_created?: number
          branch_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          patient_id?: string
          recurrence_interval?: number
          recurrence_pattern?: string
          series_name?: string
          start_date?: string
          status?: string
          template_id?: string | null
          tenant_id?: string
          total_appointments?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_series_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "appointment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_templates: {
        Row: {
          appointment_type: string
          branch_id: string
          color_code: string | null
          created_at: string
          created_by: string | null
          default_instructions: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          template_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_type: string
          branch_id: string
          color_code?: string | null
          created_at?: string
          created_by?: string | null
          default_instructions?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          template_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          branch_id?: string
          color_code?: string | null
          created_at?: string
          created_by?: string | null
          default_instructions?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          template_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          actual_start_time: string | null
          appointment_date: string
          appointment_time: string
          appointment_type: string
          billing_amount: number | null
          branch_id: string
          check_in_time: string | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          diagnosis: Json | null
          duration_minutes: number | null
          estimated_start_time: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          insurance_claim_id: string | null
          notes: string | null
          patient_id: string
          reminder_preferences: Json | null
          series_id: string | null
          staff_id: string | null
          status: string
          template_id: string | null
          tenant_id: string
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          actual_start_time?: string | null
          appointment_date: string
          appointment_time: string
          appointment_type?: string
          billing_amount?: number | null
          branch_id: string
          check_in_time?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          duration_minutes?: number | null
          estimated_start_time?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_claim_id?: string | null
          notes?: string | null
          patient_id: string
          reminder_preferences?: Json | null
          series_id?: string | null
          staff_id?: string | null
          status?: string
          template_id?: string | null
          tenant_id: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          actual_start_time?: string | null
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          billing_amount?: number | null
          branch_id?: string
          check_in_time?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          duration_minutes?: number | null
          estimated_start_time?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_claim_id?: string | null
          notes?: string | null
          patient_id?: string
          reminder_preferences?: Json | null
          series_id?: string | null
          staff_id?: string | null
          status?: string
          template_id?: string | null
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
            foreignKeyName: "appointments_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "appointment_series"
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
            foreignKeyName: "appointments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "appointment_templates"
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
      audit_events: {
        Row: {
          action: string
          actor_id: string
          actor_type: string
          after_data: Json | null
          before_data: Json | null
          branch_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_id: string
          event_timestamp: string
          hash_chain: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_type: string
          after_data?: Json | null
          before_data?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_id: string
          event_timestamp?: string
          hash_chain?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_type?: string
          after_data?: Json | null
          before_data?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_id?: string
          event_timestamp?: string
          hash_chain?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: []
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
      clinical_protocols: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          condition_codes: Json | null
          created_at: string
          created_by: string | null
          evidence_level: string | null
          id: string
          is_active: boolean | null
          protocol_name: string
          protocol_steps: Json
          specialty: string | null
          tenant_id: string
          updated_at: string
          version: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          condition_codes?: Json | null
          created_at?: string
          created_by?: string | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          protocol_name: string
          protocol_steps?: Json
          specialty?: string | null
          tenant_id: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          condition_codes?: Json | null
          created_at?: string
          created_by?: string | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          protocol_name?: string
          protocol_steps?: Json
          specialty?: string | null
          tenant_id?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      clinical_workflows: {
        Row: {
          branch_id: string | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          steps: Json
          tenant_id: string
          updated_at: string
          workflow_name: string
          workflow_type: string
        }
        Insert: {
          branch_id?: string | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          steps?: Json
          tenant_id: string
          updated_at?: string
          workflow_name: string
          workflow_type: string
        }
        Update: {
          branch_id?: string | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          steps?: Json
          tenant_id?: string
          updated_at?: string
          workflow_name?: string
          workflow_type?: string
        }
        Relationships: []
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
      encounters: {
        Row: {
          attending_staff: string | null
          branch_id: string
          chief_complaint: string | null
          created_at: string
          diagnoses: Json | null
          encounter_number: string
          encounter_type: string
          end_time: string | null
          id: string
          linked_invoices: string[] | null
          linked_orders: string[] | null
          location: string | null
          notes: string | null
          patient_id: string
          start_time: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attending_staff?: string | null
          branch_id: string
          chief_complaint?: string | null
          created_at?: string
          diagnoses?: Json | null
          encounter_number: string
          encounter_type: string
          end_time?: string | null
          id?: string
          linked_invoices?: string[] | null
          linked_orders?: string[] | null
          location?: string | null
          notes?: string | null
          patient_id: string
          start_time?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attending_staff?: string | null
          branch_id?: string
          chief_complaint?: string | null
          created_at?: string
          diagnoses?: Json | null
          encounter_number?: string
          encounter_type?: string
          end_time?: string | null
          id?: string
          linked_invoices?: string[] | null
          linked_orders?: string[] | null
          location?: string | null
          notes?: string | null
          patient_id?: string
          start_time?: string
          status?: string
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
      family_medical_history: {
        Row: {
          age_of_onset: number | null
          condition_name: string
          created_at: string
          diagnosis_codes: Json | null
          id: string
          notes: string | null
          patient_id: string
          recorded_by: string | null
          relationship: string
          severity: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          age_of_onset?: number | null
          condition_name: string
          created_at?: string
          diagnosis_codes?: Json | null
          id?: string
          notes?: string | null
          patient_id: string
          recorded_by?: string | null
          relationship: string
          severity?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          age_of_onset?: number | null
          condition_name?: string
          created_at?: string
          diagnosis_codes?: Json | null
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_by?: string | null
          relationship?: string
          severity?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      follow_up_schedules: {
        Row: {
          appointment_id: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          follow_up_type: string
          id: string
          notes: string | null
          patient_id: string
          reminder_sent: boolean | null
          scheduled_date: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          follow_up_type: string
          id?: string
          notes?: string | null
          patient_id: string
          reminder_sent?: boolean | null
          scheduled_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          follow_up_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reminder_sent?: boolean | null
          scheduled_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospitalization_records: {
        Row: {
          admission_date: string
          admission_reason: string
          attending_physician: string | null
          branch_id: string
          created_at: string
          department: string | null
          discharge_date: string | null
          discharge_summary: string | null
          hospital_name: string
          id: string
          length_of_stay: number | null
          patient_id: string
          primary_diagnosis: string
          recorded_by: string | null
          secondary_diagnoses: Json | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          admission_date: string
          admission_reason: string
          attending_physician?: string | null
          branch_id: string
          created_at?: string
          department?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          hospital_name: string
          id?: string
          length_of_stay?: number | null
          patient_id: string
          primary_diagnosis: string
          recorded_by?: string | null
          secondary_diagnoses?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          admission_date?: string
          admission_reason?: string
          attending_physician?: string | null
          branch_id?: string
          created_at?: string
          department?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          hospital_name?: string
          id?: string
          length_of_stay?: number | null
          patient_id?: string
          primary_diagnosis?: string
          recorded_by?: string | null
          secondary_diagnoses?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      imaging_orders: {
        Row: {
          body_part: string
          branch_id: string
          clinical_indication: string
          contrast_required: boolean | null
          created_at: string
          facility_name: string | null
          id: string
          order_date: string
          order_number: string
          ordered_by: string
          patient_id: string
          prep_instructions: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          special_instructions: string | null
          status: string | null
          study_type: string
          tenant_id: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          body_part: string
          branch_id: string
          clinical_indication: string
          contrast_required?: boolean | null
          created_at?: string
          facility_name?: string | null
          id?: string
          order_date?: string
          order_number: string
          ordered_by: string
          patient_id: string
          prep_instructions?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string | null
          study_type: string
          tenant_id: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          body_part?: string
          branch_id?: string
          clinical_indication?: string
          contrast_required?: boolean | null
          created_at?: string
          facility_name?: string | null
          id?: string
          order_date?: string
          order_number?: string
          ordered_by?: string
          patient_id?: string
          prep_instructions?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string | null
          study_type?: string
          tenant_id?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      imaging_reports: {
        Row: {
          clinical_history: string | null
          created_at: string
          critical_communicated_to: string | null
          critical_communication_date: string | null
          critical_findings: boolean | null
          dictated_date: string | null
          findings: string
          id: string
          imaging_study_id: string
          impression: string
          radiologist: string | null
          recommendations: string | null
          report_number: string
          report_status: string | null
          report_text: string | null
          technique: string | null
          tenant_id: string
          transcribed_date: string | null
          updated_at: string
        }
        Insert: {
          clinical_history?: string | null
          created_at?: string
          critical_communicated_to?: string | null
          critical_communication_date?: string | null
          critical_findings?: boolean | null
          dictated_date?: string | null
          findings: string
          id?: string
          imaging_study_id: string
          impression: string
          radiologist?: string | null
          recommendations?: string | null
          report_number: string
          report_status?: string | null
          report_text?: string | null
          technique?: string | null
          tenant_id: string
          transcribed_date?: string | null
          updated_at?: string
        }
        Update: {
          clinical_history?: string | null
          created_at?: string
          critical_communicated_to?: string | null
          critical_communication_date?: string | null
          critical_findings?: boolean | null
          dictated_date?: string | null
          findings?: string
          id?: string
          imaging_study_id?: string
          impression?: string
          radiologist?: string | null
          recommendations?: string | null
          report_number?: string
          report_status?: string | null
          report_text?: string | null
          technique?: string | null
          tenant_id?: string
          transcribed_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      imaging_studies: {
        Row: {
          accession_number: string | null
          body_part: string
          branch_id: string
          contrast_type: string | null
          contrast_used: boolean | null
          created_at: string
          file_size_mb: number | null
          findings: string | null
          id: string
          image_count: number | null
          impression: string | null
          indication: string
          modality: string
          patient_id: string
          performing_physician: string | null
          priority: string | null
          radiation_dose: number | null
          radiologist: string | null
          recommendations: string | null
          referring_physician: string | null
          status: string | null
          storage_location: string | null
          study_date: string
          study_time: string | null
          study_type: string
          study_uid: string | null
          technique: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accession_number?: string | null
          body_part: string
          branch_id: string
          contrast_type?: string | null
          contrast_used?: boolean | null
          created_at?: string
          file_size_mb?: number | null
          findings?: string | null
          id?: string
          image_count?: number | null
          impression?: string | null
          indication: string
          modality: string
          patient_id: string
          performing_physician?: string | null
          priority?: string | null
          radiation_dose?: number | null
          radiologist?: string | null
          recommendations?: string | null
          referring_physician?: string | null
          status?: string | null
          storage_location?: string | null
          study_date: string
          study_time?: string | null
          study_type: string
          study_uid?: string | null
          technique?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accession_number?: string | null
          body_part?: string
          branch_id?: string
          contrast_type?: string | null
          contrast_used?: boolean | null
          created_at?: string
          file_size_mb?: number | null
          findings?: string | null
          id?: string
          image_count?: number | null
          impression?: string | null
          indication?: string
          modality?: string
          patient_id?: string
          performing_physician?: string | null
          priority?: string | null
          radiation_dose?: number | null
          radiologist?: string | null
          recommendations?: string | null
          referring_physician?: string | null
          status?: string | null
          storage_location?: string | null
          study_date?: string
          study_time?: string | null
          study_type?: string
          study_uid?: string | null
          technique?: string | null
          tenant_id?: string
          updated_at?: string
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
      job_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          job_id: string
          started_at: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          job_id: string
          started_at?: string
          status: string
          tenant_id?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          job_id?: string
          started_at?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_executions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          branch_id: string
          clinical_indication: string | null
          collection_date: string | null
          created_at: string
          fasting_required: boolean | null
          id: string
          lab_facility: string | null
          order_date: string
          order_number: string
          ordered_by: string
          ordering_physician: string | null
          patient_id: string
          patient_preparation: string | null
          priority: string | null
          special_instructions: string | null
          status: string | null
          tenant_id: string
          tests_ordered: Json
          updated_at: string
        }
        Insert: {
          branch_id: string
          clinical_indication?: string | null
          collection_date?: string | null
          created_at?: string
          fasting_required?: boolean | null
          id?: string
          lab_facility?: string | null
          order_date?: string
          order_number: string
          ordered_by: string
          ordering_physician?: string | null
          patient_id: string
          patient_preparation?: string | null
          priority?: string | null
          special_instructions?: string | null
          status?: string | null
          tenant_id: string
          tests_ordered?: Json
          updated_at?: string
        }
        Update: {
          branch_id?: string
          clinical_indication?: string | null
          collection_date?: string | null
          created_at?: string
          fasting_required?: boolean | null
          id?: string
          lab_facility?: string | null
          order_date?: string
          order_number?: string
          ordered_by?: string
          ordering_physician?: string | null
          patient_id?: string
          patient_preparation?: string | null
          priority?: string | null
          special_instructions?: string | null
          status?: string | null
          tenant_id?: string
          tests_ordered?: Json
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
      medical_documents: {
        Row: {
          branch_id: string
          created_at: string
          document_date: string | null
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          patient_id: string
          status: string | null
          tags: string[] | null
          tenant_id: string
          updated_at: string
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          document_date?: string | null
          document_name: string
          document_type: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          patient_id: string
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          document_date?: string | null
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          patient_id?: string
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
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
      medication_adherence: {
        Row: {
          adherence_date: string
          adherence_percentage: number | null
          created_at: string
          doses_prescribed: number
          doses_taken: number | null
          id: string
          missed_doses: number | null
          patient_id: string
          patient_reported_issues: string | null
          prescription_id: string
          recorded_by: string | null
          side_effects: string[] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          adherence_date: string
          adherence_percentage?: number | null
          created_at?: string
          doses_prescribed: number
          doses_taken?: number | null
          id?: string
          missed_doses?: number | null
          patient_id: string
          patient_reported_issues?: string | null
          prescription_id: string
          recorded_by?: string | null
          side_effects?: string[] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          adherence_date?: string
          adherence_percentage?: number | null
          created_at?: string
          doses_prescribed?: number
          doses_taken?: number | null
          id?: string
          missed_doses?: number | null
          patient_id?: string
          patient_reported_issues?: string | null
          prescription_id?: string
          recorded_by?: string | null
          side_effects?: string[] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      medication_interactions: {
        Row: {
          clinical_significance: string | null
          created_at: string
          description: string
          evidence_level: string | null
          id: string
          interaction_type: string
          is_active: boolean | null
          management_recommendations: string | null
          medication_1: string
          medication_2: string
          severity_level: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          clinical_significance?: string | null
          created_at?: string
          description: string
          evidence_level?: string | null
          id?: string
          interaction_type: string
          is_active?: boolean | null
          management_recommendations?: string | null
          medication_1: string
          medication_2: string
          severity_level?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          clinical_significance?: string | null
          created_at?: string
          description?: string
          evidence_level?: string | null
          id?: string
          interaction_type?: string
          is_active?: boolean | null
          management_recommendations?: string | null
          medication_1?: string
          medication_2?: string
          severity_level?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          branch_id: string
          charges: Json | null
          clinical_notes: string | null
          completed_at: string | null
          created_at: string
          encounter_id: string
          id: string
          instructions: string | null
          metadata: Json | null
          order_code: string
          order_name: string
          order_number: string
          order_type: string
          ordered_at: string
          ordered_by: string
          patient_id: string
          priority: string
          scheduled_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          charges?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string
          encounter_id: string
          id?: string
          instructions?: string | null
          metadata?: Json | null
          order_code: string
          order_name: string
          order_number: string
          order_type: string
          ordered_at?: string
          ordered_by: string
          patient_id: string
          priority?: string
          scheduled_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          charges?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string
          encounter_id?: string
          id?: string
          instructions?: string | null
          metadata?: Json | null
          order_code?: string
          order_name?: string
          order_number?: string
          order_type?: string
          ordered_at?: string
          ordered_by?: string
          patient_id?: string
          priority?: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string
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
          reminder_preferences: Json | null
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
          reminder_preferences?: Json | null
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
          reminder_preferences?: Json | null
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
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      prescription_renewals: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          id: string
          modifications: Json | null
          notes: string | null
          original_prescription_id: string
          patient_id: string
          reason_for_renewal: string | null
          renewal_type: string | null
          request_date: string
          requested_by: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          id?: string
          modifications?: Json | null
          notes?: string | null
          original_prescription_id: string
          patient_id: string
          reason_for_renewal?: string | null
          renewal_type?: string | null
          request_date?: string
          requested_by?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          id?: string
          modifications?: Json | null
          notes?: string | null
          original_prescription_id?: string
          patient_id?: string
          reason_for_renewal?: string | null
          renewal_type?: string | null
          request_date?: string
          requested_by?: string | null
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
      results: {
        Row: {
          attachments: Json | null
          branch_id: string
          created_at: string
          critical_flag: boolean | null
          id: string
          notes: string | null
          order_id: string
          patient_id: string
          reference_ranges: Json | null
          reported_at: string
          reported_by: string | null
          result_data: Json
          result_type: string
          status: string
          tenant_id: string
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
          order_id: string
          patient_id: string
          reference_ranges?: Json | null
          reported_at?: string
          reported_by?: string | null
          result_data?: Json
          result_type: string
          status?: string
          tenant_id: string
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
          order_id?: string
          patient_id?: string
          reference_ranges?: Json | null
          reported_at?: string
          reported_by?: string | null
          result_data?: Json
          result_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      room_bookings: {
        Row: {
          appointment_id: string | null
          booking_date: string
          branch_id: string
          created_at: string
          created_by: string | null
          end_time: string
          equipment_required: Json | null
          id: string
          notes: string | null
          room_name: string
          room_type: string | null
          start_time: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          booking_date: string
          branch_id: string
          created_at?: string
          created_by?: string | null
          end_time: string
          equipment_required?: Json | null
          id?: string
          notes?: string | null
          room_name: string
          room_type?: string | null
          start_time: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          booking_date?: string
          branch_id?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          equipment_required?: Json | null
          id?: string
          notes?: string | null
          room_name?: string
          room_type?: string | null
          start_time?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          job_data: Json | null
          job_name: string
          job_type: string
          last_run_at: string | null
          next_run_at: string | null
          schedule_expression: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_data?: Json | null
          job_name: string
          job_type: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_expression: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_data?: Json | null
          job_name?: string
          job_type?: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_expression?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
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
      stock_moves: {
        Row: {
          batch_id: string | null
          branch_id: string
          created_at: string
          id: string
          item_id: string
          location_from: string | null
          location_to: string | null
          move_type: string
          moved_at: string
          moved_by: string
          notes: string | null
          quantity_change: number
          reason: string
          reference_id: string | null
          reference_type: string | null
          tenant_id: string
          total_cost: number | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          branch_id: string
          created_at?: string
          id?: string
          item_id: string
          location_from?: string | null
          location_to?: string | null
          move_type: string
          moved_at?: string
          moved_by: string
          notes?: string | null
          quantity_change: number
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          tenant_id: string
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          branch_id?: string
          created_at?: string
          id?: string
          item_id?: string
          location_from?: string | null
          location_to?: string | null
          move_type?: string
          moved_at?: string
          moved_by?: string
          notes?: string | null
          quantity_change?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      surgical_history: {
        Row: {
          anesthesia_type: string | null
          branch_id: string
          complications: string | null
          created_at: string
          hospital_name: string | null
          id: string
          notes: string | null
          outcome: string | null
          patient_id: string
          procedure_code: string | null
          procedure_name: string
          recorded_by: string | null
          surgeon_name: string | null
          surgery_date: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          anesthesia_type?: string | null
          branch_id: string
          complications?: string | null
          created_at?: string
          hospital_name?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          patient_id: string
          procedure_code?: string | null
          procedure_name: string
          recorded_by?: string | null
          surgeon_name?: string | null
          surgery_date: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          anesthesia_type?: string | null
          branch_id?: string
          complications?: string | null
          created_at?: string
          hospital_name?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          patient_id?: string
          procedure_code?: string | null
          procedure_name?: string
          recorded_by?: string | null
          surgeon_name?: string | null
          surgery_date?: string
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
      webhook_deliveries: {
        Row: {
          attempt_number: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          response_time_ms: number | null
          tenant_id: string
          webhook_endpoint_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          tenant_id: string
          webhook_endpoint_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          tenant_id?: string
          webhook_endpoint_id?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          events: string[]
          headers: Json | null
          id: string
          last_delivery_at: string | null
          name: string
          retry_attempts: number
          secret: string
          status: string
          success_rate: number | null
          tenant_id: string
          timeout_seconds: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          last_delivery_at?: string | null
          name: string
          retry_attempts?: number
          secret: string
          status?: string
          success_rate?: number | null
          tenant_id: string
          timeout_seconds?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          last_delivery_at?: string | null
          name?: string
          retry_attempts?: number
          secret?: string
          status?: string
          success_rate?: number | null
          tenant_id?: string
          timeout_seconds?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      workflow_instances: {
        Row: {
          assigned_to: string | null
          branch_id: string
          completed_at: string | null
          created_at: string
          current_step: number | null
          id: string
          metadata: Json | null
          patient_id: string
          priority: number | null
          started_at: string
          status: string | null
          tenant_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          metadata?: Json | null
          patient_id: string
          priority?: number | null
          started_at?: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          priority?: number | null
          started_at?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          branch_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          dependencies: Json | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          priority: number | null
          status: string | null
          task_name: string
          task_type: string | null
          tenant_id: string
          updated_at: string
          workflow_instance_id: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          branch_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          priority?: number | null
          status?: string | null
          task_name: string
          task_type?: string | null
          tenant_id: string
          updated_at?: string
          workflow_instance_id: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          branch_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          priority?: number | null
          status?: string | null
          task_name?: string
          task_type?: string | null
          tenant_id?: string
          updated_at?: string
          workflow_instance_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_appointment_types: {
        Row: {
          appointment_type: string | null
          avg_duration: number | null
          branch_id: string | null
          completed_count: number | null
          count: number | null
          month: string | null
          tenant_id: string | null
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
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_daily_appointments: {
        Row: {
          avg_duration: number | null
          branch_id: string | null
          cancelled_appointments: number | null
          completed_appointments: number | null
          date: string | null
          emergency_appointments: number | null
          no_show_appointments: number | null
          tenant_id: string | null
          total_appointments: number | null
          unique_patients: number | null
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
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_monthly_revenue: {
        Row: {
          avg_transaction_amount: number | null
          branch_id: string | null
          month: string | null
          paid_revenue: number | null
          pending_revenue: number | null
          tenant_id: string | null
          total_revenue: number | null
          total_transactions: number | null
          unique_patients: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
      analytics_patient_flow: {
        Row: {
          active_patients: number | null
          branch_id: string | null
          month: string | null
          new_patients: number | null
          pediatric_patients: number | null
          senior_patients: number | null
          tenant_id: string | null
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
      analytics_queue_performance: {
        Row: {
          avg_wait_time: number | null
          branch_id: string | null
          completed_entries: number | null
          date: string | null
          max_wait_time: number | null
          no_show_entries: number | null
          tenant_id: string | null
          total_queue_entries: number | null
        }
        Relationships: []
      }
      analytics_staff_performance: {
        Row: {
          avg_appointment_duration: number | null
          branch_id: string | null
          completed_appointments: number | null
          month: string | null
          revenue_generated: number | null
          staff_id: string | null
          staff_name: string | null
          tenant_id: string | null
          total_appointments: number | null
          unique_patients_served: number | null
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
    }
    Functions: {
      get_appointment_analytics: {
        Args: {
          end_date: string
          start_date: string
          target_branch_id?: string
          target_tenant_id: string
        }
        Returns: {
          avg_duration: number
          cancelled_appointments: number
          completed_appointments: number
          date: string
          no_show_appointments: number
          total_appointments: number
          unique_patients: number
        }[]
      }
      get_patient_flow_analytics: {
        Args: {
          end_date: string
          start_date: string
          target_branch_id?: string
          target_tenant_id: string
        }
        Returns: {
          active_patients: number
          month: string
          new_patients: number
          pediatric_patients: number
          senior_patients: number
        }[]
      }
      get_revenue_analytics: {
        Args: {
          end_date: string
          start_date: string
          target_branch_id?: string
          target_tenant_id: string
        }
        Returns: {
          avg_transaction_amount: number
          month: string
          paid_revenue: number
          pending_revenue: number
          total_revenue: number
          total_transactions: number
          unique_patients: number
        }[]
      }
      get_user_branch_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          permission_name: string
          resource: string
        }[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_cross_branch_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_webhook_success_rate: {
        Args: { webhook_id: string }
        Returns: undefined
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
        | "compliance"
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
        "compliance",
      ],
    },
  },
} as const
