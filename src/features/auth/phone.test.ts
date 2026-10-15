import { formatForDisplay, isValidAuMobile, toE164 } from '@/features/auth/phone';

const e164 = (input: string) => {
  const result = toE164(input);
  return result.ok ? result.data : null;
};

describe('toE164: accepted shapes', () => {
  it.each([
    ['local', '0491570006'],
    ['local with spaces', '0491 570 006'],
    ['local with dashes', '0491-570-006'],
    ['international with plus', '+61491570006'],
    ['international without plus', '61491570006'],
    ['international with spaces', '+61 491 570 006'],
    ['local with brackets', '(0491) 570 006'],
    ['surrounding whitespace', '  0491 570 006  '],
  ])('%s becomes +61491570006', (_name, input) => {
    expect(e164(input)).toBe('+61491570006');
  });
});

describe('toE164: rejected input', () => {
  it.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['nine digits', '049157000'],
    ['eleven digits', '04915700061'],
    ['landline', '0312345678'],
    ['international landline', '+61312345678'],
    ['letters', '04abc57006'],
    ['US number', '+14155550123'],
    ['international too short', '+6149157000'],
    ['international too long', '+614915700061'],
  ])('%s is invalid', (_name, input) => {
    const result = toE164(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_PHONE');
  });
});

describe('toE164: idempotence', () => {
  it('normalising an already normalised number returns the same number', () => {
    const once = e164('0491 570 006');
    expect(once).not.toBeNull();
    expect(e164(once as string)).toBe(once);
  });
});

describe('isValidAuMobile', () => {
  it('is true for a mobile and false for a landline', () => {
    expect(isValidAuMobile('0491 570 006')).toBe(true);
    expect(isValidAuMobile('0312345678')).toBe(false);
  });
});

describe('formatForDisplay', () => {
  it('shows an E.164 mobile in the local 04xx xxx xxx layout', () => {
    expect(formatForDisplay('+61491570006')).toBe('0491 570 006');
  });

  it('returns anything that is not an AU mobile in E.164 unchanged', () => {
    expect(formatForDisplay('')).toBe('');
    expect(formatForDisplay('0491570006')).toBe('0491570006');
    expect(formatForDisplay('+14155550123')).toBe('+14155550123');
  });
});
