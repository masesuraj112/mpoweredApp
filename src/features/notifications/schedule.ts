// Works out which reminders the phone should have scheduled, from the notification settings, the
// appointments and the date of the last assessment. The notifications service schedules the result.
//
// Every time is local wall-clock time, built from local components. Appointment times have no zone
// (the column is `timestamp without time zone`). Never use toISOString() or a UTC conversion.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { parseLocalTimestamp } from '@/features/care-planner/dateTime';
import type { Appointment } from '@/features/care-planner/types';
import type { NotificationSettings } from '@/services/settings';
import { parseIsoDate } from '@/services/date';

import { appointmentReminderText, ASSESSMENT_REMINDER_TEXT } from './messages';

/** Assessment reminders and "the day before" go off at 9:00 am (decision N-B). */
export const REMINDER_HOUR = 9;
/** "On the day" is this long before the appointment… */
export const ON_THE_DAY_LEAD_MINUTES = 120;
/** …but not before 7:00 am… */
export const EARLIEST_ON_THE_DAY_HOUR = 7;
/** …unless the appointment is so early that 7:00 am is less than this long before it. */
export const MIN_ON_THE_DAY_LEAD_MINUTES = 30;
/** How many assessment reminders are scheduled ahead. The app re-plans each time it opens. */
export const ASSESSMENT_REMINDER_COUNT = 8;
/** iOS keeps only the 64 soonest; stay under it. */
export const MAX_REMINDERS = 60;

/** Where tapping a reminder goes. */
export type ReminderTarget = { kind: 'appointment'; appointmentId: number } | { kind: 'assessment' };

export type Reminder = {
  /** Stable across re-plans, e.g. `appointment:42:day-before` or `assessment:0`. */
  id: string;
  at: Date;
  title: string;
  body: string;
  target: ReminderTarget;
};

export type ReminderInput = {
  settings: NotificationSettings;
  appointments: Appointment[];
  /** `YYYY-MM-DD` of the latest assessment of any kind, or null when there is none. */
  lastAssessmentDate: string | null;
  now: Date;
};

const MINUTE = 60_000;

/** Every reminder to schedule, soonest first, at most `MAX_REMINDERS`. */
export function planReminders({ settings, appointments, lastAssessmentDate, now }: ReminderInput): Reminder[] {
  const reminders = [
    ...(settings.appointmentReminders ? appointmentReminders(settings, appointments, now) : []),
    ...(settings.assessmentReminders ? assessmentReminders(settings, lastAssessmentDate, now) : []),
  ];
  // Ties (two reminders at 9:00 on one day) are ordered by id, so the result never depends on input order.
  return reminders
    .sort((a, b) => a.at.getTime() - b.at.getTime() || a.id.localeCompare(b.id))
    .slice(0, MAX_REMINDERS);
}

function appointmentReminders(settings: NotificationSettings, appointments: Appointment[], now: Date): Reminder[] {
  const reminders: Reminder[] = [];
  for (const appointment of appointments) {
    // Drafts aren't real appointments yet.
    if (appointment.status !== 'saved') continue;
    const start = parseLocalTimestamp(appointment.dateTime);
    if (!start) continue;
    const startAt = new Date(start.year, start.month - 1, start.day, start.hour, start.minute);
    if (startAt <= now) continue;
    const target: ReminderTarget = { kind: 'appointment', appointmentId: appointment.appointmentId };

    if (settings.appointmentDayBefore) {
      const at = new Date(start.year, start.month - 1, start.day - 1, REMINDER_HOUR, 0);
      if (at > now) {
        const text = appointmentReminderText('tomorrow', start.hour, start.minute);
        reminders.push({ id: `appointment:${appointment.appointmentId}:day-before`, at, ...text, target });
      }
    }
    if (settings.appointmentOnDay) {
      const at = onTheDayTime(startAt);
      if (at > now) {
        const text = appointmentReminderText('today', start.hour, start.minute);
        reminders.push({ id: `appointment:${appointment.appointmentId}:on-the-day`, at, ...text, target });
      }
    }
  }
  return reminders;
}

/** 2 hours before, not before 7:00 am, and at least 30 minutes before (decision N-B). */
export function onTheDayTime(startAt: Date): Date {
  const twoHoursBefore = new Date(startAt.getTime() - ON_THE_DAY_LEAD_MINUTES * MINUTE);
  const earliest = new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate(), EARLIEST_ON_THE_DAY_HOUR, 0);
  const latest = new Date(startAt.getTime() - MIN_ON_THE_DAY_LEAD_MINUTES * MINUTE);
  const notTooEarly = twoHoursBefore < earliest ? earliest : twoHoursBefore;
  return notTooEarly > latest ? latest : notTooEarly;
}

/**
 * Due every N days or weeks after the last assessment, at 9:00 am (decision N-C). Overdue, or with no
 * assessment yet, the first is the next 9:00 am. Each repeats every N days or weeks after that.
 */
function assessmentReminders(
  settings: NotificationSettings,
  lastAssessmentDate: string | null,
  now: Date,
): Reminder[] {
  const everyDays = settings.assessmentEvery * (settings.assessmentUnit === 'weeks' ? 7 : 1);
  const last = lastAssessmentDate ? parseIsoDate(lastAssessmentDate) : null;
  let first = last ? atReminderHour(last, everyDays) : null;
  if (!first || first <= now) {
    first = atReminderHour(now, 0);
    if (first <= now) first = atReminderHour(now, 1);
  }

  const reminders: Reminder[] = [];
  for (let i = 0; i < ASSESSMENT_REMINDER_COUNT; i += 1) {
    reminders.push({
      id: `assessment:${i}`,
      at: atReminderHour(first, i * everyDays),
      ...ASSESSMENT_REMINDER_TEXT,
      target: { kind: 'assessment' },
    });
  }
  return reminders;
}

/** 9:00 am local, `days` calendar days after `day`. Calendar days, so daylight saving can't shift it. */
function atReminderHour(day: Date, days: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days, REMINDER_HOUR, 0);
}
