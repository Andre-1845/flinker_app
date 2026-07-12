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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_resolved: boolean | null
          reported_user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          reported_user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          reported_user_id?: string | null
        }
        Relationships: []
      }
      gig_matches: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          company_accepted: boolean
          company_accepted_at: string | null
          company_id: string
          confirmed_at: string | null
          created_at: string
          gig_id: string
          id: string
          status: string
          updated_at: string
          worker_accepted: boolean
          worker_accepted_at: string | null
          worker_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_accepted?: boolean
          company_accepted_at?: string | null
          company_id: string
          confirmed_at?: string | null
          created_at?: string
          gig_id: string
          id?: string
          status?: string
          updated_at?: string
          worker_accepted?: boolean
          worker_accepted_at?: string | null
          worker_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_accepted?: boolean
          company_accepted_at?: string | null
          company_id?: string
          confirmed_at?: string | null
          created_at?: string
          gig_id?: string
          id?: string
          status?: string
          updated_at?: string
          worker_accepted?: boolean
          worker_accepted_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_matches_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_payments: {
        Row: {
          check_in_confirmed: boolean | null
          company_id: string | null
          created_at: string
          flagged_reason: string | null
          gig_completed: boolean | null
          gig_id: string | null
          id: string
          payment_status: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          check_in_confirmed?: boolean | null
          company_id?: string | null
          created_at?: string
          flagged_reason?: string | null
          gig_completed?: boolean | null
          gig_id?: string | null
          id?: string
          payment_status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          check_in_confirmed?: boolean | null
          company_id?: string | null
          created_at?: string
          flagged_reason?: string | null
          gig_completed?: boolean | null
          gig_id?: string | null
          id?: string
          payment_status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      gigs: {
        Row: {
          company_id: string
          created_at: string
          date_end: string
          date_start: string
          description: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          max_workers: number
          payment_amount: number
          payment_type: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date_end: string
          date_start: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_workers?: number
          payment_amount?: number
          payment_type?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date_end?: string
          date_start?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_workers?: number
          payment_amount?: number
          payment_type?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          config_key: string
          config_value: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          pix_key: string | null
          responsible_name: string | null
          responsible_role: string | null
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          pix_key?: string | null
          responsible_name?: string | null
          responsible_role?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          pix_key?: string | null
          responsible_name?: string | null
          responsible_role?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          gig_id: string | null
          id: string
          is_public: boolean | null
          rated_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          gig_id?: string | null
          id?: string
          is_public?: boolean | null
          rated_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          gig_id?: string | null
          id?: string
          is_public?: boolean | null
          rated_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: []
      }
      reputation_scores: {
        Row: {
          abandonments: number
          badges_earned: number
          cancellations: number
          confiabilidade: number
          created_at: string
          engajamento: number
          experiencia: number
          gigs_completed: number
          id: string
          last_active_at: string | null
          level: string
          no_shows: number
          nota_media: number
          overall_score: number
          qualificacao: number
          trainings_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          abandonments?: number
          badges_earned?: number
          cancellations?: number
          confiabilidade?: number
          created_at?: string
          engajamento?: number
          experiencia?: number
          gigs_completed?: number
          id?: string
          last_active_at?: string | null
          level?: string
          no_shows?: number
          nota_media?: number
          overall_score?: number
          qualificacao?: number
          trainings_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          abandonments?: number
          badges_earned?: number
          cancellations?: number
          confiabilidade?: number
          created_at?: string
          engajamento?: number
          experiencia?: number
          gigs_completed?: number
          id?: string
          last_active_at?: string | null
          level?: string
          no_shows?: number
          nota_media?: number
          overall_score?: number
          qualificacao?: number
          trainings_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          price: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: string
          price: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          price?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string
          gateway_transaction_id: string | null
          gig_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          payee_id: string | null
          payer_id: string | null
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string
          gateway_transaction_id?: string | null
          gig_id?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          payee_id?: string | null
          payer_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          gateway_transaction_id?: string | null
          gig_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          payee_id?: string | null
          payer_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
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
      wallet_movements: {
        Row: {
          amount: number
          available_at: string | null
          created_at: string
          id: string
          status: string
          transaction_id: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          available_at?: string | null
          created_at?: string
          id?: string
          status?: string
          transaction_id?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          available_at?: string | null
          created_at?: string
          id?: string
          status?: string
          transaction_id?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_movements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_movements_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          created_at: string
          id: string
          pending_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          created_at?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number | null
          created_at?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          pix_key: string
          status: string
          updated_at: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          pix_key: string
          status?: string
          updated_at?: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          pix_key?: string
          status?: string
          updated_at?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string | null
          is_verified: boolean | null
          responsible_name: string | null
          responsible_role: string | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_gig_match: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_reputation: { Args: { p_user_id: string }; Returns: Json }
      cancel_gig_match: {
        Args: { p_match_id: string; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_body?: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_match_score: {
        Args: { p_latitude?: number; p_longitude?: number; p_user_id: string }
        Returns: number
      }
      get_public_profiles: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          is_verified: boolean
          responsible_name: string
          responsible_role: string
          trust_score: number
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_own_profile: {
        Args: {
          p_address?: string
          p_cnpj?: string
          p_cpf?: string
          p_full_name?: string
          p_phone?: string
          p_pix_key?: string
          p_responsible_name?: string
          p_responsible_role?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "worker" | "company" | "admin"
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
      app_role: ["worker", "company", "admin"],
    },
  },
} as const
