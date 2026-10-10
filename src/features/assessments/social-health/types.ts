export type SocialHealthAssessmentAnswers = {
  socialLife?: string;
  travel?: string;
  moodNumber?: number;
  relationWithOthers?: number;
  enjoymentOfLife?: number;
  moodEmotion?: string;
  emotionReflection?: string;
  /** The day the entry refers to ('YYYY-MM-DD'). Defaults to today. */
  entryDate?: string;
};