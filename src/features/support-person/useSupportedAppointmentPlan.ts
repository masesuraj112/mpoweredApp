import { useCallback } from 'react';

import type { AppointmentPlanState } from '@/features/care-planner/useAppointmentPlan';
import { useAsyncResult } from '@/features/care-planner/useAsyncResult';
import { getSupportedAppointmentPlan } from '@/services/support-person';

/**
 * Loads a supported patient's appointment plan. The same shape as the Planner's
 * `useAppointmentPlan`, so the screens read the same way; see `useAsyncResult` for `reload` and `refresh`.
 */
export function useSupportedAppointmentPlan(
  appointmentId: number,
): AppointmentPlanState & { reload: () => void; refresh: () => void } {
  const load = useCallback(() => getSupportedAppointmentPlan(appointmentId), [appointmentId]);
  const { state, reload, refresh } = useAsyncResult(load);

  const plan: AppointmentPlanState = state.status === 'ready' ? { status: 'ready', plan: state.data } : state;
  return { ...plan, reload, refresh };
}
