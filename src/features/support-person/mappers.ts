// Turns the rows the support person database functions return into the app's types.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// The appointment plan and suggested questions use the Care Planner mappers instead.

import { mapAppointment, type AppointmentRow } from '@/features/care-planner/mappers';

import type { SupportedPatient, SupportRequest } from './types';

/** A row of list_supported_patients() (and accept_support_request()). */
export type SupportedPatientRow = {
  patient_id: number;
  patient_name: string;
  /** The patient's conditions, comma-separated, or null when they have none. */
  conditions: string | null;
  can_add_questions: boolean;
  can_add_answers: boolean;
};

/** A row of list_my_support_requests(). It has no conditions (decision S5). */
export type SupportRequestRow = Omit<SupportedPatientRow, 'conditions'>;

/** A row of list_supported_appointments(): an appointment with the patient it belongs to. */
export type SupportedAppointmentRow = AppointmentRow & { patient_id: number };

/** The app uses the patient id, as a string, for both the patient and their request. */
const patientKey = (patientId: number) => String(patientId);

/** Groups appointments under the patients they belong to, keeping the order of the rows. */
export function mapSupportedPatients(
  patients: readonly SupportedPatientRow[],
  appointments: readonly SupportedAppointmentRow[],
): SupportedPatient[] {
  return patients.map((row) =>
    mapSupportedPatient(
      row,
      appointments.filter((appointment) => appointment.patient_id === row.patient_id),
    ),
  );
}

export function mapSupportedPatient(
  row: SupportedPatientRow,
  appointments: readonly SupportedAppointmentRow[] = [],
): SupportedPatient {
  return {
    id: patientKey(row.patient_id),
    name: row.patient_name,
    condition: row.conditions ?? '',
    canAddQuestions: row.can_add_questions,
    canAddAnswers: row.can_add_answers,
    appointments: appointments.map(mapAppointment),
  };
}

/** A pending request: the patient's name and the access offered, but no conditions or appointments yet. */
export function mapSupportRequest(row: SupportRequestRow): SupportRequest {
  return {
    id: patientKey(row.patient_id),
    patient: mapSupportedPatient({ ...row, conditions: null }),
  };
}
