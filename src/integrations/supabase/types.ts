export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          annual_value: number | null
          cep: string | null
          city: string | null
          cnpj_cpf: string | null
          company: string | null
          contract_end: string | null
          contract_start: string | null
          contract_value: number | null
          created_at: string | null
          email: string | null
          id: string
          ie_rg: string | null
          monthly_value: number | null
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          payment_status: string | null
          phone: string | null
          responsible: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          annual_value?: number | null
          cep?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          ie_rg?: string | null
          monthly_value?: number | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          payment_status?: string | null
          phone?: string | null
          responsible?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          annual_value?: number | null
          cep?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          ie_rg?: string | null
          monthly_value?: number | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          payment_status?: string | null
          phone?: string | null
          responsible?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          amount: number | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          content: string | null
          created_at: string | null
          d4sign_document_id: string | null
          description: string | null
          end_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          start_date: string | null
          status: string | null
          template_id: string | null
          titulo: string
          updated_at: string | null
          user_id: string
          validade: string | null
        }
        Insert: {
          amount?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          content?: string | null
          created_at?: string | null
          d4sign_document_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
          validade?: string | null
        }
        Update: {
          amount?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          content?: string | null
          created_at?: string | null
          d4sign_document_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          pipeline_id: string
          position: number
          probability: number | null
          stage_id: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          pipeline_id: string
          position?: number
          probability?: number | null
          stage_id: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          pipeline_id?: string
          position?: number
          probability?: number | null
          stage_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          budget: number | null
          cep: string | null
          city: string | null
          cnpj_cpf: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          ie_rg: string | null
          last_contact: string | null
          name: string
          neighborhood: string | null
          next_contact: string | null
          notes: string | null
          number: string | null
          phone: string | null
          position: string | null
          responsible: string | null
          score: number | null
          source: string | null
          state: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          budget?: number | null
          cep?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ie_rg?: string | null
          last_contact?: string | null
          name: string
          neighborhood?: string | null
          next_contact?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          position?: string | null
          responsible?: string | null
          score?: number | null
          source?: string | null
          state?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          budget?: number | null
          cep?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ie_rg?: string | null
          last_contact?: string | null
          name?: string
          neighborhood?: string | null
          next_contact?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          position?: string | null
          responsible?: string | null
          score?: number | null
          source?: string | null
          state?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          pipeline_id: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          position: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string | null
          permissions: Json | null
          tenant_id: string | null
          updated_at: string | null
          user_level: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_level?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_level?: string | null
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
      proposals: {
        Row: {
          amount: number | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          content: string | null
          created_at: string | null
          description: string | null
          discount: number | null
          expiry_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          number: string | null
          status: string | null
          template_id: string | null
          titulo: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          number?: string | null
          status?: string | null
          template_id?: string | null
          titulo: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          number?: string | null
          status?: string | null
          template_id?: string | null
          titulo?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      smartbots: {
        Row: {
          canal: string | null
          configuracoes: Json | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canal?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canal?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          current_users: number
          domain: string | null
          expires_at: string | null
          id: string
          max_users: number
          name: string
          plan: Database["public"]["Enums"]["tenant_plan"]
          settings: Json | null
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          current_users?: number
          domain?: string | null
          expires_at?: string | null
          id?: string
          max_users?: number
          name: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          current_users?: number
          domain?: string | null
          expires_at?: string | null
          id?: string
          max_users?: number
          name?: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_level"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_level"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_level"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_level"]
        }
        Returns: boolean
      }
      is_master: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_tenant_admin: {
        Args: { _user_id: string; _tenant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      tenant_plan: "basic" | "professional" | "enterprise"
      tenant_status: "active" | "inactive" | "suspended" | "trial"
      user_level: "user" | "admin" | "master"
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
      tenant_plan: ["basic", "professional", "enterprise"],
      tenant_status: ["active", "inactive", "suspended", "trial"],
      user_level: ["user", "admin", "master"],
    },
  },
} as const
