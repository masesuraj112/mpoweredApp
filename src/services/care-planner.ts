// Data access for the care planner. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data. The Supabase version will keep the same signature and take the
// client as its last optional argument.

import type { Appointment } from '@/features/care-planner/types';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

/**
 * Sample appointments served by the mock `listAppointments`.
 * Set this to `[]` to see the empty state on the Care Planner screen.
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'Pain Clinic',
  },
  {
    appointmentId: 2,
    dateTime: '2026-07-26T14:00:00',
    practitionerName: 'Ms Linda Ho',
    healthService: 'Physiotherapy',
  },
];

/** Runs a call and converts thrown errors (for example a lost connection) into a failed Result. */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

/** The signed-in user's appointments. Unsorted: callers use `sortAppointments`. */
export async function listAppointments(): Promise<Result<Appointment[]>> {
  return run(async () => ok([...MOCK_APPOINTMENTS]));
}
