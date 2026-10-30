/**
 * Whether an appointment has been saved yet.
 * `draft`: being created in the wizard and not finished. Drafts are never listed.
 * `saved`: the plan was saved on the review screen, so it appears in My Appointments.
 */
export type AppointmentStatus = 'draft' | 'saved';

/**
 * A planned doctor appointment.
 *
 * `dateTime` is local wall-clock time as `YYYY-MM-DDTHH:mm:ss` with no zone suffix (the database
 * column is `timestamp without time zone`). Never convert it to UTC or use `toISOString()`.
 */
export type Appointment = {
  appointmentId: number;
  dateTime: string;
  practitionerName: string | null;
  healthService: string | null;
  status: AppointmentStatus;
};

/** Identifies a stored appointment, as returned when its details are saved. */
export type AppointmentRef = { appointmentId: number };

/**
 * What the "Plan my appointment" form produces. `dateTime` is local wall-clock time
 * (`YYYY-MM-DDTHH:mm:ss`, no zone). The name and service are null when left empty.
 */
export type NewAppointmentInput = {
  dateTime: string;
  practitionerName: string | null;
  healthService: string | null;
};

/**
 * Someone nominated to help with an appointment. Phone (an Australian mobile in E.164, +614...)
 * and email are optional; the
 * access flags match the settings screen's support person (can add questions / answers).
 */
export type SupportPerson = {
  /** Set once the person is stored; absent for someone added on screen and not saved yet. */
  supportPersonId?: number;
  name: string;
  phone: string | null;
  email: string | null;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
  /**
   * The invitation: waiting for the person to answer, accepted (they can see the patient's
   * appointments), or declined (they rejected or unpaired). Absent until the database has it.
   */
  status?: SupportPersonStatus;
};

export type SupportPersonStatus = 'pending' | 'accepted' | 'declined';
