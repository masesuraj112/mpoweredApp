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
          health_service: string | null
          patient_id: number
          practitioner_name: string | null
          recording_consent_at: string | null
          recording_consent_signature: string | null
          saved_at: string | null
          status: string
          suggestions_generated_on: string | null
        }
        Insert: {
          appointment_id?: never
          date_time: string
          health_service?: string | null
          patient_id: number
          practitioner_name?: string | null
          recording_consent_at?: string | null
          recording_consent_signature?: string | null
          saved_at?: string | null
          status?: string
          suggestions_generated_on?: string | null
        }
        Update: {
          appointment_id?: never
          date_time?: string
          health_service?: string | null
          patient_id?: number
          practitioner_name?: string | null
          recording_consent_at?: string | null
          recording_consent_signature?: string | null
          saved_at?: string | null
          status?: string
          suggestions_generated_on?: string | null
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
          group_key: string
          is_selected: boolean
          question: string
          question_id: number
          sort_order: number
        }
        Insert: {
          answer?: string | null
          appointment_id: number
          group_key: string
          is_selected: boolean
          question: string
          question_id?: never
          sort_order: number
        }
        Update: {
          answer?: string | null
          appointment_id?: number
          group_key?: string
          is_selected?: boolean
          question?: string
          question_id?: never
          sort_order?: number
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
            isOneToOne: true
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
          created_at: string
          deleted_at: string | null
          form: string
          medication_id: number
          name: string
          strength: number
          strength_unit: string
          users_id: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          form: string
          medication_id?: never
          name: string
          strength: number
          strength_unit: string
          users_id: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          created_at: string
          date: string
          lifting_impact: string
          reflection: string | null
          sitting_impact: string
          standing_impact: string
          submission_id: number
          users_id: number
          walking_impact: string
          week_start: string | null
        }
        Insert: {
          average_active_hours: number
          created_at?: string
          date: string
          lifting_impact: string
          reflection?: string | null
          sitting_impact: string
          standing_impact: string
          submission_id?: never
          users_id: number
          walking_impact: string
          week_start?: string | null
        }
        Update: {
          average_active_hours?: number
          created_at?: string
          date?: string
          lifting_impact?: string
          reflection?: string | null
          sitting_impact?: string
          standing_impact?: string
          submission_id?: never
          users_id?: number
          walking_impact?: string
          week_start?: string | null
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
          created_at: string
          date: string
          reflection: string | null
          sleeping: string
          submission_id: number
          users_id: number
          washing_dressing: string
          week_start: string | null
        }
        Insert: {
          created_at?: string
          date: string
          reflection?: string | null
          sleeping: string
          submission_id?: never
          users_id: number
          washing_dressing: string
          week_start?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          reflection?: string | null
          sleeping?: string
          submission_id?: never
          users_id?: number
          washing_dressing?: string
          week_start?: string | null
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
          created_at: string
          date: string
          emotion: string | null
          exercise: string
          no_medication: boolean
          otc_medication: string | null
          submission_id: number
          users_id: number
          week_start: string | null
        }
        Insert: {
          created_at?: string
          date: string
          emotion?: string | null
          exercise: string
          no_medication?: boolean
          otc_medication?: string | null
          submission_id?: never
          users_id: number
          week_start?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          emotion?: string | null
          exercise?: string
          no_medication?: boolean
          otc_medication?: string | null
          submission_id?: never
          users_id?: number
          week_start?: string | null
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
      personal_management_medication_names: {
        Row: {
          medication_name: string
          submission_id: number
        }
        Insert: {
          medication_name: string
          submission_id: number
        }
        Update: {
          medication_name?: string
          submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_management_medication_names_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "personal_management"
            referencedColumns: ["submission_id"]
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
          created_at: string
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
          week_start: string | null
        }
        Insert: {
          created_at?: string
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
          week_start?: string | null
        }
        Update: {
          created_at?: string
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
          week_start?: string | null
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
          email: string | null
          name: string
          patient_id: number
          phone_number: string | null
          support_person_id: number
          users_id: number | null
        }
        Insert: {
          access_type: string
          email?: string | null
          name: string
          patient_id: number
          phone_number?: string | null
          support_person_id?: never
          users_id?: number | null
        }
        Update: {
          access_type?: string
          email?: string | null
          name?: string
          patient_id?: number
          phone_number?: string | null
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
      user_settings: {
        Row: {
          appointment_day_before: boolean
          appointment_on_day: boolean
          appointment_reminders: boolean
          assessment_every: number
          assessment_reminders: boolean
          assessment_unit: string
          users_id: number
        }
        Insert: {
          appointment_day_before?: boolean
          appointment_on_day?: boolean
          appointment_reminders?: boolean
          assessment_every?: number
          assessment_reminders?: boolean
          assessment_unit?: string
          users_id: number
        }
        Update: {
          appointment_day_before?: boolean
          appointment_on_day?: boolean
          appointment_reminders?: boolean
          assessment_every?: number
          assessment_reminders?: boolean
          assessment_unit?: string
          users_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_users_id_fkey"
            columns: ["users_id"]
            isOneToOne: true
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
          user_type: string
          users_id: number
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          name: string
          phone_number?: string | null
          user_type?: string
          users_id?: never
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          name?: string
          phone_number?: string | null
          user_type?: string
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
      create_profile: {
        Args: {
          p_conditions: string[]
          p_name: string
          p_other_conditions: string
          p_phone: string
          p_sex: string
          p_user_type: string
          p_year_of_birth: number
        }
        Returns: undefined
      }
      current_users_id: { Args: never; Returns: number }
      export_my_data: { Args: never; Returns: Json }
      is_own_patient_record: {
        Args: { target_patient_id: number }
        Returns: boolean
      }
      is_support_person_for_patient: {
        Args: { required_access?: string; target_patient_id: number }
        Returns: boolean
      }
      list_my_appointments: {
        Args: never
        Returns: {
          appointment_id: number
          date_time: string
          health_service: string
          practitioner_name: string
          status: string
        }[]
      }
      list_my_support_persons: {
        Args: never
        Returns: {
          access_type: string
          email: string | null
          name: string
          patient_id: number
          phone_number: string | null
          support_person_id: number
          users_id: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "support_persons"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      patient_id_for_user: {
        Args: { target_users_id: number }
        Returns: number
      }
      save_appointment: {
        Args: { p_appointment_id: number }
        Returns: undefined
      }
      save_appointment_answers: {
        Args: { p_answers: Json; p_appointment_id: number }
        Returns: undefined
      }
      save_appointment_details: {
        Args: {
          p_appointment_id?: number
          p_date_time: string
          p_health_service: string
          p_practitioner_name: string
        }
        Returns: number
      }
      save_appointment_questions: {
        Args: { p_appointment_id: number; p_question_ids: number[] }
        Returns: undefined
      }
      save_appointment_suggestions: {
        Args: {
          p_appointment_id: number
          p_generated_on: string
          p_questions: Json
        }
        Returns: boolean
      }
      save_appointment_support_people: {
        Args: { p_appointment_id: number; p_people: Json }
        Returns: {
          access_type: string
          email: string | null
          name: string
          patient_id: number
          phone_number: string | null
          support_person_id: number
          users_id: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "support_persons"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      save_management_assessment: {
        Args: {
          p_date: string
          p_emotion: string
          p_exercise: string
          p_medications: string[]
          p_no_medication: boolean
          p_otc_medication: string
        }
        Returns: number
      }
      save_movement_assessment: {
        Args: {
          p_active_hours: number
          p_date: string
          p_general_impacts: string[]
          p_lifting: string
          p_reflection: string
          p_sitting: string
          p_standing: string
          p_walking: string
        }
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
      save_personal_care_assessment: {
        Args: {
          p_date: string
          p_general_activities: string[]
          p_reflection: string
          p_sleeping: string
          p_washing_dressing: string
        }
        Returns: number
      }
      save_prescription: {
        Args: {
          p_amount: number
          p_form: string
          p_medication_id?: number
          p_name: string
          p_repeats_every: number
          p_strength: number
          p_strength_unit: string
          p_unit_of_time: string
        }
        Returns: number
      }
      save_recording_consent: {
        Args: { p_appointment_id: number; p_signature: string }
        Returns: string
      }
      save_social_health_assessment: {
        Args: {
          p_date: string
          p_enjoyment_of_life: number
          p_mood: number
          p_mood_overall: string
          p_reflection: string
          p_relation_with_others: number
          p_social_life: string
          p_travelling: string
        }
        Returns: number
      }
      save_support_person: {
        Args: {
          p_access_type: string
          p_email: string
          p_name: string
          p_phone: string
          p_support_person_id?: number
        }
        Returns: {
          access_type: string
          email: string | null
          name: string
          patient_id: number
          phone_number: string | null
          support_person_id: number
          users_id: number | null
        }
        SetofOptions: {
          from: "*"
          to: "support_persons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_profile: {
        Args: { p_name: string; p_year_of_birth: number }
        Returns: undefined
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

