export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'property_manager' | 'tenant'
          full_name: string | null
          phone: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role?: 'admin' | 'property_manager' | 'tenant'
          full_name?: string | null
          phone?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'property_manager' | 'tenant'
          full_name?: string | null
          phone?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          floor_plan: string | null
          square_feet: number | null
          rent_amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          floor_plan?: string | null
          square_feet?: number | null
          rent_amount: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          floor_plan?: string | null
          square_feet?: number | null
          rent_amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          profile_id: string | null
          unit_id: string
          lease_start: string
          lease_end: string
          rent_amount: number
          security_deposit: number | null
          payment_due_day: number
          tenant_name: string | null
          tenant_email: string | null
          tenant_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          unit_id: string
          lease_start: string
          lease_end: string
          rent_amount: number
          security_deposit?: number | null
          payment_due_day: number
          tenant_name?: string | null
          tenant_email?: string | null
          tenant_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          unit_id?: string
          lease_start?: string
          lease_end?: string
          rent_amount?: number
          security_deposit?: number | null
          payment_due_day?: number
          tenant_name?: string | null
          tenant_email?: string | null
          tenant_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          amount: number
          due_date: string
          payment_date: string | null
          status: 'pending' | 'paid' | 'overdue' | 'partial'
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          amount: number
          due_date: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'partial'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          amount?: number
          due_date?: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'partial'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_reminders: {
        Row: {
          id: string
          tenant_id: string
          frequency: 'weekly' | 'monthly' | 'custom'
          days_before_due: number
          last_sent: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          frequency?: 'weekly' | 'monthly' | 'custom'
          days_before_due: number
          last_sent?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          frequency?: 'weekly' | 'monthly' | 'custom'
          days_before_due?: number
          last_sent?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
