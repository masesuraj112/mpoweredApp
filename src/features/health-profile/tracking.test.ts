import type { PainEntry } from '@/services/assessments';
import type { CompletedWeeks } from '@/services/health';

import {
  filterByLocation,
  loadMoreMessage,
  painLocations,
  painTrendMessage,
  toChartPoints,
  toHistoryWeeks,
  toWeeklyRecords,
} from './tracking';

const entry = (weekStart: string, average: number, locations: string[]): PainEntry => ({
  submissionId: 0,
  date: weekStart,
  weekStart,
  current: average,
  mildest: average - 1,
  worst: average + 1,
  average,
  locations,
  characteristics: ['Aching'],
});

const entries = [
  entry('2026-05-04', 8, ['Back']),
  entry('2026-05-18', 7, ['Back', 'Knee']),
  entry('2026-05-11', 6, ['Knee']),
];

describe('toWeeklyRecords', () => {
  it('sorts newest week first and labels each week', () => {
    const records = toWeeklyRecords(entries);
    expect(records.map((r) => r.rangeLabel)).toEqual([
      '18–24 May 2026',
      '11–17 May 2026',
      '04–10 May 2026',
    ]);
    expect(records[0]).toMatchObject({ chartLabel: '24/05', average: 7, worst: 8, mildest: 6 });
  });
});

describe('location filter', () => {
  const records = toWeeklyRecords(entries);

  it('lists locations most often recorded first', () => {
    expect(painLocations(records)).toEqual(['Back', 'Knee']);
  });

  it('keeps only weeks where the selected location was recorded', () => {
    expect(filterByLocation(records, 'Knee').map((r) => r.weekStart)).toEqual(['2026-05-18', '2026-05-11']);
    expect(filterByLocation(records, null)).toHaveLength(3);
  });
});

describe('toChartPoints', () => {
  it('plots the selected metric with the oldest week on the left', () => {
    const records = toWeeklyRecords(entries);
    expect(toChartPoints(records, 'average').map((p) => p.value)).toEqual([8, 6, 7]);
    expect(toChartPoints(records, 'worst').map((p) => p.value)).toEqual([9, 7, 8]);
    expect(toChartPoints(records, 'mildest')[0]).toEqual({ label: '10/05', value: 7 });
  });
});

describe('painTrendMessage', () => {
  it('compares the last two weeks', () => {
    expect(painTrendMessage([{ label: 'a', value: 5 }, { label: 'b', value: 7 }])).toMatch(/increased/);
    expect(painTrendMessage([{ label: 'a', value: 7 }, { label: 'b', value: 5 }])).toMatch(/decreased/);
    expect(painTrendMessage([{ label: 'a', value: 5 }, { label: 'b', value: 5 }])).toMatch(/stayed/);
    expect(painTrendMessage([{ label: 'a', value: 5 }])).toBeNull();
  });
});

describe('loadMoreMessage', () => {
  it('confirms how many weeks loaded, or that there are none', () => {
    expect(loadMoreMessage(1)).toBe('1 more week was loaded successfully.');
    expect(loadMoreMessage(5)).toBe('5 more weeks were loaded successfully.');
    expect(loadMoreMessage(0)).toMatch(/no older records/);
  });
});

describe('toHistoryWeeks', () => {
  const completed: CompletedWeeks = {
    pain: new Set(['2026-05-11', '2026-05-18']),
    movement: new Set(['2026-05-18']),
    personalCare: new Set(),
    socialHealth: new Set(),
    management: new Set(),
  };

  it('lists every week from the start week, newest first, including weeks with nothing done', () => {
    const weeks = toHistoryWeeks('2026-05-04', '2026-05-18', completed);
    expect(weeks.map((w) => w.weekStart)).toEqual(['2026-05-18', '2026-05-11', '2026-05-04']);
    expect(weeks.map((w) => w.completedCount)).toEqual([2, 1, 0]);
  });

  it('gives each week all five assessments with their status', () => {
    const [latest] = toHistoryWeeks('2026-05-18', '2026-05-18', completed);
    expect(latest.assessments).toEqual([
      { type: 'pain', label: 'Pain', completed: true },
      { type: 'movement', label: 'Movement', completed: true },
      { type: 'personalCare', label: 'Personal Care', completed: false },
      { type: 'socialHealth', label: 'Social Health', completed: false },
      { type: 'management', label: 'Management', completed: false },
    ]);
  });
});
