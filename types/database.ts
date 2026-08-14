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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          initial_balance: number
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_balance?: number
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_balance?: number
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          closing_day: number
          color: string
          created_at: string
          credit_limit: number
          due_day: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closing_day: number
          color: string
          created_at?: string
          credit_limit: number
          due_day: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closing_day?: number
          color?: string
          created_at?: string
          credit_limit?: number
          due_day?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installment_groups: {
        Row: {
          account_id: string | null
          card_id: string | null
          category_id: string
          category_type: string
          created_at: string
          description: string
          first_installment_date: string
          id: string
          installments_count: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          card_id?: string | null
          category_id: string
          category_type?: string
          created_at?: string
          description: string
          first_installment_date: string
          id?: string
          installments_count: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          card_id?: string | null
          category_id?: string
          category_type?: string
          created_at?: string
          description?: string
          first_installment_date?: string
          id?: string
          installments_count?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_groups_account_fk"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "installment_groups_card_fk"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "installment_groups_category_fk"
            columns: ["category_id", "user_id", "category_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id", "type"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salary_settings: {
        Row: {
          account_id: string
          created_at: string
          id: string
          monthly_amount: number
          salary_category_id: string
          salary_category_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          monthly_amount: number
          salary_category_id: string
          salary_category_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          salary_category_id?: string
          salary_category_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_settings_account_fk"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "salary_settings_category_fk"
            columns: ["salary_category_id", "user_id", "salary_category_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id", "type"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          card_id: string | null
          category_id: string | null
          category_type: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          installment_group_id: string | null
          installment_number: number | null
          installment_total: number | null
          is_paid: boolean
          kind: string
          salary_competence: string | null
          salary_part: number | null
          salary_setting_id: string | null
          transaction_date: string
          transfer_from_account_id: string | null
          transfer_to_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          card_id?: string | null
          category_id?: string | null
          category_type?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          installment_group_id?: string | null
          installment_number?: number | null
          installment_total?: number | null
          is_paid: boolean
          kind: string
          salary_competence?: string | null
          salary_part?: number | null
          salary_setting_id?: string | null
          transaction_date: string
          transfer_from_account_id?: string | null
          transfer_to_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          card_id?: string | null
          category_id?: string | null
          category_type?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          installment_group_id?: string | null
          installment_number?: number | null
          installment_total?: number | null
          is_paid?: boolean
          kind?: string
          salary_competence?: string | null
          salary_part?: number | null
          salary_setting_id?: string | null
          transaction_date?: string
          transfer_from_account_id?: string | null
          transfer_to_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_fk"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_card_fk"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_category_fk"
            columns: ["category_id", "user_id", "category_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id", "type"]
          },
          {
            foreignKeyName: "transactions_installment_group_fk"
            columns: ["installment_group_id", "user_id"]
            isOneToOne: false
            referencedRelation: "installment_groups"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_salary_setting_fk"
            columns: ["salary_setting_id", "user_id"]
            isOneToOne: false
            referencedRelation: "salary_settings"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_transfer_from_fk"
            columns: ["transfer_from_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_transfer_to_fk"
            columns: ["transfer_to_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_installment_plan: {
        Args: { p_description: string; p_total_amount: number; p_installments_count: number; p_first_installment_date: string; p_category_id: string; p_account_id?: string | null; p_card_id?: string | null }
        Returns: string
      }
      generate_salary_month: { Args: { p_competence: string }; Returns: number }
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
