import type { SupportedPatient } from './types';

export type AppointmentActionType = 'add-questions' | 'add-answer' | 'view-questions' | 'view-answer' | 'view-plan';

export const APPOINTMENT_ACTION_LABELS: Record<AppointmentActionType, string> = {
  'add-questions': 'Add questions',
  'add-answer': 'Add doctor’s answer',
  'view-questions': 'View questions',
  'view-answer': 'View doctor’s answer',
  'view-plan': 'View appointment',
};

/**
 * The buttons a support person sees on one of the patient's appointments (Figma 3911-25095, 3911-24852).
 * Upcoming appointments let them add, past ones let them view, and each permission adds one button.
 * Without either permission they can still view the plan (SRS edge case 3.3), so they get "View appointment".
 */
export function getAppointmentActions(
  patient: Pick<SupportedPatient, 'canAddQuestions' | 'canAddAnswers'>,
  isUpcoming: boolean,
): AppointmentActionType[] {
  const actions: AppointmentActionType[] = [];
  if (patient.canAddQuestions) actions.push(isUpcoming ? 'add-questions' : 'view-questions');
  if (patient.canAddAnswers) actions.push(isUpcoming ? 'add-answer' : 'view-answer');
  return actions.length > 0 ? actions : ['view-plan'];
}

/** What a support person may change on a patient's appointment plan. Viewing is always allowed. */
export type PlanAccess = {
  canEditQuestions: boolean;
  canEditAnswers: boolean;
};

/**
 * The single place that decides what a support person may change on an appointment plan, from the
 * access the patient gave them (US18, requirement 2.2.2).
 *
 * Decisions for now (docs/support-person.md, section 4.3), easy to change here:
 * - Answers can still be added to past appointments, because doctors' answers are often typed up later.
 * - Recording consent is never signed by a support person (the plan screen shows it read-only).
 *
 * Only the app enforces this until the database checks access_type (docs/support-person.md, P5).
 */
export function getPlanAccess(patient: Pick<SupportedPatient, 'canAddQuestions' | 'canAddAnswers'>): PlanAccess {
  return {
    canEditQuestions: patient.canAddQuestions,
    canEditAnswers: patient.canAddAnswers,
  };
}
