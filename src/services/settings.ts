// The signed-in user's notification choices (Settings > Notifications). Nothing sends reminders
// yet; these only store the choices. Returns a Result and never throws to the UI. The Supabase
// client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;
type SettingsRow = Database['public']['Tables']['user_settings']['Row'];

export type NotificationSettings = {
  assessmentReminders: boolean;
  /** 1 to 7, with `assessmentUnit`: "every 3 days". */
  assessmentEvery: number;
  assessmentUnit: 'days' | 'weeks';
  appointmentReminders: boolean;
  appointmentDayBefore: boolean;
  appointmentOnDay: boolean;
};

/** What a user has before they change anything. Matches the column defaults in user_settings. */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  assessmentReminders: false,
  assessmentEvery: 3,
  assessmentUnit: 'days',
  appointmentReminders: false,
  appointmentDayBefore: false,
  appointmentOnDay: false,
};

const SETTINGS_COLUMNS =
  'assessment_reminders, assessment_every, assessment_unit, appointment_reminders, appointment_day_before, appointment_on_day';

function fromRow(row: Omit<SettingsRow, 'users_id'>): NotificationSettings {
  return {
    assessmentReminders: row.assessment_reminders,
    assessmentEvery: row.assessment_every,
    // chk on user_settings only allows these two values
    assessmentUnit: row.assessment_unit === 'weeks' ? 'weeks' : 'days',
    appointmentReminders: row.appointment_reminders,
    appointmentDayBefore: row.appointment_day_before,
    appointmentOnDay: row.appointment_on_day,
  };
}

/**
 * Reads the signed-in user's own users row by auth_id (users_select also returns a patient's row to
 * their support persons) with its settings embedded.
 */
async function ownUser(client: Client) {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) return fail(mapError(sessionError));
  const userId = sessionData.session?.user?.id;
  if (!userId) return fail({ code: 'NO_SESSION', message: 'There is no signed-in user.' });

  const { data, error } = await client
    .from('users')
    .select(`users_id, user_settings(${SETTINGS_COLUMNS})`)
    .eq('auth_id', userId)
    .maybeSingle();
  if (error) return fail(mapError(error));
  if (!data) return fail({ code: 'NO_PROFILE', message: 'There is no profile for this user.' });
  return ok(data);
}

/** The signed-in user's notification choices, or the defaults when they haven't saved any. */
export function getNotificationSettings(
  client: Client = supabase,
): Promise<Result<NotificationSettings>> {
  return run(async () => {
    const user = await ownUser(client);
    if (!user.ok) return user;
    const row = user.data.user_settings;
    return ok(row ? fromRow(row) : DEFAULT_NOTIFICATION_SETTINGS);
  });
}

/** Saves all of the signed-in user's notification choices, creating their row the first time. */
export function saveNotificationSettings(
  settings: NotificationSettings,
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    if (!Number.isInteger(settings.assessmentEvery) || settings.assessmentEvery < 1 || settings.assessmentEvery > 7) {
      return fail({ code: 'VALIDATION', message: 'Choose a frequency from 1 to 7.', field: 'assessmentEvery' });
    }
    if (settings.assessmentUnit !== 'days' && settings.assessmentUnit !== 'weeks') {
      return fail({ code: 'VALIDATION', message: 'Choose days or weeks.', field: 'assessmentUnit' });
    }

    const user = await ownUser(client);
    if (!user.ok) return user;

    const { error } = await client.from('user_settings').upsert(
      {
        users_id: user.data.users_id,
        assessment_reminders: settings.assessmentReminders,
        assessment_every: settings.assessmentEvery,
        assessment_unit: settings.assessmentUnit,
        appointment_reminders: settings.appointmentReminders,
        appointment_day_before: settings.appointmentDayBefore,
        appointment_on_day: settings.appointmentOnDay,
      },
      { onConflict: 'users_id' },
    );
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}
