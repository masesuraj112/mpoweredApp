import { useLocalSearchParams } from 'expo-router';

/**
 * Reads the `appointmentId` route param. `hasAppointment` is false when it is missing or not a
 * number (for example when a screen was opened without choosing an appointment).
 */
export function useAppointmentIdParam(): { appointmentId: number; hasAppointment: boolean } {
  const { appointmentId: raw } = useLocalSearchParams<{ appointmentId?: string }>();
  const appointmentId = Number(raw);
  return { appointmentId, hasAppointment: raw !== undefined && Number.isFinite(appointmentId) };
}
