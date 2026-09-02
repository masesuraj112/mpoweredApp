
  create table "public"."appointment" (
    "appointment_id" integer generated always as identity not null,
    "patient_id" integer not null,
    "date_time" timestamp without time zone not null,
    "health_service" text not null,
    "practioner_name" character varying(45) not null
      );


alter table "public"."appointment" enable row level security;


  create table "public"."appointment_has_support_persons" (
    "appointment_id" integer not null,
    "support_person_id" integer not null
      );


alter table "public"."appointment_has_support_persons" enable row level security;


  create table "public"."appointment_questions" (
    "question_id" integer generated always as identity not null,
    "appointment_id" integer not null,
    "question" character varying(200) not null,
    "answer" text
      );


alter table "public"."appointment_questions" enable row level security;


  create table "public"."doctors" (
    "doctor_id" integer generated always as identity not null,
    "email" character varying(45) not null,
    "specialty" text not null,
    "patient_id" integer not null
      );


alter table "public"."doctors" enable row level security;


  create table "public"."dosage" (
    "dosage_id" integer generated always as identity not null,
    "amount" integer not null,
    "medications_id" integer not null,
    "unit_of_time" text not null,
    "repeats_every" integer not null
      );


alter table "public"."dosage" enable row level security;


  create table "public"."health_report" (
    "health_id" integer generated always as identity not null,
    "date" date,
    "personal_care_assessment_submission_id" integer,
    "movement_assessment_submission_id" integer,
    "social_health_assessment_submission_id" integer,
    "personal_management_submission_id" integer,
    "pain_assessment_submission_id" integer
      );


alter table "public"."health_report" enable row level security;


  create table "public"."medications" (
    "medication_id" integer generated always as identity not null,
    "name" character varying(100) not null,
    "form" text not null,
    "strength_unit" text not null,
    "strength" integer not null,
    "users_id" integer not null
      );


alter table "public"."medications" enable row level security;


  create table "public"."movement_assessment" (
    "submission_id" integer generated always as identity not null,
    "date" date not null,
    "walking_impact" text not null,
    "sitting_impact" text not null,
    "lifting_impact" text not null,
    "standing_impact" text not null,
    "average_active_hours" numeric(6,2) not null,
    "reflection" text,
    "users_id" integer not null
      );


alter table "public"."movement_assessment" enable row level security;


  create table "public"."movement_condition" (
    "condition_name" character varying(45) not null,
    "movementassessment_submission_id" integer not null
      );


alter table "public"."movement_condition" enable row level security;


  create table "public"."movement_general_impacts" (
    "impact_statement" character varying(100) not null,
    "movement_assessment_submission_id" integer not null
      );


alter table "public"."movement_general_impacts" enable row level security;


  create table "public"."pain_assessment" (
    "submission_id" integer generated always as identity not null,
    "date" date not null,
    "current_pain_level" integer not null,
    "mildest_pain_level" integer,
    "worst_pain_level" integer,
    "average_pain_level" integer,
    "users_id" integer not null
      );


alter table "public"."pain_assessment" enable row level security;


  create table "public"."pain_characteristics" (
    "pain_assessment_submission_id" integer not null,
    "pain_characteristic" character varying(45) not null
      );


alter table "public"."pain_characteristics" enable row level security;


  create table "public"."pain_location" (
    "pain_location" character varying(45) not null,
    "pain_assessment_submission_id" integer not null
      );


alter table "public"."pain_location" enable row level security;


  create table "public"."patient_musko_skeletal_pain" (
    "disease" character varying(45) not null,
    "patient_id" integer not null
      );


alter table "public"."patient_musko_skeletal_pain" enable row level security;


  create table "public"."patient_reflection" (
    "reflection_id" integer generated always as identity not null,
    "entry" text,
    "date_time" timestamp without time zone not null,
    "patients_patient_id" integer not null
      );


alter table "public"."patient_reflection" enable row level security;


  create table "public"."patients" (
    "patient_id" integer generated always as identity not null,
    "sex" character varying(20) not null,
    "other_conditions" text,
    "users_id" integer not null,
    "year_of_birth" smallint
      );


alter table "public"."patients" enable row level security;


  create table "public"."personal_care_assessment" (
    "submission_id" integer generated always as identity not null,
    "date" date not null,
    "reflection" text,
    "washing_dressing" text not null,
    "sleeping" text not null,
    "users_id" integer not null
      );


alter table "public"."personal_care_assessment" enable row level security;


  create table "public"."personal_care_general_activities" (
    "activity_statement" character varying(100) not null,
    "personal_care_assessment_submission_id" integer not null
      );


alter table "public"."personal_care_general_activities" enable row level security;


  create table "public"."personal_management" (
    "submission_id" integer generated always as identity not null,
    "date" date not null,
    "exercise" text not null,
    "emotion" text,
    "users_id" integer not null
      );


alter table "public"."personal_management" enable row level security;


  create table "public"."personal_management_medications" (
    "submission_id" integer not null,
    "medication_id" integer not null
      );


alter table "public"."personal_management_medications" enable row level security;


  create table "public"."social_health_assessment" (
    "submission_id" integer generated always as identity not null,
    "date" date not null,
    "social_life" text not null,
    "travelling" text not null,
    "mood" integer not null,
    "relation_with_others" integer not null,
    "enjoyment_of_life" integer not null,
    "mood_overall" text not null,
    "reflection" text,
    "users_id" integer not null
      );


alter table "public"."social_health_assessment" enable row level security;


  create table "public"."support_persons" (
    "support_person_id" integer generated always as identity not null,
    "phone_number" character varying(12) not null,
    "email" character varying(45) not null,
    "access_type" text not null,
    "name" character varying(45) not null,
    "patient_id" integer not null,
    "users_id" integer
      );


