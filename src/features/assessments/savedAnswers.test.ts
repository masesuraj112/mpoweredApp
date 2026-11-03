import { PAIN_CHARACTERISTICS_OPTIONS } from '@/constants/painCharacteristics';
import { PAIN_LOCATION_PRESETS } from '@/constants/painLocations';
import { SOCIAL_LIFE_OPTIONS, TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { validateManagementAnswers } from '@/features/assessments/management/validate';
import {
  GENERAL_IMPACT_OPTIONS,
  LIFTING_OPTIONS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';
import { validateMovementAnswers } from '@/features/assessments/movement/validate';
import { validatePainAnswers } from '@/features/assessments/pain/validate';
import {
  GENERAL_ACTIVITY_OPTIONS,
  PERSONAL_CARE_OPTIONS,
  SLEEPING_OPTIONS,
} from '@/features/assessments/personal-care/options';
import { validatePersonalCareAnswers } from '@/features/assessments/personal-care/validate';
import {
  managementEntryToAnswers,
  movementEntryToAnswers,
  painEntryToAnswers,
  personalCareEntryToAnswers,
  socialHealthEntryToAnswers,
} from '@/features/assessments/savedAnswers';
import { validateSocialHealthAnswers } from '@/features/assessments/social-health/validate';
import type { MovementEntry, PainEntry, PersonalCareEntry } from '@/services/assessments';
import type { ManagementEntry } from '@/services/management';
import type { SocialHealthEntry } from '@/services/social-health';

// Each test turns a saved entry into answers, then runs them through the same validation the save
// uses: getting back exactly what was stored proves the question screens would re-save it unchanged.
const context = { entryDate: '2026-10-01', today: '2026-10-03' };
const saved = { submissionId: 7, date: '2026-10-01', weekStart: '2026-09-28' };

describe('saved answers', () => {
  it('pain round-trips and leaves entryDate out', () => {
    const entry: PainEntry = {
      ...saved,
      current: 4,
      mildest: 2,
      worst: 8,
      average: 5,
      locations: [PAIN_LOCATION_PRESETS[0], 'Knee'],
      characteristics: [PAIN_CHARACTERISTICS_OPTIONS[0]],
    };
    const answers = painEntryToAnswers(entry);
    expect(answers).not.toHaveProperty('entryDate');
    const { submissionId, weekStart, ...expected } = entry;
    expect(validatePainAnswers(answers, context)).toEqual({ ok: true, data: expected });
  });

  it('movement round-trips, with a missing reflection left unanswered', () => {
    const entry: MovementEntry = {
      ...saved,
      activeHours: 0,
      generalImpacts: [GENERAL_IMPACT_OPTIONS[0], GENERAL_IMPACT_OPTIONS[2]],
      walking: WALKING_OPTIONS[1],
      lifting: LIFTING_OPTIONS[0],
      sitting: SITTING_OPTIONS[2],
      standing: STANDING_OPTIONS[3],
      reflection: null,
    };
    const answers = movementEntryToAnswers(entry);
    expect(answers.reflection).toBeUndefined();
    const { submissionId, weekStart, ...expected } = entry;
    expect(validateMovementAnswers(answers, context)).toEqual({ ok: true, data: expected });
  });

  it('personal care round-trips', () => {
    const entry: PersonalCareEntry = {
      ...saved,
      generalActivities: [GENERAL_ACTIVITY_OPTIONS[1]],
      washingDressing: PERSONAL_CARE_OPTIONS[2],
      sleeping: SLEEPING_OPTIONS[0],
      reflection: 'A hard week',
    };
    const { submissionId, weekStart, ...expected } = entry;
    expect(validatePersonalCareAnswers(personalCareEntryToAnswers(entry), context)).toEqual({
      ok: true,
      data: expected,
    });
  });

  it('social health round-trips, turning the stored mood sentence back into the emoji value', () => {
    const entry: SocialHealthEntry = {
      ...saved,
      socialLife: SOCIAL_LIFE_OPTIONS[0],
      travelling: TRAVELLING_OPTIONS[1],
      mood: 3,
      relationWithOthers: 0,
      enjoymentOfLife: 10,
      moodOverall: 'I was feeling calm',
      reflection: null,
    };
    const answers = socialHealthEntryToAnswers(entry);
    expect(answers.moodEmotion).toBe('calm');
    const { submissionId, weekStart, ...expected } = entry;
    expect(validateSocialHealthAnswers(answers, context)).toEqual({ ok: true, data: expected });
  });

  it('management round-trips, both with medications and with "no medication"', () => {
    const withNames: ManagementEntry = {
      ...saved,
      exercise: '3–4 days',
      emotion: 'Meditation',
      otcMedication: null,
      noMedication: false,
      medications: ['Amlodipine 5 mg', 'Vitamin D3 1000 IU'],
    };
    const none: ManagementEntry = { ...withNames, emotion: null, noMedication: true, medications: [] };
    for (const entry of [withNames, none]) {
      const { submissionId, weekStart, ...expected } = entry;
      expect(validateManagementAnswers(managementEntryToAnswers(entry), context)).toEqual({
        ok: true,
        data: expected,
      });
    }
  });
});
