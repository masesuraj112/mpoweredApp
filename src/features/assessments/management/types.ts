export type ManagementAssessmentAnswers = {
  medications?: string[];
  /** True when the user ticked "I didn't take any medication" (different from skipping). */
  noMedication?: boolean;
  otcMedication?: string;
  exerciseDays?: string;
  emotionStrategies?: string;
  /** The day the entry refers to ('YYYY-MM-DD'). Defaults to today. */
  entryDate?: string;
};
