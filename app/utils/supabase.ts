import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY_HERE';

// Generated Database types from RenoWorld Supabase Project
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  calcreno_schema: {
    Tables: {
      calcreno_projects: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          property_address: string | null
          total_area: number | null
          project_type: string | null
          budget_limit: number | null
          timeline_months: number | null
          status: string | null
          is_exported_to_timeline: boolean | null
          timeline_project_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          property_address?: string | null
          total_area?: number | null
          project_type?: string | null
          budget_limit?: number | null
          timeline_months?: number | null
          status?: string | null
          is_exported_to_timeline?: boolean | null
          timeline_project_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          property_address?: string | null
          total_area?: number | null
          project_type?: string | null
          budget_limit?: number | null
          timeline_months?: number | null
          status?: string | null
          is_exported_to_timeline?: boolean | null
          timeline_project_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calcreno_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calcreno_rooms: {
        Row: {
          id: string
          project_id: string | null
          name: string
          room_type: string
          area_sqm: number
          height_m: number | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          room_type: string
          area_sqm: number
          height_m?: number | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          room_type?: string
          area_sqm?: number
          height_m?: number | null
          description?: string | null
          created_at?: string | null
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
            id: string
            room_id: string | null
            element_type: string
            material: string
            area_sqm: number
            unit_cost: number
            total_cost: number
            notes: string | null
            created_at: string | null
            updated_at: string | null
          }
          Insert: {
            id?: string
            room_id?: string | null
            element_type: string
            material: string
            area_sqm: number
            unit_cost: number
            total_cost: number
            notes?: string | null
            created_at?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            room_id?: string | null
            element_type?: string
            material?: string
            area_sqm?: number
            unit_cost?: number
            total_cost?: number
            notes?: string | null
            created_at?: string | null
            updated_at?: string | null
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
      project_exports: {
        Row: {
          id: string
          project_id: string | null
          export_status: string | null
          timeline_project_id: string | null
          export_data: Json
          error_message: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          export_status?: string | null
          timeline_project_id?: string | null
          export_data: Json
          error_message?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          export_status?: string | null
          timeline_project_id?: string | null
          export_data?: Json
          error_message?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_exports_project_id_fkey"
            columns: ["project_id"]
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
  shared_schema: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          preferences: Json | null
          expertise: string[] | null
          created_at: string | null
          updated_at: string | null
          first_name: string | null
          last_name: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferences?: Json | null
          expertise?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferences?: Json | null
          expertise?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_preferences: {
        Row: {
          id: string
          user_id: string | null
          app_name: string
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_name: string
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          app_name?: string
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cross_app_notifications: {
        Row: {
          id: string
          user_id: string | null
          from_app: string
          to_app: string
          notification_type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          from_app: string
          to_app: string
          notification_type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          from_app?: string
          to_app?: string
          notification_type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_app_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_push_tokens: {
        Row: {
          id: string
          user_id: string | null
          app_name: string
          push_token: string
          device_type: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_name: string
          push_token: string
          device_type?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          app_name?: string
          push_token?: string
          device_type?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          user_id: string
          project_id: string
          app_name: string
          role: string
          created_at: string | null
        }
        Insert: {
          user_id: string
          project_id: string
          app_name: string
          role: string
          created_at?: string | null
        }
        Update: {
          user_id?: string
          project_id?: string
          app_name?: string
          role?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          app_name: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_name: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          app_name?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      guest_sessions: {
        Row: {
          id: string
          session_token: string
          app_name: string
          data: Json | null
          expires_at: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          session_token: string
          app_name: string
          data?: Json | null
          expires_at: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          session_token?: string
          app_name?: string
          data?: Json | null
          expires_at?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
  shared_schema: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          expertise: string | null
          timezone: string | null
          language: string | null
          theme: string | null
          notification_preferences: Json | null
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          expertise?: string | null
          timezone?: string | null
          language?: string | null
          theme?: string | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          expertise?: string | null
          timezone?: string | null
          language?: string | null
          theme?: string | null
          notification_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_preferences: {
        Row: {
          id: string
          user_id: string | null
          app_name: string
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_name: string
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          app_name?: string
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_push_tokens: {
        Row: {
          id: string
          user_id: string | null
          push_token: string
          platform: string
          app_name: string
          device_name: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          push_token: string
          platform: string
          app_name: string
          device_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          push_token?: string
          platform?: string
          app_name?: string
          device_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string | null
          project_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          project_id: string
          role: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          project_id?: string
          role?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cross_app_notifications: {
        Row: {
          id: string
          user_id: string | null
          app_name: string
          title: string
          message: string
          type: string | null
          read: boolean | null
          data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_name: string
          title: string
          message: string
          type?: string | null
          read?: boolean | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          app_name?: string
          title?: string
          message?: string
          type?: string | null
          read?: boolean | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_app_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      guest_sessions: {
        Row: {
          id: string
          session_id: string
          user_agent: string | null
          ip_address: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          session_id?: string
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
          expires_at?: string
        }
        Relationships: []
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

// Create Supabase client with proper schema configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'calcreno_schema', // Default schema for CalcReno operations
  },
});

// Shared schema client for cross-app operations
export const sharedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'shared_schema', // For cross-app operations
  },
});

// Edge Functions client (no schema override - needed for function calls)
export const functionsSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // No schema override - Edge Functions need default access
});

// Global auth error handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.log('Global: Token refresh failed, clearing session');
    // Clear any invalid session data
    supabase.auth.signOut().catch(() => {
      // Ignore errors
    });
  }
}); 