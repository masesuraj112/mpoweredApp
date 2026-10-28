jest.mock('@/lib/supabase', () => ({ supabase: {} })); // summary.ts imports a type from the service

import { toManagementSummary } from '@/features/assessments/management/summary';
import type { ManagementEntry } from '@/services/management';

const entry: ManagementEntry = {
  submissionId: 7,
  date: '2026-10-01',
  weekStart: '2026-09-28',
  exercise: '3–4 days',
  emotion: 'Meditation',
  otcMedication: 'Panadol',
  noMedication: false,
  medications: ['Amlodipine 5 mg', 'Vitamin D3 1000 IU'],
};

const noMedication = { ...entry, medications: [], otcMedication: null };

describe('toManagementSummary', () => {
  it('shows the Monday to Sunday week as the period', () => {
    expect(toManagementSummary(entry).period).toBe('28 Sep–04 Oct 2026');
  });

  describe('summary sentence', () => {
    it('exercise and medication (OTC counts as a medication)', () => {
      expect(toManagementSummary(entry).summarySentence).toBe(
        'You manage your pain with exercise (3–4 days) and medication (Amlodipine 5 mg, Vitamin D3 1000 IU, Panadol).',
      );
    });

    it.each([[false], [true]])('exercise only (noMedication %p)', (ticked) => {
      expect(toManagementSummary({ ...noMedication, noMedication: ticked }).summarySentence).toBe(
        'You mainly perform exercises to manage your pain (3–4 days).',
      );
    });

    it('medication only, counting an OTC medication on its own', () => {
      expect(toManagementSummary({ ...noMedication, exercise: '0 days', otcMedication: 'Panadol' }).summarySentence).toBe(
        'You mainly use medication to manage your pain (Panadol).',
      );
    });

    it('neither exercise nor medication', () => {
      expect(toManagementSummary({ ...noMedication, exercise: '0 days' }).summarySentence).toBe(
        'You did not record any exercise or medication to manage your pain this week.',
      );
    });
  });

  describe('medication result', () => {
    it('one medication', () => {
      expect(toManagementSummary({ ...entry, medications: ['Amlodipine 5 mg'], otcMedication: null }).medicationResult).toBe(
        'You only consumed Amlodipine 5 mg this week.',
      );
    });

    it('two or more medications', () => {
      expect(toManagementSummary({ ...entry, otcMedication: null }).medicationResult).toBe(
        'You consumed Amlodipine 5 mg, Vitamin D3 1000 IU this week.',
      );
    });

    it('"I didn\'t take any medication" ticked', () => {
      expect(toManagementSummary({ ...noMedication, noMedication: true }).medicationResult).toBe(
        'You did not take any medication this week.',
      );
    });

    it('medication question skipped', () => {
      expect(toManagementSummary(noMedication).medicationResult).toBe('No medication answer recorded.');
    });
  });

  it('describes the exercise answer', () => {
    expect(toManagementSummary(entry).exerciseResult).toBe('You exercised for 3–4 days this week.');
  });

  it('shows the saved emotion text, or the fallback sentence when there is none', () => {
    expect(toManagementSummary(entry).emotionResult).toBe('Meditation');
    expect(toManagementSummary({ ...entry, emotion: null }).emotionResult).toBe(
      'You did not perform any dedicated strategy to manage your mood.',
    );
  });
});
