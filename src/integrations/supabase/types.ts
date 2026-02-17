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
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          group_name: string | null
          id: string
          item_id: string | null
          name: string
          profit: number
          quantity: number
          total_cost: number
          total_price: number
          type: string
          unit_cost: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          group_name?: string | null
          id?: string
          item_id?: string | null
          name: string
          profit?: number
          quantity?: number
          total_cost?: number
          total_price?: number
          type: string
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          group_name?: string | null
          id?: string
          item_id?: string | null
          name?: string
          profit?: number
          quantity?: number
          total_cost?: number
          total_price?: number
          type?: string
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          client_name: string | null
          created_at: string
          id: string
          margin_percent: number
          name: string
          notes: string | null
          status: string
          total_cost: number
          total_profit: number
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          id?: string
          margin_percent?: number
          name: string
          notes?: string | null
          status?: string
          total_cost?: number
          total_profit?: number
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          id?: string
          margin_percent?: number
          name?: string
          notes?: string | null
          status?: string
          total_cost?: number
          total_profit?: number
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean
          client_id: string | null
          completed: boolean
          created_at: string
          deal_id: string | null
          description: string
          end_date: string
          id: string
          reminder: number | null
          start_date: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          client_id?: string | null
          completed?: boolean
          created_at?: string
          deal_id?: string | null
          description?: string
          end_date?: string
          id?: string
          reminder?: number | null
          start_date?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          client_id?: string | null
          completed?: boolean
          created_at?: string
          deal_id?: string | null
          description?: string
          end_date?: string
          id?: string
          reminder?: number | null
          start_date?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          date: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          company: string
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          phone: string
          position: string
          status: string
          user_id: string
        }
        Insert: {
          address?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name: string
          notes?: string
          phone?: string
          position?: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          phone?: string
          position?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          client_id: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          notes: string
          probability: number
          stage: string
          title: string
          user_id: string
          value: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string
          probability?: number
          stage?: string
          title: string
          user_id: string
          value?: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string
          probability?: number
          stage?: string
          title?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_labor: {
        Row: {
          created_at: string
          description: string | null
          final_price: number
          id: string
          margin_percent: number
          name: string
          provider_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name: string
          provider_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name?: string
          provider_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_products: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          final_price: number
          id: string
          margin_percent: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_transport: {
        Row: {
          base_cost: number
          created_at: string
          description: string | null
          final_price: number
          id: string
          margin_percent: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_cost?: number
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_cost?: number
          created_at?: string
          description?: string | null
          final_price?: number
          id?: string
          margin_percent?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_history: {
        Row: {
          action: string
          date: string
          description: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          action: string
          date?: string
          description?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          action?: string
          date?: string
          description?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          client_id: string | null
          created_at: string
          deadline: string
          description: string
          id: string
          location: string
          name: string
          parent_project_id: string | null
          start_date: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          budget?: number
          client_id?: string | null
          created_at?: string
          deadline?: string
          description?: string
          id?: string
          location?: string
          name: string
          parent_project_id?: string | null
          start_date?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          budget?: number
          client_id?: string | null
          created_at?: string
          deadline?: string
          description?: string
          id?: string
          location?: string
          name?: string
          parent_project_id?: string | null
          start_date?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          comments: Json
          completion_percentage: number
          created_at: string
          deadline: string | null
          description: string
          id: string
          phase: string
          priority: string
          project_id: string
          responsible: string
          status: string
          subtasks: Json
          title: string
          user_id: string
        }
        Insert: {
          comments?: Json
          completion_percentage?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          phase?: string
          priority?: string
          project_id: string
          responsible?: string
          status?: string
          subtasks?: Json
          title: string
          user_id: string
        }
        Update: {
          comments?: Json
          completion_percentage?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          phase?: string
          priority?: string
          project_id?: string
          responsible?: string
          status?: string
          subtasks?: Json
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string
          destination: string
          id: string
          project_id: string | null
          type: string
          user_id: string
          value: number
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          destination?: string
          id?: string
          project_id?: string | null
          type?: string
          user_id: string
          value?: number
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          destination?: string
          id?: string
          project_id?: string | null
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
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
    Enums: {},
  },
} as const
