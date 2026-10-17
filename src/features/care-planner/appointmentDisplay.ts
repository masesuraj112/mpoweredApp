// Pure helpers for showing and ordering appointments.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatDisplayDate } from '@/services/date';

import { parseLocalDatePart } from './dateTime';
import type { Appointment } from './types';

/** Shown when an appointment has neither a practitioner nor a health service. */
export const FALLBACK_APPOINTMENT_TITLE = 'Appointment';

/**
 * Soonest first. `dateTime` is a fixed-width local timestamp, so comparing the strings orders
 * them correctly without building a `Date` (which would risk a time zone shift).
 * Returns a new array; ties keep a stable order by id.
 */
export function sortAppointments(appointments: readonly Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    if (a.dateTime < b.dateTime) return -1;
    if (a.dateTime > b.dateTime) return 1;
    return a.appointmentId - b.appointmentId;
  });
}

/** Practitioner name, else the health service, else a generic title. Blank strings count as missing. */
export function getAppointmentTitle(appointment: Appointment): string {
  const practitioner = appointment.practitionerName?.trim();
  if (practitioner) return practitioner;
  const service = appointment.healthService?.trim();
  if (service) return service;
  return FALLBACK_APPOINTMENT_TITLE;
}

/** `2026-06-10T09:30:00` becomes "10 June 2026". Empty string if the date part is malformed. */
export function formatAppointmentDate(dateTime: string): string {
  const date = parseLocalDatePart(dateTime);
  return date ? formatDisplayDate(date) : '';
}

/** Row subtitle, e.g. "Date: 10 June 2026". Empty string if the date cannot be read. */
export function getAppointmentDateText(appointment: Appointment): string {
  const date = formatAppointmentDate(appointment.dateTime);
  return date ? `Date: ${date}` : '';
}

/** Screen reader label for the View button, e.g. "Appointment with Dr. Maximiliano Prinzi on 10 June 2026, View". */
export function getAppointmentViewLabel(appointment: Appointment): string {
  const title = getAppointmentTitle(appointment);
  const date = formatAppointmentDate(appointment.dateTime);
  return date ? `Appointment with ${title} on ${date}, View` : `Appointment with ${title}, View`;
}
