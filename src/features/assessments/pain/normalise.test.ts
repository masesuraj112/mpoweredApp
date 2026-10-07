import { PAIN_CHARACTERISTICS_OPTIONS } from '@/constants/painCharacteristics';
import { PAIN_LOCATION_PRESETS } from '@/constants/painLocations';
import {
  dedupe,
  isValidCharacteristic,
  normaliseLocation,
  normaliseLocations,
  suggestLocations,
} from '@/features/assessments/pain/normalise';

const presets = [...PAIN_LOCATION_PRESETS];

describe('normaliseLocation', () => {
  it.each([
    ['lower back', 'Lower Back'],
    ['LOWER BACK', 'Lower Back'],
    ['shoulder ', 'Shoulder'],
    ['  lower   back  ', 'Lower Back'],
  ])('maps %j to the canonical spelling %j', (input, expected) => {
    expect(normaliseLocation(input, presets)).toEqual({ ok: true, data: expected });
  });

  it('title-cases a location that is not in the list', () => {
    expect(normaliseLocation('Outer thigh', presets)).toEqual({ ok: true, data: 'Outer Thigh' });
    expect(normaliseLocation('inner  THIGH', presets)).toEqual({ ok: true, data: 'Inner Thigh' });
  });

  it('accepts exactly 45 characters and rejects 46', () => {
    expect(normaliseLocation('a'.repeat(45), presets).ok).toBe(true);
    expect(normaliseLocation('a'.repeat(46), presets)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'VALUE_TOO_LONG' },
    });
  });

  it.each([
    ['', 'EMPTY'],
    ['   ', 'EMPTY'],
    ['Back 2', 'INVALID_CHARACTERS'],
    ['Left-knee', 'INVALID_CHARACTERS'],
    ['other', 'RESERVED'],
    ['  Other ', 'RESERVED'],
  ])('rejects %j (%s)', (input, detail) => {
    expect(normaliseLocation(input, presets)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail },
    });
  });
});

describe('dedupe and normaliseLocations', () => {
  it('collapses values that differ only by case', () => {
    expect(dedupe(['Lower Back', 'lower back', 'Neck'])).toEqual(['Lower Back', 'Neck']);
  });

  it('normalises first, so "Lower Back" and "lower  back" become one value', () => {
    expect(normaliseLocations(['Lower Back', 'lower  back'], presets)).toEqual({
      ok: true,
      data: ['Lower Back'],
    });
  });

  it('stops at the first invalid location', () => {
    expect(normaliseLocations(['Head', 'other', 'Neck'], presets)).toMatchObject({
      ok: false,
      error: { detail: 'RESERVED' },
    });
  });
});

describe('suggestLocations', () => {
  it('suggests the preset for a typo', () => {
    expect(suggestLocations('lowr back', presets)).toEqual(['Lower Back']);
  });

  it('suggests by prefix', () => {
    expect(suggestLocations('shou', presets)).toEqual(['Shoulder']);
  });

  it('suggests a recent location only when it is in the candidate list', () => {
    expect(suggestLocations('iner thigh', presets)).toEqual([]);
    expect(suggestLocations('iner thigh', [...presets, 'Inner Thigh', 'Outer Thigh'])).toEqual([
      'Inner Thigh',
    ]);
  });

  it('suggests nothing when the text already matches a candidate', () => {
    expect(suggestLocations('lower back', presets)).toEqual([]);
  });

  it('never suggests "Other" and ignores very short input', () => {
    expect(suggestLocations('othr', [...presets, 'Other'])).toEqual([]);
    expect(suggestLocations('h', presets)).toEqual([]);
  });

  it('respects the limit', () => {
    expect(suggestLocations('ne', ['Neck', 'Neckline', 'Nerve'], 2)).toHaveLength(2);
  });
});

describe('isValidCharacteristic', () => {
  const options = [...PAIN_CHARACTERISTICS_OPTIONS];

  it('accepts each of the seven options', () => {
    expect(options).toHaveLength(7);
    for (const option of options) expect(isValidCharacteristic(option, options)).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidCharacteristic('Throbbing', options)).toBe(false);
    expect(isValidCharacteristic('sharp', options)).toBe(false);
    expect(isValidCharacteristic('', options)).toBe(false);
  });
});
