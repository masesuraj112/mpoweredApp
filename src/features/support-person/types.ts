export type Appointment = {
  id: string;
  /** ISO date-time, e.g. 2026-06-10T10:30:00. */
  startsAt: string;
  practitioner: string;
  healthService: string;
};

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