alter table "public"."support_persons" enable row level security;


  create table "public"."users" (
    "users_id" integer generated always as identity not null,
    "name" character varying(45) not null,
    "phone_number" character varying(12),
    "auth_id" uuid
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX appointment_has_support_persons_pkey ON public.appointment_has_support_persons USING btree (appointment_id, support_person_id);

CREATE UNIQUE INDEX appointment_pkey ON public.appointment USING btree (appointment_id);

CREATE UNIQUE INDEX appointment_questions_pkey ON public.appointment_questions USING btree (question_id);

CREATE UNIQUE INDEX doctors_pkey ON public.doctors USING btree (doctor_id);

CREATE UNIQUE INDEX dosage_pkey ON public.dosage USING btree (dosage_id);

CREATE UNIQUE INDEX health_report_pkey ON public.health_report USING btree (health_id);

CREATE INDEX idx_ahsp_appointment_id ON public.appointment_has_support_persons USING btree (appointment_id);

CREATE INDEX idx_ahsp_support_person_id ON public.appointment_has_support_persons USING btree (support_person_id);

CREATE INDEX idx_appointment_patient_id ON public.appointment USING btree (patient_id);

CREATE INDEX idx_aq_appointment_id ON public.appointment_questions USING btree (appointment_id);

CREATE INDEX idx_doctors_patient_id ON public.doctors USING btree (patient_id);

CREATE INDEX idx_dosage_medications_id ON public.dosage USING btree (medications_id);

CREATE INDEX idx_ma_users_id ON public.movement_assessment USING btree (users_id);

CREATE INDEX idx_mc_ma_submission_id ON public.movement_condition USING btree (movementassessment_submission_id);

CREATE INDEX idx_medications_users_id ON public.medications USING btree (users_id);

CREATE INDEX idx_mgi_ma_submission_id ON public.movement_general_impacts USING btree (movement_assessment_submission_id);

CREATE INDEX idx_pa_users_id ON public.pain_assessment USING btree (users_id);

CREATE INDEX idx_patients_users_id ON public.patients USING btree (users_id);

CREATE INDEX idx_pca_users_id ON public.personal_care_assessment USING btree (users_id);

CREATE INDEX idx_pcga_pca_submission_id ON public.personal_care_general_activities USING btree (personal_care_assessment_submission_id);

CREATE INDEX idx_pchar_pa_submission_id ON public.pain_characteristics USING btree (pain_assessment_submission_id);

CREATE INDEX idx_pl_pa_submission_id ON public.pain_location USING btree (pain_assessment_submission_id);

CREATE INDEX idx_pm_users_id ON public.personal_management USING btree (users_id);

CREATE INDEX idx_pmm_medication_id ON public.personal_management_medications USING btree (medication_id);

CREATE INDEX idx_pmm_submission_id ON public.personal_management_medications USING btree (submission_id);

CREATE INDEX idx_sha_users_id ON public.social_health_assessment USING btree (users_id);

CREATE INDEX idx_support_persons_patient_id ON public.support_persons USING btree (patient_id);

CREATE INDEX idx_support_persons_users_id ON public.support_persons USING btree (users_id);

CREATE UNIQUE INDEX medications_pkey ON public.medications USING btree (medication_id);

CREATE UNIQUE INDEX movement_assessment_pkey ON public.movement_assessment USING btree (submission_id);

CREATE UNIQUE INDEX movement_condition_pkey ON public.movement_condition USING btree (condition_name, movementassessment_submission_id);

CREATE UNIQUE INDEX movement_general_impacts_pkey ON public.movement_general_impacts USING btree (impact_statement, movement_assessment_submission_id);

CREATE UNIQUE INDEX pain_assessment_pkey ON public.pain_assessment USING btree (submission_id);

CREATE UNIQUE INDEX pain_characteristics_pkey ON public.pain_characteristics USING btree (pain_characteristic, pain_assessment_submission_id);

CREATE UNIQUE INDEX pain_location_pkey ON public.pain_location USING btree (pain_location, pain_assessment_submission_id);

CREATE UNIQUE INDEX patient_musko_skeletal_pain_pkey ON public.patient_musko_skeletal_pain USING btree (patient_id, disease);

CREATE UNIQUE INDEX patient_reflection_pkey ON public.patient_reflection USING btree (reflection_id);

CREATE UNIQUE INDEX patients_pkey ON public.patients USING btree (patient_id);

CREATE UNIQUE INDEX personal_care_assessment_pkey ON public.personal_care_assessment USING btree (submission_id);

CREATE UNIQUE INDEX personal_care_general_activities_pkey ON public.personal_care_general_activities USING btree (activity_statement, personal_care_assessment_submission_id);

CREATE UNIQUE INDEX personal_management_medications_pkey ON public.personal_management_medications USING btree (submission_id, medication_id);

CREATE UNIQUE INDEX personal_management_pkey ON public.personal_management USING btree (submission_id);

CREATE UNIQUE INDEX social_health_assessment_pkey ON public.social_health_assessment USING btree (submission_id);

CREATE UNIQUE INDEX support_persons_pkey ON public.support_persons USING btree (support_person_id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (users_id);

alter table "public"."appointment" add constraint "appointment_pkey" PRIMARY KEY using index "appointment_pkey";

alter table "public"."appointment_has_support_persons" add constraint "appointment_has_support_persons_pkey" PRIMARY KEY using index "appointment_has_support_persons_pkey";

alter table "public"."appointment_questions" add constraint "appointment_questions_pkey" PRIMARY KEY using index "appointment_questions_pkey";

alter table "public"."doctors" add constraint "doctors_pkey" PRIMARY KEY using index "doctors_pkey";

alter table "public"."dosage" add constraint "dosage_pkey" PRIMARY KEY using index "dosage_pkey";

alter table "public"."health_report" add constraint "health_report_pkey" PRIMARY KEY using index "health_report_pkey";

alter table "public"."medications" add constraint "medications_pkey" PRIMARY KEY using index "medications_pkey";

alter table "public"."movement_assessment" add constraint "movement_assessment_pkey" PRIMARY KEY using index "movement_assessment_pkey";

alter table "public"."movement_condition" add constraint "movement_condition_pkey" PRIMARY KEY using index "movement_condition_pkey";

alter table "public"."movement_general_impacts" add constraint "movement_general_impacts_pkey" PRIMARY KEY using index "movement_general_impacts_pkey";

alter table "public"."pain_assessment" add constraint "pain_assessment_pkey" PRIMARY KEY using index "pain_assessment_pkey";

alter table "public"."pain_characteristics" add constraint "pain_characteristics_pkey" PRIMARY KEY using index "pain_characteristics_pkey";

alter table "public"."pain_location" add constraint "pain_location_pkey" PRIMARY KEY using index "pain_location_pkey";

alter table "public"."patient_musko_skeletal_pain" add constraint "patient_musko_skeletal_pain_pkey" PRIMARY KEY using index "patient_musko_skeletal_pain_pkey";

alter table "public"."patient_reflection" add constraint "patient_reflection_pkey" PRIMARY KEY using index "patient_reflection_pkey";

alter table "public"."patients" add constraint "patients_pkey" PRIMARY KEY using index "patients_pkey";

alter table "public"."personal_care_assessment" add constraint "personal_care_assessment_pkey" PRIMARY KEY using index "personal_care_assessment_pkey";

alter table "public"."personal_care_general_activities" add constraint "personal_care_general_activities_pkey" PRIMARY KEY using index "personal_care_general_activities_pkey";

alter table "public"."personal_management" add constraint "personal_management_pkey" PRIMARY KEY using index "personal_management_pkey";

alter table "public"."personal_management_medications" add constraint "personal_management_medications_pkey" PRIMARY KEY using index "personal_management_medications_pkey";

alter table "public"."social_health_assessment" add constraint "social_health_assessment_pkey" PRIMARY KEY using index "social_health_assessment_pkey";

alter table "public"."support_persons" add constraint "support_persons_pkey" PRIMARY KEY using index "support_persons_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."appointment" add constraint "appointment_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) not valid;

alter table "public"."appointment" validate constraint "appointment_patient_id_fkey";

alter table "public"."appointment_has_support_persons" add constraint "appointment_has_support_persons_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointment(appointment_id) not valid;

alter table "public"."appointment_has_support_persons" validate constraint "appointment_has_support_persons_appointment_id_fkey";

alter table "public"."appointment_has_support_persons" add constraint "appointment_has_support_persons_support_person_id_fkey" FOREIGN KEY (support_person_id) REFERENCES public.support_persons(support_person_id) not valid;

alter table "public"."appointment_has_support_persons" validate constraint "appointment_has_support_persons_support_person_id_fkey";

alter table "public"."appointment_questions" add constraint "appointment_questions_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointment(appointment_id) not valid;

alter table "public"."appointment_questions" validate constraint "appointment_questions_appointment_id_fkey";

alter table "public"."doctors" add constraint "doctors_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) not valid;

alter table "public"."doctors" validate constraint "doctors_patient_id_fkey";

alter table "public"."dosage" add constraint "dosage_medications_id_fkey" FOREIGN KEY (medications_id) REFERENCES public.medications(medication_id) not valid;

alter table "public"."dosage" validate constraint "dosage_medications_id_fkey";

alter table "public"."health_report" add constraint "health_report_movement_assessment_submission_id_fkey" FOREIGN KEY (movement_assessment_submission_id) REFERENCES public.movement_assessment(submission_id) not valid;

alter table "public"."health_report" validate constraint "health_report_movement_assessment_submission_id_fkey";

alter table "public"."health_report" add constraint "health_report_pain_assessment_submission_id_fkey" FOREIGN KEY (pain_assessment_submission_id) REFERENCES public.pain_assessment(submission_id) not valid;

alter table "public"."health_report" validate constraint "health_report_pain_assessment_submission_id_fkey";

alter table "public"."health_report" add constraint "health_report_personal_care_assessment_submission_id_fkey" FOREIGN KEY (personal_care_assessment_submission_id) REFERENCES public.personal_care_assessment(submission_id) not valid;

alter table "public"."health_report" validate constraint "health_report_personal_care_assessment_submission_id_fkey";

alter table "public"."health_report" add constraint "health_report_personal_management_submission_id_fkey" FOREIGN KEY (personal_management_submission_id) REFERENCES public.personal_management(submission_id) not valid;

alter table "public"."health_report" validate constraint "health_report_personal_management_submission_id_fkey";

alter table "public"."health_report" add constraint "health_report_social_health_assessment_submission_id_fkey" FOREIGN KEY (social_health_assessment_submission_id) REFERENCES public.social_health_assessment(submission_id) not valid;

alter table "public"."health_report" validate constraint "health_report_social_health_assessment_submission_id_fkey";

alter table "public"."medications" add constraint "medications_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."medications" validate constraint "medications_users_id_fkey";

alter table "public"."movement_assessment" add constraint "movement_assessment_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."movement_assessment" validate constraint "movement_assessment_users_id_fkey";

alter table "public"."movement_condition" add constraint "movement_condition_movementassessment_submission_id_fkey" FOREIGN KEY (movementassessment_submission_id) REFERENCES public.movement_assessment(submission_id) not valid;

alter table "public"."movement_condition" validate constraint "movement_condition_movementassessment_submission_id_fkey";

alter table "public"."movement_general_impacts" add constraint "movement_general_impacts_movement_assessment_submission_id_fkey" FOREIGN KEY (movement_assessment_submission_id) REFERENCES public.movement_assessment(submission_id) not valid;

alter table "public"."movement_general_impacts" validate constraint "movement_general_impacts_movement_assessment_submission_id_fkey";

alter table "public"."pain_assessment" add constraint "chk_average_pain_level" CHECK (((average_pain_level IS NULL) OR ((average_pain_level >= 0) AND (average_pain_level <= 10)))) not valid;

alter table "public"."pain_assessment" validate constraint "chk_average_pain_level";

alter table "public"."pain_assessment" add constraint "chk_current_pain_level" CHECK (((current_pain_level >= 0) AND (current_pain_level <= 10))) not valid;

alter table "public"."pain_assessment" validate constraint "chk_current_pain_level";

alter table "public"."pain_assessment" add constraint "chk_mildest_pain_level" CHECK (((mildest_pain_level IS NULL) OR ((mildest_pain_level >= 0) AND (mildest_pain_level <= 10)))) not valid;

alter table "public"."pain_assessment" validate constraint "chk_mildest_pain_level";

alter table "public"."pain_assessment" add constraint "chk_worst_pain_level" CHECK (((worst_pain_level IS NULL) OR ((worst_pain_level >= 0) AND (worst_pain_level <= 10)))) not valid;

alter table "public"."pain_assessment" validate constraint "chk_worst_pain_level";

alter table "public"."pain_assessment" add constraint "pain_assessment_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."pain_assessment" validate constraint "pain_assessment_users_id_fkey";

alter table "public"."pain_characteristics" add constraint "pain_characteristics_pain_assessment_submission_id_fkey" FOREIGN KEY (pain_assessment_submission_id) REFERENCES public.pain_assessment(submission_id) not valid;

alter table "public"."pain_characteristics" validate constraint "pain_characteristics_pain_assessment_submission_id_fkey";

alter table "public"."pain_location" add constraint "pain_location_pain_assessment_submission_id_fkey" FOREIGN KEY (pain_assessment_submission_id) REFERENCES public.pain_assessment(submission_id) not valid;

alter table "public"."pain_location" validate constraint "pain_location_pain_assessment_submission_id_fkey";

alter table "public"."patient_musko_skeletal_pain" add constraint "patient_musko_skeletal_pain_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) not valid;

alter table "public"."patient_musko_skeletal_pain" validate constraint "patient_musko_skeletal_pain_patient_id_fkey";

alter table "public"."patient_reflection" add constraint "patient_reflection_patients_patient_id_fkey" FOREIGN KEY (patients_patient_id) REFERENCES public.patients(patient_id) not valid;

alter table "public"."patient_reflection" validate constraint "patient_reflection_patients_patient_id_fkey";

alter table "public"."patients" add constraint "chk_patients_sex" CHECK (((sex)::text = ANY ((ARRAY['Female'::character varying, 'Male'::character varying, 'Prefer not to say'::character varying])::text[]))) not valid;

alter table "public"."patients" validate constraint "chk_patients_sex";

alter table "public"."patients" add constraint "chk_patients_yob" CHECK (((year_of_birth IS NULL) OR ((year_of_birth >= 1900) AND (year_of_birth <= 2100)))) not valid;

alter table "public"."patients" validate constraint "chk_patients_yob";

alter table "public"."patients" add constraint "patients_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."patients" validate constraint "patients_users_id_fkey";

alter table "public"."personal_care_assessment" add constraint "personal_care_assessment_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."personal_care_assessment" validate constraint "personal_care_assessment_users_id_fkey";

alter table "public"."personal_care_general_activities" add constraint "personal_care_general_activit_personal_care_assessment_sub_fkey" FOREIGN KEY (personal_care_assessment_submission_id) REFERENCES public.personal_care_assessment(submission_id) not valid;

alter table "public"."personal_care_general_activities" validate constraint "personal_care_general_activit_personal_care_assessment_sub_fkey";

alter table "public"."personal_management" add constraint "personal_management_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."personal_management" validate constraint "personal_management_users_id_fkey";

alter table "public"."personal_management_medications" add constraint "personal_management_medications_medication_id_fkey" FOREIGN KEY (medication_id) REFERENCES public.medications(medication_id) not valid;

alter table "public"."personal_management_medications" validate constraint "personal_management_medications_medication_id_fkey";

alter table "public"."personal_management_medications" add constraint "personal_management_medications_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.personal_management(submission_id) not valid;

alter table "public"."personal_management_medications" validate constraint "personal_management_medications_submission_id_fkey";

alter table "public"."social_health_assessment" add constraint "chk_enjoyment_of_life" CHECK (((enjoyment_of_life >= 0) AND (enjoyment_of_life <= 10))) not valid;

alter table "public"."social_health_assessment" validate constraint "chk_enjoyment_of_life";

alter table "public"."social_health_assessment" add constraint "chk_mood" CHECK (((mood >= 0) AND (mood <= 10))) not valid;

alter table "public"."social_health_assessment" validate constraint "chk_mood";

alter table "public"."social_health_assessment" add constraint "chk_mood_overall" CHECK ((mood_overall = ANY (ARRAY['I was feeling frustrated'::text, 'I was feeling sad'::text, 'I was feeling okay'::text, 'I was feeling calm'::text, 'I was feeling delighted'::text]))) not valid;

alter table "public"."social_health_assessment" validate constraint "chk_mood_overall";

alter table "public"."social_health_assessment" add constraint "chk_relation_with_others" CHECK (((relation_with_others >= 0) AND (relation_with_others <= 10))) not valid;

alter table "public"."social_health_assessment" validate constraint "chk_relation_with_others";

alter table "public"."social_health_assessment" add constraint "social_health_assessment_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."social_health_assessment" validate constraint "social_health_assessment_users_id_fkey";

alter table "public"."support_persons" add constraint "support_persons_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) not valid;

alter table "public"."support_persons" validate constraint "support_persons_patient_id_fkey";

alter table "public"."support_persons" add constraint "support_persons_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public.users(users_id) not valid;

alter table "public"."support_persons" validate constraint "support_persons_users_id_fkey";

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_access_patient(target_patient_id integer, required_access text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT is_own_patient_record(target_patient_id)
      OR is_support_person_for_patient(target_patient_id, required_access);
$function$
;

CREATE OR REPLACE FUNCTION public.current_users_id()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT users_id FROM users WHERE auth_id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.is_own_patient_record(target_patient_id integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM patients p
    WHERE p.patient_id = target_patient_id AND p.users_id = current_users_id()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_support_person_for_patient(target_patient_id integer, required_access text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM support_persons sp
    WHERE sp.patient_id = target_patient_id
      AND sp.users_id = current_users_id()
      AND (required_access IS NULL OR sp.access_type LIKE '%' || required_access || '%')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.patient_id_for_user(target_users_id integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT patient_id FROM patients WHERE users_id = target_users_id;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_self_access_type_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.access_type IS DISTINCT FROM OLD.access_type
     AND OLD.users_id = current_users_id() THEN
    RAISE EXCEPTION 'Support persons cannot change their own access_type';
  END IF;
  RETURN NEW;
END;
$function$
;

grant references on table "public"."appointment" to "anon";

grant trigger on table "public"."appointment" to "anon";

grant truncate on table "public"."appointment" to "anon";

grant references on table "public"."appointment" to "authenticated";

grant trigger on table "public"."appointment" to "authenticated";

grant truncate on table "public"."appointment" to "authenticated";

grant references on table "public"."appointment" to "service_role";

grant trigger on table "public"."appointment" to "service_role";

grant truncate on table "public"."appointment" to "service_role";

grant references on table "public"."appointment_has_support_persons" to "anon";

grant trigger on table "public"."appointment_has_support_persons" to "anon";

grant truncate on table "public"."appointment_has_support_persons" to "anon";

grant references on table "public"."appointment_has_support_persons" to "authenticated";

grant trigger on table "public"."appointment_has_support_persons" to "authenticated";

grant truncate on table "public"."appointment_has_support_persons" to "authenticated";

grant references on table "public"."appointment_has_support_persons" to "service_role";

grant trigger on table "public"."appointment_has_support_persons" to "service_role";

grant truncate on table "public"."appointment_has_support_persons" to "service_role";

grant references on table "public"."appointment_questions" to "anon";

grant trigger on table "public"."appointment_questions" to "anon";

grant truncate on table "public"."appointment_questions" to "anon";

grant references on table "public"."appointment_questions" to "authenticated";

grant trigger on table "public"."appointment_questions" to "authenticated";

grant truncate on table "public"."appointment_questions" to "authenticated";

grant references on table "public"."appointment_questions" to "service_role";

grant trigger on table "public"."appointment_questions" to "service_role";

grant truncate on table "public"."appointment_questions" to "service_role";

grant references on table "public"."doctors" to "anon";

grant trigger on table "public"."doctors" to "anon";

grant truncate on table "public"."doctors" to "anon";

grant references on table "public"."doctors" to "authenticated";

grant trigger on table "public"."doctors" to "authenticated";

grant truncate on table "public"."doctors" to "authenticated";

grant references on table "public"."doctors" to "service_role";

grant trigger on table "public"."doctors" to "service_role";

grant truncate on table "public"."doctors" to "service_role";

grant references on table "public"."dosage" to "anon";

grant trigger on table "public"."dosage" to "anon";

grant truncate on table "public"."dosage" to "anon";

grant references on table "public"."dosage" to "authenticated";

grant trigger on table "public"."dosage" to "authenticated";

grant truncate on table "public"."dosage" to "authenticated";

grant references on table "public"."dosage" to "service_role";

grant trigger on table "public"."dosage" to "service_role";

grant truncate on table "public"."dosage" to "service_role";

grant references on table "public"."health_report" to "anon";

grant trigger on table "public"."health_report" to "anon";

grant truncate on table "public"."health_report" to "anon";

grant references on table "public"."health_report" to "authenticated";

grant trigger on table "public"."health_report" to "authenticated";

grant truncate on table "public"."health_report" to "authenticated";

grant references on table "public"."health_report" to "service_role";

grant trigger on table "public"."health_report" to "service_role";

grant truncate on table "public"."health_report" to "service_role";

grant references on table "public"."medications" to "anon";

grant trigger on table "public"."medications" to "anon";

grant truncate on table "public"."medications" to "anon";

grant references on table "public"."medications" to "authenticated";

grant trigger on table "public"."medications" to "authenticated";

grant truncate on table "public"."medications" to "authenticated";

grant references on table "public"."medications" to "service_role";

grant trigger on table "public"."medications" to "service_role";

grant truncate on table "public"."medications" to "service_role";

grant references on table "public"."movement_assessment" to "anon";

grant trigger on table "public"."movement_assessment" to "anon";

grant truncate on table "public"."movement_assessment" to "anon";

grant references on table "public"."movement_assessment" to "authenticated";

grant trigger on table "public"."movement_assessment" to "authenticated";

grant truncate on table "public"."movement_assessment" to "authenticated";

grant references on table "public"."movement_assessment" to "service_role";

grant trigger on table "public"."movement_assessment" to "service_role";

grant truncate on table "public"."movement_assessment" to "service_role";

grant references on table "public"."movement_condition" to "anon";

grant trigger on table "public"."movement_condition" to "anon";

grant truncate on table "public"."movement_condition" to "anon";

grant references on table "public"."movement_condition" to "authenticated";

grant trigger on table "public"."movement_condition" to "authenticated";

grant truncate on table "public"."movement_condition" to "authenticated";

grant references on table "public"."movement_condition" to "service_role";

grant trigger on table "public"."movement_condition" to "service_role";

grant truncate on table "public"."movement_condition" to "service_role";

grant references on table "public"."movement_general_impacts" to "anon";

grant trigger on table "public"."movement_general_impacts" to "anon";

grant truncate on table "public"."movement_general_impacts" to "anon";

grant references on table "public"."movement_general_impacts" to "authenticated";

grant trigger on table "public"."movement_general_impacts" to "authenticated";

grant truncate on table "public"."movement_general_impacts" to "authenticated";

grant references on table "public"."movement_general_impacts" to "service_role";

grant trigger on table "public"."movement_general_impacts" to "service_role";

grant truncate on table "public"."movement_general_impacts" to "service_role";

grant references on table "public"."pain_assessment" to "anon";

grant trigger on table "public"."pain_assessment" to "anon";

grant truncate on table "public"."pain_assessment" to "anon";

grant references on table "public"."pain_assessment" to "authenticated";

grant trigger on table "public"."pain_assessment" to "authenticated";

grant truncate on table "public"."pain_assessment" to "authenticated";

grant references on table "public"."pain_assessment" to "service_role";

grant trigger on table "public"."pain_assessment" to "service_role";

grant truncate on table "public"."pain_assessment" to "service_role";

grant references on table "public"."pain_characteristics" to "anon";

grant trigger on table "public"."pain_characteristics" to "anon";

grant truncate on table "public"."pain_characteristics" to "anon";

grant references on table "public"."pain_characteristics" to "authenticated";

grant trigger on table "public"."pain_characteristics" to "authenticated";

grant truncate on table "public"."pain_characteristics" to "authenticated";

grant references on table "public"."pain_characteristics" to "service_role";

grant trigger on table "public"."pain_characteristics" to "service_role";

grant truncate on table "public"."pain_characteristics" to "service_role";

grant references on table "public"."pain_location" to "anon";

grant trigger on table "public"."pain_location" to "anon";

grant truncate on table "public"."pain_location" to "anon";

grant references on table "public"."pain_location" to "authenticated";

grant trigger on table "public"."pain_location" to "authenticated";

grant truncate on table "public"."pain_location" to "authenticated";

grant references on table "public"."pain_location" to "service_role";

grant trigger on table "public"."pain_location" to "service_role";

grant truncate on table "public"."pain_location" to "service_role";

grant references on table "public"."patient_musko_skeletal_pain" to "anon";

grant trigger on table "public"."patient_musko_skeletal_pain" to "anon";

grant truncate on table "public"."patient_musko_skeletal_pain" to "anon";

grant references on table "public"."patient_musko_skeletal_pain" to "authenticated";

grant trigger on table "public"."patient_musko_skeletal_pain" to "authenticated";

grant truncate on table "public"."patient_musko_skeletal_pain" to "authenticated";

grant references on table "public"."patient_musko_skeletal_pain" to "service_role";

grant trigger on table "public"."patient_musko_skeletal_pain" to "service_role";

grant truncate on table "public"."patient_musko_skeletal_pain" to "service_role";

grant references on table "public"."patient_reflection" to "anon";

grant trigger on table "public"."patient_reflection" to "anon";

grant truncate on table "public"."patient_reflection" to "anon";

grant references on table "public"."patient_reflection" to "authenticated";

grant trigger on table "public"."patient_reflection" to "authenticated";

grant truncate on table "public"."patient_reflection" to "authenticated";

grant references on table "public"."patient_reflection" to "service_role";

grant trigger on table "public"."patient_reflection" to "service_role";

grant truncate on table "public"."patient_reflection" to "service_role";

grant references on table "public"."patients" to "anon";

grant trigger on table "public"."patients" to "anon";

grant truncate on table "public"."patients" to "anon";

grant references on table "public"."patients" to "authenticated";

grant trigger on table "public"."patients" to "authenticated";

grant truncate on table "public"."patients" to "authenticated";

grant references on table "public"."patients" to "service_role";

grant trigger on table "public"."patients" to "service_role";

grant truncate on table "public"."patients" to "service_role";

grant references on table "public"."personal_care_assessment" to "anon";

grant trigger on table "public"."personal_care_assessment" to "anon";

grant truncate on table "public"."personal_care_assessment" to "anon";

grant references on table "public"."personal_care_assessment" to "authenticated";

grant trigger on table "public"."personal_care_assessment" to "authenticated";

grant truncate on table "public"."personal_care_assessment" to "authenticated";

grant references on table "public"."personal_care_assessment" to "service_role";

grant trigger on table "public"."personal_care_assessment" to "service_role";

grant truncate on table "public"."personal_care_assessment" to "service_role";

grant references on table "public"."personal_care_general_activities" to "anon";

grant trigger on table "public"."personal_care_general_activities" to "anon";

grant truncate on table "public"."personal_care_general_activities" to "anon";

grant references on table "public"."personal_care_general_activities" to "authenticated";

grant trigger on table "public"."personal_care_general_activities" to "authenticated";

grant truncate on table "public"."personal_care_general_activities" to "authenticated";

grant references on table "public"."personal_care_general_activities" to "service_role";

grant trigger on table "public"."personal_care_general_activities" to "service_role";

grant truncate on table "public"."personal_care_general_activities" to "service_role";

grant references on table "public"."personal_management" to "anon";

grant trigger on table "public"."personal_management" to "anon";

grant truncate on table "public"."personal_management" to "anon";

grant references on table "public"."personal_management" to "authenticated";

grant trigger on table "public"."personal_management" to "authenticated";

grant truncate on table "public"."personal_management" to "authenticated";

grant references on table "public"."personal_management" to "service_role";

grant trigger on table "public"."personal_management" to "service_role";

grant truncate on table "public"."personal_management" to "service_role";

grant references on table "public"."personal_management_medications" to "anon";

grant trigger on table "public"."personal_management_medications" to "anon";

grant truncate on table "public"."personal_management_medications" to "anon";

grant references on table "public"."personal_management_medications" to "authenticated";

grant trigger on table "public"."personal_management_medications" to "authenticated";

grant truncate on table "public"."personal_management_medications" to "authenticated";

grant references on table "public"."personal_management_medications" to "service_role";

grant trigger on table "public"."personal_management_medications" to "service_role";

grant truncate on table "public"."personal_management_medications" to "service_role";

grant references on table "public"."social_health_assessment" to "anon";

grant trigger on table "public"."social_health_assessment" to "anon";

grant truncate on table "public"."social_health_assessment" to "anon";

grant references on table "public"."social_health_assessment" to "authenticated";

grant trigger on table "public"."social_health_assessment" to "authenticated";

grant truncate on table "public"."social_health_assessment" to "authenticated";

grant references on table "public"."social_health_assessment" to "service_role";

grant trigger on table "public"."social_health_assessment" to "service_role";

grant truncate on table "public"."social_health_assessment" to "service_role";

grant references on table "public"."support_persons" to "anon";

grant trigger on table "public"."support_persons" to "anon";

grant truncate on table "public"."support_persons" to "anon";

grant references on table "public"."support_persons" to "authenticated";

grant trigger on table "public"."support_persons" to "authenticated";

grant truncate on table "public"."support_persons" to "authenticated";

grant references on table "public"."support_persons" to "service_role";

grant trigger on table "public"."support_persons" to "service_role";

grant truncate on table "public"."support_persons" to "service_role";

grant references on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant references on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant references on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";


  create policy "appointment_insert"
  on "public"."appointment"
  as permissive
  for insert
  to public
with check (public.is_own_patient_record(patient_id));



  create policy "appointment_select"
  on "public"."appointment"
  as permissive
  for select
  to public
using (public.can_access_patient(patient_id));



  create policy "appointment_update"
  on "public"."appointment"
  as permissive
  for update
  to public
using (public.is_own_patient_record(patient_id))
with check (public.is_own_patient_record(patient_id));



  create policy "ahsp_insert"
  on "public"."appointment_has_support_persons"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_has_support_persons.appointment_id) AND public.is_own_patient_record(a.patient_id)))));



  create policy "ahsp_select"
  on "public"."appointment_has_support_persons"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_has_support_persons.appointment_id) AND public.can_access_patient(a.patient_id)))));



  create policy "aq_delete"
  on "public"."appointment_questions"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_questions.appointment_id) AND public.can_access_patient(a.patient_id)))));



  create policy "aq_insert"
  on "public"."appointment_questions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_questions.appointment_id) AND public.can_access_patient(a.patient_id)))));



  create policy "aq_select"
  on "public"."appointment_questions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_questions.appointment_id) AND public.can_access_patient(a.patient_id)))));



  create policy "aq_update"
  on "public"."appointment_questions"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_questions.appointment_id) AND public.can_access_patient(a.patient_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.appointment a
  WHERE ((a.appointment_id = appointment_questions.appointment_id) AND public.can_access_patient(a.patient_id)))));



  create policy "doctors_delete"
  on "public"."doctors"
  as permissive
  for delete
  to public
