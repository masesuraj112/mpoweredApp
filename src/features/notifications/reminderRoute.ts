// Where tapping a reminder goes. The target travels in the notification's data (see the
// notifications service), so it is read back defensively: anything unexpected opens nothing.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { ReminderTarget } from './schedule';

/** A route for expo-router, as plain data: the only two screens a reminder opens. */
export type ReminderRoute =
  | { pathname: '/planner/review'; params: { appointmentId: string } }
  | { pathname: '/home' };

/** The target saved with a reminder, or null for a notification this app didn't schedule. */
export function readReminderTarget(data: unknown): ReminderTarget | null {
  const target = (data as { target?: { kind?: unknown; appointmentId?: unknown } } | null | undefined)?.target;
  if (target?.kind === 'assessment') return { kind: 'assessment' };
  if (target?.kind === 'appointment' && Number.isInteger(target.appointmentId)) {
    return { kind: 'appointment', appointmentId: target.appointmentId as number };
  }
  return null;
}

/**
 * An appointment reminder opens that appointment's plan (Review); an assessment reminder opens the
 * Pain Tracker home, which lists the five assessments with their Record buttons.
 */
export function routeForReminder(target: ReminderTarget): ReminderRoute {
  if (target.kind === 'appointment') {
    return { pathname: '/planner/review', params: { appointmentId: String(target.appointmentId) } };
  }
  return { pathname: '/home' };
}
