import { useCallback, useEffect, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { getAppointmentPlan } from '@/services/care-planner';

import type { AppointmentPlan } from './planTypes';

export type AppointmentPlanState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; plan: AppointmentPlan };

/** Loads one appointment's plan and exposes `reload` for a retry. */
export function useAppointmentPlan(appointmentId: number): AppointmentPlanState & { reload: () => void } {
  const [state, setState] = useState<AppointmentPlanState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAppointmentPlan(appointmentId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok ? { status: 'ready', plan: result.data } : { status: 'error', error: result.error },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [appointmentId, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