using (public.is_own_patient_record(patient_id));



  create policy "doctors_insert"
  on "public"."doctors"
  as permissive
  for insert
  to public
with check (public.is_own_patient_record(patient_id));



  create policy "doctors_select"
  on "public"."doctors"
  as permissive
  for select
  to public
using (public.is_own_patient_record(patient_id));



  create policy "doctors_update"
  on "public"."doctors"
  as permissive
  for update
  to public
using (public.is_own_patient_record(patient_id))
with check (public.is_own_patient_record(patient_id));



  create policy "dosage_delete"
  on "public"."dosage"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = dosage.medications_id) AND (m.users_id = public.current_users_id())))));



  create policy "dosage_insert"
  on "public"."dosage"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = dosage.medications_id) AND (m.users_id = public.current_users_id())))));



  create policy "dosage_select"
  on "public"."dosage"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = dosage.medications_id) AND (m.users_id = public.current_users_id())))));



  create policy "dosage_update"
  on "public"."dosage"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = dosage.medications_id) AND (m.users_id = public.current_users_id())))))
with check ((EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = dosage.medications_id) AND (m.users_id = public.current_users_id())))));



  create policy "health_report_insert"
  on "public"."health_report"
  as permissive
  for insert
  to public
with check ((((personal_care_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.personal_care_assessment x
  WHERE ((x.submission_id = health_report.personal_care_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((movement_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.movement_assessment x
  WHERE ((x.submission_id = health_report.movement_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((social_health_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.social_health_assessment x
  WHERE ((x.submission_id = health_report.social_health_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((personal_management_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.personal_management x
  WHERE ((x.submission_id = health_report.personal_management_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((pain_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.pain_assessment x
  WHERE ((x.submission_id = health_report.pain_assessment_submission_id) AND (x.users_id = public.current_users_id())))))));



  create policy "health_report_select"
  on "public"."health_report"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.personal_care_assessment x
  WHERE ((x.submission_id = health_report.personal_care_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.movement_assessment x
  WHERE ((x.submission_id = health_report.movement_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.social_health_assessment x
  WHERE ((x.submission_id = health_report.social_health_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.personal_management x
  WHERE ((x.submission_id = health_report.personal_management_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.pain_assessment x
  WHERE ((x.submission_id = health_report.pain_assessment_submission_id) AND (x.users_id = public.current_users_id()))))));



  create policy "health_report_update"
  on "public"."health_report"
  as permissive
  for update
  to public
using (((EXISTS ( SELECT 1
   FROM public.personal_care_assessment x
  WHERE ((x.submission_id = health_report.personal_care_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.movement_assessment x
  WHERE ((x.submission_id = health_report.movement_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.social_health_assessment x
  WHERE ((x.submission_id = health_report.social_health_assessment_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.personal_management x
  WHERE ((x.submission_id = health_report.personal_management_submission_id) AND (x.users_id = public.current_users_id())))) OR (EXISTS ( SELECT 1
   FROM public.pain_assessment x
  WHERE ((x.submission_id = health_report.pain_assessment_submission_id) AND (x.users_id = public.current_users_id()))))))
with check ((((personal_care_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.personal_care_assessment x
  WHERE ((x.submission_id = health_report.personal_care_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((movement_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.movement_assessment x
  WHERE ((x.submission_id = health_report.movement_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((social_health_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.social_health_assessment x
  WHERE ((x.submission_id = health_report.social_health_assessment_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((personal_management_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.personal_management x
  WHERE ((x.submission_id = health_report.personal_management_submission_id) AND (x.users_id = public.current_users_id()))))) AND ((pain_assessment_submission_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.pain_assessment x
  WHERE ((x.submission_id = health_report.pain_assessment_submission_id) AND (x.users_id = public.current_users_id())))))));



  create policy "meds_delete"
  on "public"."medications"
  as permissive
  for delete
  to public
using ((users_id = public.current_users_id()));



  create policy "meds_insert"
  on "public"."medications"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "meds_select"
  on "public"."medications"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "meds_update"
  on "public"."medications"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "ma_insert"
  on "public"."movement_assessment"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "ma_select"
  on "public"."movement_assessment"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "ma_update"
  on "public"."movement_assessment"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "mc_delete"
  on "public"."movement_condition"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.movement_assessment ma
  WHERE ((ma.submission_id = movement_condition.movementassessment_submission_id) AND (ma.users_id = public.current_users_id())))));



  create policy "mc_insert"
  on "public"."movement_condition"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.movement_assessment ma
  WHERE ((ma.submission_id = movement_condition.movementassessment_submission_id) AND (ma.users_id = public.current_users_id())))));



  create policy "mc_select"
  on "public"."movement_condition"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.movement_assessment ma
  WHERE ((ma.submission_id = movement_condition.movementassessment_submission_id) AND (ma.users_id = public.current_users_id())))));



  create policy "mgi_insert"
  on "public"."movement_general_impacts"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.movement_assessment ma
  WHERE ((ma.submission_id = movement_general_impacts.movement_assessment_submission_id) AND (ma.users_id = public.current_users_id())))));



  create policy "mgi_select"
  on "public"."movement_general_impacts"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.movement_assessment ma
  WHERE ((ma.submission_id = movement_general_impacts.movement_assessment_submission_id) AND (ma.users_id = public.current_users_id())))));



  create policy "pa_insert"
  on "public"."pain_assessment"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "pa_select"
  on "public"."pain_assessment"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "pa_update"
  on "public"."pain_assessment"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "pc_delete"
  on "public"."pain_characteristics"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_characteristics.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pc_insert"
  on "public"."pain_characteristics"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_characteristics.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pc_select"
  on "public"."pain_characteristics"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_characteristics.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pl_delete"
  on "public"."pain_location"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_location.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pl_insert"
  on "public"."pain_location"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_location.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pl_select"
  on "public"."pain_location"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pain_assessment pa
  WHERE ((pa.submission_id = pain_location.pain_assessment_submission_id) AND (pa.users_id = public.current_users_id())))));



  create policy "pmsp_delete"
  on "public"."patient_musko_skeletal_pain"
  as permissive
  for delete
  to public
using (public.is_own_patient_record(patient_id));



  create policy "pmsp_insert"
  on "public"."patient_musko_skeletal_pain"
  as permissive
  for insert
  to public
with check (public.is_own_patient_record(patient_id));



  create policy "pmsp_select"
  on "public"."patient_musko_skeletal_pain"
  as permissive
  for select
  to public
using (public.is_own_patient_record(patient_id));



  create policy "reflection_insert"
  on "public"."patient_reflection"
  as permissive
  for insert
  to public
with check (public.is_own_patient_record(patients_patient_id));



  create policy "reflection_select"
  on "public"."patient_reflection"
  as permissive
  for select
  to public
using (public.is_own_patient_record(patients_patient_id));



  create policy "reflection_update"
  on "public"."patient_reflection"
  as permissive
  for update
  to public
using (public.is_own_patient_record(patients_patient_id))
with check (public.is_own_patient_record(patients_patient_id));



  create policy "patients_insert"
  on "public"."patients"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "patients_select"
  on "public"."patients"
  as permissive
  for select
  to public
using (public.can_access_patient(patient_id));



  create policy "patients_update"
  on "public"."patients"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "pca_insert"
  on "public"."personal_care_assessment"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "pca_select"
  on "public"."personal_care_assessment"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "pca_update"
  on "public"."personal_care_assessment"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "pcga_insert"
  on "public"."personal_care_general_activities"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.personal_care_assessment pca
  WHERE ((pca.submission_id = personal_care_general_activities.personal_care_assessment_submission_id) AND (pca.users_id = public.current_users_id())))));



  create policy "pcga_select"
  on "public"."personal_care_general_activities"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.personal_care_assessment pca
  WHERE ((pca.submission_id = personal_care_general_activities.personal_care_assessment_submission_id) AND (pca.users_id = public.current_users_id())))));



  create policy "pm_insert"
  on "public"."personal_management"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "pm_select"
  on "public"."personal_management"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "pm_update"
  on "public"."personal_management"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "pmm_insert"
  on "public"."personal_management_medications"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.personal_management pm
  WHERE ((pm.submission_id = personal_management_medications.submission_id) AND (pm.users_id = public.current_users_id())))) AND (EXISTS ( SELECT 1
   FROM public.medications m
  WHERE ((m.medication_id = personal_management_medications.medication_id) AND (m.users_id = public.current_users_id()))))));



  create policy "pmm_select"
  on "public"."personal_management_medications"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.personal_management pm
  WHERE ((pm.submission_id = personal_management_medications.submission_id) AND (pm.users_id = public.current_users_id())))));



  create policy "sha_insert"
  on "public"."social_health_assessment"
  as permissive
  for insert
  to public
with check ((users_id = public.current_users_id()));



  create policy "sha_select"
  on "public"."social_health_assessment"
  as permissive
  for select
  to public
using ((users_id = public.current_users_id()));



  create policy "sha_update"
  on "public"."social_health_assessment"
  as permissive
  for update
  to public
using ((users_id = public.current_users_id()))
with check ((users_id = public.current_users_id()));



  create policy "support_persons_delete"
  on "public"."support_persons"
  as permissive
  for delete
  to public
using (public.is_own_patient_record(patient_id));



  create policy "support_persons_insert"
  on "public"."support_persons"
  as permissive
  for insert
  to public
with check (public.is_own_patient_record(patient_id));



  create policy "support_persons_select"
  on "public"."support_persons"
  as permissive
  for select
  to public
using (((users_id = public.current_users_id()) OR public.is_own_patient_record(patient_id)));



  create policy "support_persons_update"
  on "public"."support_persons"
  as permissive
  for update
  to public
using ((public.is_own_patient_record(patient_id) OR (users_id = public.current_users_id())))
with check ((public.is_own_patient_record(patient_id) OR (users_id = public.current_users_id())));



  create policy "users_insert"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((auth_id = auth.uid()));



  create policy "users_select"
  on "public"."users"
  as permissive
  for select
  to public
using (((auth_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.patients p
  WHERE ((p.users_id = users.users_id) AND public.is_support_person_for_patient(p.patient_id))))));



  create policy "users_update"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth_id = auth.uid()))
with check ((auth_id = auth.uid()));


CREATE TRIGGER support_persons_protect_access_type BEFORE UPDATE ON public.support_persons FOR EACH ROW EXECUTE FUNCTION public.prevent_self_access_type_change();


