jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { deleteAccount, exportMyData } from '@/services/account';

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

describe('deleteAccount', () => {
  const invokeWith = (result: { data: unknown; error: unknown }) => {
    const invoke = jest.fn().mockResolvedValue(result);
    return { invoke, client: fakeClient({ functions: { invoke } }) };
  };
  // functions.invoke's error for a non-2xx reply carries the Response as `context`
  const httpError = (body: unknown) => ({
    name: 'FunctionsHttpError',
    context: { json: jest.fn().mockResolvedValue(body) },
  });

  it('sends only the code to the delete-account function', async () => {
    const { invoke, client } = invokeWith({ data: { ok: true }, error: null });
    const result = await deleteAccount('123456', client);
    // the function reads the phone from Auth, so no phone or user id is ever sent
    expect(invoke).toHaveBeenCalledWith('delete-account', { body: { code: '123456' } });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it.each(['', '12345', '1234567', '12345a'])('rejects the code %p without calling the function', async (code) => {
    const { invoke, client } = invokeWith({ data: null, error: null });
    const result = await deleteAccount(code, client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_OTP');
    expect(invoke).not.toHaveBeenCalled();
  });

  it.each([
    ['OTP_EXPIRED', 'OTP_EXPIRED'],
    ['INVALID_OTP', 'INVALID_OTP'],
    ['NOT_ALLOWED', 'NOT_ALLOWED'],
    ['NO_PHONE', 'NOT_ALLOWED'],
    ['NO_PROFILE', 'NO_PROFILE'],
    ['UNKNOWN', 'UNKNOWN'],
    ['SOMETHING_NEW', 'UNKNOWN'],
  ])('maps the function error %s to %s', async (functionCode, appCode) => {
    const { client } = invokeWith({ data: null, error: httpError({ error: functionCode }) });
    const result = await deleteAccount('123456', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(appCode);
  });

  it('returns UNKNOWN when the error body is not JSON', async () => {
    const error = { name: 'FunctionsHttpError', context: { json: jest.fn().mockRejectedValue(new SyntaxError('bad')) } };
    const { client } = invokeWith({ data: null, error });
    const result = await deleteAccount('123456', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN');
  });

  it('returns NETWORK when the request could not be sent', async () => {
    const { client } = invokeWith({ data: null, error: { name: 'FunctionsFetchError', context: {} } });
    const result = await deleteAccount('123456', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK');
  });

  it('returns an error instead of throwing when invoke throws', async () => {
    const invoke = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await deleteAccount('123456', fakeClient({ functions: { invoke } }));
    expect(result.ok).toBe(false);
  });
});
