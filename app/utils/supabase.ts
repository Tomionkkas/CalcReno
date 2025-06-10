import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY_HERE';

// Generated Database types from Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calcreno_projects: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          is_completed: boolean | null
          is_pinned: boolean | null
          local_id: string | null
          metadata: Json | null
          name: string
          start_date: string | null
          status: string | null
          total_area: number | null
          total_budget: number | null
          total_cost: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          local_id?: string | null
          metadata?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          total_area?: number | null
          total_budget?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          local_id?: string | null
          metadata?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          total_area?: number | null
          total_budget?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calcreno_rooms: {
        Row: {
          area: number | null
          corner: string | null
          created_at: string | null
          dimensions: Json | null
          id: string
          local_id: string | null
          metadata: Json | null
          name: string
          project_id: string | null
          shape: string | null
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          corner?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          local_id?: string | null
          metadata?: Json | null
          name: string
          project_id?: string | null
          shape?: string | null
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          corner?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          local_id?: string | null
          metadata?: Json | null
          name?: string
          project_id?: string | null
          shape?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calcreno_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "calcreno_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      calcreno_room_elements: {
        Row: {
          created_at: string | null
          height: number
          id: string
          local_id: string | null
          position: number
          room_id: string | null
          type: string
          updated_at: string | null
          wall: number
          width: number
        }
        Insert: {
          created_at?: string | null
          height: number
          id?: string
          local_id?: string | null
          position: number
          room_id?: string | null
          type: string
          updated_at?: string | null
          wall: number
          width: number
        }
        Update: {
          created_at?: string | null
          height?: number
          id?: string
          local_id?: string | null
          position?: number
          room_id?: string | null
          type?: string
          updated_at?: string | null
          wall?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "calcreno_room_elements_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "calcreno_rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      cross_app_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          source_app: string
          target_app: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          source_app: string
          target_app: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          source_app?: string
          target_app?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_links: {
        Row: {
          calcreno_project_id: string | null
          created_at: string | null
          id: string
          renotimeline_project_id: string | null
          user_id: string | null
        }
        Insert: {
          calcreno_project_id?: string | null
          created_at?: string | null
          id?: string
          renotimeline_project_id?: string | null
          user_id?: string | null
        }
        Update: {
          calcreno_project_id?: string | null
          created_at?: string | null
          id?: string
          renotimeline_project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_links_calcreno_project_id_fkey"
            columns: ["calcreno_project_id"]
            isOneToOne: false
            referencedRelation: "calcreno_projects"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 