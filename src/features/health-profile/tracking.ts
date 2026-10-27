// Shapes pain entries for the tracking chart and table, and completion data for the History tab.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatWeekEndLabel, formatWeekRange, listWeeks } from '@/features/assessments/week';
import type { PainEntry } from '@/services/assessments';
import type { CompletedWeeks } from '@/services/health';

import { ASSESSMENT_LABELS, ASSESSMENT_TYPES, type AssessmentType } from './assessment-types';

export type PainMetric = 'average' | 'worst' | 'mildest';

export const PAIN_METRICS: { key: PainMetric; label: string }[] = [
  { key: 'average', label: 'Average' },
  { key: 'worst', label: 'Worst' },
  { key: 'mildest', label: 'Mildest' },
];

export interface WeeklyPainRecord {
  weekStart: string;
  /** For example '18–24 May 2026' */
  rangeLabel: string;
  /** The Sunday of the week, for example '24/05' */
  chartLabel: string;
  average: number;
  worst: number;
  mildest: number;
  locations: string[];
}

export interface ChartPoint {
  label: string;
  value: number;
}

/** One record per week, newest first. */
export function toWeeklyRecords(entries: PainEntry[]): WeeklyPainRecord[] {
  return [...entries]
    .sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1))
    .map((entry) => ({
      weekStart: entry.weekStart,
      rangeLabel: formatWeekRange(entry.weekStart),
      chartLabel: formatWeekEndLabel(entry.weekStart),
      average: entry.average,
      worst: entry.worst,
      mildest: entry.mildest,
      locations: entry.locations,
    }));
}

/** Every location the user has recorded, most often recorded first (ties alphabetical). */
export function painLocations(records: WeeklyPainRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const location of record.locations) {
      counts.set(location, (counts.get(location) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
    .map(([location]) => location);
}

/** Only the weeks where the location was recorded; every week when location is null. */
export function filterByLocation(
  records: WeeklyPainRecord[],
  location: string | null,
): WeeklyPainRecord[] {
  return location === null ? records : records.filter((r) => r.locations.includes(location));
}

/** Points for the chart, oldest week on the left. */
export function toChartPoints(records: WeeklyPainRecord[], metric: PainMetric): ChartPoint[] {
  return [...records].reverse().map((record) => ({ label: record.chartLabel, value: record[metric] }));
}

/** Compares the two most recent points, for example 'Your average pain increased'. */
export function painTrendMessage(points: ChartPoint[]): string | null {
  if (points.length < 2) return null;
  const previous = points[points.length - 2].value;
  const latest = points[points.length - 1].value;
  if (latest > previous) return 'Your average pain increased';
  if (latest < previous) return 'Your average pain decreased';
  return 'Your average pain stayed the same';
}

/** The confirmation shown after tapping "See more records". */
export function loadMoreMessage(loadedCount: number): string {
  if (loadedCount === 0) return 'There are no older records to load.';
  return `${loadedCount} more ${loadedCount === 1 ? 'week was' : 'weeks were'} loaded successfully.`;
}

export interface HistoryAssessment {
  type: AssessmentType;
  label: string;
  completed: boolean;
}

export interface HistoryWeek {
  weekStart: string;
  rangeLabel: string;
  assessments: HistoryAssessment[];
  completedCount: number;
}

/** Every week from `fromWeek` to `toWeek`, newest first, with each assessment's status. */
export function toHistoryWeeks(
  fromWeek: string,
  toWeek: string,
  completed: CompletedWeeks,
): HistoryWeek[] {
  return listWeeks(fromWeek, toWeek)
    .reverse()
    .map((weekStart) => {
      const assessments = ASSESSMENT_TYPES.map((type) => ({
        type,
        label: ASSESSMENT_LABELS[type],
        completed: completed[type].has(weekStart),
      }));
      return {
        weekStart,
        rangeLabel: formatWeekRange(weekStart),
        assessments,
        completedCount: assessments.filter((a) => a.completed).length,
      };
    });
}
