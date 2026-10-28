import type { AssessmentType } from '@/features/health-profile/assessment-types';

import type { AppointmentStatus } from './types';

/** A question suggested for the appointment. */
export type SuggestedQuestion = {
  questionId: number;
  text: string;
};

/** Suggested questions that belong together, e.g. "Pain location". */
export type SuggestedQuestionGroup = {
  groupId: string;
  title: string;
  questions: SuggestedQuestion[];
};

/** What the "Add Questions for My Appointment" screen shows. */
export type QuestionSuggestions = {
  /** Whether the appointment is still a draft in the create wizard, or saved. */
  appointmentStatus: AppointmentStatus;
  /** Calendar date the suggestions were generated, `YYYY-MM-DD`; null when none were generated. */
  generatedOn: string | null;
  groups: SuggestedQuestionGroup[];
  /** Questions currently on the appointment plan. */
  selectedQuestionIds: number[];
  /** Chosen questions that already have a doctor's answer (removing these needs confirming). */
  answeredQuestionIds: number[];
};

/** The questions generated for browsing without an appointment, and what is stopping more. */
export type GeneratedQuestionsPreview = {
  groups: SuggestedQuestionGroup[];
  /** Assessments still to complete before questions can be generated (empty when none). */
  missing: AssessmentType[];
};
