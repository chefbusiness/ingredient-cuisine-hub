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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_en: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_en: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_en?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string
          currency_symbol: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          currency: string
          currency_symbol: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ingredient_prices: {
        Row: {
          country_id: string
          created_at: string
          id: string
          ingredient_id: string
          month: number | null
          price: number
          season_variation: string | null
          unit: string
          updated_at: string
          year: number | null
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          ingredient_id: string
          month?: number | null
          price: number
          season_variation?: string | null
          unit?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          ingredient_id?: string
          month?: number | null
          price?: number
          season_variation?: string | null
          unit?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_prices_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_prices_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_real_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          ingredient_id: string
          is_approved: boolean | null
          uploaded_by: string | null
          votes_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          ingredient_id: string
          is_approved?: boolean | null
          uploaded_by?: string | null
          votes_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          ingredient_id?: string
          is_approved?: boolean | null
          uploaded_by?: string | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_real_images_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_recipes: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          ingredient_id: string
          name: string
          time: string
          type: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          id?: string
          ingredient_id: string
          name: string
          time: string
          type: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          ingredient_id?: string
          name?: string
          time?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_recipes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_uses: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          use_description: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          use_description: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          use_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_uses_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_varieties: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          variety_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          variety_name: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          variety_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_varieties_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          merma: number
          name: string
          name_en: string
          name_fr: string | null
          name_it: string | null
          name_la: string | null
          name_pt: string | null
          name_zh: string | null
          origen: string | null
          popularity: number
          real_image_url: string | null
          rendimiento: number
          temporada: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          merma?: number
          name: string
          name_en: string
          name_fr?: string | null
          name_it?: string | null
          name_la?: string | null
          name_pt?: string | null
          name_zh?: string | null
          origen?: string | null
          popularity?: number
          real_image_url?: string | null
          rendimiento?: number
          temporada?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          merma?: number
          name?: string
          name_en?: string
          name_fr?: string | null
          name_it?: string | null
          name_la?: string | null
          name_pt?: string | null
          name_zh?: string | null
          origen?: string | null
          popularity?: number
          real_image_url?: string | null
          rendimiento?: number
          temporada?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritional_info: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          fiber: number | null
          id: string
          ingredient_id: string
          protein: number | null
          vitamin_c: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          id?: string
          ingredient_id: string
          protein?: number | null
          vitamin_c?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          id?: string
          ingredient_id?: string
          protein?: number | null
          vitamin_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutritional_info_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          id: string
          ingredient_id: string | null
          ip_address: unknown | null
          session_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ingredient_id?: string | null
          ip_address?: unknown | null
          session_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ingredient_id?: string | null
          ip_address?: unknown | null
          session_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          preferred_currency: string | null
          preferred_language: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          preferred_currency?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preferred_currency?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_history: {
        Row: {
          id: string
          ingredient_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_history_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_ingredient_cascade: {
        Args: { ingredient_id: string }
        Returns: Json
      }
      delete_real_image_safe: {
        Args: { image_id: string }
        Returns: Json
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          resource_type: string
          resource_id?: string
          action_details?: Json
        }
        Returns: undefined
      }
      promote_to_super_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
      update_image_approval: {
        Args: { image_id: string; approved: boolean }
        Returns: Json
      }
      verify_super_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
