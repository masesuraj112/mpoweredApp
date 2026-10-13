import type { SupportedPatient } from './types';

export type AppointmentActionType = 'add-questions' | 'add-answer' | 'view-questions' | 'view-answer';

export const APPOINTMENT_ACTION_LABELS: Record<AppointmentActionType, string> = {
  'add-questions': 'Add questions',
  'add-answer': 'Add doctor’s answer',
  'view-questions': 'View questions',
  'view-answer': 'View doctor’s answer',
};

/**
 * The buttons a support person sees on one of the patient's appointments (Figma 3911-25095, 3911-24852).
 * Upcoming appointments let them add, past ones let them view, and each permission adds one button.
 */
export function getAppointmentActions(
  patient: Pick<SupportedPatient, 'canAddQuestions' | 'canAddAnswers'>,
  isUpcoming: boolean,
): AppointmentActionType[] {
  const actions: AppointmentActionType[] = [];
  if (patient.canAddQuestions) actions.push(isUpcoming ? 'add-questions' : 'view-questions');
  if (patient.canAddAnswers) actions.push(isUpcoming ? 'add-answer' : 'view-answer');
  return actions;
}
