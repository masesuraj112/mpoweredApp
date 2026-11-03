jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { saveOrUpdate } from '@/services/saveOrUpdate';

const duplicate = { data: null, error: { code: '23505', message: 'duplicate key' } };

describe('saveOrUpdate', () => {
  it('returns the new id and does not update when the save succeeds', async () => {
    const save = jest.fn().mockResolvedValue({ data: 4, error: null });
    const update = jest.fn();
    expect(await saveOrUpdate(save, update)).toEqual({ ok: true, data: 4 });
    expect(update).not.toHaveBeenCalled();
  });

  it('updates the existing entry when the week already has one', async () => {
    const save = jest.fn().mockResolvedValue(duplicate);
    const update = jest.fn().mockResolvedValue({ data: 9, error: null });
    expect(await saveOrUpdate(save, update)).toEqual({ ok: true, data: 9 });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('does not update after any other save error', async () => {
    const save = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message: 'FUTURE_DATE' } });
    const update = jest.fn();
    expect(await saveOrUpdate(save, update)).toMatchObject({ ok: false, error: { code: 'FUTURE_DATE' } });
    expect(update).not.toHaveBeenCalled();
  });

  it('maps a failed update', async () => {
    const save = jest.fn().mockResolvedValue(duplicate);
    const update = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message: 'NOT_FOUND' } });
    expect(await saveOrUpdate(save, update)).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  it('gives UNKNOWN when a call returns no id and no error', async () => {
    const save = jest.fn().mockResolvedValue({ data: null, error: null });
    expect(await saveOrUpdate(save, jest.fn())).toMatchObject({ ok: false, error: { code: 'UNKNOWN' } });
  });

  it('gives NETWORK when a request throws', async () => {
    const save = jest.fn().mockResolvedValue(duplicate);
    const update = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    expect(await saveOrUpdate(save, update)).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });
});
