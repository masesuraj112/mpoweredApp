import {
  GENERAL_IMPACT_OPTIONS,
  LIFTING_OPTIONS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';
import type { MovementAssessmentAnswers } from '@/features/assessments/movement/types';
import { validateMovementAnswers } from '@/features/assessments/movement/validate';

const context = { entryDate: '2026-10-08', today: '2026-10-12' };

const complete: MovementAssessmentAnswers = {
  activeHours: 6,
  generalImpacts: [GENERAL_IMPACT_OPTIONS[0], GENERAL_IMPACT_OPTIONS[3]],
  walkingImpact: WALKING_OPTIONS[1],
  liftingImpact: LIFTING_OPTIONS[2],
  sittingImpact: SITTING_OPTIONS[3],
  standingImpact: STANDING_OPTIONS[4],
  reflection: 'A slow week',
};

describe('validateMovementAnswers', () => {
  it('accepts a complete set of answers', () => {
    expect(validateMovementAnswers(complete, context)).toMatchObject({
      ok: true,
      data: { date: '2026-10-08', activeHours: 6, reflection: 'A slow week' },
    });
  });

  it.each([0, 24, 7.5])('accepts %p active hours (0 is a real answer)', (activeHours) => {
    expect(validateMovementAnswers({ ...complete, activeHours }, context)).toMatchObject({
      ok: true,
      data: { activeHours },
    });
  });

  it.each([
    [undefined, 'MISSING'],
    [-1, 'OUT_OF_RANGE'],
    [25, 'OUT_OF_RANGE'],
    [Number.NaN, 'NOT_A_NUMBER'],
  ])('rejects %p active hours', (activeHours, detail) => {
    expect(validateMovementAnswers({ ...complete, activeHours }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field: 'activeHours', detail },
    });
  });

  it('treats the reflection as optional and trims it', () => {
    expect(validateMovementAnswers({ ...complete, reflection: '  ' }, context)).toMatchObject({
      ok: true,
      data: { reflection: null },
    });
    expect(validateMovementAnswers({ ...complete, reflection: ' ok ' }, context)).toMatchObject({
      ok: true,
      data: { reflection: 'ok' },
    });
  });

  it('drops repeated impacts', () => {
    const result = validateMovementAnswers(
      { ...complete, generalImpacts: [GENERAL_IMPACT_OPTIONS[1], GENERAL_IMPACT_OPTIONS[1]] },
      context,
    );
    expect(result).toMatchObject({ ok: true, data: { generalImpacts: [GENERAL_IMPACT_OPTIONS[1]] } });
  });

  it.each([
    ['generalImpacts', { generalImpacts: [] }, 'NO_IMPACT'],
    ['walkingImpact', { walkingImpact: undefined }, 'MISSING'],
    ['liftingImpact', { liftingImpact: '' }, 'MISSING'],
    ['sittingImpact', { sittingImpact: undefined }, 'MISSING'],
    ['standingImpact', { standingImpact: undefined }, 'MISSING'],
  ])('rejects a missing %s answer', (field, change, detail) => {
    expect(validateMovementAnswers({ ...complete, ...change }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field, detail },
    });
  });

  it.each([
    ['generalImpacts', { generalImpacts: ['Something else'] }],
    ['walkingImpact', { walkingImpact: LIFTING_OPTIONS[0] }],
    ['liftingImpact', { liftingImpact: 'I lift anything' }],
  ])('rejects text that is not one of the %s answers', (field, change) => {
    expect(validateMovementAnswers({ ...complete, ...change }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field, detail: 'UNKNOWN_OPTION' },
    });
  });

  it('rejects a date in the future', () => {
    expect(validateMovementAnswers(complete, { ...context, entryDate: '2026-10-13' })).toMatchObject({
      ok: false,
      error: { code: 'FUTURE_DATE' },
    });
  });
});