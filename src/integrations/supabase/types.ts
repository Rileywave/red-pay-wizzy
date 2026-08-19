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
      activation_requests: {
        Row: {
          account_number: string | null
          admin_note: string | null
          amount: number
          auth_user_id: string | null
          bank: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          proof_image: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rpc_code_used: string | null
          status: string
          updated_at: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          account_number?: string | null
          admin_note?: string | null
          amount?: number
          auth_user_id?: string | null
          bank?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          proof_image?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rpc_code_used?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          account_number?: string | null
          admin_note?: string | null
          amount?: number
          auth_user_id?: string | null
          bank?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          proof_image?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rpc_code_used?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          cta_url: string | null
          delivered_count: number
          failed_count: number
          id: string
          sent_at: string | null
          sent_count: number
          status: string
          target_type: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          delivered_count?: number
          failed_count?: number
          id?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          target_type?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          delivered_count?: number
          failed_count?: number
          id?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          target_type?: string
          title?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string
          endpoint: string
          id: string
          p256dh: string | null
          subscription: Json | null
          user_id: string | null
        }
        Insert: {
          auth?: string | null
          created_at?: string
          endpoint: string
          id?: string
          p256dh?: string | null
          subscription?: Json | null
          user_id?: string | null
        }
        Update: {
          auth?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string | null
          subscription?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          amount_given: number | null
          confirmed_at: string | null
          created_at: string | null
          date: string | null
          id: string
          manual_credit_notes: string | null
          new_user_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          amount_given?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          manual_credit_notes?: string | null
          new_user_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          amount_given?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          manual_credit_notes?: string | null
          new_user_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_new_user_id_fkey"
            columns: ["new_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rpc_purchases: {
        Row: {
          admin_note: string | null
          created_at: string | null
          date: string | null
          email: string
          id: string
          phone: string
          proof_image: string | null
          rpc_code_issued: string | null
          status: string
          user_id: string
          user_name: string
          user_unique_id: string
          verified: boolean | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          date?: string | null
          email: string
          id?: string
          phone: string
          proof_image?: string | null
          rpc_code_issued?: string | null
          status?: string
          user_id: string
          user_name: string
          user_unique_id: string
          verified?: boolean | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          date?: string | null
          email?: string
          id?: string
          phone?: string
          proof_image?: string | null
          rpc_code_issued?: string | null
          status?: string
          user_id?: string
          user_name?: string
          user_unique_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rpc_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          date: string | null
          id: string
          meta: Json
          proof_image: string | null
          reference_id: string | null
          title: string
          transaction_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before?: number
          created_at?: string | null
          date?: string | null
          id?: string
          meta?: Json
          proof_image?: string | null
          reference_id?: string | null
          title: string
          transaction_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          date?: string | null
          id?: string
          meta?: Json
          proof_image?: string | null
          reference_id?: string | null
          title?: string
          transaction_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      users: {
        Row: {
          activated: boolean
          activated_at: string | null
          auth_user_id: string | null
          balance: number | null
          country: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_claim_at: string | null
          last_name: string
          phone: string
          profile_image: string | null
          referral_code: string
          referral_count: number
          referred_by: string | null
          rpc_code: string | null
          rpc_purchased: boolean | null
          status: string | null
          user_id: string
        }
        Insert: {
          activated?: boolean
          activated_at?: string | null
          auth_user_id?: string | null
          balance?: number | null
          country: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_claim_at?: string | null
          last_name: string
          phone: string
          profile_image?: string | null
          referral_code: string
          referral_count?: number
          referred_by?: string | null
          rpc_code?: string | null
          rpc_purchased?: boolean | null
          status?: string | null
          user_id: string
        }
        Update: {
          activated?: boolean
          activated_at?: string | null
          auth_user_id?: string | null
          balance?: number | null
          country?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_claim_at?: string | null
          last_name?: string
          phone?: string
          profile_image?: string | null
          referral_code?: string
          referral_count?: number
          referred_by?: string | null
          rpc_code?: string | null
          rpc_purchased?: boolean | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_note: string | null
          amount: number
          bank: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rpc_code_used: string | null
          status: string
          updated_at: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          admin_note?: string | null
          amount: number
          bank: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rpc_code_used?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_note?: string | null
          amount?: number
          bank?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rpc_code_used?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_referral: {
        Args: { _new_user_id: string; _referral_code: string }
        Returns: undefined
      }
      confirm_referral: {
        Args: { _amount: number; _new_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
