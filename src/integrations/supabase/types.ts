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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      credit_applications: {
        Row: {
          address: string | null
          address_2: string | null
          assigned_to: string | null
          channel: string
          city: string | null
          co_email: string | null
          co_first_name: string | null
          co_last_name: string | null
          co_monthly_income: number | null
          co_phone: string | null
          co_relationship: string | null
          co_ssn_last_four: string | null
          consent_credit_check: boolean
          consent_terms: boolean
          created_at: string
          date_of_birth: string | null
          decline_reason: string | null
          dependents: number | null
          desired_down_payment: number | null
          desired_monthly_payment: number | null
          dl_number: string | null
          dl_state: string | null
          email: string
          employer_name: string | null
          employer_phone: string | null
          employment_status: string | null
          first_name: string
          has_co_applicant: boolean
          housing_payment: number | null
          housing_status: string | null
          id: string
          internal_notes: string | null
          job_title: string | null
          last_name: string
          linked_deal_id: string | null
          marital_status: string | null
          monthly_income: number | null
          months_at_address: number | null
          months_at_employer: number | null
          other_income: number | null
          other_income_source: string | null
          phone: string
          previous_address: string | null
          reference_1_name: string | null
          reference_1_phone: string | null
          reference_1_relationship: string | null
          reference_2_name: string | null
          reference_2_phone: string | null
          reference_2_relationship: string | null
          signature_ip: string | null
          signature_name: string | null
          signed_at: string | null
          soft_pull_completed_at: string | null
          soft_pull_data: Json | null
          soft_pull_requested_at: string | null
          soft_pull_score: number | null
          soft_pull_status: Database["public"]["Enums"]["soft_pull_status"]
          ssn_last_four: string | null
          state: string | null
          status: Database["public"]["Enums"]["credit_app_status"]
          submitted_ip: string | null
          submitted_user_agent: string | null
          trade_in_details: string | null
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_stock_number: string | null
          vehicle_vin: string | null
          vehicle_year: string | null
          years_at_address: number | null
          years_at_employer: number | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          address_2?: string | null
          assigned_to?: string | null
          channel?: string
          city?: string | null
          co_email?: string | null
          co_first_name?: string | null
          co_last_name?: string | null
          co_monthly_income?: number | null
          co_phone?: string | null
          co_relationship?: string | null
          co_ssn_last_four?: string | null
          consent_credit_check?: boolean
          consent_terms?: boolean
          created_at?: string
          date_of_birth?: string | null
          decline_reason?: string | null
          dependents?: number | null
          desired_down_payment?: number | null
          desired_monthly_payment?: number | null
          dl_number?: string | null
          dl_state?: string | null
          email: string
          employer_name?: string | null
          employer_phone?: string | null
          employment_status?: string | null
          first_name: string
          has_co_applicant?: boolean
          housing_payment?: number | null
          housing_status?: string | null
          id?: string
          internal_notes?: string | null
          job_title?: string | null
          last_name: string
          linked_deal_id?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          months_at_address?: number | null
          months_at_employer?: number | null
          other_income?: number | null
          other_income_source?: string | null
          phone: string
          previous_address?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_1_relationship?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_2_relationship?: string | null
          signature_ip?: string | null
          signature_name?: string | null
          signed_at?: string | null
          soft_pull_completed_at?: string | null
          soft_pull_data?: Json | null
          soft_pull_requested_at?: string | null
          soft_pull_score?: number | null
          soft_pull_status?: Database["public"]["Enums"]["soft_pull_status"]
          ssn_last_four?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["credit_app_status"]
          submitted_ip?: string | null
          submitted_user_agent?: string | null
          trade_in_details?: string | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_stock_number?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
          years_at_address?: number | null
          years_at_employer?: number | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          address_2?: string | null
          assigned_to?: string | null
          channel?: string
          city?: string | null
          co_email?: string | null
          co_first_name?: string | null
          co_last_name?: string | null
          co_monthly_income?: number | null
          co_phone?: string | null
          co_relationship?: string | null
          co_ssn_last_four?: string | null
          consent_credit_check?: boolean
          consent_terms?: boolean
          created_at?: string
          date_of_birth?: string | null
          decline_reason?: string | null
          dependents?: number | null
          desired_down_payment?: number | null
          desired_monthly_payment?: number | null
          dl_number?: string | null
          dl_state?: string | null
          email?: string
          employer_name?: string | null
          employer_phone?: string | null
          employment_status?: string | null
          first_name?: string
          has_co_applicant?: boolean
          housing_payment?: number | null
          housing_status?: string | null
          id?: string
          internal_notes?: string | null
          job_title?: string | null
          last_name?: string
          linked_deal_id?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          months_at_address?: number | null
          months_at_employer?: number | null
          other_income?: number | null
          other_income_source?: string | null
          phone?: string
          previous_address?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_1_relationship?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_2_relationship?: string | null
          signature_ip?: string | null
          signature_name?: string | null
          signed_at?: string | null
          soft_pull_completed_at?: string | null
          soft_pull_data?: Json | null
          soft_pull_requested_at?: string | null
          soft_pull_score?: number | null
          soft_pull_status?: Database["public"]["Enums"]["soft_pull_status"]
          ssn_last_four?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["credit_app_status"]
          submitted_ip?: string | null
          submitted_user_agent?: string | null
          trade_in_details?: string | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_stock_number?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
          years_at_address?: number | null
          years_at_employer?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          activity_type: string
          actor_id: string | null
          body: string | null
          contact_email: string | null
          created_at: string
          direction: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          occurred_at: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          body?: string | null
          contact_email?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          occurred_at?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          body?: string | null
          contact_email?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          occurred_at?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          credit_app_count: number
          email: string
          first_source: string | null
          first_utm_campaign: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          full_name: string | null
          id: string
          last_ip: string | null
          last_utm_campaign: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          lead_count: number
          phone: string | null
          state: string | null
          tags: string[] | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          credit_app_count?: number
          email: string
          first_source?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          full_name?: string | null
          id?: string
          last_ip?: string | null
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          lead_count?: number
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          credit_app_count?: number
          email?: string
          first_source?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          full_name?: string | null
          id?: string
          last_ip?: string | null
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          lead_count?: number
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      deal_documents: {
        Row: {
          created_at: string
          deal_id: string
          document_type: string | null
          document_upload_id: string
          id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          document_type?: string | null
          document_upload_id: string
          id?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          document_type?: string | null
          document_upload_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_documents_document_upload_id_fkey"
            columns: ["document_upload_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          co_buyer_dl_number: string | null
          co_buyer_email: string | null
          co_buyer_name: string | null
          co_buyer_phone: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_credit_score: number | null
          customer_dl_number: string | null
          customer_email: string | null
          customer_employer: string | null
          customer_income: number | null
          customer_name: string
          customer_phone: string | null
          customer_state: string | null
          customer_zip: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          notes: string | null
          sale_price: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          trade_in_make: string | null
          trade_in_model: string | null
          trade_in_value: number | null
          trade_in_vin: string | null
          trade_in_year: string | null
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_stock_number: string | null
          vehicle_vin: string | null
          vehicle_year: string | null
        }
        Insert: {
          co_buyer_dl_number?: string | null
          co_buyer_email?: string | null
          co_buyer_name?: string | null
          co_buyer_phone?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_credit_score?: number | null
          customer_dl_number?: string | null
          customer_email?: string | null
          customer_employer?: string | null
          customer_income?: number | null
          customer_name: string
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          notes?: string | null
          sale_price?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          trade_in_make?: string | null
          trade_in_model?: string | null
          trade_in_value?: number | null
          trade_in_vin?: string | null
          trade_in_year?: string | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_stock_number?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
        }
        Update: {
          co_buyer_dl_number?: string | null
          co_buyer_email?: string | null
          co_buyer_name?: string | null
          co_buyer_phone?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_credit_score?: number | null
          customer_dl_number?: string | null
          customer_email?: string | null
          customer_employer?: string | null
          customer_income?: number | null
          customer_name?: string
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          notes?: string | null
          sale_price?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          trade_in_make?: string | null
          trade_in_model?: string | null
          trade_in_value?: number | null
          trade_in_vin?: string | null
          trade_in_year?: string | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_stock_number?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      document_uploads: {
        Row: {
          contact_submission_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          uploaded_by: string | null
        }
        Insert: {
          contact_submission_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          uploaded_by?: string | null
        }
        Update: {
          contact_submission_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_contact_submission_id_fkey"
            columns: ["contact_submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_captures: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          referrer: string | null
          session_id: string | null
          source: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          session_id: string | null
          step: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          session_id?: string | null
          step: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          session_id?: string | null
          step?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      inventory_queries: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          ip_address: string | null
          query_type: string
          search_term: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          vehicle_id: string | null
          vehicle_vin: string | null
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          ip_address?: string | null
          query_type: string
          search_term?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_vin?: string | null
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          ip_address?: string | null
          query_type?: string
          search_term?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_vin?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          follow_up_at: string | null
          id: string
          internal_notes: string | null
          message: string | null
          name: string
          phone: string | null
          program_tags: string[]
          rideshare_account_active: boolean | null
          rideshare_months_driving: number | null
          rideshare_platform: string | null
          rideshare_weekly_earnings: number | null
          source: string
          status: string
          submitted_ip: string | null
          submitted_user_agent: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          follow_up_at?: string | null
          id?: string
          internal_notes?: string | null
          message?: string | null
          name: string
          phone?: string | null
          program_tags?: string[]
          rideshare_account_active?: boolean | null
          rideshare_months_driving?: number | null
          rideshare_platform?: string | null
          rideshare_weekly_earnings?: number | null
          source?: string
          status?: string
          submitted_ip?: string | null
          submitted_user_agent?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          follow_up_at?: string | null
          id?: string
          internal_notes?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          program_tags?: string[]
          rideshare_account_active?: boolean | null
          rideshare_months_driving?: number | null
          rideshare_platform?: string | null
          rideshare_weekly_earnings?: number | null
          source?: string
          status?: string
          submitted_ip?: string | null
          submitted_user_agent?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      login_events: {
        Row: {
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          provider: string | null
          session_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          provider?: string | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          provider?: string | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          audience_filter: Json | null
          body: string
          channel: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          stats: Json | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          audience_filter?: Json | null
          body: string
          channel: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          audience_filter?: Json | null
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          email: string
          error: string | null
          id: string
          lead_id: string | null
          opened_at: string | null
          phone: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          email: string
          error?: string | null
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          email: string | null
          first_utm_campaign: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          id: string
          ip_address: string | null
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string
          ip_address?: string | null
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string
          ip_address?: string | null
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      portfolio_buyers: {
        Row: {
          buyer_type: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          last_contacted_at: string | null
          notes: string | null
          status: string
          terms_summary: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          buyer_type?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          status?: string
          terms_summary?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          buyer_type?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          status?: string
          terms_summary?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      questionnaire_submissions: {
        Row: {
          body_style: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          desired_make: string | null
          desired_model: string | null
          desired_year: string | null
          financing_preference: string | null
          flexible_on_model: boolean
          id: string
          inventory_source: string
          linked_deal_id: string | null
          matched_stock_numbers: string[]
          notes: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          body_style?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          desired_make?: string | null
          desired_model?: string | null
          desired_year?: string | null
          financing_preference?: string | null
          flexible_on_model?: boolean
          id?: string
          inventory_source?: string
          linked_deal_id?: string | null
          matched_stock_numbers?: string[]
          notes?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          body_style?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          desired_make?: string | null
          desired_model?: string | null
          desired_year?: string | null
          financing_preference?: string | null
          flexible_on_model?: boolean
          id?: string
          inventory_source?: string
          linked_deal_id?: string | null
          matched_stock_numbers?: string[]
          notes?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_submissions_linked_deal_id_fkey"
            columns: ["linked_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_tracking: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      sales_jacket_sends: {
        Row: {
          created_at: string
          deal_id: string
          error_message: string | null
          file_name: string | null
          id: string
          provider_message_id: string | null
          sent_by: string | null
          sent_to_email: string
          sent_to_name: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          error_message?: string | null
          file_name?: string | null
          id?: string
          provider_message_id?: string | null
          sent_by?: string | null
          sent_to_email: string
          sent_to_name?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          error_message?: string | null
          file_name?: string | null
          id?: string
          provider_message_id?: string | null
          sent_by?: string | null
          sent_to_email?: string
          sent_to_name?: string | null
          status?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_run_sql: { Args: { query: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "finance"
      credit_app_status:
        | "new"
        | "reviewing"
        | "approved"
        | "declined"
        | "needs_info"
      deal_stage: "inquiry" | "approved" | "docs_signing" | "sold"
      soft_pull_status: "not_run" | "requested" | "completed" | "failed"
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
      app_role: ["admin", "user", "finance"],
      credit_app_status: [
        "new",
        "reviewing",
        "approved",
        "declined",
        "needs_info",
      ],
      deal_stage: ["inquiry", "approved", "docs_signing", "sold"],
      soft_pull_status: ["not_run", "requested", "completed", "failed"],
    },
  },
} as const
