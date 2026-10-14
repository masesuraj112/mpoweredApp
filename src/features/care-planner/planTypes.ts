import type { Appointment } from './types';

/** One question the person plans to ask, with the doctor's answer once it has been noted. */
export type PlanQuestion = {
  questionId: number;
  text: string;
  /** Null until an answer has been added. */
  doctorAnswer: string | null;
};

/** A doctor's answer to save. Plain text; an empty string clears the answer. */
export type AnswerInput = {
  questionId: number;
  answerText: string;
};

/** Questions that belong together, e.g. "Pain location". */
export type QuestionGroup = {
  groupId: string;
  title: string;
  questions: PlanQuestion[];
};

/** Everything the "Review My Appointment Plan" screen shows. */
export type AppointmentPlan = {
  appointment: Appointment;
  supportPersonName: string | null;
  /** UTC instant the recording consent was signed (ISO string), or null if it has not been. */
  recordingConsentedAt: string | null;
  questionGroups: QuestionGroup[];
};
