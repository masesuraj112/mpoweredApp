export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment: {
        Row: {
          appointment_id: number
          date_time: string
          health_service: string
          patient_id: number
          practioner_name: string
        }
        Insert: {
          appointment_id?: never
          date_time: string
          health_service: string
          patient_id: number
          practioner_name: string
        }
        Update: {
          appointment_id?: never
          date_time?: string
          health_service?: string
          patient_id?: number
          practioner_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      appointment_has_support_persons: {
        Row: {
          appointment_id: number
          support_person_id: number
        }
        Insert: {
          appointment_id: number
          support_person_id: number
        }
        Update: {
          appointment_id?: number
          support_person_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_has_support_persons_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_has_support_persons_support_person_id_fkey"
            columns: ["support_person_id"]
            isOneToOne: false
            referencedRelation: "support_persons"
            referencedColumns: ["support_person_id"]
          },
        ]
      }
      appointment_questions: {
        Row: {
          answer: string | null
          appointment_id: number
          question: string
          question_id: number
        }
        Insert: {
          answer?: string | null
          appointment_id: number
          question: string
          question_id?: never
        }
        Update: {
          answer?: string | null
          appointment_id?: number
          question?: string
          question_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "appointment_questions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      doctors: {
        Row: {
          doctor_id: number
          email: string
          patient_id: number
          specialty: string
        }
        Insert: {
          doctor_id?: never
          email: string
          patient_id: number
          specialty: string
        }
        Update: {
          doctor_id?: never
          email?: string
          patient_id?: number
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      dosage: {
        Row: {
          amount: number
          dosage_id: number
          medications_id: number
          repeats_every: number
          unit_of_time: string
        }
        Insert: {
          amount: number
          dosage_id?: never
          medications_id: number
          repeats_every: number
          unit_of_time: string
        }
        Update: {
          amount?: number
          dosage_id?: never
          medications_id?: number
          repeats_every?: number
          unit_of_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "dosage_medications_id_fkey"
            columns: ["medications_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["medication_id"]
          },
        ]
      }
      health_report: {
        Row: {
          date: string | null
          health_id: number
          movement_assessment_submission_id: number | null
          pain_assessment_submission_id: number | null
          personal_care_assessment_submission_id: number | null
          personal_management_submission_id: number | null
          social_health_assessment_submission_id: number | null
        }
        Insert: {
          date?: string | null
          health_id?: never
          movement_assessment_submission_id?: number | null
          pain_assessment_submission_id?: number | null
          personal_care_assessment_submission_id?: number | null
          personal_management_submission_id?: number | null
          social_health_assessment_submission_id?: number | null
        }
        Update: {
          date?: string | null
          health_id?: never
          movement_assessment_submission_id?: number | null
          pain_assessment_submission_id?: number | null
          personal_care_assessment_submission_id?: number | null
          personal_management_submission_id?: number | null
          social_health_assessment_submission_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_report_movement_assessment_submission_id_fkey"
            columns: ["movement_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "movement_assessment"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "health_report_pain_assessment_submission_id_fkey"
            columns: ["pain_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "pain_assessment"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "health_report_personal_care_assessment_submission_id_fkey"
            columns: ["personal_care_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "personal_care_assessment"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "health_report_personal_management_submission_id_fkey"
            columns: ["personal_management_submission_id"]
            isOneToOne: false
            referencedRelation: "personal_management"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "health_report_social_health_assessment_submission_id_fkey"
            columns: ["social_health_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "social_health_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      medications: {
        Row: {
          form: string
          medication_id: number
          name: string
          strength: number
          strength_unit: string
          users_id: number
        }
        Insert: {
          form: string
          medication_id?: never
          name: string
          strength: number
          strength_unit: string
          users_id: number
        }
        Update: {
          form?: string
          medication_id?: never
          name?: string
          strength?: number
          strength_unit?: string
          users_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "medications_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      movement_assessment: {
        Row: {
          average_active_hours: number
          date: string
          lifting_impact: string
          reflection: string | null
          sitting_impact: string
          standing_impact: string
          submission_id: number
          users_id: number
          walking_impact: string
        }
        Insert: {
          average_active_hours: number
          date: string
          lifting_impact: string
          reflection?: string | null
          sitting_impact: string
          standing_impact: string
          submission_id?: never
          users_id: number
          walking_impact: string
        }
        Update: {
          average_active_hours?: number
          date?: string
          lifting_impact?: string
          reflection?: string | null
          sitting_impact?: string
          standing_impact?: string
          submission_id?: never
          users_id?: number
          walking_impact?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_assessment_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      movement_condition: {
        Row: {
          condition_name: string
          movementassessment_submission_id: number
        }
        Insert: {
          condition_name: string
          movementassessment_submission_id: number
        }
        Update: {
          condition_name?: string
          movementassessment_submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "movement_condition_movementassessment_submission_id_fkey"
            columns: ["movementassessment_submission_id"]
            isOneToOne: false
            referencedRelation: "movement_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      movement_general_impacts: {
        Row: {
          impact_statement: string
          movement_assessment_submission_id: number
        }
        Insert: {
          impact_statement: string
          movement_assessment_submission_id: number
        }
        Update: {
          impact_statement?: string
          movement_assessment_submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "movement_general_impacts_movement_assessment_submission_id_fkey"
            columns: ["movement_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "movement_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      pain_assessment: {
        Row: {
          average_pain_level: number
          created_at: string
          current_pain_level: number
          date: string
          mildest_pain_level: number
          submission_id: number
          users_id: number
          week_start: string | null
          worst_pain_level: number
        }
        Insert: {
          average_pain_level: number
          created_at?: string
          current_pain_level: number
          date: string
          mildest_pain_level: number
          submission_id?: never
          users_id: number
          week_start?: string | null
          worst_pain_level: number
        }
        Update: {
          average_pain_level?: number
          created_at?: string
          current_pain_level?: number
          date?: string
          mildest_pain_level?: number
          submission_id?: never
          users_id?: number
          week_start?: string | null
          worst_pain_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "pain_assessment_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      pain_characteristics: {
        Row: {
          pain_assessment_submission_id: number
          pain_characteristic: string
        }
        Insert: {
          pain_assessment_submission_id: number
          pain_characteristic: string
        }
        Update: {
          pain_assessment_submission_id?: number
          pain_characteristic?: string
        }
        Relationships: [
          {
            foreignKeyName: "pain_characteristics_pain_assessment_submission_id_fkey"
            columns: ["pain_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "pain_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      pain_location: {
        Row: {
          pain_assessment_submission_id: number
          pain_location: string
        }
        Insert: {
          pain_assessment_submission_id: number
          pain_location: string
        }
        Update: {
          pain_assessment_submission_id?: number
          pain_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "pain_location_pain_assessment_submission_id_fkey"
            columns: ["pain_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "pain_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      patient_musko_skeletal_pain: {
        Row: {
          disease: string
          patient_id: number
        }
        Insert: {
          disease: string
          patient_id: number
        }
        Update: {
          disease?: string
          patient_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_musko_skeletal_pain_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_reflection: {
        Row: {
          date_time: string
          entry: string | null
          patients_patient_id: number
          reflection_id: number
        }
        Insert: {
          date_time: string
          entry?: string | null
          patients_patient_id: number
          reflection_id?: never
        }
        Update: {
          date_time?: string
          entry?: string | null
          patients_patient_id?: number
          reflection_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "patient_reflection_patients_patient_id_fkey"
            columns: ["patients_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patients: {
        Row: {
          other_conditions: string | null
          patient_id: number
          sex: string
          users_id: number
          year_of_birth: number | null
        }
        Insert: {
          other_conditions?: string | null
          patient_id?: never
          sex: string
          users_id: number
          year_of_birth?: number | null
        }
        Update: {
          other_conditions?: string | null
          patient_id?: never
          sex?: string
          users_id?: number
          year_of_birth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      personal_care_assessment: {
        Row: {
          date: string
          reflection: string | null
          sleeping: string
          submission_id: number
          users_id: number
          washing_dressing: string
        }
        Insert: {
          date: string
          reflection?: string | null
          sleeping: string
          submission_id?: never
          users_id: number
          washing_dressing: string
        }
        Update: {
          date?: string
          reflection?: string | null
          sleeping?: string
          submission_id?: never
          users_id?: number
          washing_dressing?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_care_assessment_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      personal_care_general_activities: {
        Row: {
          activity_statement: string
          personal_care_assessment_submission_id: number
        }
        Insert: {
          activity_statement: string
          personal_care_assessment_submission_id: number
        }
        Update: {
          activity_statement?: string
          personal_care_assessment_submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_care_general_activit_personal_care_assessment_sub_fkey"
            columns: ["personal_care_assessment_submission_id"]
            isOneToOne: false
            referencedRelation: "personal_care_assessment"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      personal_management: {
        Row: {
          date: string
          emotion: string | null
          exercise: string
          submission_id: number
          users_id: number
        }
        Insert: {
          date: string
          emotion?: string | null
          exercise: string
          submission_id?: never
          users_id: number
        }
        Update: {
          date?: string
          emotion?: string | null
          exercise?: string
          submission_id?: never
          users_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_management_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      personal_management_medications: {
        Row: {
          medication_id: number
          submission_id: number
        }
        Insert: {
          medication_id: number
          submission_id: number
        }
        Update: {
          medication_id?: number
          submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_management_medications_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["medication_id"]
          },
          {
            foreignKeyName: "personal_management_medications_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "personal_management"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      social_health_assessment: {
        Row: {
          date: string
          enjoyment_of_life: number
          mood: number
          mood_overall: string
          reflection: string | null
          relation_with_others: number
          social_life: string
          submission_id: number
          travelling: string
          users_id: number
        }
        Insert: {
          date: string
          enjoyment_of_life: number
          mood: number
          mood_overall: string
          reflection?: string | null
          relation_with_others: number
          social_life: string
          submission_id?: never
          travelling: string
          users_id: number
        }
        Update: {
          date?: string
          enjoyment_of_life?: number
          mood?: number
          mood_overall?: string
          reflection?: string | null
          relation_with_others?: number
          social_life?: string
          submission_id?: never
          travelling?: string
          users_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "social_health_assessment_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      support_persons: {
        Row: {
          access_type: string
          email: string
          name: string
          patient_id: number
          phone_number: string
          support_person_id: number
          users_id: number | null
        }
        Insert: {
          access_type: string
          email: string
          name: string
          patient_id: number
          phone_number: string
          support_person_id?: never
          users_id?: number | null
        }
        Update: {
          access_type?: string
          email?: string
          name?: string
          patient_id?: number
          phone_number?: string
          support_person_id?: never
          users_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "support_persons_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "support_persons_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["users_id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          name: string
          phone_number: string | null
          users_id: number
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          name: string
          phone_number?: string | null
          users_id?: never
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          name?: string
          phone_number?: string | null
          users_id?: never
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_patient: {
        Args: { required_access?: string; target_patient_id: number }
        Returns: boolean
      }
      current_users_id: { Args: never; Returns: number }
      is_own_patient_record: {
        Args: { target_patient_id: number }
        Returns: boolean
      }
      is_support_person_for_patient: {
        Args: { required_access?: string; target_patient_id: number }
        Returns: boolean
      }
      patient_id_for_user: {
        Args: { target_users_id: number }
        Returns: number
      }
      save_pain_assessment: {
        Args: {
          p_average: number
          p_characteristics: string[]
          p_current: number
          p_date: string
          p_locations: string[]
          p_mildest: number
          p_worst: number
        }
        Returns: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

