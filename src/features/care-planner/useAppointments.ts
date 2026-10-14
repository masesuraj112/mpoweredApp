import { useCallback, useEffect, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { listAppointments } from '@/services/care-planner';

import { sortAppointments } from './appointmentDisplay';
import type { Appointment } from './types';

export type AppointmentsState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; appointments: Appointment[] };

/** Loads the appointments (soonest first) and exposes `reload` for a retry. */
export function useAppointments(): AppointmentsState & { reload: () => void } {
  const [state, setState] = useState<AppointmentsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listAppointments().then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: 'ready', appointments: sortAppointments(result.data) }
          : { status: 'error', error: result.error },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
