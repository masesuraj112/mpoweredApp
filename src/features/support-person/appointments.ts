import type { Appointment } from './types';

const byStart = (a: Appointment, b: Appointment) => a.startsAt.localeCompare(b.startsAt);

/**
 * Splits appointments into upcoming (soonest first) and past (most recent first).
 * An appointment counts as upcoming until its start time has passed.
 */
export function splitAppointments(
  appointments: Appointment[],
  now: Date = new Date(),
): { upcoming: Appointment[]; past: Appointment[] } {
  const upcoming = appointments.filter(a => new Date(a.startsAt) >= now).sort(byStart);
  const past = appointments.filter(a => new Date(a.startsAt) < now).sort((a, b) => byStart(b, a));
  return { upcoming, past };
}

/** The soonest upcoming appointment, or null when nothing is scheduled. */
export function getNextAppointment(appointments: Appointment[], now: Date = new Date()): Appointment | null {
  return splitAppointments(appointments, now).upcoming[0] ?? null;
}

/** "Wednesday, 10 June 2026 at 10:30am", as shown on the appointment cards. */
export function formatAppointmentTime(startsAt: string): string {
  const date = new Date(startsAt);
  // Formatted in two parts because en-AU leaves out the comma after the weekday.
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'long' });
  const day = `${weekday}, ${date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} at ${hours % 12 || 12}:${minutes}${hours < 12 ? 'am' : 'pm'}`;
}

/** Up to two initials for the avatar, e.g. "Jane Cooper" → "JC", "Cher" → "C". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
