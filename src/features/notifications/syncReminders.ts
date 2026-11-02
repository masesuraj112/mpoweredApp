// Brings this phone's scheduled reminders in line with the user's settings, appointments and
// assessments: reads them, plans the reminders and schedules them. Services are passed in so tests
// can replace them.

import { listAppointments } from '@/services/care-planner';
import { getAssessments, type AssessmentSet } from '@/services/health';
import { applyReminders, cancelAllReminders, getReminderPermission } from '@/services/notifications';
import { getNotificationSettings } from '@/services/settings';
import type { Result } from '@/lib/result';

import { planReminders } from './schedule';

export const reminderSources = {
  getReminderPermission,
  getNotificationSettings,
  listAppointments,
  getLatestAssessments: () => getAssessments({ kind: 'latest' }),
  applyReminders,
  cancelAllReminders,
};

export type ReminderSources = typeof reminderSources;

/** What happened, for tests and debugging. Never includes reminder text. */
export type SyncOutcome = 'no-permission' | 'cancelled' | 'scheduled' | 'failed';

/** The latest `date` of the five assessments, or null with none. Dates are `YYYY-MM-DD`, so they sort as text. */
export function lastAssessmentDate(assessments: AssessmentSet): string | null {
  const dates = Object.values(assessments)
    .map((entry) => entry?.date)
    .filter((date): date is string => !!date);
  return dates.length > 0 ? dates.sort().at(-1)! : null;
}

/**
 * Without permission it leaves things alone (nothing could show anyway). With both kinds of reminder
 * off it cancels. A failed read keeps the reminders already scheduled, so a lost connection never
 * wipes them; the next sync tries again.
 */
export async function syncReminders(now: Date, sources: ReminderSources = reminderSources): Promise<SyncOutcome> {
  const permission = await sources.getReminderPermission();
  if (!permission.ok) return 'failed';
  if (permission.data.status !== 'granted') return 'no-permission';

  const settings = await sources.getNotificationSettings();
  if (!settings.ok) return 'failed';
  const { appointmentReminders, assessmentReminders } = settings.data;
  if (!appointmentReminders && !assessmentReminders) {
    return (await sources.cancelAllReminders()).ok ? 'cancelled' : 'failed';
  }

  const [appointments, assessments] = await Promise.all([
    appointmentReminders ? sources.listAppointments() : okEmpty([]),
    assessmentReminders ? sources.getLatestAssessments() : okEmpty(null),
  ]);
  if (!appointments.ok || !assessments.ok) return 'failed';

  const reminders = planReminders({
    settings: settings.data,
    appointments: appointments.data,
    lastAssessmentDate: assessments.data ? lastAssessmentDate(assessments.data) : null,
    now,
  });
  return (await sources.applyReminders(reminders)).ok ? 'scheduled' : 'failed';
}

function okEmpty<T>(data: T): Promise<Result<T>> {
  return Promise.resolve({ ok: true, data });
}
