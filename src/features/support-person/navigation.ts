import { router } from 'expo-router';

import type { AppointmentActionType } from './permissions';

/** Opens the screen for an appointment button ("View questions", "Add questions" and so on). */
export function openAppointmentAction(action: AppointmentActionType, patientId: string, appointmentId: number) {
  const params = { patientId, appointmentId: String(appointmentId) };
  switch (action) {
    case 'view-questions':
    case 'view-answer':
    case 'view-plan':
      router.push({ pathname: '/care-planner/appointment/[appointmentId]', params });
      return;
    case 'add-answer':
      router.push({ pathname: '/care-planner/appointment/[appointmentId]', params: { ...params, openAnswer: '1' } });
      return;
    default:
      // TODO (commit 14 of docs/support-person-appointments-now-plan.md): add questions.
      router.push({ pathname: '/care-planner/appointment-action', params: { ...params, action } });
  }
}
