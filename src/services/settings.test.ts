jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '@/services/settings';

const fakeClient = (parts: Record<string, unknown>) => parts as never;

const savedRow = {
  assessment_reminders: true,
  assessment_every: 2,
  assessment_unit: 'weeks',
  appointment_reminders: true,
  appointment_day_before: false,
  appointment_on_day: true,
};

const saved: NotificationSettings = {
  assessmentReminders: true,
  assessmentEvery: 2,
  assessmentUnit: 'weeks',
  appointmentReminders: true,
  appointmentDayBefore: false,
  appointmentOnDay: true,
};

/** A fake client whose users lookup returns `userRow`, and whose upsert returns `upsertResult`. */
function clientWith(
  session: unknown,
  userRow: { data: unknown; error: unknown },
  upsertResult: { error: unknown } = { error: null },
) {
  const eq = jest.fn();
  const maybeSingle = jest.fn().mockResolvedValue(userRow);
  const select = jest.fn(() => ({ eq }));
  eq.mockReturnValue({ maybeSingle });
  const upsert = jest.fn().mockResolvedValue(upsertResult);
  const from = jest.fn((table: string) => (table === 'users' ? { select } : { upsert }));
  const getSession = jest.fn().mockResolvedValue({ data: { session }, error: null });
  return { from, select, eq, upsert, client: fakeClient({ auth: { getSession }, from }) };
}

const signedIn = { user: { id: 'u-1' } };

describe('getNotificationSettings', () => {
  it('returns NO_SESSION and does not query when nobody is signed in', async () => {
    const { from, client } = clientWith(null, { data: null, error: null });
    const result = await getNotificationSettings(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_SESSION');
    expect(from).not.toHaveBeenCalled();
  });

  it("reads the signed-in user's own row by auth_id, with the settings embedded", async () => {
    const { from, select, eq, client } = clientWith(signedIn, {
      data: { users_id: 7, user_settings: savedRow },
      error: null,
    });
    const result = await getNotificationSettings(client);
    expect(from).toHaveBeenCalledWith('users');
    expect(select).toHaveBeenCalledWith(expect.stringContaining('user_settings('));
    expect(eq).toHaveBeenCalledWith('auth_id', 'u-1');
    expect(result).toEqual({ ok: true, data: saved });
  });

  it('returns the defaults when the user has saved nothing yet', async () => {
    const { client } = clientWith(signedIn, { data: { users_id: 7, user_settings: null }, error: null });
    const result = await getNotificationSettings(client);
    expect(result).toEqual({ ok: true, data: DEFAULT_NOTIFICATION_SETTINGS });
  });

  it('has the same defaults as the screen: off, every 3 days, off, off, off', () => {
    expect(DEFAULT_NOTIFICATION_SETTINGS).toEqual({
      assessmentReminders: false,
      assessmentEvery: 3,
      assessmentUnit: 'days',
      appointmentReminders: false,
      appointmentDayBefore: false,
      appointmentOnDay: false,
    });
  });

  it('returns NO_PROFILE when the user has no users row', async () => {
    const { client } = clientWith(signedIn, { data: null, error: null });
    const result = await getNotificationSettings(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_PROFILE');
  });

  it('maps a database error', async () => {
    const { client } = clientWith(signedIn, { data: null, error: { code: '42501', message: 'permission denied' } });
    const result = await getNotificationSettings(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const getSession = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await getNotificationSettings(fakeClient({ auth: { getSession } }));
    expect(result.ok).toBe(false);
  });
});

describe('saveNotificationSettings', () => {
  it("upserts every choice into the user's own row", async () => {
    const { upsert, client } = clientWith(signedIn, { data: { users_id: 7, user_settings: null }, error: null });
    const result = await saveNotificationSettings(saved, client);
    expect(upsert).toHaveBeenCalledWith({ users_id: 7, ...savedRow }, { onConflict: 'users_id' });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it.each([
    ['a frequency of 0', { assessmentEvery: 0 }, 'assessmentEvery'],
    ['a frequency of 8', { assessmentEvery: 8 }, 'assessmentEvery'],
    ['a fractional frequency', { assessmentEvery: 2.5 }, 'assessmentEvery'],
    ['an unknown unit', { assessmentUnit: 'months' as 'days' }, 'assessmentUnit'],
  ])('rejects %s without calling the database', async (_label, change, field) => {
    const { from, client } = clientWith(signedIn, { data: null, error: null });
    const result = await saveNotificationSettings({ ...saved, ...change }, client);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.field).toBe(field);
    }
    expect(from).not.toHaveBeenCalled();
  });

  it('does not save when nobody is signed in', async () => {
    const { upsert, client } = clientWith(null, { data: null, error: null });
    const result = await saveNotificationSettings(saved, client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_SESSION');
    expect(upsert).not.toHaveBeenCalled();
  });

  it('maps an error from the save', async () => {
    const { client } = clientWith(
      signedIn,
      { data: { users_id: 7, user_settings: null }, error: null },
      { error: { code: '23514', message: 'violates check constraint' } },
    );
    const result = await saveNotificationSettings(saved, client);
    expect(result.ok).toBe(false);
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const getSession = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await saveNotificationSettings(saved, fakeClient({ auth: { getSession } }));
    expect(result.ok).toBe(false);
  });
});
