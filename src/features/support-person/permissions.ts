import type { AppError } from '@/lib/errors';

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
 * The database checks the same rules (support_person_functions); this decides what the screens offer.
 */
export function getPlanAccess(patient: Pick<SupportedPatient, 'canAddQuestions' | 'canAddAnswers'>): PlanAccess {
  return {
    canEditQuestions: patient.canAddQuestions,
    canEditAnswers: patient.canAddAnswers,
  };
}

/**
 * Whether the support person may type the doctor's answers now: they need the answers permission,
 * and the patient must have recorded the doctor's consent first (decision S3; the database refuses
 * an answer without it, CONSENT_REQUIRED).
 */
export function canAnswerNow(access: PlanAccess, recordingConsentedAt: string | null): boolean {
  return access.canEditAnswers && recordingConsentedAt !== null;
}

/**
 * True when a save failed because the patient changed what this person may do: their access was
 * changed, they were taken off the appointment, or they were removed. The patient list is stale then.
 */
export function isAccessChanged(error: Pick<AppError, 'code'>): boolean {
  return error.code === 'NOT_ALLOWED' || error.code === 'NOT_FOUND';
}
