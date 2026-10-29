import { useCallback } from 'react';

import type { AppError } from '@/lib/errors';
import { ok } from '@/lib/result';
import { listAppointments } from '@/services/care-planner';

import { sortAppointments } from './appointmentDisplay';
import type { Appointment } from './types';
import { useAsyncResult } from './useAsyncResult';

export type AppointmentsState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; appointments: Appointment[] };

/** Loads the saved appointments, soonest first. See `useAsyncResult` for `reload` and `refresh`. */
export function useAppointments(): AppointmentsState & { reload: () => void; refresh: () => void } {
  const load = useCallback(async () => {
    const result = await listAppointments();
    return result.ok ? ok(sortAppointments(result.data)) : result;
  }, []);
  const { state, reload, refresh } = useAsyncResult(load);

  const appointments: AppointmentsState =
    state.status === 'ready' ? { status: 'ready', appointments: state.data } : state;
  return { ...appointments, reload, refresh };
}
