jest.mock('@/lib/supabase', () => ({ supabase: {} })); // summary.ts imports a type from the service

import { toPainSummary } from '@/features/assessments/pain/summary';

const entry = {
  submissionId: 7,
  date: '2026-10-01',
  weekStart: '2026-09-28',
  current: 4,
  mildest: 0,
  worst: 10,
  average: 7,
  locations: ['Head', 'Lower Back'],
  characteristics: ['Sharp'],
};

describe('toPainSummary', () => {
  it('shows the Monday to Sunday week as the period', () => {
    expect(toPainSummary(entry).period).toBe('28 Sep–04 Oct 2026');
  });

  it('keeps the saved locations and characteristics', () => {
    const summary = toPainSummary(entry);
    expect(summary.locations).toEqual(['Head', 'Lower Back']);
    expect(summary.characteristics).toEqual(['Sharp']);
  });

  it('describes each level with the pain score band, including 0 and 10', () => {
    const { intensity } = toPainSummary(entry);
    expect(intensity.current).toEqual({ value: 4, description: 'The pain is moderate' });
    expect(intensity.mildest).toEqual({ value: 0, description: 'I have no pain at all' });
    expect(intensity.worst).toEqual({ value: 10, description: 'The pain is the worst imaginable' });
    expect(intensity.average).toEqual({ value: 7, description: 'The pain is fairly severe' });
  });
});
