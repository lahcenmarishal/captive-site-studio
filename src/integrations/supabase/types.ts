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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      demo_requests: {
        Row: {
          activite: string
          budget: string | null
          created_at: string
          demo_sent_date: string | null
          email: string | null
          entreprise: string
          id: string
          is_locked: boolean
          nom: string
          notes: string | null
          payment_amount: number | null
          payment_date: string | null
          service: string
          status: string
          telephone: string
          timeline: string
          updated_at: string
        }
        Insert: {
          activite: string
          budget?: string | null
          created_at?: string
          demo_sent_date?: string | null
          email?: string | null
          entreprise: string
          id?: string
          is_locked?: boolean
          nom: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          service: string
          status?: string
          telephone: string
          timeline: string
          updated_at?: string
        }
        Update: {
          activite?: string
          budget?: string | null
          created_at?: string
          demo_sent_date?: string | null
          email?: string | null
          entreprise?: string
          id?: string
          is_locked?: boolean
          nom?: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          service?: string
          status?: string
          telephone?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: []
      }
      license_activations: {
        Row: {
          activated_at: string
          deactivated_at: string | null
          domain: string
          id: string
          ip_address: string | null
          is_active: boolean
          license_id: string
          user_agent: string | null
        }
        Insert: {
          activated_at?: string
          deactivated_at?: string | null
          domain: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          license_id: string
          user_agent?: string | null
        }
        Update: {
          activated_at?: string
          deactivated_at?: string | null
          domain?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          license_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_activations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_api_logs: {
        Row: {
          created_at: string
          domain: string | null
          endpoint: string
          id: string
          ip_address: string | null
          license_key_prefix: string | null
          rejection_reason: string | null
          request_timestamp: number | null
          status: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          domain?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          license_key_prefix?: string | null
          rejection_reason?: string | null
          request_timestamp?: number | null
          status: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          domain?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          license_key_prefix?: string | null
          rejection_reason?: string | null
          request_timestamp?: number | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          allowed_domains: string[]
          created_at: string
          current_activations: number
          email: string
          expiration_date: string | null
          id: string
          license_key_hash: string
          license_key_prefix: string
          max_activations: number
          product_id: string
          status: string
          updated_at: string
        }
        Insert: {
          allowed_domains?: string[]
          created_at?: string
          current_activations?: number
          email: string
          expiration_date?: string | null
          id?: string
          license_key_hash: string
          license_key_prefix: string
          max_activations?: number
          product_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          allowed_domains?: string[]
          created_at?: string
          current_activations?: number
          email?: string
          expiration_date?: string | null
          id?: string
          license_key_hash?: string
          license_key_prefix?: string
          max_activations?: number
          product_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string | null
          name: string
          published: boolean
          site_title: string
          technologies: string[] | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          site_title: string
          technologies?: string[] | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          site_title?: string
          technologies?: string[] | null
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
