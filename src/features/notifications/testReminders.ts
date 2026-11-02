// Development only: one sample of each kind of reminder, with the real wording, for the Developer
// buttons on Settings > Notifications. An appointment sample uses the next saved appointment, so
// tapping it opens a real plan; without one it uses 10:30 AM and opens nothing.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { parseLocalTimestamp } from '@/features/care-planner/dateTime';
import type { Appointment } from '@/features/care-planner/types';

import { appointmentReminderText, ASSESSMENT_REMINDER_TEXT } from './messages';
import type { ReminderTarget } from './schedule';

export type TestReminderKind = 'appointment-day-before' | 'appointment-on-the-day' | 'assessment';

export type TestReminder = {
  /** Never starts with a planned reminder's prefix, so a re-plan leaves it alone. */
  id: string;
  title: string;
  body: string;
  /** Null when there is nothing to open. */
  target: ReminderTarget | null;
};

export const TEST_REMINDER_LABELS: Record<TestReminderKind, string> = {
  'appointment-day-before': 'Test appointment reminder (day before)',
  'appointment-on-the-day': 'Test appointment reminder (on the day)',
  assessment: 'Test assessment reminder',
};

/** The soonest saved appointment after `now`, or null. */
export function nextSavedAppointment(appointments: Appointment[], now: Date): Appointment | null {
  let next: { appointment: Appointment; at: Date } | null = null;
  for (const appointment of appointments) {
    if (appointment.status !== 'saved') continue;
    const start = parseLocalTimestamp(appointment.dateTime);
    if (!start) continue;
    const at = new Date(start.year, start.month - 1, start.day, start.hour, start.minute);
    if (at > now && (!next || at < next.at)) next = { appointment, at };
  }
  return next?.appointment ?? null;
}

export function testReminder(kind: TestReminderKind, appointment: Appointment | null): TestReminder {
  const id = `test-reminder:${kind}`;
  if (kind === 'assessment') return { id, ...ASSESSMENT_REMINDER_TEXT, target: { kind: 'assessment' } };

  const start = appointment ? parseLocalTimestamp(appointment.dateTime) : null;
  const text = appointmentReminderText(
    kind === 'appointment-day-before' ? 'tomorrow' : 'today',
    start?.hour ?? 10,
    start?.minute ?? 30,
  );
  const target: ReminderTarget | null = appointment
    ? { kind: 'appointment', appointmentId: appointment.appointmentId }
    : null;
  return { id, ...text, target };
}
