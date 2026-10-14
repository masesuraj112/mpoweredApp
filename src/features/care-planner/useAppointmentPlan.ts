import { useCallback } from 'react';

import type { AppError } from '@/lib/errors';
import { getAppointmentPlan } from '@/services/care-planner';

import type { AppointmentPlan } from './planTypes';
import { useAsyncResult } from './useAsyncResult';

export type AppointmentPlanState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; plan: AppointmentPlan };

/** Loads one appointment's plan. See `useAsyncResult` for `reload` and `refresh`. */
export function useAppointmentPlan(
  appointmentId: number,
): AppointmentPlanState & { reload: () => void; refresh: () => void } {
  const load = useCallback(() => getAppointmentPlan(appointmentId), [appointmentId]);
  const { state, reload, refresh } = useAsyncResult(load);

  const plan: AppointmentPlanState =
    state.status === 'ready' ? { status: 'ready', plan: state.data } : state;
  return { ...plan, reload, refresh };
}
