// The five weekly assessments shown on the home page. Progress is read from the database
// (src/services/home.ts), so nothing is stored on the device.

export const WEEKLY_ASSESSMENT_IDS = [
  'pain',
  'movement',
  'personalCare',
  'socialHealth',
  'management',
] as const;

export type WeeklyAssessmentId = (typeof WEEKLY_ASSESSMENT_IDS)[number];
