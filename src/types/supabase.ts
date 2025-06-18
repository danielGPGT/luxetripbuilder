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
      users: {
        Row: {
          id: string
          email: string
          name: string
          agency_name: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          agency_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          agency_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          title: string
          client_name: string
          destination: string
          generated_by: string
          date_created: string
          preferences: Json
          days: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          client_name: string
          destination: string
          generated_by: string
          date_created?: string
          preferences: Json
          days: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          client_name?: string
          destination?: string
          generated_by?: string
          date_created?: string
          preferences?: Json
          days?: Json
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