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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_material_drafts: {
        Row: {
          applied_at: string | null
          created_at: string
          created_by: string | null
          general_material_id: string | null
          generated_payload: Json | null
          id: string
          material_name: string | null
          model: string | null
          prompt: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          created_by?: string | null
          general_material_id?: string | null
          generated_payload?: Json | null
          id?: string
          material_name?: string | null
          model?: string | null
          prompt?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          created_by?: string | null
          general_material_id?: string | null
          generated_payload?: Json | null
          id?: string
          material_name?: string | null
          model?: string | null
          prompt?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_material_drafts_general_material_id_fkey"
            columns: ["general_material_id"]
            isOneToOne: false
            referencedRelation: "general_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          issuing_body: string | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          issuing_body?: string | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          issuing_body?: string | null
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_name: string
          company_type: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          slug: string | null
          sustainability_focus: string | null
          updated_at: string
          verified_status: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          slug?: string | null
          sustainability_focus?: string | null
          updated_at?: string
          verified_status?: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          slug?: string | null
          sustainability_focus?: string | null
          updated_at?: string
          verified_status?: string
          website?: string | null
        }
        Relationships: []
      }
      general_material_synonyms: {
        Row: {
          created_at: string
          id: string
          material_id: string
          synonym: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          synonym: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          synonym?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_material_synonyms_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "general_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      general_material_tags: {
        Row: {
          created_at: string
          id: string
          material_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_material_tags_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "general_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      general_materials: {
        Row: {
          auto_ai_enabled: boolean
          category_id: string | null
          chemical_formula: string | null
          chemical_structure_url: string | null
          created_at: string
          data_confidence: string | null
          end_of_life_summary: string | null
          id: string
          name: string
          production_scale_maturity: string | null
          short_description: string | null
          slug: string
          status: string
          sustainability_summary: string | null
          updated_at: string
        }
        Insert: {
          auto_ai_enabled?: boolean
          category_id?: string | null
          chemical_formula?: string | null
          chemical_structure_url?: string | null
          created_at?: string
          data_confidence?: string | null
          end_of_life_summary?: string | null
          id?: string
          name: string
          production_scale_maturity?: string | null
          short_description?: string | null
          slug: string
          status?: string
          sustainability_summary?: string | null
          updated_at?: string
        }
        Update: {
          auto_ai_enabled?: boolean
          category_id?: string | null
          chemical_formula?: string | null
          chemical_structure_url?: string | null
          created_at?: string
          data_confidence?: string | null
          end_of_life_summary?: string | null
          id?: string
          name?: string
          production_scale_maturity?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          sustainability_summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      introduction_requests: {
        Row: {
          application: string | null
          company_id: string
          created_at: string
          deal_value: number | null
          id: string
          message: string | null
          quantity: string | null
          status: string
          success_fee_status: string | null
          supplier_grade_id: string
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application?: string | null
          company_id: string
          created_at?: string
          deal_value?: number | null
          id?: string
          message?: string | null
          quantity?: string | null
          status?: string
          success_fee_status?: string | null
          supplier_grade_id: string
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application?: string | null
          company_id?: string
          created_at?: string
          deal_value?: number | null
          id?: string
          message?: string | null
          quantity?: string | null
          status?: string
          success_fee_status?: string | null
          supplier_grade_id?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introduction_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introduction_requests_supplier_grade_id_fkey"
            columns: ["supplier_grade_id"]
            isOneToOne: false
            referencedRelation: "supplier_material_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      material_applications: {
        Row: {
          application_id: string
          created_at: string
          id: string
          owner_id: string
          owner_type: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          owner_id: string
          owner_type: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          owner_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_applications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      material_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      material_certifications: {
        Row: {
          certification_id: string
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          owner_id: string
          owner_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          owner_id: string
          owner_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          owner_id?: string
          owner_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      material_comparisons: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      material_edit_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          owner_id: string
          owner_type: string
          reason: string | null
          reporter_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          owner_id: string
          owner_type: string
          reason?: string | null
          reporter_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          owner_id?: string
          owner_type?: string
          reason?: string | null
          reporter_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_properties: {
        Row: {
          confidence_level: string | null
          created_at: string
          exact_value: number | null
          id: string
          owner_id: string
          owner_type: string
          property_name: string
          source_id: string | null
          test_standard: string | null
          unit: string | null
          updated_at: string
          value_max: number | null
          value_min: number | null
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string
          exact_value?: number | null
          id?: string
          owner_id: string
          owner_type: string
          property_name: string
          source_id?: string | null
          test_standard?: string | null
          unit?: string | null
          updated_at?: string
          value_max?: number | null
          value_min?: number | null
        }
        Update: {
          confidence_level?: string | null
          created_at?: string
          exact_value?: number | null
          id?: string
          owner_id?: string
          owner_type?: string
          property_name?: string
          source_id?: string | null
          test_standard?: string | null
          unit?: string | null
          updated_at?: string
          value_max?: number | null
          value_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_properties_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      material_regulations: {
        Row: {
          created_at: string
          evidence_url: string | null
          id: string
          notes: string | null
          owner_id: string
          owner_type: string
          regulation_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          owner_type: string
          regulation_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          owner_type?: string
          regulation_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_regulations_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      material_requests: {
        Row: {
          application: string | null
          created_at: string
          description: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application?: string | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application?: string | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["app_role"]
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["app_role"]
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["app_role"]
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      regulations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_materials: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          owner_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          owner_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          owner_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          doi: string | null
          id: string
          notes: string | null
          organization: string | null
          publication_year: number | null
          source_type: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          doi?: string | null
          id?: string
          notes?: string | null
          organization?: string | null
          publication_year?: number | null
          source_type?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          doi?: string | null
          id?: string
          notes?: string | null
          organization?: string | null
          publication_year?: number | null
          source_type?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      supplier_material_grades: {
        Row: {
          availability_type: string | null
          company_id: string
          country_of_production: string | null
          created_at: string
          datasheet_url: string | null
          description: string | null
          general_material_id: string
          grade_name: string
          id: string
          moq: string | null
          premium_visibility: boolean
          production_scale: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          uniqueness: string | null
          updated_at: string
          verified_status: string
        }
        Insert: {
          availability_type?: string | null
          company_id: string
          country_of_production?: string | null
          created_at?: string
          datasheet_url?: string | null
          description?: string | null
          general_material_id: string
          grade_name: string
          id?: string
          moq?: string | null
          premium_visibility?: boolean
          production_scale?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          uniqueness?: string | null
          updated_at?: string
          verified_status?: string
        }
        Update: {
          availability_type?: string | null
          company_id?: string
          country_of_production?: string | null
          created_at?: string
          datasheet_url?: string | null
          description?: string | null
          general_material_id?: string
          grade_name?: string
          id?: string
          moq?: string | null
          premium_visibility?: boolean
          production_scale?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          uniqueness?: string | null
          updated_at?: string
          verified_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_material_grades_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_material_grades_general_material_id_fkey"
            columns: ["general_material_id"]
            isOneToOne: false
            referencedRelation: "general_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainability_indicators: {
        Row: {
          bio_based_content: number | null
          carbon_credits: string | null
          carbon_footprint_unit: string | null
          carbon_footprint_value: number | null
          created_at: string
          epd_available: boolean | null
          id: string
          lca_available: boolean | null
          notes: string | null
          owner_id: string
          owner_type: string
          recycled_content: number | null
          updated_at: string
        }
        Insert: {
          bio_based_content?: number | null
          carbon_credits?: string | null
          carbon_footprint_unit?: string | null
          carbon_footprint_value?: number | null
          created_at?: string
          epd_available?: boolean | null
          id?: string
          lca_available?: boolean | null
          notes?: string | null
          owner_id: string
          owner_type: string
          recycled_content?: number | null
          updated_at?: string
        }
        Update: {
          bio_based_content?: number | null
          carbon_credits?: string | null
          carbon_footprint_unit?: string | null
          carbon_footprint_value?: number | null
          created_at?: string
          epd_available?: boolean | null
          id?: string
          lca_available?: boolean | null
          notes?: string | null
          owner_id?: string
          owner_type?: string
          recycled_content?: number | null
          updated_at?: string
        }
        Relationships: []
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
      waitlist_signups: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          interest_area: string | null
          phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          interest_area?: string | null
          phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          interest_area?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_material_draft: { Args: { _draft_id: string }; Returns: string }
      can_read_owner: {
        Args: { _owner_id: string; _owner_type: string }
        Returns: boolean
      }
      can_write_owner: {
        Args: { _owner_id: string; _owner_type: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      is_paid: { Args: { _uid: string }; Returns: boolean }
      is_premium: { Args: { _uid: string }; Returns: boolean }
      is_producer: { Args: { _uid: string }; Returns: boolean }
      storage_path_company: { Args: { _name: string }; Returns: string }
      update_own_company: {
        Args: {
          _company_id: string
          _company_name: string
          _country: string
          _description: string
          _logo_url: string
          _sustainability_focus: string
          _website: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "free"
        | "researcher"
        | "industrial_premium"
        | "producer"
        | "admin"
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
      app_role: [
        "free",
        "researcher",
        "industrial_premium",
        "producer",
        "admin",
      ],
    },
  },
} as const
