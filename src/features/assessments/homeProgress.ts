import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalToday, getWeekStart } from './week';

export const WEEKLY_ASSESSMENT_IDS = [
  'pain',
  'movement',
  'personalCare',
  'socialHealth',
  'management',
] as const;

export type WeeklyAssessmentId = (typeof WEEKLY_ASSESSMENT_IDS)[number];

function getCurrentWeekKey(kind: 'assessments' | 'reflection'): string {
  const weekStart = getWeekStart(getLocalToday());
  const version = kind === 'assessments' ? 'v2' : 'v1';
  return `@mpowered/weekly-${kind}/${version}/${weekStart}`;
}

function isWeeklyAssessmentId(value: unknown): value is WeeklyAssessmentId {
  return WEEKLY_ASSESSMENT_IDS.some((id) => id === value);
}

export async function getCompletedAssessments(): Promise<Set<WeeklyAssessmentId>> {
  const serialized = await AsyncStorage.getItem(getCurrentWeekKey('assessments'));
  if (serialized === null) return new Set();

  const stored: unknown = JSON.parse(serialized);
  if (!Array.isArray(stored) || !stored.every(isWeeklyAssessmentId)) {
    throw new Error('Stored weekly assessment progress has an invalid format.');
  }
  return new Set(stored);
}

export async function markAssessmentCompleted(id: WeeklyAssessmentId): Promise<void> {
  const completed = await getCompletedAssessments();
  completed.add(id);
  await AsyncStorage.setItem(getCurrentWeekKey('assessments'), JSON.stringify([...completed]));
}

export async function getWeeklyReflection(): Promise<string> {
  return (await AsyncStorage.getItem(getCurrentWeekKey('reflection'))) ?? '';
}

export async function saveWeeklyReflection(reflection: string): Promise<void> {
  await AsyncStorage.setItem(getCurrentWeekKey('reflection'), reflection.trim());
}
