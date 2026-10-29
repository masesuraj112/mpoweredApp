jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { exportMyData } from '@/services/account';

const fakeClient = (parts: Record<string, unknown>) => parts as never;

describe('exportMyData', () => {
  it('calls export_my_data with no arguments and returns the document', async () => {
    const document = { exported_at: '2026-10-29T12:00:00Z', profile: { name: 'Sam' } };
    const rpc = jest.fn().mockResolvedValue({ data: document, error: null });
    const result = await exportMyData(fakeClient({ rpc }));
    // the function takes the user from the session, so nothing identifies the user
    expect(rpc).toHaveBeenCalledWith('export_my_data');
    expect(result).toEqual({ ok: true, data: document });
  });

  it.each([
    ['NO_SESSION', 'NO_SESSION'],
    ['NO_PROFILE', 'NO_PROFILE'],
  ])('maps the database code %s to %s', async (message, code) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message } });
    const result = await exportMyData(fakeClient({ rpc }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it('fails when the export returns nothing', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await exportMyData(fakeClient({ rpc }));
    expect(result.ok).toBe(false);
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await exportMyData(fakeClient({ rpc }));
    expect(result.ok).toBe(false);
  });
});
