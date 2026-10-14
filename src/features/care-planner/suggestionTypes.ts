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
  /** Calendar date the suggestions were generated, `YYYY-MM-DD`. */
  generatedOn: string;
  groups: SuggestedQuestionGroup[];
  /** Questions currently on the appointment plan. */
  selectedQuestionIds: number[];
  /** Chosen questions that already have a doctor's answer (removing these needs confirming). */
  answeredQuestionIds: number[];
};
