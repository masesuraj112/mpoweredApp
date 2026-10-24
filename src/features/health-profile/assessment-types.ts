// The five weekly assessments, in the order the app shows them.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export const ASSESSMENT_TYPES = [
  'pain',
  'movement',
  'personalCare',
  'socialHealth',
  'management',
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  pain: 'Pain',
  movement: 'Movement',
  personalCare: 'Personal Care',
  socialHealth: 'Social Health',
  management: 'Management',
};

export function isAssessmentType(value: unknown): value is AssessmentType {
  return typeof value === 'string' && (ASSESSMENT_TYPES as readonly string[]).includes(value);
}
