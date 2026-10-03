export type PainAssessmentAnswers = {
  painLocations?: string[];
  characteristics?: string[];
  currentPain?: number;
  mildestPain?: number;
  worstPain?: number;
  averagePain?: number;
  /** The day the entry refers to ('YYYY-MM-DD'). Defaults to today. */
  entryDate?: string;
};