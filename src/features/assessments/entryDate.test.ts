import { validateEntryDate } from '@/features/assessments/entryDate';

const base = { entryDate: '2026-10-08', today: '2026-10-12' };

describe('validateEntryDate', () => {
  it('accepts today and earlier days', () => {
    expect(validateEntryDate(base)).toEqual({ ok: true, data: '2026-10-08' });
    expect(validateEntryDate({ ...base, entryDate: '2026-10-12' }).ok).toBe(true);
  });

  it('rejects a date in the future', () => {
    expect(validateEntryDate({ ...base, entryDate: '2026-10-13' })).toMatchObject({
      ok: false,
      error: { code: 'FUTURE_DATE' },
    });
  });

  it('rejects a date before the start week only when a start week is given', () => {
    expect(validateEntryDate({ ...base, startWeek: '2026-10-12' })).toMatchObject({
      ok: false,
      error: { code: 'BEFORE_START' },
    });
    expect(validateEntryDate(base).ok).toBe(true);
  });

  it.each(['', 'yesterday', '2026-1-8', '2026-02-30'])('rejects the invalid date %p', (entryDate) => {
    expect(validateEntryDate({ ...base, entryDate })).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'INVALID_DATE' },
    });
  });
});