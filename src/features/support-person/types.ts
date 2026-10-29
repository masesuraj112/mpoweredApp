import type { Appointment } from '@/features/care-planner/types';

// The same appointment shape as the patient's Planner, so both can share screens and services.
export type { Appointment };

/** A patient the signed-in support person has accepted, with the access that patient gave them. */
export type SupportedPatient = {
  id: string;
  name: string;
  condition: string;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
  appointments: Appointment[];
};

/** A patient's pending request to add the signed-in user as their support person. */
export type SupportRequest = {
  id: string;
  /** Who the support person will be supporting once they accept. */
  patient: SupportedPatient;
};
